import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const key = 'btk-profile';

const defaults = {
	isim: '',
	sinif: '',
	rol: 'Üye',
	eposta: '',
	renk: '#4fd1c5'
};

function load() {
	if (!browser) return defaults;
	try {
		const raw = localStorage.getItem(key);
		return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
	} catch (e) {
		return defaults;
	}
}

function createProfileStore() {
	const { subscribe, set, update } = writable(load());
	return {
		subscribe,
		save(data) {
			set(data);
			if (browser) localStorage.setItem(key, JSON.stringify(data));
		},
		update
	};
}

export const profile = createProfileStore();
