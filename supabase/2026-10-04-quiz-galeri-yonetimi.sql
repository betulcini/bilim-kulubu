-- =====================================================================
-- YENİ: Yönetici panelinden Quiz oluşturma (CSV ile toplu ekleme dahil) ve Galeri fotoğrafı ekleme
-- ÖNCE 2026-10-03-yonetici-formu.sql çalışmış olmalı (is_yonetici fonksiyonu orada).
-- Supabase Dashboard → SQL Editor → New query'e yapıştırıp Run.
-- Tekrar çalıştırılabilir (zarar vermez).
--
-- Mantık:
--  * Herkes (giriş yapmamışlar dahil) sadece "aktif" quiz konularını, sorularını
--    ve galeri fotoğraflarını OKUYABİLİR.
--  * Ekleme / düzenleme / silme sadece yöneticiler (is_yonetici) içindir.
--  * Fotoğraflar "galeri" adlı herkese açık Storage kovasında durur;
--    yükleme ve silme yetkisi sadece yöneticilerdedir.
-- =====================================================================

-- ---------- QUIZ KONULARI ----------
create table if not exists public.quiz_konulari (
    slug text primary key
        check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 40),
    baslik text not null check (char_length(baslik) between 2 and 80),
    aciklama text not null default '' check (char_length(aciklama) <= 300),
    aktif boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.quiz_konulari enable row level security;

drop policy if exists "Herkes aktif quiz konularini okur" on public.quiz_konulari;
create policy "Herkes aktif quiz konularini okur"
    on public.quiz_konulari for select to anon, authenticated using (aktif);

drop policy if exists "Yonetici quiz konularini gorur" on public.quiz_konulari;
create policy "Yonetici quiz konularini gorur"
    on public.quiz_konulari for select to authenticated using (public.is_yonetici());

drop policy if exists "Yonetici quiz konusu ekler" on public.quiz_konulari;
create policy "Yonetici quiz konusu ekler"
    on public.quiz_konulari for insert to authenticated with check (public.is_yonetici());

drop policy if exists "Yonetici quiz konusu gunceller" on public.quiz_konulari;
create policy "Yonetici quiz konusu gunceller"
    on public.quiz_konulari for update to authenticated
    using (public.is_yonetici()) with check (public.is_yonetici());

drop policy if exists "Yonetici quiz konusu siler" on public.quiz_konulari;
create policy "Yonetici quiz konusu siler"
    on public.quiz_konulari for delete to authenticated using (public.is_yonetici());

-- ---------- QUIZ SORULARI ----------
create table if not exists public.quiz_sorulari (
    id bigint generated always as identity primary key,
    konu text not null references public.quiz_konulari(slug) on delete cascade on update cascade,
    soru text not null check (char_length(soru) between 5 and 600),
    secenekler text[] not null check (array_length(secenekler, 1) between 2 and 6),
    dogru text not null,
    aciklama text check (aciklama is null or char_length(aciklama) <= 800),
    zorluk text not null default 'Orta' check (zorluk in ('Kolay', 'Orta', 'Zor')),
    aktif boolean not null default true,
    created_at timestamptz not null default now(),
    -- doğru cevap şıklardan biri olmak zorunda
    constraint quiz_dogru_siklardan check (dogru = any (secenekler))
);

create index if not exists quiz_sorulari_konu_idx on public.quiz_sorulari (konu);

alter table public.quiz_sorulari enable row level security;

drop policy if exists "Herkes aktif quiz sorularini okur" on public.quiz_sorulari;
create policy "Herkes aktif quiz sorularini okur"
    on public.quiz_sorulari for select to anon, authenticated
    using (aktif and exists (select 1 from public.quiz_konulari k where k.slug = konu and k.aktif));

drop policy if exists "Yonetici quiz sorularini gorur" on public.quiz_sorulari;
create policy "Yonetici quiz sorularini gorur"
    on public.quiz_sorulari for select to authenticated using (public.is_yonetici());

drop policy if exists "Yonetici quiz sorusu ekler" on public.quiz_sorulari;
create policy "Yonetici quiz sorusu ekler"
    on public.quiz_sorulari for insert to authenticated with check (public.is_yonetici());

drop policy if exists "Yonetici quiz sorusu gunceller" on public.quiz_sorulari;
create policy "Yonetici quiz sorusu gunceller"
    on public.quiz_sorulari for update to authenticated
    using (public.is_yonetici()) with check (public.is_yonetici());

drop policy if exists "Yonetici quiz sorusu siler" on public.quiz_sorulari;
create policy "Yonetici quiz sorusu siler"
    on public.quiz_sorulari for delete to authenticated using (public.is_yonetici());

-- ---------- GALERİ ----------
create table if not exists public.galeri (
    id bigint generated always as identity primary key,
    baslik text not null check (char_length(baslik) between 2 and 120),
    aciklama text check (aciklama is null or char_length(aciklama) <= 400),
    gorsel_yolu text not null,          -- "galeri" kovasındaki dosya yolu
    tarih date,                         -- etkinlik tarihi (isteğe bağlı)
    aktif boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.galeri enable row level security;

drop policy if exists "Herkes aktif galeri kayitlarini okur" on public.galeri;
create policy "Herkes aktif galeri kayitlarini okur"
    on public.galeri for select to anon, authenticated using (aktif);

drop policy if exists "Yonetici galeriyi gorur" on public.galeri;
create policy "Yonetici galeriyi gorur"
    on public.galeri for select to authenticated using (public.is_yonetici());

drop policy if exists "Yonetici galeriye ekler" on public.galeri;
create policy "Yonetici galeriye ekler"
    on public.galeri for insert to authenticated with check (public.is_yonetici());

drop policy if exists "Yonetici galeriyi gunceller" on public.galeri;
create policy "Yonetici galeriyi gunceller"
    on public.galeri for update to authenticated
    using (public.is_yonetici()) with check (public.is_yonetici());

drop policy if exists "Yonetici galeriden siler" on public.galeri;
create policy "Yonetici galeriden siler"
    on public.galeri for delete to authenticated using (public.is_yonetici());

-- ---------- FOTOĞRAF DEPOSU (Storage) ----------
-- Herkese açık okunur (adresi bilinen görsel görünür); sadece yönetici yükler / siler.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('galeri', 'galeri', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
    set public = true,
        file_size_limit = 5242880,
        allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Yonetici galeri gorseli yukler" on storage.objects;
create policy "Yonetici galeri gorseli yukler"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'galeri' and public.is_yonetici());

drop policy if exists "Yonetici galeri gorselini gunceller" on storage.objects;
create policy "Yonetici galeri gorselini gunceller"
    on storage.objects for update to authenticated
    using (bucket_id = 'galeri' and public.is_yonetici())
    with check (bucket_id = 'galeri' and public.is_yonetici());

drop policy if exists "Yonetici galeri gorselini siler" on storage.objects;
create policy "Yonetici galeri gorselini siler"
    on storage.objects for delete to authenticated
    using (bucket_id = 'galeri' and public.is_yonetici());
