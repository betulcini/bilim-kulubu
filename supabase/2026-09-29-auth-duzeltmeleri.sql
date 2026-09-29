-- =====================================================================
-- GÜNCELLEME: Giriş / kayıt sistemi düzeltmeleri
-- Supabase Dashboard → SQL Editor → New query'e yapıştırıp Run.
-- Tekrar çalıştırılabilir (zarar vermez).
-- =====================================================================

-- 1) Profili olmayan mevcut kullanıcılar için profil oluştur.
--    (Trigger sonradan kurulduysa veya bir kayıt hata verdiyse, bu kullanıcılar
--     skor tablosunda görünmez çünkü leaderboard_view profiles ile birleşir.)
insert into public.profiles (id, full_name, class_name)
select u.id, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'class_name'
from auth.users u
on conflict (id) do nothing;

-- 2) Yeni kullanıcı trigger'ı: aynı id zaten varsa kaydı bozmasın,
--    isim çok uzunsa kırpsın (yoksa "Database error saving new user" çıkar).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, full_name, class_name)
    values (
        new.id,
        left(new.raw_user_meta_data->>'full_name', 80),
        left(new.raw_user_meta_data->>'class_name', 20)
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- 3) Skor doğrulaması: 8 soru x 25 puan = en fazla 200.
--    Bu olmadan herkes tarayıcı konsolundan 999999 puan ekleyebilir.
alter table public.quiz_scores drop constraint if exists quiz_scores_score_range;
alter table public.quiz_scores add constraint quiz_scores_score_range check (score between 0 and 200);

-- 4) Profil metin uzunlukları
alter table public.profiles drop constraint if exists profiles_len;
alter table public.profiles add constraint profiles_len
    check (char_length(coalesce(full_name, '')) <= 80 and char_length(coalesce(class_name, '')) <= 20);

-- 5) Liderlik görünümü, sorguyu yapan kullanıcının yetkisiyle çalışsın
--    (Supabase "Security Definer View" uyarısını giderir; select politikaları
--     zaten herkese açık olduğu için tablo aynı şekilde çalışmaya devam eder.)
alter view public.leaderboard_view set (security_invoker = true);
