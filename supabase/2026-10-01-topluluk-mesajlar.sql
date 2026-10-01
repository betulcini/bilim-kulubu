-- =====================================================================
-- GÜNCELLEME: Topluluk (öğrenci dizini) + Mesajlar
-- Supabase Dashboard → SQL Editor → New query'e yapıştırıp Run.
-- Tekrar çalıştırılabilir (zarar vermez).
--
-- Gizlilik ilkeleri:
--  * Profil dizinde ancak kullanıcı AÇIKÇA izin verirse görünür (varsayılan: gizli).
--  * Dizini sadece giriş yapmış kullanıcılar görebilir.
--  * E-posta hiçbir yerde paylaşılmaz; iletişim site içi mesajla olur.
--  * Mesajı sadece gönderen ve alıcı okuyabilir. Engelleme + şikayet vardır.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) TOPLULUK PROFİLİ
-- Ad ve sınıf zaten public.profiles'ta; burada sadece dizin ayarları var.
-- profiles tablosu herkese açık okunabildiği için ilgi alanları ve biyografi
-- ayrı bir tabloda tutulur ve sadece is_public = true ise başkaları görebilir.
-- ---------------------------------------------------------------------
create table if not exists public.community_profiles (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    is_public boolean not null default false,
    bio text,
    interests text[] not null default '{}',
    updated_at timestamptz not null default now(),
    constraint community_bio_len check (char_length(coalesce(bio, '')) <= 280),
    constraint community_interests_len check (cardinality(interests) <= 12)
);

alter table public.community_profiles enable row level security;

drop policy if exists "Topluluk: herkese açık profilleri üyeler görür" on public.community_profiles;
create policy "Topluluk: herkese açık profilleri üyeler görür"
    on public.community_profiles for select
    to authenticated
    using (is_public or user_id = auth.uid());

drop policy if exists "Topluluk: kendi kaydını ekler" on public.community_profiles;
create policy "Topluluk: kendi kaydını ekler"
    on public.community_profiles for insert
    to authenticated
    with check (user_id = auth.uid());

drop policy if exists "Topluluk: kendi kaydını günceller" on public.community_profiles;
create policy "Topluluk: kendi kaydını günceller"
    on public.community_profiles for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

-- Mevcut kullanıcıların kayıtta seçtiği ilgi alanlarını taşı.
-- is_public varsayılan olarak false kalır: kimse kendi izni olmadan listelenmez.
insert into public.community_profiles (user_id, interests)
select
    p.id,
    case
        when jsonb_typeof(u.raw_user_meta_data->'interests') = 'array'
        then array(select jsonb_array_elements_text(u.raw_user_meta_data->'interests') limit 12)
        else '{}'::text[]
    end
from public.profiles p
join auth.users u on u.id = p.id
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------
-- 2) ENGELLER
-- ---------------------------------------------------------------------
create table if not exists public.engeller (
    engelleyen uuid not null default auth.uid() references public.profiles(id) on delete cascade,
    engellenen uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (engelleyen, engellenen),
    constraint engel_kendine check (engelleyen <> engellenen)
);

alter table public.engeller enable row level security;

drop policy if exists "Engeller: kendi listemi görürüm" on public.engeller;
create policy "Engeller: kendi listemi görürüm"
    on public.engeller for select to authenticated
    using (engelleyen = auth.uid());

drop policy if exists "Engeller: ben engellerim" on public.engeller;
create policy "Engeller: ben engellerim"
    on public.engeller for insert to authenticated
    with check (engelleyen = auth.uid());

drop policy if exists "Engeller: engeli kaldırırım" on public.engeller;
create policy "Engeller: engeli kaldırırım"
    on public.engeller for delete to authenticated
    using (engelleyen = auth.uid());

-- ---------------------------------------------------------------------
-- 3) MESAJ GÖNDERME KURALI
-- Engel tablosunu gönderen göremez (RLS), bu yüzden kontrol security definer
-- bir fonksiyonda yapılır ve sadece true/false döner.
--   - Aralarında engel varsa (iki yönde de) yazılamaz.
--   - Alıcının profili herkese açıksa yazılabilir.
--   - Alıcı daha önce bana yazdıysa (profili gizli olsa bile) cevap verebilirim.
-- ---------------------------------------------------------------------
create or replace function public.can_message(target uuid)
returns boolean
language plpgsql
stable
security definer set search_path = public
as $$
begin
    if auth.uid() is null or target = auth.uid() then
        return false;
    end if;

    if exists (
        select 1 from public.engeller e
        where (e.engelleyen = target and e.engellenen = auth.uid())
           or (e.engelleyen = auth.uid() and e.engellenen = target)
    ) then
        return false;
    end if;

    return exists (select 1 from public.community_profiles c where c.user_id = target and c.is_public)
        or exists (select 1 from public.mesajlar m where m.gonderen = target and m.alici = auth.uid());
end;
$$;

-- ---------------------------------------------------------------------
-- 4) MESAJLAR
-- ---------------------------------------------------------------------
create table if not exists public.mesajlar (
    id bigint generated always as identity primary key,
    gonderen uuid not null default auth.uid() references public.profiles(id) on delete cascade,
    alici uuid not null references public.profiles(id) on delete cascade,
    icerik text not null,
    okundu boolean not null default false,
    created_at timestamptz not null default now(),
    constraint mesaj_kendine check (gonderen <> alici),
    constraint mesaj_uzunluk check (char_length(btrim(icerik)) between 1 and 1000)
);

create index if not exists mesajlar_gonderen_idx on public.mesajlar (gonderen, created_at desc);
create index if not exists mesajlar_alici_idx on public.mesajlar (alici, created_at desc);

alter table public.mesajlar enable row level security;

drop policy if exists "Mesajlar: taraflar okur" on public.mesajlar;
create policy "Mesajlar: taraflar okur"
    on public.mesajlar for select to authenticated
    using (gonderen = auth.uid() or alici = auth.uid());

drop policy if exists "Mesajlar: kurala uygunsa gönderir" on public.mesajlar;
create policy "Mesajlar: kurala uygunsa gönderir"
    on public.mesajlar for insert to authenticated
    with check (gonderen = auth.uid() and public.can_message(alici));

-- Alıcı sadece "okundu" bilgisini değiştirebilsin; içerik değiştirilemesin.
drop policy if exists "Mesajlar: alıcı okundu işaretler" on public.mesajlar;
create policy "Mesajlar: alıcı okundu işaretler"
    on public.mesajlar for update to authenticated
    using (alici = auth.uid())
    with check (alici = auth.uid());

revoke update on public.mesajlar from anon, authenticated;
grant update (okundu) on public.mesajlar to authenticated;

-- Silme politikası yok: mesajlar siteden silinemez (şikayet incelemesi için).

-- Basit spam freni: bir kullanıcı dakikada en fazla 10 mesaj atabilir.
create or replace function public.mesaj_hiz_siniri()
returns trigger
language plpgsql
as $$
begin
    if (select count(*) from public.mesajlar
        where gonderen = new.gonderen and created_at > now() - interval '1 minute') >= 10 then
        raise exception 'Çok hızlı mesaj gönderiyorsun, biraz bekle.';
    end if;
    return new;
end;
$$;

drop trigger if exists mesaj_hiz_siniri_tetik on public.mesajlar;
create trigger mesaj_hiz_siniri_tetik
    before insert on public.mesajlar
    for each row execute procedure public.mesaj_hiz_siniri();

-- ---------------------------------------------------------------------
-- 5) ŞİKAYETLER
-- Öneri kutusu gibi: giriş yapan herkes gönderebilir, siteden kimse okuyamaz.
-- Sadece Supabase Dashboard → Table Editor → "sikayetler" üzerinden görülür.
-- ---------------------------------------------------------------------
create table if not exists public.sikayetler (
    id bigint generated always as identity primary key,
    bildiren uuid not null default auth.uid() references public.profiles(id) on delete cascade,
    sikayet_edilen uuid not null references public.profiles(id) on delete cascade,
    sebep text not null,
    aciklama text,
    created_at timestamptz not null default now(),
    constraint sikayet_sebep_len check (char_length(sebep) between 1 and 40),
    constraint sikayet_aciklama_len check (char_length(coalesce(aciklama, '')) <= 500)
);

alter table public.sikayetler enable row level security;

drop policy if exists "Şikayetler: üyeler gönderebilir" on public.sikayetler;
create policy "Şikayetler: üyeler gönderebilir"
    on public.sikayetler for insert to authenticated
    with check (bildiren = auth.uid());
-- Bilerek SELECT / UPDATE / DELETE politikası YOK.
