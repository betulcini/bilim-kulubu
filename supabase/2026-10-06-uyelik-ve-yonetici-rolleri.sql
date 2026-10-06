-- Üyelik gerektiren oyun/yarışma erişimi, üye listesi ve kapsamlı yönetici rolleri.
-- Önce projedeki mevcut Supabase kurulum ve migration dosyaları çalıştırılmış olmalı.
-- Tekrar çalıştırılabilir.

-- ---------- YÖNETİCİ ROLLERİ VE BÖLÜM KAPSAMLARI ----------
alter table public.yoneticiler
    add column if not exists rol text not null default 'tam',
    add column if not exists bolumler text[] not null default '{}';

alter table public.yoneticiler drop constraint if exists yoneticiler_rol_check;
alter table public.yoneticiler
    add constraint yoneticiler_rol_check
    check (
        (rol = 'tam' and cardinality(bolumler) = 0)
        or
        (rol = 'sinirli' and cardinality(bolumler) > 0)
    );

alter table public.yoneticiler drop constraint if exists yoneticiler_bolumler_check;
alter table public.yoneticiler
    add constraint yoneticiler_bolumler_check
    check (bolumler <@ array[
        'duyurular', 'firsatlar', 'geziler', 'videolar', 'kartlar',
        'quizler', 'galeri', 'oneriler', 'istatistik', 'yedek',
        'kalite', 'gecmis', 'uyeler'
    ]::text[]);

create or replace function public.yonetici_tam_yetkili()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.yoneticiler y
        where y.user_id = auth.uid() and y.rol = 'tam'
    );
$$;

create or replace function public.yonetici_bolum_izni(p_bolum text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.yoneticiler y
        where y.user_id = auth.uid()
          and (
              y.rol = 'tam'
              or (y.rol = 'sinirli' and p_bolum = any(y.bolumler))
          )
    );
$$;

create or replace function public.yonetici_yetkim()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(
        (select jsonb_build_object('rol', y.rol, 'bolumler', to_jsonb(y.bolumler))
         from public.yoneticiler y where y.user_id = auth.uid()),
        jsonb_build_object('rol', 'yok', 'bolumler', '[]'::jsonb)
    );
$$;

revoke all on function public.yonetici_tam_yetkili() from public, anon;
revoke all on function public.yonetici_bolum_izni(text) from public, anon;
revoke all on function public.yonetici_yetkim() from public, anon;
grant execute on function public.yonetici_tam_yetkili() to authenticated;
grant execute on function public.yonetici_bolum_izni(text) to authenticated;
grant execute on function public.yonetici_yetkim() to authenticated;

-- Yönetici yönetimi yalnızca tam yetkililerin elindedir.
drop function if exists public.yonetici_listesi();
create function public.yonetici_listesi()
returns table (user_id uuid, email text, created_at timestamptz, rol text, bolumler text[])
language plpgsql
security definer
set search_path = public, auth
as $$
begin
    if not public.yonetici_tam_yetkili() then
        raise exception 'Bu işlem için tam yönetici yetkisi gerekir.' using errcode = '42501';
    end if;
    return query
    select y.user_id, u.email::text, y.created_at, y.rol, y.bolumler
    from public.yoneticiler y
    join auth.users u on u.id = y.user_id
    order by y.created_at, u.email;
end;
$$;

drop function if exists public.yonetici_ekle(text);
create function public.yonetici_ekle(p_email text, p_rol text, p_bolumler text[])
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    yeni_user_id uuid;
    secimler text[] := coalesce(p_bolumler, '{}');
    izinli_bolumler text[] := array[
        'duyurular', 'firsatlar', 'geziler', 'videolar', 'kartlar',
        'quizler', 'galeri', 'oneriler', 'istatistik', 'yedek',
        'kalite', 'gecmis', 'uyeler'
    ];
begin
    if not public.yonetici_tam_yetkili() then
        raise exception 'Bu işlem için tam yönetici yetkisi gerekir.' using errcode = '42501';
    end if;
    if nullif(trim(p_email), '') is null then
        raise exception 'E-posta adresi girin.';
    end if;
    if p_rol is null or p_rol not in ('tam', 'sinirli')
       or (p_rol = 'tam' and cardinality(secimler) <> 0)
       or (p_rol = 'sinirli' and cardinality(secimler) = 0)
       or not (secimler <@ izinli_bolumler) then
        raise exception 'Yönetici rolü veya bölüm seçimi geçersiz.';
    end if;

    lock table public.yoneticiler in exclusive mode;
    if not public.yonetici_tam_yetkili() then
        raise exception 'Bu işlem için tam yönetici yetkisi gerekir.' using errcode = '42501';
    end if;
    select u.id into yeni_user_id from auth.users u
    where lower(u.email) = lower(trim(p_email)) limit 1;
    if yeni_user_id is null then
        raise exception 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.';
    end if;

    insert into public.yoneticiler (user_id, rol, bolumler)
    values (yeni_user_id, p_rol, secimler);
    if not found then
        raise exception 'Bu kullanıcı zaten yönetici.';
    end if;
exception
    when unique_violation then
        raise exception 'Bu kullanıcı zaten yönetici.';
end;
$$;

create or replace function public.yonetici_yetki_guncelle(
    p_user_id uuid, p_rol text, p_bolumler text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    secimler text[] := coalesce(p_bolumler, '{}');
    izinli_bolumler text[] := array[
        'duyurular', 'firsatlar', 'geziler', 'videolar', 'kartlar',
        'quizler', 'galeri', 'oneriler', 'istatistik', 'yedek',
        'kalite', 'gecmis', 'uyeler'
    ];
begin
    if not public.yonetici_tam_yetkili() then
        raise exception 'Bu işlem için tam yönetici yetkisi gerekir.' using errcode = '42501';
    end if;
    if p_user_id = auth.uid() then
        raise exception 'Kendi yönetici rolünüzü değiştiremezsiniz.';
    end if;
    if p_rol is null or p_rol not in ('tam', 'sinirli')
       or (p_rol = 'tam' and cardinality(secimler) <> 0)
       or (p_rol = 'sinirli' and cardinality(secimler) = 0)
       or not (secimler <@ izinli_bolumler) then
        raise exception 'Yönetici rolü veya bölüm seçimi geçersiz.';
    end if;
    update public.yoneticiler set rol = p_rol, bolumler = secimler
    where user_id = p_user_id;
    if not found then
        raise exception 'Yönetici kaydı bulunamadı.';
    end if;
end;
$$;

create or replace function public.yonetici_kaldir(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.yonetici_tam_yetkili() then
        raise exception 'Bu işlem için tam yönetici yetkisi gerekir.' using errcode = '42501';
    end if;
    if p_user_id = auth.uid() then
        raise exception 'Kendi yöneticiliğinizi bu ekrandan kaldıramazsınız.';
    end if;
    lock table public.yoneticiler in exclusive mode;
    if not public.yonetici_tam_yetkili() then
        raise exception 'Bu işlem için tam yönetici yetkisi gerekir.' using errcode = '42501';
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
revoke all on function public.yonetici_ekle(text, text, text[]) from public, anon;
revoke all on function public.yonetici_yetki_guncelle(uuid, text, text[]) from public, anon;
revoke all on function public.yonetici_kaldir(uuid) from public, anon;
grant execute on function public.yonetici_listesi() to authenticated;
grant execute on function public.yonetici_ekle(text, text, text[]) to authenticated;
grant execute on function public.yonetici_yetki_guncelle(uuid, text, text[]) to authenticated;
grant execute on function public.yonetici_kaldir(uuid) to authenticated;

-- ---------- BÖLÜMLERE GÖRE RLS ----------
drop policy if exists "Yonetici duyurulari gorur" on public.duyurular;
create policy "Yonetici duyurulari gorur" on public.duyurular for select to authenticated
    using (public.yonetici_bolum_izni('duyurular') or public.yonetici_bolum_izni('yedek') or public.yonetici_bolum_izni('kalite'));
drop policy if exists "Yonetici duyuru ekler" on public.duyurular;
create policy "Yonetici duyuru ekler" on public.duyurular for insert to authenticated
    with check (public.yonetici_bolum_izni('duyurular') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici duyuru gunceller" on public.duyurular;
create policy "Yonetici duyuru gunceller" on public.duyurular for update to authenticated
    using (public.yonetici_bolum_izni('duyurular') or public.yonetici_bolum_izni('yedek'))
    with check (public.yonetici_bolum_izni('duyurular') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici duyuru siler" on public.duyurular;
create policy "Yonetici duyuru siler" on public.duyurular for delete to authenticated
    using (public.yonetici_bolum_izni('duyurular') or public.yonetici_bolum_izni('yedek'));

drop policy if exists "Yonetici firsatlari gorur" on public.firsatlar;
create policy "Yonetici firsatlari gorur" on public.firsatlar for select to authenticated
    using (public.yonetici_bolum_izni('firsatlar') or public.yonetici_bolum_izni('yedek') or public.yonetici_bolum_izni('kalite'));
drop policy if exists "Yonetici firsat ekler" on public.firsatlar;
create policy "Yonetici firsat ekler" on public.firsatlar for insert to authenticated
    with check (public.yonetici_bolum_izni('firsatlar') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici firsat gunceller" on public.firsatlar;
create policy "Yonetici firsat gunceller" on public.firsatlar for update to authenticated
    using (public.yonetici_bolum_izni('firsatlar') or public.yonetici_bolum_izni('yedek'))
    with check (public.yonetici_bolum_izni('firsatlar') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici firsat siler" on public.firsatlar;
create policy "Yonetici firsat siler" on public.firsatlar for delete to authenticated
    using (public.yonetici_bolum_izni('firsatlar') or public.yonetici_bolum_izni('yedek'));

drop policy if exists "Yonetici videolari gorur" on public.videolar;
create policy "Yonetici videolari gorur" on public.videolar for select to authenticated
    using (public.yonetici_bolum_izni('videolar') or public.yonetici_bolum_izni('yedek') or public.yonetici_bolum_izni('kalite'));
drop policy if exists "Yonetici video ekler" on public.videolar;
create policy "Yonetici video ekler" on public.videolar for insert to authenticated
    with check (public.yonetici_bolum_izni('videolar') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici video gunceller" on public.videolar;
create policy "Yonetici video gunceller" on public.videolar for update to authenticated
    using (public.yonetici_bolum_izni('videolar') or public.yonetici_bolum_izni('yedek'))
    with check (public.yonetici_bolum_izni('videolar') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici video siler" on public.videolar;
create policy "Yonetici video siler" on public.videolar for delete to authenticated
    using (public.yonetici_bolum_izni('videolar') or public.yonetici_bolum_izni('yedek'));

drop policy if exists "Yonetici gezileri gorur" on public.geziler;
create policy "Yonetici gezileri gorur" on public.geziler for select to authenticated
    using (public.yonetici_bolum_izni('geziler') or public.yonetici_bolum_izni('yedek') or public.yonetici_bolum_izni('kalite'));
drop policy if exists "Yonetici gezi ekler" on public.geziler;
create policy "Yonetici gezi ekler" on public.geziler for insert to authenticated
    with check (public.yonetici_bolum_izni('geziler') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici gezi gunceller" on public.geziler;
create policy "Yonetici gezi gunceller" on public.geziler for update to authenticated
    using (public.yonetici_bolum_izni('geziler') or public.yonetici_bolum_izni('yedek'))
    with check (public.yonetici_bolum_izni('geziler') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici gezi siler" on public.geziler;
create policy "Yonetici gezi siler" on public.geziler for delete to authenticated
    using (public.yonetici_bolum_izni('geziler') or public.yonetici_bolum_izni('yedek'));

drop policy if exists "Yonetici video kartlarini gorur" on public.video_kartlari;
create policy "Yonetici video kartlarini gorur" on public.video_kartlari for select to authenticated
    using (public.yonetici_bolum_izni('kartlar') or public.yonetici_bolum_izni('yedek') or public.yonetici_bolum_izni('kalite'));
drop policy if exists "Yonetici video karti ekler" on public.video_kartlari;
create policy "Yonetici video karti ekler" on public.video_kartlari for insert to authenticated
    with check (public.yonetici_bolum_izni('kartlar') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici video karti gunceller" on public.video_kartlari;
create policy "Yonetici video karti gunceller" on public.video_kartlari for update to authenticated
    using (public.yonetici_bolum_izni('kartlar') or public.yonetici_bolum_izni('yedek'))
    with check (public.yonetici_bolum_izni('kartlar') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici video karti siler" on public.video_kartlari;
create policy "Yonetici video karti siler" on public.video_kartlari for delete to authenticated
    using (public.yonetici_bolum_izni('kartlar') or public.yonetici_bolum_izni('yedek'));

drop policy if exists "Yonetici quiz konularini gorur" on public.quiz_konulari;
create policy "Yonetici quiz konularini gorur" on public.quiz_konulari for select to authenticated
    using (public.yonetici_bolum_izni('quizler') or public.yonetici_bolum_izni('yedek') or public.yonetici_bolum_izni('kalite'));
drop policy if exists "Yonetici quiz konusu ekler" on public.quiz_konulari;
create policy "Yonetici quiz konusu ekler" on public.quiz_konulari for insert to authenticated
    with check (public.yonetici_bolum_izni('quizler') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici quiz konusu gunceller" on public.quiz_konulari;
create policy "Yonetici quiz konusu gunceller" on public.quiz_konulari for update to authenticated
    using (public.yonetici_bolum_izni('quizler') or public.yonetici_bolum_izni('yedek'))
    with check (public.yonetici_bolum_izni('quizler') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici quiz konusu siler" on public.quiz_konulari;
create policy "Yonetici quiz konusu siler" on public.quiz_konulari for delete to authenticated
    using (public.yonetici_bolum_izni('quizler') or public.yonetici_bolum_izni('yedek'));

drop policy if exists "Yonetici quiz sorularini gorur" on public.quiz_sorulari;
create policy "Yonetici quiz sorularini gorur" on public.quiz_sorulari for select to authenticated
    using (public.yonetici_bolum_izni('quizler') or public.yonetici_bolum_izni('yedek') or public.yonetici_bolum_izni('kalite'));
drop policy if exists "Yonetici quiz sorusu ekler" on public.quiz_sorulari;
create policy "Yonetici quiz sorusu ekler" on public.quiz_sorulari for insert to authenticated
    with check (public.yonetici_bolum_izni('quizler') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici quiz sorusu gunceller" on public.quiz_sorulari;
create policy "Yonetici quiz sorusu gunceller" on public.quiz_sorulari for update to authenticated
    using (public.yonetici_bolum_izni('quizler') or public.yonetici_bolum_izni('yedek'))
    with check (public.yonetici_bolum_izni('quizler') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici quiz sorusu siler" on public.quiz_sorulari;
create policy "Yonetici quiz sorusu siler" on public.quiz_sorulari for delete to authenticated
    using (public.yonetici_bolum_izni('quizler') or public.yonetici_bolum_izni('yedek'));

drop policy if exists "Yonetici galeriyi gorur" on public.galeri;
create policy "Yonetici galeriyi gorur" on public.galeri for select to authenticated
    using (public.yonetici_bolum_izni('galeri') or public.yonetici_bolum_izni('yedek') or public.yonetici_bolum_izni('kalite'));
drop policy if exists "Yonetici galeriye ekler" on public.galeri;
create policy "Yonetici galeriye ekler" on public.galeri for insert to authenticated
    with check (public.yonetici_bolum_izni('galeri') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici galeriyi gunceller" on public.galeri;
create policy "Yonetici galeriyi gunceller" on public.galeri for update to authenticated
    using (public.yonetici_bolum_izni('galeri') or public.yonetici_bolum_izni('yedek'))
    with check (public.yonetici_bolum_izni('galeri') or public.yonetici_bolum_izni('yedek'));
drop policy if exists "Yonetici galeriden siler" on public.galeri;
create policy "Yonetici galeriden siler" on public.galeri for delete to authenticated
    using (public.yonetici_bolum_izni('galeri') or public.yonetici_bolum_izni('yedek'));

drop policy if exists "Yonetici galeri gorseli yukler" on storage.objects;
create policy "Yonetici galeri gorseli yukler" on storage.objects for insert to authenticated
    with check (bucket_id = 'galeri' and (public.yonetici_bolum_izni('galeri') or public.yonetici_bolum_izni('yedek')));
drop policy if exists "Yonetici galeri gorselini gunceller" on storage.objects;
create policy "Yonetici galeri gorselini gunceller" on storage.objects for update to authenticated
    using (bucket_id = 'galeri' and (public.yonetici_bolum_izni('galeri') or public.yonetici_bolum_izni('yedek')))
    with check (bucket_id = 'galeri' and (public.yonetici_bolum_izni('galeri') or public.yonetici_bolum_izni('yedek')));
drop policy if exists "Yonetici galeri gorselini siler" on storage.objects;
create policy "Yonetici galeri gorselini siler" on storage.objects for delete to authenticated
    using (bucket_id = 'galeri' and (public.yonetici_bolum_izni('galeri') or public.yonetici_bolum_izni('yedek')));

drop policy if exists "Yonetici onerileri gorur" on public.oneriler;
create policy "Yonetici onerileri gorur" on public.oneriler for select to authenticated
    using (public.yonetici_bolum_izni('oneriler'));
drop policy if exists "Yonetici onerileri gunceller" on public.oneriler;
create policy "Yonetici onerileri gunceller" on public.oneriler for update to authenticated
    using (public.yonetici_bolum_izni('oneriler'))
    with check (public.yonetici_bolum_izni('oneriler'));

drop policy if exists "Yonetici islem gecmisini gorur" on public.yonetici_islem_gecmisi;
create policy "Yonetici islem gecmisini gorur" on public.yonetici_islem_gecmisi
    for select to authenticated using (public.yonetici_bolum_izni('gecmis'));

-- ---------- YÖNETİM İŞLEMLERİNİN RPC KONTROLLERİ ----------
create or replace function public.yonetici_istatistikleri()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare sonuc jsonb;
begin
    if not public.yonetici_bolum_izni('istatistik') then
        raise exception 'Bu işlem için istatistik yetkisi gerekir.' using errcode = '42501';
    end if;
    select jsonb_build_object(
        'quiz_attempts', (select count(*) from public.quiz_scores),
        'quiz_players', (select count(distinct user_id) from public.quiz_scores),
        'daily_quizzes', (select count(*) from public.gunluk_aktivite where quiz_dogru is not null),
        'daily_active', (select count(distinct user_id) from public.gunluk_aktivite where gun = public.bugun_ist()),
        'suggestions', (select count(*) from public.oneriler),
        'suggestions_open', (select count(*) from public.oneriler where status in ('yeni', 'inceleniyor')),
        'member_count', (select count(*) from public.profiles),
        'top_topics', coalesce((
            select jsonb_agg(jsonb_build_object('subject', konu, 'attempts', adet) order by adet desc, konu)
            from (
                select subject_title as konu, count(*)::int as adet from public.quiz_scores
                group by subject_title order by adet desc, konu limit 5
            ) top
        ), '[]'::jsonb),
        'updated_at', now()
    ) into sonuc;
    return sonuc;
end;
$$;

create or replace function public.yonetici_islem_gecmisi_listele(
    p_before_id bigint default null, p_limit integer default 50
)
returns table (
    id bigint, actor_name text, actor_user_id uuid, entity_type text,
    entity_id text, action text, entity_label text, changed_fields text[],
    created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
    if not public.yonetici_bolum_izni('gecmis') then
        raise exception 'Bu işlem için işlem geçmişi yetkisi gerekir.' using errcode = '42501';
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

revoke all on function public.yonetici_istatistikleri() from public, anon;
revoke all on function public.yonetici_islem_gecmisi_listele(bigint, integer) from public, anon;
grant execute on function public.yonetici_istatistikleri() to authenticated;
grant execute on function public.yonetici_islem_gecmisi_listele(bigint, integer) to authenticated;

create or replace function public.yonetici_uye_listesi(p_offset integer default 0, p_limit integer default 50)
returns table (full_name text, class_name text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
    if not public.yonetici_bolum_izni('uyeler') then
        raise exception 'Bu işlem için üye listesi yetkisi gerekir.' using errcode = '42501';
    end if;
    if p_offset < 0 or p_limit < 1 or p_limit > 500 then
        raise exception 'Sayfalama parametreleri geçersiz.';
    end if;
    return query
    select coalesce(p.full_name, ''), coalesce(p.class_name, '')
    from public.profiles p
    order by lower(coalesce(p.full_name, '')), p.id
    offset p_offset limit p_limit;
end;
$$;
revoke all on function public.yonetici_uye_listesi(integer, integer) from public, anon;
grant execute on function public.yonetici_uye_listesi(integer, integer) to authenticated;
