-- =====================================================================
-- YENİ: Proje arkadaşı ilanları ("Şu projeye ekip arıyorum")
-- ÖNCE 2026-10-01-topluluk-mesajlar.sql çalışmış olmalı.
-- Supabase Dashboard → SQL Editor → New query'e yapıştırıp Run.
-- Tekrar çalıştırılabilir (zarar vermez).
--
-- Gizlilik / güvenlik ilkeleri:
--  * İlanları sadece giriş yapmış üyeler görür.
--  * İlan vermek için topluluk profilin herkese açık olmalı; çünkü ilgilenenler
--    sana site içi mesajla ulaşır ve mesaj kuralı (can_message) profilin açık
--    olmasını ister. E-posta / telefon paylaşılmaz.
--  * Herkes sadece kendi ilanını kapatabilir / silebilir.
--  * Aynı anda en fazla 3 açık ilanın olabilir; ilanlar 60 gün sonra listeden düşer.
--  * Şikayetler mevcut "sikayetler" tablosuna düşer (sadece Table Editor'dan okunur).
-- =====================================================================

create table if not exists public.proje_ilanlari (
    id bigint generated always as identity primary key,
    sahip uuid not null default auth.uid() references public.profiles(id) on delete cascade,
    baslik text not null,
    aciklama text not null,
    aranan text,                                   -- örn: "1 yazılımcı, 1 tasarımcı"
    alanlar text[] not null default '{}',          -- interests id'leri (fizik, robotik ...)
    acik boolean not null default true,            -- false = ekip tamam / ilan kapalı
    created_at timestamptz not null default now(),
    constraint ilan_baslik_len check (char_length(btrim(baslik)) between 3 and 80),
    constraint ilan_aciklama_len check (char_length(btrim(aciklama)) between 10 and 500),
    constraint ilan_aranan_len check (char_length(coalesce(aranan, '')) <= 120),
    constraint ilan_alan_len check (cardinality(alanlar) <= 4)
);

create index if not exists proje_ilanlari_liste_idx on public.proje_ilanlari (acik, created_at desc);
create index if not exists proje_ilanlari_sahip_idx on public.proje_ilanlari (sahip);

alter table public.proje_ilanlari enable row level security;

drop policy if exists "Ilanlar: uyeler gorur" on public.proje_ilanlari;
create policy "Ilanlar: uyeler gorur"
    on public.proje_ilanlari for select to authenticated
    using (true);

drop policy if exists "Ilanlar: profili acik uye ilan verir" on public.proje_ilanlari;
create policy "Ilanlar: profili acik uye ilan verir"
    on public.proje_ilanlari for insert to authenticated
    with check (
        sahip = auth.uid()
        and exists (select 1 from public.community_profiles c where c.user_id = auth.uid() and c.is_public)
    );

drop policy if exists "Ilanlar: sahibi gunceller" on public.proje_ilanlari;
create policy "Ilanlar: sahibi gunceller"
    on public.proje_ilanlari for update to authenticated
    using (sahip = auth.uid())
    with check (sahip = auth.uid());

drop policy if exists "Ilanlar: sahibi siler" on public.proje_ilanlari;
create policy "Ilanlar: sahibi siler"
    on public.proje_ilanlari for delete to authenticated
    using (sahip = auth.uid());

-- Sahibi sadece "acik" durumunu değiştirebilsin; başlık/açıklama sonradan değiştirilip
-- "kapalı" bir ilan yeniden yayımlanarak sınır aşılmasın.
revoke update on public.proje_ilanlari from anon, authenticated;
grant update (acik) on public.proje_ilanlari to authenticated;

-- Spam freni: aynı anda en fazla 3 açık ilan
create or replace function public.ilan_sinir()
returns trigger
language plpgsql
as $$
begin
    if new.acik and (select count(*) from public.proje_ilanlari
                     where sahip = new.sahip and acik and id is distinct from new.id) >= 3 then
        raise exception 'En fazla 3 açık ilanın olabilir. Birini kapatıp tekrar dene.';
    end if;
    return new;
end;
$$;

drop trigger if exists ilan_sinir_tetik on public.proje_ilanlari;
create trigger ilan_sinir_tetik
    before insert or update of acik on public.proje_ilanlari
    for each row execute procedure public.ilan_sinir();
