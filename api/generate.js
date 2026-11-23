const crypto = require("node:crypto");

const MAX_IMAGE_BYTES = 2.6 * 1024 * 1024;
const ALLOWED_SIZES = new Set(["1024x1536", "1024x1024", "1536x1024"]);
const ALLOWED_QUALITIES = new Set(["medium", "high"]);

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

  const openAiKey = process.env.OPENAI_API_KEY;
  const appPassword = process.env.APP_PASSWORD;
  if (!openAiKey || !appPassword) {
    return res.status(503).json({ error: "Sunucu ayarları tamamlanmamış. Vercel’de OPENAI_API_KEY ve APP_PASSWORD değerlerini ekle." });
  }

  const authorization = req.headers.authorization || "";
  const suppliedPassword = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!sameSecret(suppliedPassword, appPassword)) {
    return res.status(401).json({ error: "Uygulama erişim şifresi doğru değil." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const scene = typeof body.scene === "string" ? body.scene.trim() : "";
  const size = ALLOWED_SIZES.has(body.size) ? body.size : "1024x1536";
  const quality = ALLOWED_QUALITIES.has(body.quality) ? body.quality : "medium";
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
    "Create a new photorealistic everyday smartphone photograph using the uploaded image as the identity reference. Depict the same person.",
    "Preserve their actual face shape, facial features, eye shape and spacing, eye color, eyebrows, nose, lips, jaw, skin tone, natural skin texture, freckles, asymmetries, age, hair color, hairline and natural body proportions.",
    "Do not beautify, idealize, make the face more symmetric, smooth the skin, add makeup or a beauty filter, or change their body. Keep their identity consistent.",
    "Change only the scene, pose, clothing, camera angle and lighting as needed for this scene: " + scene + ".",
    "Use natural ambient light, realistic perspective and shadows, ordinary lived-in details, natural colors and subtle phone-camera grain. Avoid studio lighting, cinematic color grading, excessive HDR and artificial sharpness.",
    "Make the result look like a casual photo taken by a person with a smartphone, not a polished AI portrait."
  ].join(" ");

  try {
    const form = new FormData();
    form.append("model", "gpt-image-2.5-sunburst");
    form.append("prompt", prompt);
    form.append("quality", quality);
    form.append("size", size);
    form.append("output_format", "jpeg");
    form.append("output_compression", "82");
    form.append("n", "1");
    form.append("image", new Blob([imageBytes], { type: "image/jpeg" }), "reference.jpg");

    const apiResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: "Bearer " + openAiKey },
      body: form
    });
    const data = await apiResponse.json().catch(() => null);
    if (!apiResponse.ok) {
      const message = data && data.error && data.error.message
        ? data.error.message
        : "OpenAI görsel isteğini tamamlayamadı. API kredini ve model erişimini kontrol et.";
      return res.status(502).json({ error: message });
    }

    const image = data && data.data && data.data[0] && data.data[0].b64_json;
    if (!image) {
      return res.status(502).json({ error: "OpenAI yanıtında fotoğraf bulunamadı. Yeniden dene." });
    }

    return res.status(200).json({ image: image, mimeType: "image/jpeg" });
  } catch (_) {
    return res.status(502).json({ error: "OpenAI’ye bağlanılamadı. Sunucu ayarını ve internet bağlantısını kontrol et." });
  }
};