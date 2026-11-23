const crypto = require("node:crypto");

const MAX_IMAGE_BYTES = 900 * 1024;
const ALLOWED_SIZES = new Set(["1024x1536", "1024x1024", "1536x1024"]);
const MODEL = "@cf/black-forest-labs/flux-2-klein-9b";

function sameSecret(left, right) {
  const a = Buffer.from(String(left || ""), "utf8");
  const b = Buffer.from(String(right || ""), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Yalnızca POST isteği kabul edilir." });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
  const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN;
  const appPassword = process.env.APP_PASSWORD;
  if (!/^[a-f0-9]{32}$/i.test(accountId) || !cloudflareToken || !appPassword) {
    return res.status(503).json({ error: "Vercel’de CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN ve APP_PASSWORD ayarlarını tamamla." });
  }

  const authorization = req.headers.authorization || "";
  const suppliedPassword = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!sameSecret(suppliedPassword, appPassword)) {
    return res.status(401).json({ error: "Uygulama erişim şifresi doğru değil." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const scene = typeof body.scene === "string" ? body.scene.trim() : "";
  const size = ALLOWED_SIZES.has(body.size) ? body.size : "1024x1536";
  const [width, height] = size.split("x");
  const match = typeof body.image === "string"
    ? /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/.exec(body.image)
    : null;

  if (!match || !scene || scene.length > 1200) {
    return res.status(400).json({ error: "Geçerli bir JPEG fotoğrafı ve en fazla 1.200 karakterlik sahne tarifi gerekli." });
  }

  const imageBytes = Buffer.from(match[1], "base64");
  if (!imageBytes.length || imageBytes.length > MAX_IMAGE_BYTES) {
    return res.status(413).json({ error: "Fotoğraf çok büyük. Daha küçük bir fotoğraf seç." });
  }

  const prompt = [
    "Create a new photorealistic everyday smartphone photograph. The person in reference image 0 is the same real person; keep their identity recognizable.",
    "Preserve the person's face shape, facial features, eye shape and spacing, eye color, eyebrows, nose, lips, jaw, skin tone, natural skin texture, freckles, asymmetries, age, hair color, hairline and natural body proportions.",
    "Do not beautify, idealize, make the face more symmetric, smooth the skin, add makeup or a beauty filter, or change their body. Change only the pose, clothing, camera angle, lighting and setting.",
    "Scene: " + scene + ".",
    "Use natural ambient light, realistic perspective and shadows, ordinary lived-in details, natural colors and subtle phone-camera grain. Avoid studio lighting, cinematic color grading, excessive HDR and artificial sharpness.",
    "Make the result look like a casual photo taken by a person with a smartphone, not a polished AI portrait."
  ].join(" ");

  try {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("width", width);
    form.append("height", height);
    form.append("input_image_0", new Blob([imageBytes], { type: "image/jpeg" }), "reference.jpg");

    const apiResponse = await fetch(
      "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/ai/run/" + MODEL,
      {
        method: "POST",
        headers: { Authorization: "Bearer " + cloudflareToken },
        body: form
      }
    );
    const data = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok || !data || data.success === false) {
      const cloudflareMessage = data && Array.isArray(data.errors)
        ? data.errors.map((item) => item && item.message).filter(Boolean).join(" ")
        : "";
      return res.status(502).json({
        error: cloudflareMessage || "Ücretsiz günlük kullanım kotası dolmuş olabilir. Kota sıfırlanınca yeniden dene."
      });
    }

    const image = data && data.result && data.result.image;
    if (!image) {
      return res.status(502).json({ error: "Cloudflare yanıtında fotoğraf bulunamadı. Yeniden dene." });
    }

    return res.status(200).json({ image: image, mimeType: "image/jpeg" });
  } catch (_) {
    return res.status(502).json({ error: "Cloudflare AI’a bağlanılamadı. Vercel’deki sunucu ayarlarını kontrol et." });
  }
};