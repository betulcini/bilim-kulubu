import { supabase } from '$lib/supabaseClient.js';

// Proje arkadaşı ilanları için Supabase yardımcıları.
// Yetki kontrolleri RLS kurallarında (supabase/2026-10-02-proje-ilanlari.sql) yapılır.

export const ILAN_SURESI_GUN = 60; // bu kadar günden eski ilanlar listeden düşer
export const MAX_ACIK_ILAN = 3;
export const MAX_ILAN_ALANI = 4;

export const tabloYok = (error) =>
	!!error && (error.code === '42P01' || error.code === 'PGRST205' || /does not exist|schema cache/i.test(error.message || ''));

export async function loadListings() {
	const since = new Date(Date.now() - ILAN_SURESI_GUN * 86400000).toISOString();
	const { data, error } = await supabase
		.from('proje_ilanlari')
		.select('id, sahip, baslik, aciklama, aranan, alanlar, acik, created_at, profiles(full_name, class_name)')
		.gte('created_at', since)
		.order('created_at', { ascending: false })
		.limit(200);
	if (error) return { error, data: [] };
	const rows = (data || []).map((r) => ({
		id: r.id,
		sahip: r.sahip,
		baslik: r.baslik,
		aciklama: r.aciklama,
		aranan: r.aranan || '',
		alanlar: Array.isArray(r.alanlar) ? r.alanlar : [],
		acik: !!r.acik,
		created_at: r.created_at,
		ad: r.profiles?.full_name || 'İsimsiz üye',
		sinif: r.profiles?.class_name || ''
	}));
	return { error: null, data: rows };
}

// Döndürür: { error } — error.message kullanıcıya gösterilebilir Türkçe metindir
export async function createListing({ baslik, aciklama, aranan, alanlar }) {
	const b = (baslik || '').trim();
	const a = (aciklama || '').trim();
	if (b.length < 3 || b.length > 80) return { error: { message: 'Başlık 3 ile 80 karakter arasında olmalı.' } };
	if (a.length < 10 || a.length > 500) return { error: { message: 'Açıklama 10 ile 500 karakter arasında olmalı.' } };
	const { error } = await supabase.from('proje_ilanlari').insert({
		baslik: b,
		aciklama: a,
		aranan: (aranan || '').trim().slice(0, 120) || null,
		alanlar: (alanlar || []).slice(0, MAX_ILAN_ALANI)
	});
	return { error: error ? { message: ilanHataMetni(error) } : null };
}

export async function setListingOpen(id, acik) {
	const { error } = await supabase.from('proje_ilanlari').update({ acik }).eq('id', id);
	return { error: error ? { message: ilanHataMetni(error) } : null };
}

export async function deleteListing(id) {
	const { error } = await supabase.from('proje_ilanlari').delete().eq('id', id);
	return { error };
}

function ilanHataMetni(error) {
	const m = error.message || '';
	if (/En fazla 3/i.test(m)) return m;
	if (error.code === '42501' || /row-level security/i.test(m)) {
		return 'İlan vermek için topluluk profilini herkese açık yapmalısın (Profilim → Topluluk).';
	}
	if (tabloYok(error)) {
		return 'Veritabanında ilan tablosu yok. supabase/2026-10-02-proje-ilanlari.sql dosyasını bir kez çalıştırman gerekiyor.';
	}
	return 'İşlem yapılamadı: ' + m;
}

export function ilanTarihi(iso) {
	const gun = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
	if (gun <= 0) return 'Bugün';
	if (gun === 1) return 'Dün';
	if (gun < 30) return `${gun} gün önce`;
	return `${Math.floor(gun / 7)} hafta önce`;
}
