import { writable } from 'svelte/store';

// "Ana ekrana ekle" (PWA kurulum) durumu.
// Android/Chrome: tarayıcı `beforeinstallprompt` olayı gönderir, biz de kendi düğmemizle tetikleriz.
// iOS/Safari: böyle bir olay yok, kullanıcıya Paylaş > Ana Ekrana Ekle adımları gösterilir.

const KEY = 'btk-install-dismissed';
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // "Şimdi değil" dedikten sonra 14 gün sorma

export const install = writable({
	ready: false,
	canPrompt: false,
	ios: false,
	installed: false,
	phone: false,
	dismissed: false
});

let deferred = null;
let started = false;

function recentlyDismissed() {
	try {
		const t = Number(localStorage.getItem(KEY));
		return Boolean(t) && Date.now() - t < COOLDOWN_MS;
	} catch {
		return false;
	}
}

export function initInstall() {
	if (started || typeof window === 'undefined') return;
	started = true;

	const safariNavigator = /** @type {Navigator & { standalone?: boolean }} */ (window.navigator);
	const standalone =
		window.matchMedia('(display-mode: standalone)').matches || safariNavigator.standalone === true;
	const ua = window.navigator.userAgent;
	const ios =
		/iphone|ipad|ipod/i.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
	const phone = window.matchMedia('(max-width: 900px)').matches && window.matchMedia('(pointer: coarse)').matches;

	install.set({
		ready: true,
		canPrompt: false,
		ios,
		installed: standalone,
		phone,
		dismissed: recentlyDismissed()
	});

	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault();
		deferred = e;
		install.update((s) => ({ ...s, canPrompt: true }));
	});

	window.addEventListener('appinstalled', () => {
		deferred = null;
		install.update((s) => ({ ...s, canPrompt: false, installed: true }));
	});
}

export async function promptInstall() {
	if (!deferred) return 'unavailable';
	deferred.prompt();
	const { outcome } = await deferred.userChoice;
	deferred = null;
	install.update((s) => ({ ...s, canPrompt: false, installed: outcome === 'accepted' }));
	return outcome;
}

export function dismissInstall() {
	try {
		localStorage.setItem(KEY, String(Date.now()));
	} catch {}
	install.update((s) => ({ ...s, dismissed: true }));
}
