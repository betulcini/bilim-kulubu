// Bilim Serileri / Bilim Tiyatrosu videoları (tablo: `videolar`). Herkese açık okuma, supabase-js gerekmez.
// Hata olursa null döner (sayfa videolar bölümünü göstermez); tablo boşsa [] döner.
import { restSelect } from '$lib/publicRest.js';

export async function loadVideolar(bolum) {
	try {
		const data = await restSelect('videolar', {
			select: 'id, baslik, aciklama, grup, youtube_id, playlist_id, created_at',
			eq: { aktif: true, bolum },
			order: ['sira.desc', 'created_at.desc'],
			limit: 100
		});
		return data.map((v) => ({
			id: v.id,
			baslik: v.baslik,
			aciklama: v.aciklama || '',
			grup: v.grup || '',
			youtubeId: v.youtube_id,
			playlistId: v.playlist_id
		}));
	} catch {
		return null;
	}
}

export async function loadVideoKartlari(bolum) {
	try {
		const data = await restSelect('video_kartlari', {
			select: 'id, baslik, aciklama, durum, alt_bilgi, rozet',
			eq: { aktif: true, bolum },
			order: ['sira.asc', 'created_at.asc'],
			limit: 100
		});
		return data.map((kart) => ({
			title: kart.baslik,
			desc: kart.aciklama || '',
			durum: kart.durum || '',
			detay: kart.alt_bilgi || '',
			rozet: kart.rozet || ''
		}));
	} catch {
		return null;
	}
}
