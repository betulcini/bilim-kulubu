# Bilim ve Teknoloji Kulübü — Platform

SvelteKit ile hazırlanmış, koyu/aydınlık temalı, mobil ve masaüstüne uyumlu kulüp platformu.

## Bölümler

Ana Sayfa · Bilim Serileri · Bilim Tiyatrosu · Kulüp Gezileri · Duyurular · Fırsatlar ·
Galeri · Öneri Kutusu · Yarışmalar · Oyunlar (Bilim Bilgi Yarışması, Hafıza Kartları) · Ayarlar

## Çalıştırma

Bilgisayarında [Node.js](https://nodejs.org) (18 veya üzeri) kurulu olmalı.

```bash
npm install
npm run dev
```

Terminalde çıkan adresi (genellikle `http://localhost:5173`) tarayıcında açman yeterli.

## Kontroller ve testler

```bash
npm test       # Node.js yerleşik test çalıştırıcısı
npm run check  # Svelte / JavaScript kontrolleri
npm run build  # üretim derlemesi
```

GitHub Actions, push ve pull request'lerde bu üç kontrolü çalıştırır.

## Yayınlamaya hazır sürüm oluşturma

```bash
npm run build
npm run preview   # oluşan sürümü yerelde test etmek için
```

`npm run build` komutu `build/` klasörüne tamamen statik dosyalar üretir. Bu klasörü GitHub
Pages, Netlify, Vercel veya okulun kendi barındırma alanı gibi herhangi bir statik hosting
hizmetine yükleyebilirsin.

## İçeriği güncelleme

Örnek/başlangıç içerikleri düzenlemeni kolaylaştırmak için ayrı dosyalarda tutuluyor.
Supabase tablosu kurulmamışsa ya da tabloda henüz kart yoksa ilgili yedek veri gösterilir:

- `src/lib/data/series.js` — Bilim Serileri yedek kartları
- `src/lib/data/theater.js` — Bilim Tiyatrosu yedek kartları
- `src/lib/data/trips.js` — Kulüp Gezileri
- `src/lib/data/announcements.js` — Duyurular
- `src/lib/data/opportunities.js` — Fırsatlar
- `src/lib/data/competitions.js` — Yarışmalar
- `src/lib/data/gallery.js` — Galeri kartları (gerçek fotoğraf eklemek için `galeri/+page.svelte`
  içindeki `<Icon>` yer tutucusunu bir `<img>` etiketiyle değiştirebilirsin)
- `src/lib/data/bilim-quizleri.js` — yerleşik quiz soru havuzları

Yönetim panelinden eklenen güncel duyuru, fırsat, gezi, video, seri/tiyatro kartı, quiz ve
galeri içerikleri Supabase'de tutulur.

## Tasarım sistemi

Renkler, yazı tipleri ve boşluk değerleri `src/app.css` dosyasında CSS değişkenleri
(`--accent`, `--bg`, `--radius-md` gibi) olarak tanımlı. Koyu ve aydınlık tema renkleri
ayrı ayrı `[data-theme='dark']` ve `[data-theme='light']` blokları altında.

## Sesler

Tüm arayüz sesleri (`src/lib/sound.js`) Web Audio API ile anlık üretiliyor; harici ses
dosyası gerekmiyor. Ayarlar sayfasından açılıp kapatılabilir.

## Duyurular ve Fırsatlar (Supabase)

Duyurular ve Fırsatlar sayfaları içeriği Supabase'deki `duyurular` ve `firsatlar` tablolarından okur.
Yeni satır eklemek için Supabase → Table Editor'ı kullanman yeterli, siteyi yeniden yayınlamana gerek yok.
Tablolar boşsa ya da bağlantı yoksa `src/lib/data/announcements.js` ve `opportunities.js` içindeki yedek liste gösterilir.

- Tabloları kurmak için `supabase/2026-09-30-duyuru-firsat-tablolari.sql` dosyasını SQL Editor'de bir kez çalıştır.
- Bir kaydı yayından kaldırmak için `aktif` sütununu `false` yap.
- Fırsatlarda `son_tarih` geçince kart otomatik "Kapandı" olur ve listenin sonuna düşer.

## Öneri Kutusu

Öneriler `oneriler` tablosuna yazılır. Mevcut yöneticiler `/yonetim` → **Öneriler** sekmesinden
önerileri durumlarına göre işaretleyebilir ve yalnızca yönetici ekibinin görebildiği iç not
ekleyebilir. Bu notlar öneri sahibine otomatik olarak iletilmez. Anonim öneriler de kabul edilir.

- `supabase/2026-09-30-oneri-kutusu.sql` — öneri tablosu ve herkese açık gönderim izni.
- `supabase/2026-10-08-oneri-yonetimi.sql` — durumlar ve yönetici paneli yetkileri. Önce
  `2026-09-30-oneri-kutusu.sql` ve `2026-10-03-yonetici-formu.sql` çalışmış olmalı.

## Paylaşım önizlemesi (WhatsApp vb.)

Önizleme görseli `static/og-image.png`. Görselin görünmesi için sitenin tam adresi gerekir:
build ortamına `VITE_SITE_URL` değişkenini ekle (ör. `https://siteadresin.com`) ya da `src/lib/site.js` dosyasına yaz.

## Yönetici paneli (Supabase)

İlk yönetici kurulumu `supabase/2026-10-03-yonetici-formu.sql` ile yapılır. Bu ilk yönetici
SQL'den eklendikten sonra mevcut yöneticiler `/yonetim` → **Yöneticiler** sekmesinden başka
kayıtlı kullanıcıları ekleyebilir/kaldırabilir. Son yönetici ve oturum açmış yöneticinin kendi
erişimi panelden kaldırılamaz.

İçerik sekmeleri duyuru, fırsat, gezi, video, seri/tiyatro kartı, quiz, galeri ve yönetici
işlemlerini içerir. Video ve tanıtım kartları için yeni kayıtlar taslak olarak başlar; önizleme
kontrolünden sonra panelden yayına alınabilir. Herkese açık sayfalama, panelde 50 kayıtlık
**Daha fazla yükle** adımıyla yapılır.

- `supabase/2026-10-04-quiz-galeri-yonetimi.sql` — `quiz_konulari`, `quiz_sorulari`, `galeri`
  tabloları ve herkese açık galeri deposu. Önce yönetici SQL'i çalışmış olmalı.
- `supabase/2026-10-06-video-ve-gezi-yonetimi.sql` — videolar ve geziler; önce yönetici SQL'i.
- `supabase/2026-10-07-video-katalogu-siralama-yonetici.sql` — video sırası, oynatma listeleri,
  yönetilebilir seri/tiyatro kartları ve mevcut yöneticilerin yönetici ekleme/kaldırma işlemleri.
  Önce `2026-10-03` ve `2026-10-06` migration'ları gerekir.
- `supabase/2026-10-08-oneri-yonetimi.sql` — öneri paneli; önce öneri tablosu ve yönetici SQL'i.
- `supabase/2026-10-09-quiz-skoru-dogrulama.sql` — konu quiz puanlarını sunucuda doğrular ve
  doğrudan tarayıcıdan skor eklenmesini kapatır. Önce temel `schema.sql` ile quiz tabloları
  (`2026-10-04`) ve puan/ilerleme tabloları (`2026-10-05`) kurulmuş olmalı.
- `supabase/2026-10-10-yonetim-istatistik-oneri-takip.sql` — yönetici için toplu kullanım
  istatistiklerini ve kullanıcının kendi önerilerinin durum/yanıt takibini açar. Önce
  `2026-10-05-puan-ve-ilerleme.sql` ve `2026-10-08-oneri-yonetimi.sql` uygulanmış olmalı.
- `supabase/2026-10-11-planli-yayin-ve-yonetici-gecmisi.sql` — duyuru/fırsat zamanlı yayını,
  hesaplı öneriler için uygulama içi bildirimleri ve yönetici işlem geçmişini açar. Bu migration
  öncesinde yönetici, duyuru/fırsat, gezi, video, quiz/galeri ve öneri migration'larını; ayrıca
  `2026-10-10-yonetim-istatistik-oneri-takip.sql` dosyasını uygulayın.
- `supabase/2026-10-12-guvenlik-linter-duzeltmeleri.sql` — iç tarih yardımcısının `search_path`
  değerini sabitler ve tetikleyici fonksiyonlarının istemcilerden doğrudan çalıştırılmasını kapatır.
  Önceki migration'ları uyguladıktan sonra bir kez çalıştırın. Supabase Auth'ın sızdırılmış parola
  koruması SQL ile değil, Dashboard → Authentication → Attack Protection ayarlarından açılır.
- `supabase/2026-10-06-uyelik-ve-yonetici-rolleri.sql` — oyun ve yarışma quizlerine giriş zorunluluğu
  uygulama arayüzünde etkinleştirilir; üye sayısı, üye listesi dışa aktarımı ve tam/sınırlı yönetici
  rolleri için veritabanı izinlerini kurar. Tüm mevcut migration'lardan sonra çalıştırın. Mevcut
  yöneticiler tam yetkili olarak korunur ve `betul.cini61@gmail.com` hesabı tam yetkili yönetici
  yapılır; bu e-posta Supabase Auth'ta kayıtlı olmalıdır. Tam yetkili yöneticiler yeni yöneticileri
  belirli panellerle sınırlandırabilir. Üye listesi yalnızca ad-soyad ve sınıf içerir; CSV dosyası
  Excel'de açılabilir, yazdırma ekranından PDF kaydedilebilir.

Bu migration dosyalarını Supabase Dashboard → SQL Editor'de bir kez çalıştır. İlk yönetici
hesabının eklenmesi hariç, tabloları kurduktan sonra içerik ve yönetici değişiklikleri panelden
yapılabilir.

- **Quizler:** konu oluştur, tek soru ekle/düzenle/gizle/sil ya da **CSV dosyasından toplu soru ekle**.
  Örnek dosya: `supabase/ornek-quiz.csv` (sütunlar: konu, soru, secenek_a…secenek_d, dogru, aciklama, zorluk).
  Koddaki hazır konulara (fizik, kimya…) eklenen sorular aynı konunun havuzuna katılır; yeni konular
  Yarışmalar sayfasında kart olarak, Günlük Mini Quiz'de ise soru havuzunda görünür.
- **Galeri:** fotoğraf(lar) seç, başlık yaz, yükle. Fotoğraflar tarayıcıda küçültülüp yüklenir.

### Yedekleme ve kullanım özeti

- `/yonetim` → **İçerik yedeği**, yönetilebilir duyuru, fırsat, gezi, video, seri/tiyatro kartı,
  quiz konusu ve sorularını JSON olarak indirir. Galeri fotoğraf dosyaları, profiller, yöneticiler
  ve öneriler yedeğe dahil değildir.
- Yedeği geri yüklemek mevcut kayıtların üzerine yazmaz; aynı kayıtları atlar ve yeni kayıtları
  yayından kapalı ekler. Geri yüklenen öğeleri ilgili yönetim listesinden gözden geçirip yayınla.
- **İstatistikler** yalnızca toplu sayıları gösterir; kişisel kullanıcı kayıtları bu RPC üzerinden
  döndürülmez.
- Duyuru ve fırsatlarda **Yayın başlangıcı** ile **Yayından kaldırma zamanı** yerel saat diliminde
  ayarlanabilir. Zaman gelmeden içerik halka açık API'den de gizlenir. Öneri bildirimleri sadece
  hesapla gönderilen önerilere üretilir ve Profilim açıkken dakikada bir yenilenir.
- **İçerik kalite kontrolü** eksik alanları, biçimsel olarak hatalı/tekrarlanan bağlantıları ve
  süresi geçmiş fırsatları listeler. Tarayıcılar başka sitelerin HTTP durum kodunu CORS nedeniyle
  güvenilir biçimde doğrulayamadığından bağlantıların açılarak gözle kontrol edilmesi gerekir.
- **Yönetici işlem geçmişi** ekleme, güncelleme ve silme işlemlerini kullanıcı adı, zaman ve değişen
  alan adlarıyla listeler; içerik metnini, öneri mesajını veya özel yönetici notlarını kaydetmez.
- Sunucu tarafı puan doğrulama, istemciden uydurma quiz skorları gönderilmesini önler. Yerleşik
  quiz soruları ve cevapları uygulamanın tarayıcı paketinde bulunduğundan, teknik bilgisi olan
  bir kullanıcı cevap anahtarını yine inceleyebilir; bu yöntem doğru skor hesaplamasını güvenceye
  alır, soruların gizliliğini değil.

## Bilim Puanı, hesaba bağlı seri ve İlerlemem sayfası

Kurulum (bir kez): `supabase/2026-10-05-puan-ve-ilerleme.sql` dosyasını SQL Editor'de çalıştır.
Bu dosya `gunluk_aktivite` tablosunu, puan/seri fonksiyonlarını ve `toplam_puan_view` sıralamasını kurar.

- **Puan:** konu quizi (0-200, günde en yüksek 3 quiz sayılır) + günlük quiz (doğru başına 20) + seri bonusu (gün x 10, en çok 70) + günlük giriş (20).
- **Seri:** giriş yapmış kullanıcıda Supabase'de tutulur (telefon/bilgisayar senkron). Giriş yapmadan çözülmüş günler ilk girişte hesaba aktarılır.
- **Profilim → İlerlemem** (`/profil/ilerleme`): seviye, puan dökümü, seri, son 5 hafta takvimi, konu bazlı en iyi skorlar.
- Yarışmalar sayfasındaki sıralama panelinde yeni **Toplam puan** sekmesi var.

## Çevrimdışı kullanım ve öğrenme rotası

- Service worker uygulama dosyalarını ve günlük quiz sayfasını önbelleğe alır. Günlük Mini Quiz'in
  yerleşik soruları bağlantı yokken de oynanır; sonuç cihazdaki yerel seriye yazılır. Giriş yapılmış
  kullanıcıda bağlantı geri geldiğinde bugünkü sonuç hesaba eşitlenmeye çalışılır. Çevrimiçi quiz
  ve diğer Supabase işlemleri bağlantı gerektirir.
- Profil/anasayfadaki **Öğrenme rotan**, seçilen ilgi alanlarını, hesapta saklanan konu quizlerinin
  en iyi skorlarını ve günlük quiz durumunu kullanarak sıradaki adımları önerir. Quiz geçmişi
  yüklenemezse ilgi alanlarına dayalı öneri gösterilir.
