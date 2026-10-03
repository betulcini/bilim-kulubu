-- =====================================================================
-- YENİ: Toplam puan (Bilim Puanı), hesaba bağlı günlük seri ve ilerleme sayfası
-- Supabase Dashboard → SQL Editor → New query'e yapıştırıp Run.
-- Tekrar çalıştırılabilir (zarar vermez). Mevcut tablolara/görünümlere dokunmaz;
-- sadece quiz_scores'a "puan 0-200 olmalı" kuralı ekler (sadece YENİ kayıtlar için).
--
-- PUAN KURALLARI (Bilim Puanı):
--  * Konu quizi:   çözülen quizin puanı kadar (0-200). Günde en yüksek 3 quiz sayılır
--                  (aynı quizi arka arkaya çözüp puan şişirmek engellenir).
--  * Günlük quiz:  her doğru cevap 20 puan (en fazla 100).
--  * Seri bonusu:  günlük quizi bitirince art arda gün sayısı x 10 (en fazla 70).
--  * Günlük giriş: giriş yapmış olarak siteyi açtığın her gün 20 puan.
-- Gün, Türkiye saatine göre hesaplanır.
--
-- Güvenlik: gunluk_aktivite tablosuna doğrudan yazılamaz; sadece aşağıdaki
-- fonksiyonlar (giriş yapmış kullanıcı için, kendi adına) yazar.
-- =====================================================================

-- ---------- quiz_scores: puan 0-200 aralığında olmalı (yeni kayıtlar için) ----------
do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'quiz_scores_puan_araligi') then
        alter table public.quiz_scores
            add constraint quiz_scores_puan_araligi check (score between 0 and 200) not valid;
    end if;
end $$;

-- ---------- GÜNLÜK AKTİVİTE ----------
create table if not exists public.gunluk_aktivite (
    user_id uuid not null references auth.users(id) on delete cascade,
    gun date not null,
    ziyaret boolean not null default false,                       -- o gün siteye giriş yapıldı mı
    quiz_dogru smallint check (quiz_dogru between 0 and 5),       -- günlük quiz doğru sayısı (null = çözülmedi)
    quiz_bonus int not null default 0 check (quiz_bonus between 0 and 70),
    created_at timestamptz not null default now(),
    primary key (user_id, gun)
);

alter table public.gunluk_aktivite enable row level security;

-- Herkes sadece KENDİ kaydını okuyabilir; yazma politikası yok (sadece fonksiyonlar yazar)
drop policy if exists "Kullanici kendi aktivitesini okur" on public.gunluk_aktivite;
create policy "Kullanici kendi aktivitesini okur"
    on public.gunluk_aktivite for select to authenticated using (auth.uid() = user_id);

-- ---------- YARDIMCI: Türkiye saatine göre bugün ----------
create or replace function public.bugun_ist() returns date
language sql stable as $$ select (now() at time zone 'Europe/Istanbul')::date $$;

-- ---------- İLERLEME ÖZETİ (kişinin kendi toplam puanı, serisi, son 60 gün) ----------
create or replace function public.ilerleme_ozeti() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
    uid uuid := auth.uid();
    bugun date := public.bugun_ist();
    xp_quiz int := 0;
    xp_gunluk int := 0;
    xp_bonus int := 0;
    xp_ziyaret int := 0;
    quiz_adet int := 0;
    ziyaret_gun int := 0;
    seri_toplam int := 0;
    seri_en_iyi int := 0;
    seri_guncel int := 0;
    son_gun date;
    aktivite jsonb;
begin
    if uid is null then
        return null;
    end if;

    -- Konu quizleri: günde en yüksek 3 skor, her biri en fazla 200
    select coalesce(sum(least(greatest(score, 0), 200)), 0)::int into xp_quiz
    from (
        select score,
               row_number() over (
                   partition by (created_at at time zone 'Europe/Istanbul')::date
                   order by score desc
               ) as sira
        from public.quiz_scores
        where user_id = uid
    ) t
    where sira <= 3;

    select count(*)::int into quiz_adet from public.quiz_scores where user_id = uid;

    -- Günlük quiz, seri bonusu, ziyaret
    select coalesce(sum(coalesce(quiz_dogru, 0)) * 20, 0)::int,
           coalesce(sum(quiz_bonus), 0)::int,
           (count(*) filter (where ziyaret) * 20)::int,
           (count(*) filter (where ziyaret))::int,
           (count(*) filter (where quiz_dogru is not null))::int
      into xp_gunluk, xp_bonus, xp_ziyaret, ziyaret_gun, seri_toplam
    from public.gunluk_aktivite
    where user_id = uid;

    -- Seri: art arda günlük quiz çözülen gün grupları
    select coalesce(max(n), 0)::int into seri_en_iyi
    from (
        select count(*) as n
        from (
            select gun, gun - (row_number() over (order by gun))::int as grup
            from public.gunluk_aktivite
            where user_id = uid and quiz_dogru is not null
        ) g
        group by grup
    ) x;

    select max(gun) into son_gun
    from public.gunluk_aktivite where user_id = uid and quiz_dogru is not null;

    -- Güncel seri: bugün ya da dün çözüldüyse geriye doğru say
    if son_gun is not null and son_gun >= bugun - 1 then
        declare d date := son_gun;
        begin
            while exists (select 1 from public.gunluk_aktivite
                          where user_id = uid and gun = d and quiz_dogru is not null) loop
                seri_guncel := seri_guncel + 1;
                d := d - 1;
                exit when seri_guncel >= 1000;
            end loop;
        end;
    end if;

    select coalesce(jsonb_agg(jsonb_build_object('gun', gun, 'ziyaret', ziyaret, 'quiz_dogru', quiz_dogru)
                              order by gun), '[]'::jsonb)
      into aktivite
    from public.gunluk_aktivite
    where user_id = uid and gun >= bugun - 60;

    return jsonb_build_object(
        'xp', xp_quiz + xp_gunluk + xp_bonus + xp_ziyaret,
        'kirilim', jsonb_build_object(
            'quiz', xp_quiz,
            'gunluk_quiz', xp_gunluk,
            'seri_bonusu', xp_bonus,
            'ziyaret', xp_ziyaret
        ),
        'quiz_adet', quiz_adet,
        'ziyaret_gun', ziyaret_gun,
        'seri', jsonb_build_object(
            'current', seri_guncel,
            'best', seri_en_iyi,
            'total', seri_toplam,
            'last_day', son_gun
        ),
        'aktivite', aktivite,
        'bugun', bugun
    );
end $$;

-- ---------- GÜNLÜK GİRİŞ ----------
create or replace function public.ziyaret_kaydet() returns void
language plpgsql security definer set search_path = public as $$
begin
    if auth.uid() is null then
        return;
    end if;
    insert into public.gunluk_aktivite (user_id, gun, ziyaret)
    values (auth.uid(), public.bugun_ist(), true)
    on conflict (user_id, gun) do update set ziyaret = true;
end $$;

-- ---------- GÜNLÜK QUİZ BİTTİ ----------
-- p_gun: tarayıcının "bugün"ü (Türkiye saatine göre dün/bugün/yarın kabul edilir)
-- Aynı gün ikinci kez çağrılırsa hiçbir şey değişmez.
create or replace function public.gunluk_quiz_kaydet(p_gun date, p_dogru int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
    uid uuid := auth.uid();
    bugun date := public.bugun_ist();
    seri int := 1;
    d date;
begin
    if uid is null then
        raise exception 'Giriş gerekli' using errcode = '42501';
    end if;
    if p_gun is null or p_gun < bugun - 1 or p_gun > bugun + 1 then
        raise exception 'Geçersiz gün';
    end if;
    if p_dogru is null or p_dogru < 0 or p_dogru > 5 then
        raise exception 'Geçersiz doğru sayısı';
    end if;

    if not exists (select 1 from public.gunluk_aktivite
                   where user_id = uid and gun = p_gun and quiz_dogru is not null) then
        d := p_gun - 1;
        while exists (select 1 from public.gunluk_aktivite
                      where user_id = uid and gun = d and quiz_dogru is not null) loop
            seri := seri + 1;
            d := d - 1;
            exit when seri >= 1000;
        end loop;

        insert into public.gunluk_aktivite (user_id, gun, quiz_dogru, quiz_bonus)
        values (uid, p_gun, p_dogru, least(seri, 7) * 10)
        on conflict (user_id, gun) do update
            set quiz_dogru = excluded.quiz_dogru, quiz_bonus = excluded.quiz_bonus;
    end if;

    return public.ilerleme_ozeti();
end $$;

-- ---------- ESKİ (cihazdaki) SERİYİ HESABA AKTAR ----------
-- p_sonuclar: { "2026-10-02": { "score": 4, "total": 5 }, ... }  (son 60 gün, en fazla 61 gün)
-- Var olan günlere dokunmaz; seri bonusu verilmez (sadece geçmiş kaydı ve doğru puanı).
create or replace function public.seri_aktar(p_sonuclar jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
    uid uuid := auth.uid();
    bugun date := public.bugun_ist();
    r record;
    g date;
    s int;
    sayac int := 0;
begin
    if uid is null then
        raise exception 'Giriş gerekli' using errcode = '42501';
    end if;
    if p_sonuclar is null or jsonb_typeof(p_sonuclar) <> 'object' then
        return public.ilerleme_ozeti();
    end if;

    for r in select key, value from jsonb_each(p_sonuclar) loop
        sayac := sayac + 1;
        exit when sayac > 61;
        begin
            if r.key !~ '^\d{4}-\d{2}-\d{2}$' then continue; end if;
            g := r.key::date;
            if g < bugun - 60 or g > bugun then continue; end if;
            s := (r.value ->> 'score')::int;
            if s is null or s < 0 or s > 5 then continue; end if;
            insert into public.gunluk_aktivite (user_id, gun, quiz_dogru, quiz_bonus)
            values (uid, g, s, 0)
            on conflict (user_id, gun) do update
                set quiz_dogru = excluded.quiz_dogru, quiz_bonus = 0
                where public.gunluk_aktivite.quiz_dogru is null;
        exception when others then
            continue; -- bozuk bir satır diğerlerini engellemesin
        end;
    end loop;

    return public.ilerleme_ozeti();
end $$;

-- Fonksiyonları sadece giriş yapmış kullanıcılar çağırabilir
revoke all on function public.ilerleme_ozeti() from public, anon;
revoke all on function public.ziyaret_kaydet() from public, anon;
revoke all on function public.gunluk_quiz_kaydet(date, int) from public, anon;
revoke all on function public.seri_aktar(jsonb) from public, anon;
grant execute on function public.ilerleme_ozeti() to authenticated;
grant execute on function public.ziyaret_kaydet() to authenticated;
grant execute on function public.gunluk_quiz_kaydet(date, int) to authenticated;
grant execute on function public.seri_aktar(jsonb) to authenticated;

-- ---------- GENEL PUAN SIRALAMASI (herkese açık: ad, sınıf, toplam puan) ----------
create or replace view public.toplam_puan_view as
with quiz as (
    select user_id, sum(least(greatest(score, 0), 200))::int as xp
    from (
        select user_id, score,
               row_number() over (
                   partition by user_id, (created_at at time zone 'Europe/Istanbul')::date
                   order by score desc
               ) as sira
        from public.quiz_scores
    ) t
    where sira <= 3
    group by user_id
),
akt as (
    select user_id,
           (sum(coalesce(quiz_dogru, 0)) * 20
            + sum(quiz_bonus)
            + count(*) filter (where ziyaret) * 20)::int as xp
    from public.gunluk_aktivite
    group by user_id
)
select
    p.id as user_id,
    p.full_name,
    upper(trim(p.class_name)) as class_name,
    (coalesce(q.xp, 0) + coalesce(a.xp, 0))::int as xp
from public.profiles p
left join quiz q on q.user_id = p.id
left join akt a on a.user_id = p.id
where coalesce(q.xp, 0) + coalesce(a.xp, 0) > 0
order by xp desc;

grant select on public.toplam_puan_view to anon, authenticated;
