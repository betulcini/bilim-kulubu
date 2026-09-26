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
