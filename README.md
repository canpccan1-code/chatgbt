# Kendim — Fotoğraf Stüdyosu

Referans fotoğrafından, aynı kişinin kimliğini ve doğal özelliklerini korumaya öncelik veren günlük telefon fotoğrafları oluşturmak için Türkçe bir web arayüzü.

## Site dosyası

GitHub Pages için site kaynağı `docs/index.html` içindedir. Herhangi bir üçüncü taraf JavaScript kütüphanesi, analitik veya görsel servisi yüklemez.

## GitHub Pages'i açma

Depo şu anda özeldir ve site henüz yayımlanmamıştır. Yayımlamak için:

1. Depoda **Settings → Pages** sayfasını aç.
2. **Build and deployment** bölümünde kaynak olarak **Deploy from a branch** seç.
3. Dal olarak **main**, klasör olarak **/docs** seçip **Save**'e bas.
4. GitHub Pages site bağlantısı hazır olduğunda aynı sayfada görünür.

GitHub Free kişisel hesaplarda Pages için depo herkese açık olmalıdır. GitHub Pro ve bazı kurumsal planlarda özel depodan Pages kullanılabilir. Plan izin verse bile Pages sitesi internette herkese açık olabilir. Depo görünürlüğünü veya yayımlama ayarını bu değişiklik kendi başına değiştirmez.

## Fotoğraf üretimi ve API anahtarı

- Görsel düzenleme isteği tarayıcıdan doğrudan OpenAI Images API'ye gönderilir.
- Referans fotoğrafı ve üretilen sonuç GitHub deposuna yüklenmez; uygulama yerel depolama alanına kaydetmez. Sonucu yalnızca **Fotoğrafı indir** düğmesiyle indirirsin.
- OpenAI API anahtarı kodda değildir. Uygulama çalışırken anahtarı tarayıcı alanına yazarsın; sayfa anahtarı saklamaz ve istek doğrudan OpenAI'ye gider.
- OpenAI, gizli API anahtarlarını tarayıcı kodunda kullanmamayı önerir. Bu nedenle bu sürümü yalnızca kendi kişisel kullanımın için kullan; başkalarından kendi anahtarlarını girmelerini isteme ve ortak bilgisayarda anahtarını kullanma.
- OpenAI API kullanımı ChatGPT aboneliğinden ayrıdır. API kredisi, model erişimi ve gerekirse hesap doğrulaması gerekir.

## Kimlik tutarlılığı

İstem, referanstaki kişinin yüzünü, ten rengini, saçını, cilt dokusunu, yaşını ve vücut oranlarını korumasını; yalnızca poz, kıyafet, kamera açısı, ışık ve ortamı değiştirmesini ister. Görsel üretim sistemleri birebir kimlik veya fiziksel özellik garantisi vermez.

Model ve endpoint: `gpt-image-2.5-sunburst`, `POST /v1/images/edits`.
