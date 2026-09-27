-- =====================================================================
-- BİLİM VE TEKNOLOJİ KULÜBÜ — Supabase Veritabanı Kurulumu
-- Bu script'in TAMAMINI Supabase Dashboard → SQL Editor → New query
-- kısmına yapıştırıp "Run" ile bir kerede çalıştır.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) PROFİLLER TABLOSU
-- Her kullanıcının herkese açık profil bilgilerini tutar.
-- auth.users tablosuna (Supabase'in kendi kullanıcı tablosu) bağlıdır.
-- ---------------------------------------------------------------------
create table public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    full_name text,
    class_name text,           -- örn: "11-A"
    created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Herkes tüm profilleri görebilir (isim/sınıf gibi genel bilgiler)
create policy "Profiller herkese açık okunabilir"
    on public.profiles for select
    using (true);

-- Kullanıcı sadece kendi profilini güncelleyebilir
create policy "Kullanıcı kendi profilini güncelleyebilir"
    on public.profiles for update
    using (auth.uid() = id);

-- Kullanıcı sadece kendi profilini oluşturabilir
create policy "Kullanıcı kendi profilini oluşturabilir"
    on public.profiles for insert
    with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 2) YENİ KULLANICI KAYIT OLUNCA OTOMATİK PROFİL OLUŞTUR
-- Kayıt formunda "full_name" bilgisi user metadata olarak gönderilirse
-- (auth.signUp'ta options.data içinde), otomatik profile kopyalanır.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, full_name, class_name)
    values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'class_name');
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- 3) QUIZ SKORLARI TABLOSU
-- Şu an localStorage'da tutulan quiz sonuçlarının Supabase karşılığı.
-- ---------------------------------------------------------------------
create table public.quiz_scores (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    subject text not null,          -- örn: "fizik", "biyoloji"
    subject_title text,             -- örn: "Fizik Hızlı Quiz"
    score int not null,
    created_at timestamptz default now()
);

alter table public.quiz_scores enable row level security;

-- Herkes tüm skorları görebilir (liderlik tablosu için gerekli)
create policy "Skorlar herkese açık okunabilir"
    on public.quiz_scores for select
    using (true);

-- Kullanıcı sadece kendi adına skor ekleyebilir
create policy "Kullanıcı kendi skorunu ekleyebilir"
    on public.quiz_scores for insert
    with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 4) LİDERLİK TABLOSU GÖRÜNÜMÜ (VIEW)
-- Her kullanıcının en yüksek skorunu, isim/sınıfıyla birlikte sıralı
-- şekilde döner — yarismalar sayfasındaki tablo bunu kullanacak.
-- ---------------------------------------------------------------------
create or replace view public.leaderboard_view as
select
    p.id as user_id,
    p.full_name,
    p.class_name,
    max(qs.score) as best_score
from public.quiz_scores qs
join public.profiles p on p.id = qs.user_id
group by p.id, p.full_name, p.class_name
order by best_score desc;

-- =====================================================================
-- Kurulum tamamlandı. Table Editor'dan "profiles" ve "quiz_scores"
-- tablolarının oluştuğunu görebilirsin.
-- =====================================================================
