import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createThemeStore() {
	const initial = browser ? localStorage.getItem('btk-theme') || 'light' : 'light';
	const { subscribe, set } = writable(initial);

	function apply(value) {
		if (!browser) return;
		let resolved = value;
		if (value === 'system') {
			resolved = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
		}
		document.documentElement.setAttribute('data-theme', resolved);
		localStorage.setItem('btk-theme', value);
	}

	return {
		subscribe,
		set(value) {
			set(value);
			apply(value);
		},
		init() {
			apply(initial);
		}
	};
}

export const theme = createThemeStore();
