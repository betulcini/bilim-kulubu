-- Öneri Kutusu'nu /yonetim panelinden inceleme ve yanıtlama.
-- Önce 2026-09-30-oneri-kutusu.sql ve 2026-10-03-yonetici-formu.sql çalışmış olmalı.
-- Tekrar çalıştırılabilir.

alter table public.oneriler
    add column if not exists status text not null default 'yeni',
    add column if not exists response text,
    add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
    add column if not exists updated_at timestamptz not null default now();

alter table public.oneriler drop constraint if exists oneriler_status_check;
alter table public.oneriler
    add constraint oneriler_status_check
    check (status in ('yeni', 'inceleniyor', 'planlandi', 'tamamlandi', 'reddedildi'));

alter table public.oneriler drop constraint if exists oneriler_response_len;
alter table public.oneriler
    add constraint oneriler_response_len
    check (response is null or char_length(response) <= 1000);

create index if not exists oneriler_created_at_idx on public.oneriler (created_at desc);

drop policy if exists "Yonetici onerileri gorur" on public.oneriler;
create policy "Yonetici onerileri gorur"
    on public.oneriler for select to authenticated
    using (public.is_yonetici());

drop policy if exists "Yonetici onerileri gunceller" on public.oneriler;
create policy "Yonetici onerileri gunceller"
    on public.oneriler for update to authenticated
    using (public.is_yonetici())
    with check (public.is_yonetici());

create or replace function public.oneri_gonderen_alanlarini_koru()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
    new.user_id := auth.uid();
    new.status := 'yeni';
    new.response := null;
    new.reviewed_by := null;
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists oneri_gonderen_alanlarini_koru on public.oneriler;
create trigger oneri_gonderen_alanlarini_koru
    before insert on public.oneriler
    for each row execute function public.oneri_gonderen_alanlarini_koru();

create or replace function public.oneri_yonetici_guncellemesini_isaretle()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
    new.updated_at := now();
    new.reviewed_by := auth.uid();
    return new;
end;
$$;

drop trigger if exists oneri_yonetici_guncellemesini_isaretle on public.oneriler;
create trigger oneri_yonetici_guncellemesini_isaretle
    before update on public.oneriler
    for each row execute function public.oneri_yonetici_guncellemesini_isaretle();
