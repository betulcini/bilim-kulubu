import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { supabase, getSupabase, istemciOlusunca, oturumKayitliMi } from '$lib/supabaseClient.js';
import { cleanInterests } from '$lib/data/interests.js';

// user: null (bilinmiyor/çıkış yapılmış) | { id, email, full_name, class_name, interests }
export const user = writable(null);
// authReady: oturum bilgisi Supabase'den ilk kez yüklenene kadar false
export const authReady = writable(false);

async function loadProfile(sessionUser) {
	if (!sessionUser) {
		user.set(null);
		return;
	}
	const { data: profile } = await supabase
		.from('profiles')
		.select('full_name, class_name')
		.eq('id', sessionUser.id)
		.maybeSingle();

	// Profil düzenlemeleri user_metadata'ya yazılır; bu yüzden önce metadata okunur,
	// yoksa (eski hesaplar) profiles tablosundaki değere düşülür.
	const meta = sessionUser.user_metadata || {};
	user.set({
		id: sessionUser.id,
		email: sessionUser.email,
		full_name: meta.full_name || profile?.full_name || '',
		class_name: meta.class_name ?? profile?.class_name ?? '',
		interests: cleanInterests(meta.interests)
	});
}

// Profil düzenleme: { full_name, class_name, interests }
// Döndürür: { error } (başarılıysa error null)
export async function updateProfile({ full_name, class_name, interests }) {
	const cleaned = {
		full_name: (full_name || '').trim(),
		class_name: (class_name || '').trim(),
		interests: cleanInterests(interests)
	};

	const { data, error } = await supabase.auth.updateUser({ data: cleaned });
	if (error) return { error };

	// Skor tablosu profiles tablosundan ad okuyabilir; yazma izni yoksa sessizce geçilir.
	try {
		await supabase.from('profiles').update({ full_name: cleaned.full_name, class_name: cleaned.class_name }).eq('id', data.user.id);
	} catch (e) {
		/* profiles güncellenemedi: metadata yine de güncel */
	}

	await loadProfile(data.user);
	return { error: null };
}

let initialized = false;
export function initAuth() {
	if (!browser || initialized) return;
	initialized = true;

	// Oturum değişimlerini (giriş, çıkış, yenileme) dinle. Kitaplık henüz yüklenmediyse
	// (giriş yapılmamış ziyaretçi) dinleyici, giriş/kayıt sayfası kitaplığı yüklediği an kurulur.
	istemciOlusunca((c) => {
		c.auth.onAuthStateChange((_event, session) => {
			loadProfile(session?.user ?? null);
		});
	});

	// Bu tarayıcıda kayıtlı oturum yoksa supabase-js'i hiç indirmeden devam et.
	if (!oturumKayitliMi()) {
		authReady.set(true);
		return;
	}

	getSupabase()
		.then((c) => c.auth.getSession())
		.then(({ data }) => loadProfile(data.session?.user ?? null))
		.catch(() => user.set(null))
		.finally(() => authReady.set(true));
}

export async function signOut() {
	await supabase.auth.signOut();
	user.set(null);
}
