-- Supabase Database Linter hardening.
-- Apply after 2026-10-11-planli-yayin-ve-yonetici-gecmisi.sql.

-- Internal date helper: pin name resolution and prevent direct API execution.
alter function public.bugun_ist()
    set search_path = pg_catalog;
revoke all on function public.bugun_ist() from public, anon, authenticated;

-- These functions are invoked by existing table triggers, not through RPC.
-- Existing triggers continue to run; clients do not need direct EXECUTE access.
revoke all on function public.oneri_guncellemesinde_bildirim_yaz()
    from public, anon, authenticated;
revoke all on function public.yonetici_islemini_kaydet()
    from public, anon, authenticated;
