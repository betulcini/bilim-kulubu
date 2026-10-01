import { supabase } from '$lib/supabaseClient.js';

// Topluluk (öğrenci dizini) ve mesajlaşma için Supabase yardımcıları.
// Tüm yetki kontrolleri veritabanındaki RLS kurallarında yapılır
// (supabase/2026-10-01-topluluk-mesajlar.sql); buradaki kod sadece arayüzü besler.

export const SIKAYET_SEBEPLERI = ['Rahatsız edici mesaj', 'Spam / reklam', 'Sahte profil', 'Diğer'];

// ---------- kendi topluluk ayarlarım ----------
export async function loadMyCommunity(userId) {
	const { data, error } = await supabase
		.from('community_profiles')
		.select('is_public, bio, interests')
		.eq('user_id', userId)
		.maybeSingle();
	if (error) return { error, data: null };
	return { error: null, data: data || { is_public: false, bio: '', interests: [] } };
}

// İlgi alanları profildeki seçimle aynı tutulur (Sana Özel ile tek kaynak).
export async function saveMyCommunity(userId, { is_public, bio, interests }) {
	const { error } = await supabase.from('community_profiles').upsert(
		{
			user_id: userId,
			is_public: !!is_public,
			bio: (bio || '').trim().slice(0, 280) || null,
			interests: interests || [],
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id' }
	);
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
	const { data, error } = await supabase
		.from('community_profiles')
		.select('user_id, bio, interests, profiles(full_name, class_name)')
		.eq('is_public', true)
		.neq('user_id', userId)
		.limit(500);
	if (error) return { error, data: [] };
	const rows = (data || [])
		.filter((r) => r.profiles?.full_name)
		.map((r) => ({
			id: r.user_id,
			name: r.profiles.full_name,
			sinif: r.profiles.class_name || '',
			bio: r.bio || '',
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
	return { error };
}

// ---------- mesajlar ----------
export async function loadMessages(userId) {
	const { data, error } = await supabase
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
