// YouTube bağlantısından video kimliğini (11 karakter) çıkarır. Geçersizse null.
// Kabul edilenler: youtube.com/watch?v=…, youtu.be/…, /shorts/…, /embed/…, /live/…  ya da çıplak kimlik.
const KIMLIK = /^[A-Za-z0-9_-]{11}$/;

export function youtubeId(girdi) {
	const s = String(girdi ?? '').trim();
	if (!s) return null;
	if (KIMLIK.test(s)) return s;
	try {
		const u = new URL(/^https?:\/\//i.test(s) ? s : 'https://' + s);
		const h = u.hostname.replace(/^(www|m|music)\./, '');
		let id = null;
		if (h === 'youtu.be') id = u.pathname.split('/')[1];
		else if (h === 'youtube.com' || h === 'youtube-nocookie.com') {
			if (u.pathname === '/watch') id = u.searchParams.get('v');
			else id = (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
		}
		return id && KIMLIK.test(id) ? id : null;
	} catch {
		return null;
	}
}

export const kapakAdresi = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const gomuluAdres = (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
