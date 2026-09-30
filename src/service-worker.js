/// <reference lib="webworker" />
// Basit çevrimdışı önbellek: uygulama gibi kurulabilmesi ve bağlantı zayıfken de açılabilmesi için.
// Sayfalar önce ağdan istenir (içerik güncel kalır), ağ yoksa önbellekten sunulur.
import { build, files, version } from '$service-worker';

const CACHE = `btk-${version}`;
const ASSETS = [...build, ...files.filter((f) => !f.endsWith('.map'))];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;
	const url = new URL(req.url);
	if (url.origin !== self.location.origin) return; // Supabase vb. dış istekler dokunulmaz

	// Derlenmiş dosyalar sürümlü olduğu için önce önbellekten
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
				const hit = await caches.match(req);
				if (hit) return hit;
				if (req.mode === 'navigate') return (await caches.match('/')) || Response.error();
				return Response.error();
			})
	);
});
