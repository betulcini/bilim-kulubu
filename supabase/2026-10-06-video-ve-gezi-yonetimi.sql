-- =====================================================================
-- YENİ: Yönetici panelinden (1) Bilim Serileri / Bilim Tiyatrosu'na YouTube videosu
--       ekleme ve (2) Kulüp Gezisi duyurusu ekleme / düzenleme / gizleme / silme.
-- ÖNCE 2026-10-03-yonetici-formu.sql çalışmış olmalı (is_yonetici fonksiyonu orada).
-- Supabase Dashboard → SQL Editor → New query'e yapıştırıp Run.
-- Tekrar çalıştırılabilir (zarar vermez). Not: geziler tablosu BOŞSA 4 örnek gezi
-- eklenir; bilerek hepsini silersen bu dosyayı yeniden çalıştırma.
--
-- Herkes (giriş yapmamış olanlar dahil) "aktif" satırları okuyabilir.
-- Ekleme / düzenleme / silme sadece yöneticilere açıktır (RLS).
-- =====================================================================

-- ---------- VİDEOLAR ----------
create table if not exists public.videolar (
    id bigint generated always as identity primary key,
    bolum text not null check (bolum in ('seri', 'tiyatro')),   -- seri = Bilim Serileri, tiyatro = Bilim Tiyatrosu
    baslik text not null check (char_length(baslik) between 3 and 140),
    aciklama text check (aciklama is null or char_length(aciklama) <= 500),
    grup text check (grup is null or char_length(grup) <= 80),   -- seri / gösteri adı (isteğe bağlı)
    youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
    aktif boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.videolar enable row level security;

drop policy if exists "Herkes aktif videolari okuyabilir" on public.videolar;
create policy "Herkes aktif videolari okuyabilir"
    on public.videolar for select to anon, authenticated using (aktif);

drop policy if exists "Yonetici videolari gorur" on public.videolar;
create policy "Yonetici videolari gorur"
    on public.videolar for select to authenticated using (public.is_yonetici());

drop policy if exists "Yonetici video ekler" on public.videolar;
create policy "Yonetici video ekler"
    on public.videolar for insert to authenticated with check (public.is_yonetici());

drop policy if exists "Yonetici video gunceller" on public.videolar;
create policy "Yonetici video gunceller"
    on public.videolar for update to authenticated
    using (public.is_yonetici()) with check (public.is_yonetici());

drop policy if exists "Yonetici video siler" on public.videolar;
create policy "Yonetici video siler"
    on public.videolar for delete to authenticated using (public.is_yonetici());

create index if not exists videolar_bolum_idx on public.videolar (bolum, created_at desc);

-- ---------- GEZİLER ----------
create table if not exists public.geziler (
    id bigint generated always as identity primary key,
    yer text not null check (char_length(yer) between 3 and 140),
    durum text not null default 'planlaniyor' check (durum in ('planlaniyor', 'gerceklesti', 'iptal')),
    gun date,                        -- sıralama için; belli değilse boş
    tarih_metni text check (tarih_metni is null or char_length(tarih_metni) <= 120),  -- kartta görünen tarih yazısı
    ozet text not null check (char_length(ozet) between 10 and 700),
    link text check (link is null or link ~* '^https?://'),   -- kayıt / bilgi bağlantısı
    link_ad text check (link_ad is null or char_length(link_ad) <= 60),
    aktif boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.geziler enable row level security;

drop policy if exists "Herkes aktif gezileri okuyabilir" on public.geziler;
create policy "Herkes aktif gezileri okuyabilir"
    on public.geziler for select to anon, authenticated using (aktif);

drop policy if exists "Yonetici gezileri gorur" on public.geziler;
create policy "Yonetici gezileri gorur"
    on public.geziler for select to authenticated using (public.is_yonetici());

drop policy if exists "Yonetici gezi ekler" on public.geziler;
create policy "Yonetici gezi ekler"
    on public.geziler for insert to authenticated with check (public.is_yonetici());

drop policy if exists "Yonetici gezi gunceller" on public.geziler;
create policy "Yonetici gezi gunceller"
    on public.geziler for update to authenticated
    using (public.is_yonetici()) with check (public.is_yonetici());

drop policy if exists "Yonetici gezi siler" on public.geziler;
create policy "Yonetici gezi siler"
    on public.geziler for delete to authenticated using (public.is_yonetici());

-- Sitedeki mevcut 4 planlanan gezi (tablo boşsa bir kez eklenir; panelden düzenleyip silebilirsin)
insert into public.geziler (yer, durum, tarih_metni, ozet)
select v.yer, 'planlaniyor', 'Tarih belirlenecek', v.ozet
from (values
  ('TÜBİTAK Bilim Merkezi', 'İnteraktif sergiler ve planetaryum gösterimiyle tam gün gezi.'),
  ('Rahmi M. Koç Müzesi', 'Sanayi tarihi ve ulaşım teknolojileri üzerine rehberli tur.'),
  ('Üniversite Robotik Laboratuvarı Ziyareti', 'Lisans öğrencilerinin robotik projelerinin yerinde incelenmesi.'),
  ('Gözlemevi Gece Turu', 'Teleskopla gök cismi gözlemi ve astronomi söyleşisi.')
) as v(yer, ozet)
where not exists (select 1 from public.geziler);
