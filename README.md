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

## Yayınlamaya hazır sürüm oluşturma

```bash
npm run build
npm run preview   # oluşan sürümü yerelde test etmek için
```

`npm run build` komutu `build/` klasörüne tamamen statik dosyalar üretir. Bu klasörü GitHub
Pages, Netlify, Vercel veya okulun kendi barındırma alanı gibi herhangi bir statik hosting
hizmetine yükleyebilirsin.

## İçeriği güncelleme

Örnek/başlangıç içerikleri düzenlemeni kolaylaştırmak için ayrı dosyalarda tutuluyor —
bileşen kodlarına dokunmadan güncelleyebilirsin:

- `src/lib/data/series.js` — Bilim Serileri
- `src/lib/data/theater.js` — Bilim Tiyatrosu
- `src/lib/data/trips.js` — Kulüp Gezileri
- `src/lib/data/announcements.js` — Duyurular
- `src/lib/data/opportunities.js` — Fırsatlar
- `src/lib/data/competitions.js` — Yarışmalar
- `src/lib/data/gallery.js` — Galeri kartları (gerçek fotoğraf eklemek için `galeri/+page.svelte`
  içindeki `<Icon>` yer tutucusunu bir `<img>` etiketiyle değiştirebilirsin)
- `src/lib/data/quiz.js` — Bilim Bilgi Yarışması soruları

Öneri Kutusu ve Ayarlar > Profilim bölümleri şu an yalnızca tarayıcının `localStorage`
alanında veri tutuyor (gerçek bir sunucu/veritabanı yok); ileride bir backend eklemek
istersen bu iki sayfadaki kaydetme fonksiyonlarını bir API çağrısıyla değiştirmen yeterli.

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

Öneriler `oneriler` tablosuna yazılır; sadece Supabase → Table Editor'dan okunabilir.
Kurulum: `supabase/2026-09-30-oneri-kutusu.sql`.

## Paylaşım önizlemesi (WhatsApp vb.)

Önizleme görseli `static/og-image.png`. Görselin görünmesi için sitenin tam adresi gerekir:
build ortamına `VITE_SITE_URL` değişkenini ekle (ör. `https://siteadresin.com`) ya da `src/lib/site.js` dosyasına yaz.

## Yönetici paneli: Quiz ve Galeri (Supabase)

`/yonetim` sayfasında Duyurular ve Fırsatların yanında **Quizler** ve **Galeri** sekmeleri vardır.
Kurulum (bir kez): `supabase/2026-10-04-quiz-galeri-yonetimi.sql` dosyasını SQL Editor'de çalıştır
(önce `2026-10-03-yonetici-formu.sql` çalışmış olmalı). Bu dosya `quiz_konulari`, `quiz_sorulari`, `galeri`
tablolarını ve herkese açık `galeri` fotoğraf deposunu kurar; ekleme/silme sadece yöneticilere açıktır.

- **Quizler:** konu oluştur, tek soru ekle/düzenle/gizle/sil ya da **CSV dosyasından toplu soru ekle**.
  Örnek dosya: `supabase/ornek-quiz.csv` (sütunlar: konu, soru, secenek_a…secenek_d, dogru, aciklama, zorluk).
  Koddaki hazır konulara (fizik, kimya…) eklenen sorular aynı konunun havuzuna katılır; yeni konular
  Yarışmalar sayfasında kart olarak, Günlük Mini Quiz'de ise soru havuzunda görünür.
- **Galeri:** fotoğraf(lar) seç, başlık yaz, yükle. Fotoğraflar tarayıcıda küçültülüp yüklenir.
