import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

// Rozetler için hafif etkinlik takibi (bu cihazda, localStorage'da tutulur).
// Şimdilik: hangi oyunlar açıldı, hangi bilim insanlarının detayına bakıldı.
const KEY = 'btk_activity';
const defaults = { games: [], scientists: [] };

function load() {
	if (!browser) return { ...defaults };
	try {
		const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
		return {
			games: Array.isArray(raw.games) ? raw.games : [],
			scientists: Array.isArray(raw.scientists) ? raw.scientists : []
		};
	} catch (e) {
		return { ...defaults };
	}
}

const store = writable(load());

function persist(value) {
	if (!browser) return;
	try {
		localStorage.setItem(KEY, JSON.stringify(value));
	} catch (e) {
		/* depolama dolu / kapalı: sessizce geç */
	}
}

export const activity = {
	subscribe: store.subscribe,
	// kind: 'games' | 'scientists'
	mark(kind, id) {
		if (!browser || !id) return;
		const current = get(store);
		if (!current[kind] || current[kind].includes(id)) return;
		const next = { ...current, [kind]: [...current[kind], id] };
		store.set(next);
		persist(next);
	}
};
