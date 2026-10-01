import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { supabase } from '$lib/supabaseClient.js';
import { user } from '$lib/stores/auth.js';

// Okunmamış mesaj sayısı (menüdeki rozet için).
export const unread = writable(0);

export async function refreshUnread() {
	const u = get(user);
	if (!browser || !u) {
		unread.set(0);
		return;
	}
	const { count, error } = await supabase
		.from('mesajlar')
		.select('id', { count: 'exact', head: true })
		.eq('alici', u.id)
		.eq('okundu', false);
	if (!error) unread.set(count || 0);
}

let started = false;
export function initUnread() {
	if (!browser || started) return;
	started = true;
	user.subscribe(() => refreshUnread());
	// Sekme görünürken dakikada bir tazele
	setInterval(() => {
		if (document.visibilityState === 'visible') refreshUnread();
	}, 60000);
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') refreshUnread();
	});
}
