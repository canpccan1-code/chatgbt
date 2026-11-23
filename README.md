# Kendim — Fotoğraf Stüdyosu

Referans fotoğrafından, aynı kişinin kimliğini ve doğal özelliklerini korumaya öncelik veren günlük telefon fotoğrafları oluşturmak için Türkçe bir web arayüzü.

## Nasıl çalışır?

- Site arayüzü `docs/index.html` içindedir.
- Görsel üretim sunucusu `api/generate.js` içindedir.
- Tarayıcı OpenAI API anahtarını görmez. İstek, Vercel sunucusuna gider; sunucu anahtarı OPENAI_API_KEY gizli ayarından alır.
- Fotoğraf uygulama veritabanında saklanmaz. Üretim sırasında tarayıcıdan Vercel’e, oradan OpenAI API’ye gönderilir. Bu hizmetlerin gizlilik ve saklama koşulları geçerlidir.
- Uygulama erişim şifresi APP_PASSWORD ayarıyla korunur. Bu şifreyi siteyi başkalarıyla paylaşma.
- Sonuç tarayıcıda gösterilir; **Fotoğrafı indir** düğmesiyle bilgisayarına kaydedebilirsin.

## Vercel’de ücretsiz kişisel sunucuyu yayımlama

Vercel’in Hobby planı kişisel projeler için ücretsizdir. Görsel üretim API’sinin kullanım bedeli ayrıdır.

1. [Vercel’e GitHub ile kaydol](https://vercel.com/signup) veya hesabına giriş yap.
2. **Add New → Project** seçip `canpccan1-code/chatgbt` deposunu içe aktar.
3. Proje ayarlarını değiştirmeden **Deploy** düğmesine bas. `vercel.json` web dosyalarını `docs` klasöründen yayımlar; sunucu `/api/generate` adresinde çalışır.
4. Vercel projesinde **Settings → Environment Variables** bölümünü aç. İki gizli değer ekle:
   - `OPENAI_API_KEY`: Kendi OpenAI API anahtarın.
   - `APP_PASSWORD`: Siteye erişmek için kendin belirleyeceğin uzun bir şifre.
5. Ayarları kaydet. Sonra **Deployments** bölümünden **Redeploy** yap.
6. Vercel’in verdiği `*.vercel.app` adresini aç. GitHub Pages adresi sunucu API’sini çalıştırmaz.
7. Fotoğraf stüdyosunda APP_PASSWORD olarak belirlediğin şifreyi gir. OpenAI API anahtarını web sayfasına veya GitHub’a yazma.

Vercel’de bir gizli ayarı sonradan değiştirirsen yeni bir dağıtım başlat. API anahtarını veya uygulama şifresini bu depoya, herkese açık bir mesaja ya da sohbete ekleme.

## API kredisi ve ücretsiz kullanım

OpenAI API anahtarı oluşturmak kendi başına görsel üretim kredisi sağlamaz. API kullanımı ChatGPT aboneliğinden ayrı ücretlendirilir ve kredin/bakiyen gerekir. Uygun bazı ChatGPT Pro ve Business aboneleri API kredi avantajı talep edebilir; bu hak her hesapta bulunmaz. Otomatik bakiye yükleme ayarlarını açmadan önce sınırlarını kontrol et.

- [API anahtarlarını yönet](https://platform.openai.com/settings/organization/api-keys)
- [OpenAI API kredisi ve faturalandırma](https://help.openai.com/en/articles/9039756-managing-billing-for-chatgpt-and-the-api-platform)
- [Uygun aboneler için API kredisi bilgisi](https://help.openai.com/en/articles/20001626-api-credits-benefit-for-eligible-chatgpt-subscriptions)

## Kimlik tutarlılığı

İstem, referanstaki kişinin yüzünü, ten rengini, saçını, cilt dokusunu, yaşını ve vücut oranlarını korumasını; yalnızca poz, kıyafet, kamera açısı, ışık ve ortamı değiştirmesini ister. Görsel üretim sistemleri birebir kimlik veya fiziksel özellik garantisi vermez.

Model ve endpoint: `gpt-image-2.5-sunburst`, `POST /v1/images/edits`.
