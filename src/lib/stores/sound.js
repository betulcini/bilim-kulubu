import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const initial = browser ? localStorage.getItem('btk-sound') !== 'off' : true;

function createSoundStore() {
	const { subscribe, set, update } = writable(initial);
	return {
		subscribe,
		set(value) {
			set(value);
			if (browser) localStorage.setItem('btk-sound', value ? 'on' : 'off');
		},
		toggle() {
			update((v) => {
				const next = !v;
				if (browser) localStorage.setItem('btk-sound', next ? 'on' : 'off');
				return next;
			});
		}
	};
}

export const soundEnabled = createSoundStore();
