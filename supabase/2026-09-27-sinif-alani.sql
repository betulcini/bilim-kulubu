-- =====================================================================
-- GÜNCELLEME: Kayıt formunda "Sınıf / şube" alanı eklendi.
-- Daha önce supabase/schema.sql dosyasını çalıştırdıysan, sadece bu
-- ek script'i SQL Editor'de çalıştırman yeterli (schema.sql'i tekrar
-- çalıştırmana gerek yok).
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, full_name, class_name)
    values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'class_name');
    return new;
end;
$$;
