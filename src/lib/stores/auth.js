import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { supabase } from '$lib/supabaseClient.js';

// user: null (bilinmiyor/çıkış yapılmış) | { id, email, full_name, class_name }
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

	user.set({
		id: sessionUser.id,
		email: sessionUser.email,
		full_name: profile?.full_name || sessionUser.user_metadata?.full_name || '',
		class_name: profile?.class_name || ''
	});
}

let initialized = false;
export function initAuth() {
	if (!browser || initialized) return;
	initialized = true;

	supabase.auth.getSession().then(({ data }) => {
		loadProfile(data.session?.user ?? null).finally(() => authReady.set(true));
	});

	supabase.auth.onAuthStateChange((_event, session) => {
		loadProfile(session?.user ?? null);
	});
}

export async function signOut() {
	await supabase.auth.signOut();
	user.set(null);
}
