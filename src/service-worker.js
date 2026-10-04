/// <reference lib="webworker" />
// Çevrimdışı önbellek: uygulama gibi kurulabilmesi ve bağlantı yokken de açılabilmesi için.
//  1) Derlenmiş dosyalar + statik dosyalar + TÜM önceden üretilmiş sayfalar kurulumda önbelleğe alınır.
//  2) Sayfalar önce ağdan istenir (içerik güncel kalır), ağ yoksa önbellekten sunulur.
//  3) Herkese açık duyuru / fırsat verisi (Supabase) son görülen haliyle çevrimdışı da gösterilir.
//  4) Google Fonts yazı tipleri ilk yüklemeden sonra önbellekten gelir.
// Kişisel veriler (profil, skorlar, mesajlar, giriş) bilerek ÖNBELLEĞE ALINMAZ.
import { build, files, prerendered, version } from '$service-worker';

const CACHE = `btk-${version}`;
const VERI = 'btk-veri'; // duyuru / fırsat verisi (sürümler arası kalır)
const FONT = 'btk-font';
const GORSEL = 'btk-galeri'; // galeri fotoğrafları (dosya adları değişmez, bir kez indirilince saklanır)
const ASSETS = [...build, ...files.filter((f) => !f.endsWith('.map'))];
const SAYFALAR = [...prerendered];
const CEVRIMDISI_SAYFALAR = ['/gunluk-quiz'];

// Önbelleğe alınacak herkese açık Supabase tabloları
const HERKESE_ACIK = ['/rest/v1/duyurular', '/rest/v1/firsatlar', '/rest/v1/galeri', '/rest/v1/geziler', '/rest/v1/videolar', '/rest/v1/quiz_konulari', '/rest/v1/quiz_sorulari'];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then(async (cache) => {
				await cache.addAll(ASSETS);
				// Sayfalar tek tek eklenir: biri alınamazsa kurulum bozulmaz
				await Promise.allSettled([...new Set([...SAYFALAR, ...CEVRIMDISI_SAYFALAR])].map((p) => cache.add(p)));
			})
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== VERI && k !== FONT && k !== GORSEL).map((k) => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

async function agOnce(req, cacheAdi) {
	try {
		const res = await fetch(req);
		if (res.ok) {
			const kopya = res.clone();
			caches.open(cacheAdi).then((c) => c.put(req, kopya));
		}
		return res;
	} catch (err) {
		const hit = await caches.match(req, { cacheName: cacheAdi });
		if (hit) return hit;
		throw err;
	}
}

self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;
	const url = new URL(req.url);

	// Supabase: sadece herkese açık içerik tabloları
	if (url.hostname.endsWith('.supabase.co') && HERKESE_ACIK.some((p) => url.pathname.startsWith(p))) {
		event.respondWith(agOnce(req, VERI));
		return;
	}

	// Galeri fotoğrafları (Supabase Storage, herkese açık kova): önce önbellek, yoksa ağ
	if (url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/storage/v1/object/public/galeri/')) {
		event.respondWith(
			caches.open(GORSEL).then(async (c) => {
				const hit = await c.match(req);
				if (hit) return hit;
				const res = await fetch(req);
				if (res.ok) c.put(req, res.clone());
				return res;
			})
		);
		return;
	}

	// Google Fonts: önce önbellek, yoksa ağ (opak yanıtlar da saklanır)
	if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
		event.respondWith(
			caches.open(FONT).then(async (c) => {
				const hit = await c.match(req);
				if (hit) return hit;
				const res = await fetch(req);
				if (res.ok || res.type === 'opaque') c.put(req, res.clone());
				return res;
			})
		);
		return;
	}

	if (url.origin !== self.location.origin) return; // diğer dış istekler dokunulmaz

	// Derlenmiş / statik dosyalar sürümlü olduğu için önce önbellekten
	if (ASSETS.includes(url.pathname)) {
		event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
		return;
	}

	// Sayfalar ve diğerleri: önce ağ, olmazsa önbellek
	event.respondWith(
		fetch(req)
			.then((res) => {
				if (res.ok && (req.mode === 'navigate' || res.type === 'basic')) {
					const copy = res.clone();
					caches.open(CACHE).then((c) => c.put(req, copy));
				}
				return res;
			})
			.catch(async () => {
				// ?konu=fizik gibi parametreli adresler için parametresiz kopya da kabul
				const hit = (await caches.match(req)) || (await caches.match(req, { ignoreSearch: true }));
				if (hit) return hit;
				if (req.mode === 'navigate') {
					return (await caches.match(url.pathname.replace(/\/+$/, '') || '/')) || (await caches.match('/')) || Response.error();
				}
				return Response.error();
			})
	);
});
