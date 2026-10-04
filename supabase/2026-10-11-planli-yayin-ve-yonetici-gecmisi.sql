-- Planli yayin, onerilerde uygulama ici bildirimler ve yonetici islem gecmisi.
-- Once ilgili duyuru, firsat, gezi, video, quiz, galeri ve oneri migration'lari calismis olmali.
-- Tekrar calistirilabilir.

alter table public.duyurular
    add column if not exists yayina_basla timestamptz,
    add column if not exists yayindan_kaldir timestamptz;
alter table public.firsatlar
    add column if not exists yayina_basla timestamptz,
    add column if not exists yayindan_kaldir timestamptz;

alter table public.duyurular drop constraint if exists duyurular_yayin_araligi;
alter table public.duyurular add constraint duyurular_yayin_araligi
    check (yayina_basla is null or yayindan_kaldir is null or yayindan_kaldir > yayina_basla);
alter table public.firsatlar drop constraint if exists firsatlar_yayin_araligi;
alter table public.firsatlar add constraint firsatlar_yayin_araligi
    check (yayina_basla is null or yayindan_kaldir is null or yayindan_kaldir > yayina_basla);

drop policy if exists "Herkes aktif duyuruları okuyabilir" on public.duyurular;
drop policy if exists "Herkes zamanli yayindaki duyurulari okuyabilir" on public.duyurular;
create policy "Herkes zamanli yayindaki duyurulari okuyabilir"
    on public.duyurular for select to anon, authenticated
    using (
        aktif
        and (yayina_basla is null or yayina_basla <= now())
        and (yayindan_kaldir is null or yayindan_kaldir > now())
    );

drop policy if exists "Herkes aktif fırsatları okuyabilir" on public.firsatlar;
drop policy if exists "Herkes zamanli yayindaki firsatlari okuyabilir" on public.firsatlar;
create policy "Herkes zamanli yayindaki firsatlari okuyabilir"
    on public.firsatlar for select to anon, authenticated
    using (
        aktif
        and (yayina_basla is null or yayina_basla <= now())
        and (yayindan_kaldir is null or yayindan_kaldir > now())
    );

create table if not exists public.oneri_bildirimleri (
    id bigint generated always as identity primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    oneri_id bigint references public.oneriler(id) on delete set null,
    mesaj text not null check (char_length(mesaj) between 1 and 1200),
    created_at timestamptz not null default now(),
    read_at timestamptz
);

alter table public.oneri_bildirimleri enable row level security;
revoke all on public.oneri_bildirimleri from public, anon, authenticated;

create or replace function public.oneri_guncellemesinde_bildirim_yaz()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_mesaj text;
    v_durum text;
begin
    if not public.is_yonetici() then
        return new;
    end if;
    if new.user_id is null or new.user_id is distinct from old.user_id then
        return new;
    end if;
    if new.status is not distinct from old.status
       and new.public_response is not distinct from old.public_response then
        return new;
    end if;

    v_durum := case new.status
        when 'yeni' then 'Yeni'
        when 'inceleniyor' then 'İnceleniyor'
        when 'planlandi' then 'Planlandı'
        when 'tamamlandi' then 'Tamamlandı'
        when 'reddedildi' then 'Uygun bulunmadı'
        else 'Güncellendi'
    end;
    v_mesaj := 'Önerinin durumu: ' || v_durum || '.';
    if new.public_response is distinct from old.public_response
       and nullif(btrim(new.public_response), '') is not null then
        v_mesaj := v_mesaj || E'\nKulüp yanıtı: ' || btrim(new.public_response);
    end if;

    insert into public.oneri_bildirimleri (user_id, oneri_id, mesaj)
    values (new.user_id, new.id, v_mesaj);
    return new;
end;
$$;

drop trigger if exists oneri_guncellemesinde_bildirim_yaz on public.oneriler;
create trigger oneri_guncellemesinde_bildirim_yaz
    after update on public.oneriler
    for each row execute function public.oneri_guncellemesinde_bildirim_yaz();

create or replace function public.oneri_bildirimlerim()
returns table (id bigint, oneri_id bigint, mesaj text, created_at timestamptz, read_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
    select b.id, b.oneri_id, b.mesaj, b.created_at, b.read_at
    from public.oneri_bildirimleri b
    where auth.uid() is not null and b.user_id = auth.uid()
    order by b.created_at desc
    limit 50;
$$;

create or replace function public.oneri_bildirimini_okundu_isaretle(p_id bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
    if auth.uid() is null or not public.is_yonetici() then
        raise exception 'Authentication required.' using errcode = '42501';
    end if;
    update public.oneri_bildirimleri
    set read_at = coalesce(read_at, now())
    where id = p_id and user_id = auth.uid();
    return found;
end;
$$;

revoke all on function public.oneri_bildirimlerim() from public, anon;
revoke all on function public.oneri_bildirimini_okundu_isaretle(bigint) from public, anon;
grant execute on function public.oneri_bildirimlerim() to authenticated;
grant execute on function public.oneri_bildirimini_okundu_isaretle(bigint) to authenticated;

create table if not exists public.yonetici_islem_gecmisi (
    id bigint generated always as identity primary key,
    actor_user_id uuid references auth.users(id) on delete set null,
    entity_type text not null,
    entity_id text not null,
    action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
    entity_label text,
    changed_fields text[] not null default '{}',
    created_at timestamptz not null default now()
);

create index if not exists yonetici_islem_gecmisi_created_idx
    on public.yonetici_islem_gecmisi (created_at desc, id desc);
alter table public.yonetici_islem_gecmisi enable row level security;
revoke all on public.yonetici_islem_gecmisi from public, anon, authenticated;
drop policy if exists "Yonetici islem gecmisini gorur" on public.yonetici_islem_gecmisi;
create policy "Yonetici islem gecmisini gorur"
    on public.yonetici_islem_gecmisi for select to authenticated
    using (public.is_yonetici());

create or replace function public.yonetici_islemini_kaydet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_old jsonb := '{}'::jsonb;
    v_new jsonb := '{}'::jsonb;
    v_current jsonb;
    v_id text;
    v_label text;
    v_fields text[];
begin
    if auth.uid() is null or not public.is_yonetici() then
        if tg_op = 'DELETE' then return old; else return new; end if;
    end if;

    if tg_op = 'DELETE' then
        v_old := to_jsonb(old);
        v_current := v_old;
    elsif tg_op = 'INSERT' then
        v_new := to_jsonb(new);
        v_current := v_new;
    else
        v_old := to_jsonb(old);
        v_new := to_jsonb(new);
        v_current := v_new;
    end if;

    v_id := coalesce(v_current ->> 'id', v_current ->> 'slug', v_current ->> 'user_id', 'unknown');
    v_label := left(coalesce(
        v_current ->> 'baslik',
        v_current ->> 'yer',
        v_current ->> 'kategori',
        v_current ->> 'soru',
        v_current ->> 'isim',
        v_id
    ), 160);

    select coalesce(array_agg(k order by k), '{}'::text[])
    into v_fields
    from (
        select key as k
        from jsonb_object_keys(v_old || v_new) as keys(key)
        where key not in ('created_at', 'updated_at')
          and v_old -> key is distinct from v_new -> key
    ) changed;

    insert into public.yonetici_islem_gecmisi
        (actor_user_id, entity_type, entity_id, action, entity_label, changed_fields)
    values
        (auth.uid(), tg_table_name, v_id, tg_op, v_label, v_fields);

    if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

do $$
declare
    v_table text;
    v_tables text[] := array[
        'duyurular', 'firsatlar', 'geziler', 'videolar', 'video_kartlari',
        'quiz_konulari', 'quiz_sorulari', 'galeri', 'oneriler', 'yoneticiler'
    ];
begin
    foreach v_table in array v_tables loop
        execute format('drop trigger if exists yonetici_islemini_kaydet on public.%I', v_table);
        execute format(
            'create trigger yonetici_islemini_kaydet after insert or update or delete on public.%I for each row execute function public.yonetici_islemini_kaydet()',
            v_table
        );
    end loop;
end;
$$;

create or replace function public.yonetici_islem_gecmisi_listele(p_before_id bigint default null, p_limit integer default 50)
returns table (
    id bigint,
    actor_name text,
    actor_user_id uuid,
    entity_type text,
    entity_id text,
    action text,
    entity_label text,
    changed_fields text[],
    created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
    if not public.is_yonetici() then
        raise exception 'Bu işlem için yönetici yetkisi gerekir.' using errcode = '42501';
    end if;

    return query
    select h.id, p.full_name, h.actor_user_id, h.entity_type, h.entity_id,
           h.action, h.entity_label, h.changed_fields, h.created_at
    from public.yonetici_islem_gecmisi h
    left join public.profiles p on p.id = h.actor_user_id
    where p_before_id is null or h.id < p_before_id
    order by h.id desc
    limit greatest(1, least(coalesce(p_limit, 50), 100));
end;
$$;

revoke all on function public.yonetici_islem_gecmisi_listele(bigint, integer) from public, anon;
grant execute on function public.yonetici_islem_gecmisi_listele(bigint, integer) to authenticated;
