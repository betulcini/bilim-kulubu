-- =====================================================================
-- SINIFLAR ARASI YARIŞ + HAFTALIK LİDERLİK
-- Supabase → SQL Editor'de bir kez çalıştır. Tekrar çalıştırmak zararsız
-- (create or replace). Mevcut tablolara ve leaderboard_view'a dokunmaz.
--
-- Puan mantığı: bir kişinin puanı = her quiz konusundaki EN YÜKSEK skorunun
-- toplamı. Böylece aynı quizi defalarca çözerek puan şişirilemez; farklı
-- konularda quiz çözmek puanı artırır (6 konu x 200 = en fazla 1200).
-- Hafta, Türkiye saatiyle Pazartesi 00:00'da başlar.
-- =====================================================================

-- 1) Kişi bazında, tüm sezon (her konunun en iyisi)
create or replace view public.user_season_scores_view as
select
    qs.user_id,
    qs.subject,
    max(qs.score) as best_score
from public.quiz_scores qs
group by qs.user_id, qs.subject;

-- 2) Kişi bazında, bu hafta (her konunun en iyisi)
create or replace view public.user_week_scores_view as
select
    qs.user_id,
    qs.subject,
    max(qs.score) as best_score
from public.quiz_scores qs
where (qs.created_at at time zone 'Europe/Istanbul')
      >= date_trunc('week', now() at time zone 'Europe/Istanbul')
group by qs.user_id, qs.subject;

-- 3) HAFTALIK LİDERLİK (kişiler)
create or replace view public.weekly_leaderboard_view as
select
    p.id as user_id,
    p.full_name,
    upper(trim(p.class_name)) as class_name,
    sum(w.best_score)::int as week_score,
    count(*)::int as quiz_count
from public.user_week_scores_view w
join public.profiles p on p.id = w.user_id
group by p.id, p.full_name, p.class_name
order by week_score desc;

-- 4) SINIFLAR ARASI YARIŞ (sınıf şubesine göre toplam puan)
create or replace view public.class_leaderboard_view as
with sezon as (
    select user_id, sum(best_score)::int as total from public.user_season_scores_view group by user_id
),
hafta as (
    select user_id, sum(best_score)::int as total from public.user_week_scores_view group by user_id
)
select
    upper(trim(p.class_name)) as class_name,
    count(distinct p.id)::int as member_count,
    coalesce(sum(s.total), 0)::int as season_total,
    coalesce(sum(w.total), 0)::int as week_total,
    round(coalesce(sum(s.total), 0)::numeric / nullif(count(distinct p.id), 0), 1) as season_avg
from public.profiles p
join sezon s on s.user_id = p.id
left join hafta w on w.user_id = p.id
where p.class_name is not null and trim(p.class_name) <> ''
group by upper(trim(p.class_name))
order by season_total desc;

grant select on public.user_season_scores_view to anon, authenticated;
grant select on public.user_week_scores_view to anon, authenticated;
grant select on public.weekly_leaderboard_view to anon, authenticated;
grant select on public.class_leaderboard_view to anon, authenticated;
