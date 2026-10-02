import { SITE_URL } from '$lib/site.js';
import { seoByPath } from '$lib/data/seo.js';

// Build sırasında statik sitemap.xml üretilir.
// Tam adres için VITE_SITE_URL (ya da src/lib/site.js) tanımlı olmalı; yoksa liste boş kalır.
export const prerender = true;

// Giriş gerektiren / kişisel sayfalar sitemap'e girmez
const HARIC = ['/profil', '/ayarlar', '/topluluk', '/mesajlar'];
const EK = ['/oyunlar/hafiza', '/oyunlar/biyoloji-enerji', '/oyunlar/adam-asmaca', '/oyunlar/bilim-tabu', '/gunluk-quiz'];

export function GET() {
	const yollar = ['/', ...Object.keys(seoByPath), ...EK].filter((y, i, a) => !HARIC.includes(y) && a.indexOf(y) === i);
	const govde = SITE_URL
		? yollar.map((y) => `\t<url><loc>${SITE_URL}${y === '/' ? '' : y}</loc></url>`).join('\n')
		: '\t<!-- VITE_SITE_URL tanımlı değil: tam adres verilince burada sayfa listesi oluşur -->';
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${govde}\n</urlset>\n`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
