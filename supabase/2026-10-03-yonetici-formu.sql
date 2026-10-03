-- =====================================================================
-- YENİ: Yönetici formu (Duyuru ve Fırsatları siteden ekle / düzenle / gizle / sil)
-- ÖNCE 2026-09-30-duyuru-firsat-tablolari.sql çalışmış olmalı.
-- Supabase Dashboard → SQL Editor → New query'e yapıştırıp Run.
-- Tekrar çalıştırılabilir (zarar vermez).
--
-- Mantık:
--  * "yoneticiler" tablosundaki kişiler yönetici sayılır. Siteden kimse yönetici
--    OLAMAZ ya da yönetici yapılamaz: ekleme sadece bu SQL Editor'den yapılır.
--  * Yöneticiler duyurular ve firsatlar tablolarında ekleme / düzenleme / silme
--    yapabilir ve yayında olmayan (aktif = false) satırları da görebilir.
--  * Herkesin aktif satırları okuması aynen devam eder.
-- =====================================================================

create table if not exists public.yoneticiler (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

alter table public.yoneticiler enable row level security;

-- Herkes sadece KENDİ kaydını görebilir (form "yönetici miyim?" diye sorar).
-- Ekleme / güncelleme / silme politikası bilerek YOK.
drop policy if exists "Yonetici: kendi kaydimi gorurum" on public.yoneticiler;
create policy "Yonetici: kendi kaydimi gorurum"
    on public.yoneticiler for select to authenticated
    using (user_id = auth.uid());

create or replace function public.is_yonetici()
returns boolean
language sql
stable
security definer set search_path = public
as $$
    select exists (select 1 from public.yoneticiler y where y.user_id = auth.uid());
$$;

revoke all on function public.is_yonetici() from public, anon;
grant execute on function public.is_yonetici() to authenticated;

-- ---------- DUYURULAR ----------
drop policy if exists "Yonetici duyurulari gorur" on public.duyurular;
create policy "Yonetici duyurulari gorur"
    on public.duyurular for select to authenticated using (public.is_yonetici());

drop policy if exists "Yonetici duyuru ekler" on public.duyurular;
create policy "Yonetici duyuru ekler"
    on public.duyurular for insert to authenticated with check (public.is_yonetici());

drop policy if exists "Yonetici duyuru gunceller" on public.duyurular;
create policy "Yonetici duyuru gunceller"
    on public.duyurular for update to authenticated
    using (public.is_yonetici()) with check (public.is_yonetici());

drop policy if exists "Yonetici duyuru siler" on public.duyurular;
create policy "Yonetici duyuru siler"
    on public.duyurular for delete to authenticated using (public.is_yonetici());

-- ---------- FIRSATLAR ----------
drop policy if exists "Yonetici firsatlari gorur" on public.firsatlar;
create policy "Yonetici firsatlari gorur"
    on public.firsatlar for select to authenticated using (public.is_yonetici());

drop policy if exists "Yonetici firsat ekler" on public.firsatlar;
create policy "Yonetici firsat ekler"
    on public.firsatlar for insert to authenticated with check (public.is_yonetici());

drop policy if exists "Yonetici firsat gunceller" on public.firsatlar;
create policy "Yonetici firsat gunceller"
    on public.firsatlar for update to authenticated
    using (public.is_yonetici()) with check (public.is_yonetici());

drop policy if exists "Yonetici firsat siler" on public.firsatlar;
create policy "Yonetici firsat siler"
    on public.firsatlar for delete to authenticated using (public.is_yonetici());

-- ---------- BAĞLANTI GÜVENLİĞİ ----------
-- Sitede link olarak gösterilen alanlar sadece http(s) olabilir (javascript: vb. engellenir).
alter table public.duyurular drop constraint if exists duyuru_link_https;
alter table public.duyurular
    add constraint duyuru_link_https check (link is null or link ~* '^https?://');

alter table public.firsatlar drop constraint if exists firsat_link_https;
alter table public.firsatlar
    add constraint firsat_link_https check (link is null or link ~* '^https?://');
alter table public.firsatlar drop constraint if exists firsat_kaynak_https;
alter table public.firsatlar
    add constraint firsat_kaynak_https check (kaynak is null or kaynak ~* '^https?://');

-- =====================================================================
-- KENDİNİ YÖNETİCİ YAPMAK İÇİN (bir kez): aşağıdaki satırı AYRI bir sorgu olarak
-- çalıştır; e-posta kısmına sitede kayıtlı e-postanı yaz.
--
--   insert into public.yoneticiler (user_id)
--   select id from auth.users where email = 'senin-epostan@ornek.com'
--   on conflict do nothing;
-- =====================================================================
