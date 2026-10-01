import { supabase } from '$lib/supabaseClient.js';

// Topluluk (öğrenci dizini) ve mesajlaşma için Supabase yardımcıları.
// Tüm yetki kontrolleri veritabanındaki RLS kurallarında yapılır
// (supabase/2026-10-01-topluluk-mesajlar.sql); buradaki kod sadece arayüzü besler.

export const SIKAYET_SEBEPLERI = ['Rahatsız edici mesaj', 'Spam / reklam', 'Sahte profil', 'Diğer'];

// Rol kişinin kendi beyanıdır (doğrulanmaz).
export const ROLLER = [
	{ id: 'ogrenci', label: 'Öğrenci' },
	{ id: 'ogretmen', label: 'Öğretmen' },
	{ id: 'mezun', label: 'Mezun' },
	{ id: 'diger', label: 'Diğer' }
];
export const rolAdi = (id) => ROLLER.find((r) => r.id === id)?.label || 'Öğrenci';

// ---------- sosyal medya doğrulama ----------
// Instagram: "@ad", "ad" ya da instagram.com/ad/ yazılabilir → sadece kullanıcı adı döner.
// Boş giriş '' döner, geçersiz giriş null döner.
export function normalizeInstagram(input) {
	let v = (input || '').trim();
	if (!v) return '';
	v = v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^instagram\.com\//i, '');
	v = v.split(/[/?#]/)[0].replace(/^@/, '');
	return /^[A-Za-z0-9._]{1,30}$/.test(v) ? v : null;
}

// LinkedIn: sadece linkedin.com/in/kullanici-adi biçimi kabul edilir.
export function normalizeLinkedin(input) {
	const v = (input || '').trim();
	if (!v) return '';
	const m = v.match(/^(?:https?:\/\/)?(?:[a-z]{2,3}\.|www\.)?linkedin\.com\/in\/([A-Za-z0-9_%-]{3,100})\/?(?:[?#].*)?$/i);
	return m ? 'https://www.linkedin.com/in/' + m[1] : null;
}

export const instagramUrl = (handle) => 'https://www.instagram.com/' + encodeURIComponent(handle);

const eksikSutun = (error) => error && (error.code === '42703' || /column/i.test(error.message || ''));

// ---------- kendi topluluk ayarlarım ----------
export async function loadMyCommunity(userId) {
	const bos = { is_public: false, bio: '', interests: [], role: 'ogrenci', instagram: '', linkedin: '' };
	let { data, error } = await supabase
		.from('community_profiles')
		.select('is_public, bio, interests, role, instagram, linkedin')
		.eq('user_id', userId)
		.maybeSingle();
	// Ek alanlar SQL'i henüz çalışmadıysa eski sütunlarla devam et
	if (eksikSutun(error)) {
		({ data, error } = await supabase
			.from('community_profiles')
			.select('is_public, bio, interests')
			.eq('user_id', userId)
			.maybeSingle());
		if (error) return { error, data: null };
		return { error: null, data: { ...bos, ...(data || {}) }, eksikAlan: true };
	}
	if (error) return { error, data: null };
	return { error: null, data: { ...bos, ...(data || {}) }, eksikAlan: false };
}

// İlgi alanları profildeki seçimle aynı tutulur (Sana Özel ile tek kaynak).
export async function saveMyCommunity(userId, { is_public, bio, interests, role, instagram, linkedin }) {
	const ig = normalizeInstagram(instagram);
	const li = normalizeLinkedin(linkedin);
	if (ig === null) return { error: { message: 'Instagram kullanıcı adı geçersiz (harf, rakam, nokta ve alt çizgi kullanabilirsin).' } };
	if (li === null) return { error: { message: 'LinkedIn bağlantısı geçersiz. Şu biçimde olmalı: linkedin.com/in/kullanici-adin' } };
	const { error } = await supabase.from('community_profiles').upsert(
		{
			user_id: userId,
			is_public: !!is_public,
			bio: (bio || '').trim().slice(0, 280) || null,
			interests: interests || [],
			role: ROLLER.some((r) => r.id === role) ? role : 'ogrenci',
			instagram: ig || null,
			linkedin: li || null,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id' }
	);
	if (eksikSutun(error)) {
		return { error: { message: 'Rol, Instagram ve LinkedIn için veritabanına supabase/2026-10-01-topluluk-ek-alanlar.sql dosyasını bir kez çalıştırman gerekiyor.' } };
	}
	return { error };
}

// Profildeki ilgi alanları değişince dizin kaydına yansıt. is_public / bio'ya DOKUNMAZ
// (görünürlük sadece Topluluk bölümündeki kendi kaydet butonuyla değişir).
export async function syncMyInterests(userId, interests) {
	const { error } = await supabase
		.from('community_profiles')
		.upsert({ user_id: userId, interests: interests || [], updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
	return { error };
}

// ---------- dizin ----------
export async function loadDirectory(userId) {
	const sorgu = (alanlar) =>
		supabase.from('community_profiles').select(alanlar).eq('is_public', true).neq('user_id', userId).limit(500);
	let { data, error } = await sorgu('user_id, bio, interests, role, instagram, linkedin, profiles(full_name, class_name)');
	if (eksikSutun(error)) ({ data, error } = await sorgu('user_id, bio, interests, profiles(full_name, class_name)'));
	if (error) return { error, data: [] };
	const rows = (data || [])
		.filter((r) => r.profiles?.full_name)
		.map((r) => ({
			id: r.user_id,
			name: r.profiles.full_name,
			sinif: r.profiles.class_name || '',
			bio: r.bio || '',
			role: r.role || 'ogrenci',
			instagram: r.instagram || '',
			linkedin: r.linkedin || '',
			interests: Array.isArray(r.interests) ? r.interests : []
		}));
	return { error: null, data: rows };
}

// ---------- engel / şikayet ----------
export async function loadBlockedIds() {
	const { data } = await supabase.from('engeller').select('engellenen');
	return new Set((data || []).map((r) => r.engellenen));
}

export async function blockUser(otherId) {
	const { error } = await supabase.from('engeller').insert({ engellenen: otherId });
	return { error };
}

export async function unblockUser(userId, otherId) {
	const { error } = await supabase.from('engeller').delete().eq('engelleyen', userId).eq('engellenen', otherId);
	return { error };
}

export async function reportUser(otherId, sebep, aciklama) {
	const { error } = await supabase
		.from('sikayetler')
		.insert({ sikayet_edilen: otherId, sebep, aciklama: (aciklama || '').trim().slice(0, 500) || null });
}

// ---------- mesajlar ----------
		.from('mesajlar')
		.select('id, gonderen, alici, icerik, okundu, created_at')
		.or(`gonderen.eq.${userId},alici.eq.${userId}`)
		.order('created_at', { ascending: false })
		.limit(400);
	return { error, data: data || [] };
}

export async function loadPeople(ids) {
	if (!ids.length) return {};
	const { data } = await supabase.from('profiles').select('id, full_name, class_name').in('id', ids);
	return Object.fromEntries((data || []).map((p) => [p.id, { name: p.full_name || 'İsimsiz üye', sinif: p.class_name || '' }]));
}

export async function sendMessage(toId, text) {
	const { error } = await supabase.from('mesajlar').insert({ alici: toId, icerik: text.trim() });
	return { error };
}

export async function markThreadRead(userId, otherId) {
	await supabase.from('mesajlar').update({ okundu: true }).eq('alici', userId).eq('gonderen', otherId).eq('okundu', false);
}

export function sendErrorText(error) {
	if (!error) return '';
	if (/hızlı/i.test(error.message || '')) return error.message;
	if (error.code === '42501' || /row-level security/i.test(error.message || '')) {
		return 'Bu kişiye şu an mesaj gönderilemiyor (profili gizlenmiş olabilir ya da aranızda engel var).';
	}
	return 'Mesaj gönderilemedi: ' + error.message;
}
