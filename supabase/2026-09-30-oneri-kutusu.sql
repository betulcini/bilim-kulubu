-- =====================================================================
-- GÜNCELLEME: Öneri Kutusu
-- Supabase Dashboard → SQL Editor → New query'e yapıştırıp Run.
-- Tekrar çalıştırılabilir (zarar vermez).
--
-- Herkes (giriş yapmamış olanlar dahil) öneri GÖNDEREBİLİR, ama kimse
-- site üzerinden öneri OKUYAMAZ. Öneriler sadece Supabase Dashboard →
-- Table Editor → "oneriler" tablosundan görüntülenir.
-- =====================================================================

create table if not exists public.oneriler (
    id bigint generated always as identity primary key,
    isim text,                                   -- isteğe bağlı
    kategori text not null,
    mesaj text not null,
    user_id uuid default auth.uid(),             -- giriş yapmışsa otomatik dolar, değilse boş kalır
    created_at timestamptz not null default now(),
    constraint oneriler_isim_len check (char_length(coalesce(isim, '')) <= 60),
    constraint oneriler_kategori_len check (char_length(kategori) between 1 and 40),
    constraint oneriler_mesaj_len check (char_length(btrim(mesaj)) between 1 and 1000)
);

alter table public.oneriler enable row level security;

-- Ekleme: herkes. (user_id sadece kendi kimliği ya da boş olabilir; başkası adına gönderilemez.)
drop policy if exists "Herkes öneri gönderebilir" on public.oneriler;
create policy "Herkes öneri gönderebilir"
    on public.oneriler for insert
    to anon, authenticated
    with check (user_id is null or user_id = auth.uid());

-- Bilerek SELECT / UPDATE / DELETE politikası YOK:
-- RLS açıkken politika olmayan işlem reddedilir, yani site üzerinden okunamaz.
-- Dashboard (Table Editor) yönetici yetkisiyle çalıştığı için RLS'e takılmadan görür.
