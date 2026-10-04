import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Herkese açık (giriş gerektirmeyen) tabloları supabase-js yüklemeden okur.
// Güvenlik aynı: erişimi veritabanındaki RLS politikaları belirler (anon rolü).
// Hata olursa fırlatır; çağıran yedeğe düşer.
/**
 * @param {string} tablo
 * @param {{ select?: string, eq?: Record<string, string | number | boolean>, order?: string[], limit?: number }} [secenek]
 * @returns {Promise<any[]>}
 */
export async function restSelect(tablo, { select = '*', eq = {}, order = [], limit } = {}) {
	const p = new URLSearchParams();
	p.set('select', select.replace(/\s+/g, ''));
	for (const [k, v] of Object.entries(eq)) p.set(k, `eq.${v}`);
	if (order.length) p.set('order', order.join(','));
	if (limit) p.set('limit', String(limit));

	const headers = { apikey: PUBLIC_SUPABASE_ANON_KEY, Accept: 'application/json' };
	// Eski tip (JWT) anahtarlar Authorization başlığıyla da gönderilir; yeni "publishable" anahtarlar sadece apikey ister.
	if (PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ')) headers.Authorization = `Bearer ${PUBLIC_SUPABASE_ANON_KEY}`;

	const res = await fetch(`${PUBLIC_SUPABASE_URL}/rest/v1/${tablo}?${p}`, { headers });
	if (!res.ok) throw new Error(`${tablo}: ${res.status}`);
	const veri = await res.json();
	return Array.isArray(veri) ? veri : [];
}
