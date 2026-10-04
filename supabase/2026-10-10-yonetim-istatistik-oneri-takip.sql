-- Yönetici istatistikleri ve öneri sahibinin güvenli durum takibi.
-- Önce yönetici, öneri ve quiz puanı migration'ları çalışmış olmalı.
-- Tekrar çalıştırılabilir.

alter table public.oneriler
    add column if not exists public_response text;

alter table public.oneriler drop constraint if exists oneriler_public_response_len;
alter table public.oneriler
    add constraint oneriler_public_response_len
    check (public_response is null or char_length(public_response) <= 1000);

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
    new.public_response := null;
    new.reviewed_by := null;
    new.updated_at := now();
    return new;
end;
$$;

create or replace function public.oneri_durumum()
returns table (
    id bigint,
    kategori text,
    status text,
    public_response text,
    created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
    select o.id, o.kategori, o.status, o.public_response, o.created_at
    from public.oneriler o
    where auth.uid() is not null and o.user_id = auth.uid()
    order by o.created_at desc
    limit 100;
$$;

revoke all on function public.oneri_durumum() from public, anon;
grant execute on function public.oneri_durumum() to authenticated;

create or replace function public.yonetici_istatistikleri()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
    sonuc jsonb;
begin
    if not public.is_yonetici() then
        raise exception 'Bu işlem için yönetici yetkisi gerekir.' using errcode = '42501';
    end if;

    select jsonb_build_object(
        'quiz_attempts', (select count(*) from public.quiz_scores),
        'quiz_players', (select count(distinct user_id) from public.quiz_scores),
        'daily_quizzes', (select count(*) from public.gunluk_aktivite where quiz_dogru is not null),
        'daily_active', (select count(distinct user_id) from public.gunluk_aktivite where gun = public.bugun_ist()),
        'suggestions', (select count(*) from public.oneriler),
        'suggestions_open', (select count(*) from public.oneriler where status in ('yeni', 'inceleniyor')),
        'top_topics', coalesce((
            select jsonb_agg(jsonb_build_object('subject', konu, 'attempts', adet) order by adet desc, konu)
            from (
                select subject_title as konu, count(*)::int as adet
                from public.quiz_scores
                group by subject_title
                order by adet desc, konu
                limit 5
            ) top
        ), '[]'::jsonb),
        'updated_at', now()
    ) into sonuc;

    return sonuc;
end;
$$;

revoke all on function public.yonetici_istatistikleri() from public, anon;
grant execute on function public.yonetici_istatistikleri() to authenticated;
