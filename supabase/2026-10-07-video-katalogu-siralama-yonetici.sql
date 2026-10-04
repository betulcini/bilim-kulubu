-- Video sıralaması, video kartları, oynatma listeleri ve yönetici yönetimi.
-- Önce 2026-10-03-yonetici-formu.sql ve 2026-10-06-video-ve-gezi-yonetimi.sql çalışmış olmalı.
-- Bu dosya tekrar çalıştırılabilir.

-- ---------- VİDEO SIRASI VE OYNATMA LİSTELERİ ----------
alter table public.videolar add column if not exists sira integer not null default 0;
alter table public.videolar add column if not exists playlist_id text;
alter table public.videolar alter column youtube_id drop not null;

alter table public.videolar drop constraint if exists videolar_youtube_kaynak_check;
alter table public.videolar
    add constraint videolar_youtube_kaynak_check check (
        (youtube_id is not null and playlist_id is null and youtube_id ~ '^[A-Za-z0-9_-]{11}$')
        or
        (youtube_id is null and playlist_id is not null and playlist_id ~ '^[A-Za-z0-9_-]{10,100}$')
    );

create index if not exists videolar_bolum_sira_idx
    on public.videolar (bolum, sira desc, created_at desc);

-- ---------- SERİ / TİYATRO TANITIM KARTLARI ----------
create table if not exists public.video_kartlari (
    id bigint generated always as identity primary key,
    bolum text not null check (bolum in ('seri', 'tiyatro')),
    baslik text not null check (char_length(baslik) between 3 and 140),
    aciklama text not null check (char_length(aciklama) between 10 and 700),
    durum text check (durum is null or char_length(durum) <= 100),
    alt_bilgi text check (alt_bilgi is null or char_length(alt_bilgi) <= 120),
    rozet text check (rozet is null or char_length(rozet) <= 60),
    sira integer not null default 0,
    aktif boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.video_kartlari enable row level security;

drop policy if exists "Herkes aktif video kartlarini okuyabilir" on public.video_kartlari;
create policy "Herkes aktif video kartlarini okuyabilir"
    on public.video_kartlari for select to anon, authenticated using (aktif);

drop policy if exists "Yonetici video kartlarini gorur" on public.video_kartlari;
create policy "Yonetici video kartlarini gorur"
    on public.video_kartlari for select to authenticated using (public.is_yonetici());

drop policy if exists "Yonetici video karti ekler" on public.video_kartlari;
create policy "Yonetici video karti ekler"
    on public.video_kartlari for insert to authenticated with check (public.is_yonetici());

drop policy if exists "Yonetici video karti gunceller" on public.video_kartlari;
create policy "Yonetici video karti gunceller"
    on public.video_kartlari for update to authenticated
    using (public.is_yonetici()) with check (public.is_yonetici());

drop policy if exists "Yonetici video karti siler" on public.video_kartlari;
create policy "Yonetici video karti siler"
    on public.video_kartlari for delete to authenticated using (public.is_yonetici());

create index if not exists video_kartlari_bolum_sira_idx
    on public.video_kartlari (bolum, sira, created_at);
create unique index if not exists video_kartlari_bolum_baslik_uidx
    on public.video_kartlari (bolum, baslik);

insert into public.video_kartlari (bolum, baslik, aciklama, durum, alt_bilgi, rozet, sira)
select v.bolum, v.baslik, v.aciklama, v.durum, v.alt_bilgi, v.rozet, v.sira
from (values
    ('seri', 'Günlük Hayatta Fizik', 'Mutfaktan trafiğe, çevremizdeki olayları fizik kurallarıyla açıklayan kısa bölümler.', 'Senaryo aşamasında', '4 bölüm planlandı', 'Geliştirme aşamasında', 1),
    ('seri', 'Laboratuvar Anları', 'Kulüp laboratuvarında yapılan deneylerin arka planını ve sonuçlarını gösteren seri.', 'Çekim planlanıyor', '3 bölüm planlandı', 'Geliştirme aşamasında', 2),
    ('seri', 'Bilim İnsanlarıyla Söyleşi', 'Üniversitelerden akademisyenlerle yapılacak kısa röportaj serisi.', 'Konuk listesi oluşturuluyor', '2 bölüm planlandı', 'Geliştirme aşamasında', 3),
    ('seri', 'Mikro Dünya', 'Okul mikroskobuyla çekilen görüntülerle hücreleri ve mikroorganizmaları tanıtan bölümler.', 'Görüntü arşivi hazırlanıyor', '5 bölüm planlandı', 'Geliştirme aşamasında', 4),
    ('tiyatro', 'Newton Kahvehanede', 'Hareket yasalarını bir kahvehane ortamında komedi diliyle anlatan kısa oyun fikri.', null, 'Sahneleme tarihi belirlenmedi', 'Henüz başlanmadı', 1),
    ('tiyatro', 'Elementler Mahkemesi', 'Periyodik tablodaki elementlerin bir "mahkeme" kurgusunda kendini savunduğu gösteri fikri.', null, 'Sahneleme tarihi belirlenmedi', 'Henüz başlanmadı', 2),
    ('tiyatro', 'DNA’nın Günlüğü', 'Hücre içindeki bir DNA molekülünün günlük tutarak kendini anlattığı tek kişilik gösteri fikri.', null, 'Sahneleme tarihi belirlenmedi', 'Henüz başlanmadı', 3)
) as v(bolum, baslik, aciklama, durum, alt_bilgi, rozet, sira)
on conflict (bolum, baslik) do nothing;

-- ---------- YÖNETİCİ EKLEME / KALDIRMA ----------
create or replace function public.yonetici_listesi()
returns table (user_id uuid, email text, created_at timestamptz)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
    if not public.is_yonetici() then
        raise exception 'Bu işlem için yönetici yetkisi gerekir.' using errcode = '42501';
    end if;

    return query
    select y.user_id, u.email::text, y.created_at
    from public.yoneticiler y
    join auth.users u on u.id = y.user_id
    order by y.created_at, u.email;
end;
$$;

create or replace function public.yonetici_ekle(p_email text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    yeni_user_id uuid;
begin
    if not public.is_yonetici() then
        raise exception 'Bu işlem için yönetici yetkisi gerekir.' using errcode = '42501';
    end if;
    if nullif(trim(p_email), '') is null then
        raise exception 'E-posta adresi girin.';
    end if;

    lock table public.yoneticiler in exclusive mode;
    if not public.is_yonetici() then
        raise exception 'Bu işlem için yönetici yetkisi gerekir.' using errcode = '42501';
    end if;

    select u.id into yeni_user_id
    from auth.users u
    where lower(u.email) = lower(trim(p_email))
    limit 1;

    if yeni_user_id is null then
        raise exception 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.';
    end if;

    insert into public.yoneticiler (user_id)
    values (yeni_user_id)
    on conflict (user_id) do nothing;

    if not found then
        raise exception 'Bu kullanıcı zaten yönetici.';
    end if;
end;
$$;

create or replace function public.yonetici_kaldir(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
    if not public.is_yonetici() then
        raise exception 'Bu işlem için yönetici yetkisi gerekir.' using errcode = '42501';
    end if;
    if p_user_id = auth.uid() then
        raise exception 'Kendi yöneticiliğinizi bu ekrandan kaldıramazsınız.';
    end if;

    lock table public.yoneticiler in exclusive mode;
    if not public.is_yonetici() then
        raise exception 'Bu işlem için yönetici yetkisi gerekir.' using errcode = '42501';
    end if;
    if (select count(*) from public.yoneticiler) <= 1 then
        raise exception 'Son yönetici kaldırılamaz.';
    end if;

    delete from public.yoneticiler where user_id = p_user_id;
    if not found then
        raise exception 'Yönetici kaydı bulunamadı.';
    end if;
end;
$$;

revoke all on function public.yonetici_listesi() from public, anon;
revoke all on function public.yonetici_ekle(text) from public, anon;
revoke all on function public.yonetici_kaldir(uuid) from public, anon;
grant execute on function public.yonetici_listesi() to authenticated;
grant execute on function public.yonetici_ekle(text) to authenticated;
grant execute on function public.yonetici_kaldir(uuid) to authenticated;
