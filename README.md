# Kendim — Fotoğraf Stüdyosu

Referans fotoğrafından, aynı kişinin kimliğini korumaya öncelik veren günlük telefon fotoğrafları oluşturmak için Türkçe web arayüzü.

## Nasıl çalışır?

- Site: `docs/index.html`
- Sunucu: `api/generate.js`
- Tarayıcı API tokenını görmez. İstek Vercel sunucusuna gider; tokenlar Vercel’in gizli ortam ayarlarından okunur.
- Fotoğraf uygulama veritabanında saklanmaz. Üretim sırasında tarayıcıdan Vercel’e, oradan Cloudflare Workers AI’a gönderilir.
- Uygulama erişimi `APP_PASSWORD` ile kısıtlanır. Bu şifreyi başkalarıyla paylaşma.
- FLUX.2 klein-9b referans fotoğrafını düzenleyebilir. Model, referans görseller için 512×512’den küçük girdi ister; arayüz fotoğrafı 500 piksele küçültür. Bu, yüz ayrıntısını ve kimlik benzerliğini etkileyebilir.
- Üretici birebir kimlik veya fiziksel özellik garantisi vermez.

## Ücretsiz kullanım

Cloudflare Workers AI ücretsiz planı günde 10.000 Neuron kullanım kotası sağlar. FLUX.2 klein-9b’nin fiyatı ilk 1 MP çıktı için 1.363,64 Neuron; 1 MP referans görüntü için ayrıca 181,82 Neuron’dur. Seçilen kadraja göre yaklaşık günde 6 fotoğraf üretilebilir. Ücretsiz kota dolarsa istekler ertesi gün kotanın yenilenmesine kadar başarısız olur; ücretli plana geçmek zorunda değilsin.

## Ücretsiz API tokenı alma

1. [Cloudflare hesabı oluştur](https://dash.cloudflare.com/sign-up).
2. Kontrol panelinde **Workers AI** bölümünü aç.
3. **Use REST API** düğmesine basıp **Create a Workers AI API Token** seçeneğiyle token oluştur. Bu hazır token gerekli Workers AI izinlerini içerir.
4. Aynı sayfadan **Account ID** değerini kopyala. Tokenı ve Account ID’yi kimseyle paylaşma.
5. [Vercel projesinde](https://vercel.com/dashboard) **Settings → Environment Variables** bölümüne şu üç değeri ekle:
   - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare’de gördüğün Account ID.
   - `CLOUDFLARE_API_TOKEN`: Cloudflare’in oluşturduğu gizli token.
   - `APP_PASSWORD`: Kendin belirleyeceğin uzun uygulama şifresi.
6. Değerleri kaydedip Vercel’de **Deployments → Redeploy** yap.
7. Vercel’in verdiği `*.vercel.app` adresini aç. GitHub Pages adresi sunucu API’sini çalıştırmaz.

Tokenı GitHub’a, web sayfasına veya sohbete yazma. Ayarları ekledikten sonra yeniden dağıtım gerekir. Vercel Hobby kişisel projeler için ücretsizdir.

## Kimlik tutarlılığı

İstem; yüz, ten rengi, saç, cilt dokusu, yaş ve vücut oranlarını korumaya çalışır; poz, kıyafet, ışık ve ortamı değiştirebilir. Üretken görsel modeller küçük fiziksel farklar oluşturabilir.

Model ve endpoint: `@cf/black-forest-labs/flux-2-klein-9b`, Cloudflare Workers AI REST API.
