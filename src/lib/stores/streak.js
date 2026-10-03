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

// Seri verisinin hangi hesaba ait olduğu (aynı cihazda başka biri girerse onun serisi karışmasın)
const OWNER_KEY = 'btk_streak_owner';
export function streakOwner() {
	if (!browser) return '';
	try {
		return localStorage.getItem(OWNER_KEY) || '';
	} catch (e) {
		return '';
	}
}

export const streak = {
	subscribe: store.subscribe,
	// Giriş yapmış kullanıcının Supabase'deki serisini bu cihazın önbelleğine yazar.
	// sunucu: { seri: { current, best, total, last_day }, aktivite: [{ gun, quiz_dogru }] }
	// birlestir: bu cihazdaki veri aynı hesaba (ya da hiç kimseye) aitse en iyi/toplam değerlerin büyüğü korunur.
	hydrate(sunucu, uid, birlestir = true) {
		if (!browser || !sunucu?.seri) return get(store);
		const yerel = birlestir ? get(store) : defaults;
		const results = {};
		for (const a of sunucu.aktivite || []) {
			if (a.quiz_dogru !== null && a.quiz_dogru !== undefined) results[a.gun] = { score: a.quiz_dogru, total: 5 };
		}
		// Bu cihazdaki sonuçlardan sunucuda olmayanlar (henüz aktarılmamış) görünür kalsın
		for (const [k, v] of Object.entries(yerel.results || {})) if (!results[k]) results[k] = v;
		const keys = Object.keys(results).sort();
		for (const k of keys.slice(0, Math.max(0, keys.length - 60))) delete results[k];

		const next = {
			current: Number(sunucu.seri.current) || 0,
			best: Math.max(Number(sunucu.seri.best) || 0, yerel.best || 0),
			total: Math.max(Number(sunucu.seri.total) || 0, yerel.total || 0),
			lastDay: sunucu.seri.last_day || '',
			results
		};
		store.set(next);
		persist(next);
		try {
			if (uid) localStorage.setItem(OWNER_KEY, uid);
		} catch (e) {
			/* önemsiz */
		}
		return next;
	},
	// Bu cihazda olup henüz hesapta bulunmayan gün sonuçları (son 60 gün)
	eksikGunler(sunucuAktivite) {
		const var_ = new Set((sunucuAktivite || []).filter((a) => a.quiz_dogru !== null && a.quiz_dogru !== undefined).map((a) => a.gun));
		const out = {};
		for (const [k, v] of Object.entries(get(store).results || {})) if (!var_.has(k)) out[k] = v;
		return out;
	},
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
