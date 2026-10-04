// Bilim Serileri / Bilim Tiyatrosu videoları (tablo: `videolar`). Herkese açık okuma, supabase-js gerekmez.
// Hata olursa null döner (sayfa videolar bölümünü göstermez); tablo boşsa [] döner.
import { restSelect } from '$lib/publicRest.js';

export async function loadVideolar(bolum) {
	try {
		const data = await restSelect('videolar', {
			select: 'id, baslik, aciklama, grup, youtube_id, created_at',
			eq: { aktif: true, bolum },
			order: ['created_at.desc'],
			limit: 100
		});
		return data.map((v) => ({ id: v.id, baslik: v.baslik, aciklama: v.aciklama || '', grup: v.grup || '', youtubeId: v.youtube_id }));
	} catch {
		return null;
	}
}
