import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { loadAnnouncements, loadOpportunities } from '$lib/content.js';

// "Yeni" rozeti ve "son ziyaretten beri eklenenler" sayacı.
// Her bölümün son görülme zamanı bu cihazda (localStorage) tutulur.
// İlk ziyarette hiçbir şey "yeni" sayılmaz; sadece başlangıç zamanı kaydedilir.
const KEY = 'btk_last_seen';
const SECTIONS = ['duyurular', 'firsatlar'];

function read() {
	if (!browser) return {};
	try {
		const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
		return raw && typeof raw === 'object' ? raw : {};
	} catch {
		return {};
	}
}

function write(value) {
	if (!browser) return;
	try {
		localStorage.setItem(KEY, JSON.stringify(value));
	} catch {
		/* depolama dolu / kapalı: sessizce geç */
	}
}

// Oturum başındaki durum: sayfada "Yeni" rozetleri bu zamana göre çizilir.
const since = read();
const visited = new Set();

// Kayıtlı zaman yoksa (ilk ziyaret) şimdiyi başlangıç yap
if (browser) {
	const now = new Date().toISOString();
	let changed = false;
	for (const s of SECTIONS) {
		if (!since[s]) {
			since[s] = now;
			changed = true;
		}
	}
	if (changed) write({ ...read(), ...since });
}

export const newCounts = writable({ duyurular: 0, firsatlar: 0 });

/** Kayıt, son ziyaretten sonra eklendiyse true. Yedek (yerel) veride tarih yoktur, yeni sayılmaz. */
export function isNew(section, item) {
	if (!item?.eklendi || !since[section]) return false;
	return item.eklendi > since[section];
}

/** Sayfa açıldığında çağır: sayaç sıfırlanır, bir sonraki ziyaret için zaman güncellenir. */
export function markSeen(section) {
	if (!browser) return;
	visited.add(section);
	write({ ...read(), [section]: new Date().toISOString() });
	newCounts.update((c) => ({ ...c, [section]: 0 }));
}

/** Menüdeki sayaçlar için: iki listeyi çekip yeni olanları sayar. */
export async function refreshNewCounts() {
	const [d, f] = await Promise.all([loadAnnouncements(), loadOpportunities()]);
	newCounts.set({
		duyurular: visited.has('duyurular') ? 0 : (d || []).filter((x) => isNew('duyurular', x)).length,
		firsatlar: visited.has('firsatlar') ? 0 : (f || []).filter((x) => isNew('firsatlar', x)).length
	});
}
