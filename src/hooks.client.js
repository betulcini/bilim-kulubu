const RECOVERY_KEY = 'btk-stale-chunk-recovery';
const PERSISTENT_CACHES = new Set(['btk-veri', 'btk-font', 'btk-galeri']);

window.addEventListener('vite:preloadError', (event) => {
	if (!navigator.onLine) return;

	try {
		if (sessionStorage.getItem(RECOVERY_KEY)) {
			return;
		}
		sessionStorage.setItem(RECOVERY_KEY, '1');
	} catch (error) {
		console.error('Otomatik uygulama yenilemesi başlatılamadı:', error);
		return;
	}

	event.preventDefault();

	void (async () => {
		try {
			const registrations = await navigator.serviceWorker?.getRegistrations() ?? [];
			await Promise.allSettled(registrations.map((registration) => registration.update()));

			const cacheNames = await caches.keys();
			await Promise.all(
				cacheNames
					.filter((name) => name.startsWith('btk-') && !PERSISTENT_CACHES.has(name))
					.map((name) => caches.delete(name))
			);
		} catch (error) {
			console.error('Eski uygulama önbelleği temizlenemedi; sayfa yeniden yüklenecek:', error);
		} finally {
			window.location.reload();
		}
	})();
});
