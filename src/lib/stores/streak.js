import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

// Günlük mini quiz serisi (streak). Bu cihazda, localStorage'da tutulur.
// Seri: arka arkaya kaç gün günlük quizi tamamladığın. Bir gün atlarsan sıfırlanır.
const KEY = 'btk_streak';
const defaults = { current: 0, best: 0, total: 0, lastDay: '', results: {} };

// Yerel saate göre 'YYYY-MM-DD'
export function dayKey(date = new Date()) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

function yesterdayKey() {
	const d = new Date();
	d.setDate(d.getDate() - 1);
	return dayKey(d);
}

function load() {
	if (!browser) return { ...defaults };
	try {
		const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
		return {
			current: Number(raw.current) || 0,
			best: Number(raw.best) || 0,
			total: Number(raw.total) || 0,
			lastDay: typeof raw.lastDay === 'string' ? raw.lastDay : '',
			results: raw.results && typeof raw.results === 'object' ? raw.results : {}
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

// Saklanan seri bugün/dün değilse kırılmıştır; ekranda 0 göster
export function visibleStreak(s) {
	if (!s) return 0;
	if (s.lastDay === dayKey() || s.lastDay === yesterdayKey()) return s.current;
	return 0;
}

export const streak = {
	subscribe: store.subscribe,
	// Bugünkü quiz tamamlandı mı?
	todayResult() {
		return get(store).results[dayKey()] || null;
	},
	// Günlük quiz bittiğinde çağrılır. Aynı gün ikinci kez çağrılırsa seri artmaz.
	complete(score, total) {
		if (!browser) return get(store);
		const s = get(store);
		const today = dayKey();
		if (s.lastDay === today) return s;

		const current = s.lastDay === yesterdayKey() ? s.current + 1 : 1;
		// Sadece son 60 günün sonucunu sakla
		const results = { ...s.results, [today]: { score, total } };
		const keys = Object.keys(results).sort();
		for (const k of keys.slice(0, Math.max(0, keys.length - 60))) delete results[k];

		const next = {
			current,
			best: Math.max(s.best, current),
			total: s.total + 1,
			lastDay: today,
			results
		};
		store.set(next);
		persist(next);
		return next;
	}
};
