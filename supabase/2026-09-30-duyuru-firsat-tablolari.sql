-- =====================================================================
-- GÜNCELLEME: Duyurular ve Fırsatlar artık Supabase'den okunuyor
-- Supabase Dashboard → SQL Editor → New query'e yapıştırıp Run.
-- Tekrar çalıştırılabilir (tablolar zaten doluysa örnek satırları tekrar eklemez).
--
-- Herkes (giriş yapmamış olanlar dahil) "aktif" satırları OKUYABİLİR.
-- Ekleme / düzenleme / silme için politika yok: bunları sadece
-- Dashboard → Table Editor'dan sen yaparsın.
--
-- Yayından kaldırmak için satırı silmek yerine aktif = false yapabilirsin.
-- =====================================================================

-- ---------- DUYURULAR ----------
create table if not exists public.duyurular (
    id bigint generated always as identity primary key,
    baslik text not null,
    etiket text not null default 'Bilim',
    tarih date not null default current_date,
    ozet text not null,
    link text,                      -- haberin adresi
    kaynak_ad text,                 -- yayın organı (ör. AA, CHIP Online)
    aktif boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.duyurular enable row level security;

drop policy if exists "Herkes aktif duyuruları okuyabilir" on public.duyurular;
create policy "Herkes aktif duyuruları okuyabilir"
    on public.duyurular for select
    to anon, authenticated
    using (aktif);

insert into public.duyurular (baslik, etiket, tarih, ozet, link, kaynak_ad)
select v.baslik, v.etiket, v.tarih::date, v.ozet, v.link, v.kaynak_ad
from (values
  ('Ay’da yeni ve dev bir çarpma krateri bulundu', 'Uzay', '2026-09-30', 'NASA’nın Ay Keşif Uydusu (LRO), Mayıs 2024’te bir asteroit ya da kuyruklu yıldız parçasının çarpmasıyla oluşan, yaklaşık 222 metre çapında ve 43 metre derinliğindeki krateri tespit etti. Güneş Sistemi’nde yakın zamanda oluştuğu bilinen en büyük çarpışma krateri olarak anılıyor.', 'https://www.bursahakimiyet.com.tr/teknoloji/bilim-dunyasinda-eylul-ayina-damga-vuran-kesifler-insan-beyinli-farelerden-ay-daki-dev-kratere-1720049', 'AA, eylül derlemesi'),
  ('Bir kuantum işlemci ilk kez Dünya yörüngesinde çalıştırıldı', 'Teknoloji', '2026-09-28', 'Araştırmacılar fotonik bir kuantum işlemcinin uzay ortamında kuantum davranışı üretip kontrol edebildiğini gösterdi. Sonuçlar henüz hakem değerlendirmesinden geçmedi (ön baskı) ve sistem uydu verisini gerçekten analiz edecek seviyede değil.', 'https://www.chip.com.tr/guncel/bir-kuantum-bilgisayar-ilk-kez-uzayda-calistirildi_184134.html', 'CHIP Online'),
  ('FAST teleskobu 1300’den fazla pulsar kaydetti', 'Uzay', '2026-09-30', 'Çin’deki dünyanın en büyük radyo teleskobu FAST, 2016’da hizmete girdiğinden beri hızla dönen ve güçlü manyetik alan yayan 1300’den fazla nötron yıldızı (pulsar) gözlemledi; bu, diğer tüm teleskopların toplamından fazla.', 'https://www.bursahakimiyet.com.tr/teknoloji/bilim-dunyasinda-eylul-ayina-damga-vuran-kesifler-insan-beyinli-farelerden-ay-daki-dev-kratere-1720049', 'AA, eylül derlemesi'),
  ('Ay’daki su, büyük bir yerleşimi uzun süre taşımaya yetmeyebilir', 'Uzay', '2026-09-30', 'Frontiers in Space Technologies’te yayımlanan araştırmaya göre Ay’da kullanılabilir yaklaşık 1 milyar ton su olduğu varsayılsa bile 1 milyon kişilik bir kent bunu 2,5 yıldan kısa sürede tüketebilir. Yoğun geri dönüşümle bile kaynak en fazla 100 yıl yetiyor.', 'https://www.bursahakimiyet.com.tr/teknoloji/bilim-dunyasinda-eylul-ayina-damga-vuran-kesifler-insan-beyinli-farelerden-ay-daki-dev-kratere-1720049', 'AA, eylül derlemesi'),
  ('Felçli hastalar için konuşma ve beden dilini birlikte aktaran beyin-bilgisayar arayüzü', 'Sağlık', '2026-09-30', 'ABD Ulusal Sağlık Enstitüsü (NIH), üç felçli hastanın beyin sinyallerini makine öğrenmesiyle sanal bir karaktere dönüştüren bir sistem duyurdu. Konuşmayı ve beden hareketini aynı anda aktarabilen ilk cihaz olduğu belirtiliyor.', 'https://www.bursahakimiyet.com.tr/teknoloji/bilim-dunyasinda-eylul-ayina-damga-vuran-kesifler-insan-beyinli-farelerden-ay-daki-dev-kratere-1720049', 'AA, eylül derlemesi'),
  ('Genetiği değiştirilmiş domuz böbreğiyle 271 gün diyalizsiz yaşam', 'Biyoteknoloji', '2026-09-30', 'ABD’de böbrek yetmezliği olan bir hasta, insan donörden böbrek bekleme sürecinde 271 gün boyunca genetiği değiştirilmiş domuz böbreğiyle diyalize girmeden yaşadı; ardından insan böbreği nakledildi.', 'https://www.bursahakimiyet.com.tr/teknoloji/bilim-dunyasinda-eylul-ayina-damga-vuran-kesifler-insan-beyinli-farelerden-ay-daki-dev-kratere-1720049', 'AA, eylül derlemesi'),
  ('Stanford’da beyninin yaklaşık yarısı insan hücrelerinden oluşan fareler geliştirildi', 'Biyoloji', '2026-09-30', 'Araştırmacılar, fare beyninde bazı bölgelerin gelişimini genetik müdahaleyle kısıtlayıp yerine insan beyin organoidlerinden elde edilen hücreler nakletti. Hayvan beyninin hacimce yaklaşık yarısı insan hücrelerinden oluştu.', 'https://www.bursahakimiyet.com.tr/teknoloji/bilim-dunyasinda-eylul-ayina-damga-vuran-kesifler-insan-beyinli-farelerden-ay-daki-dev-kratere-1720049', 'AA, eylül derlemesi'),
  ('Afrika filleri hastalanınca şifalı bitkilere başvuruyor olabilir', 'Biyoloji', '2026-09-30', 'Araştırmacılar fillerin 35 bitki türünden yararlandığını, bunların 25’inin yerel halk tarafından da tıbbi amaçla kullanıldığını saptadı. Anne fillerin bazı bitkileri yavrularına da yedirdiği gözlemlendi.', 'https://www.bursahakimiyet.com.tr/teknoloji/bilim-dunyasinda-eylul-ayina-damga-vuran-kesifler-insan-beyinli-farelerden-ay-daki-dev-kratere-1720049', 'AA, eylül derlemesi')
) as v(baslik, etiket, tarih, ozet, link, kaynak_ad)
where not exists (select 1 from public.duyurular);

-- ---------- FIRSATLAR ----------
create table if not exists public.firsatlar (
    id bigint generated always as identity primary key,
    baslik text not null,
    kurum text,
    tur text,                       -- Ulusal, Uluslararası, Etkinlik, Eğitim, Okul içi
    durum text not null default 'yaklasan'
        check (durum in ('acik', 'yaklasan', 'etkinlik', 'okul-ici')),
    son text,                       -- kartta görünen tarih metni
    son_tarih date,                 -- son başvuru günü; geçince kart otomatik "Kapandı" olur
    ozet text not null,
    link text,                      -- başvuru / detay sayfası
    link_ad text,                   -- butonda görünen yazı
    kaynak text,                    -- bilginin alındığı sayfa
    kaynak_ad text,
    aktif boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.firsatlar enable row level security;

drop policy if exists "Herkes aktif fırsatları okuyabilir" on public.firsatlar;
create policy "Herkes aktif fırsatları okuyabilir"
    on public.firsatlar for select
    to anon, authenticated
    using (aktif);

insert into public.firsatlar (baslik, kurum, tur, durum, son, son_tarih, ozet, link, link_ad, kaynak, kaynak_ad)
select v.baslik, v.kurum, v.tur, v.durum, v.son, v.son_tarih::date, v.ozet, v.link, v.link_ad, v.kaynak, v.kaynak_ad
from (values
  ('TÜBİTAK 2204-A Lise Öğrencileri Araştırma Projeleri Yarışması', 'TÜBİTAK', 'Ulusal', 'acik', 'Başvuru: 23 Eylül 2026 – 4 Ocak 2027, 17.30', '2027-01-04', 'Lise öğrencileri danışman öğretmenle hazırladıkları araştırma projeleriyle bölge ve Türkiye finaline yarışır. Bu yıl 58. kez düzenleniyor; başvurular TÜBİTAK Yönetim Bilgi Sistemi (TYBS) üzerinden yapılıyor.', 'https://tybsng.tubitak.gov.tr/', 'TYBS başvuru sistemi', 'https://tekirdagyenihaber.com/2026/09/23/2027-yili-2204-a-lise-ogrencileri-arastirma-projeleri-yarismasi-ve-2204-b-ortaokul-ogrencileri-arastirma-projeleri-yarismasi-basliyor/', 'Çağrı duyurusu haberi'),
  ('TÜBİTAK 2204-B Ortaokul Öğrencileri Araştırma Projeleri Yarışması', 'TÜBİTAK', 'Ulusal', 'yaklasan', 'Başvuru: 21 Ekim 2026 – 10 Şubat 2027, 17.30', '2027-02-10', 'Ortaokul öğrencilerinin araştırma projeleriyle katıldığı yarışma. Bu yıl 21. kez düzenleniyor; başvurular 21 Ekim 2026’da başlıyor.', 'https://tubitak.gov.tr/en/competitions/2204-b-secondary-school-students-research-projects-competition', 'TÜBİTAK yarışma sayfası', 'https://tekirdagyenihaber.com/2026/09/23/2027-yili-2204-a-lise-ogrencileri-arastirma-projeleri-yarismasi-ve-2204-b-ortaokul-ogrencileri-arastirma-projeleri-yarismasi-basliyor/', 'Çağrı duyurusu haberi'),
  ('NASA Space Apps Challenge 2026', 'NASA', 'Uluslararası', 'acik', 'Hackathon: 14–15 Kasım 2026 · Kayıt 15 Kasım’a kadar', '2026-11-15', 'NASA ve uzay ajanslarının açık verileriyle Dünya ve uzay problemlerine çözüm geliştirilen iki günlük hackathon. Herkese açık; takımlar en fazla 6 kişi olabilir. Önce hesap açıp kayıt olmak ve bir Local Event seçmek gerekiyor.', 'https://www.spaceappschallenge.org/2026/', 'Kayıt sayfası', 'https://www.spaceappschallenge.org/2026/', 'NASA Space Apps resmi sitesi'),
  ('TEKNOFEST Şanlıurfa 2026 — Yarışma Finalleri', 'TEKNOFEST', 'Etkinlik', 'etkinlik', '30 Eylül – 4 Ekim 2026, Şanlıurfa', '2026-10-04', 'TEKNOFEST teknoloji yarışmalarının finalleri Şanlıurfa’da yapılıyor. 2026 dönemi yarışma başvuruları Şubat–Nisan aylarında kapandı; bir sonraki dönemin takvimi için TEKNOFEST sayfasını takip et.', 'https://www.teknofest.org/tr/yarismalar/insanlik-yararina-teknolojiler-yarismasi-lise-seviyesi/', 'TEKNOFEST yarışma sayfası', 'https://www.teknofest.org/tr/yarismalar/insanlik-yararina-teknolojiler-yarismasi-lise-seviyesi/', 'TEKNOFEST resmi sitesi'),
  ('TÜBİTAK Bilim Olimpiyatları (35. dönem)', 'TÜBİTAK', 'Ulusal', 'yaklasan', 'Yeni çağrı takvimi resmi sitede ilan edilecek', null, 'Astronomi, biyoloji, fizik, kimya, matematik, bilgisayar ve coğrafya dallarında ortaokul ve lise öğrencilerine açık olimpiyat programı. Geçen yıl başvurular 12 Ocak’ta başlayıp Nisan’a kadar sürdü, birinci aşama sınavı 16 Mayıs 2026’da yapıldı.', 'https://bilimolimpiyatlari.tubitak.gov.tr/tr/duyurular', 'Olimpiyat duyuruları', 'https://tubitak.gov.tr/tr/duyuru/bilim-olimpiyatlari-programi-birinci-asama-sinavi-basvuru-takvimi-guncellendi', 'TÜBİTAK duyurusu (2026 takvimi)'),
  ('DENEYAP Teknoloji Atölyeleri', 'T3 Vakfı · TÜBİTAK · Sanayi ve Teknoloji Bakanlığı', 'Eğitim', 'yaklasan', 'Yeni dönem başvuruları deneyap.org’da ilan edilecek', null, '81 ilde 36 ay boyunca ücretsiz robotik, yapay zekâ, yazılım, siber güvenlik gibi 11 başlıkta teknoloji eğitimi. Seçim e-sınavla başlıyor. Geçen dönem başvurular 27 Ocak – 30 Mart 2026 arasındaydı; 8. sınıf, hazırlık ve 9. sınıflar başvurabildi.', 'https://deneyap.org/tr/basvurular/sinav-basvuru/', 'Başvuru sayfası', 'https://deneyap.org/tr/basvurular/sinav-basvuru/', 'DENEYAP resmi sitesi'),
  ('Okul İçi Mini Hackathon', 'Bilim ve Teknoloji Kulübü', 'Okul içi', 'okul-ici', 'Planlanıyor, tarih belirlenecek', null, 'Takım halinde bir günde küçük bir uygulama ya da prototip geliştirilmesi planlanan okul içi etkinlik.', null, null, null, null)
) as v(baslik, kurum, tur, durum, son, son_tarih, ozet, link, link_ad, kaynak, kaynak_ad)
where not exists (select 1 from public.firsatlar);
