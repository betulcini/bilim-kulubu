-- =====================================================================
-- GÜNCELLEME: Topluluk profiline rol (öğrenci/öğretmen/mezun), Instagram ve LinkedIn
-- ÖNCE 2026-10-01-topluluk-mesajlar.sql çalışmış olmalı.
-- Supabase Dashboard → SQL Editor → New query'e yapıştırıp Run.
-- Tekrar çalıştırılabilir (zarar vermez).
--
-- Not: Bu alanlar community_profiles tablosunda durur; mevcut RLS kuralları geçerlidir,
-- yani sadece is_public = true olan profillerde, giriş yapmış üyelere görünür.
-- Rol kişinin kendi beyanıdır, doğrulanmaz.
-- =====================================================================

alter table public.community_profiles
    add column if not exists role text not null default 'ogrenci',
    add column if not exists instagram text,
    add column if not exists linkedin text;

alter table public.community_profiles drop constraint if exists community_role_check;
alter table public.community_profiles
    add constraint community_role_check check (role in ('ogrenci', 'ogretmen', 'mezun', 'diger'));

-- Sadece kullanıcı adı (@ olmadan): harf, rakam, nokta, alt çizgi
alter table public.community_profiles drop constraint if exists community_instagram_check;
alter table public.community_profiles
    add constraint community_instagram_check check (instagram is null or instagram ~ '^[A-Za-z0-9._]{1,30}$');

-- Sadece linkedin.com/in/... adresleri (başka bir bağlantı ya da javascript: kabul edilmez)
alter table public.community_profiles drop constraint if exists community_linkedin_check;
alter table public.community_profiles
    add constraint community_linkedin_check check (
        linkedin is null or linkedin ~ '^https://(www\.)?linkedin\.com/in/[A-Za-z0-9_%-]{3,100}/?$'
    );
