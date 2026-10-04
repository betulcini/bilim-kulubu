// Galeri fotoğrafları Supabase'den okunur (tablo: `galeri`, depo: `galeri` kovası).
// Bağlantı yoksa ya da tablo boşsa null döner; sayfa src/lib/data/gallery.js'teki yedek listeyi gösterir.
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { restSelect } from '$lib/publicRest.js';

export const GALERI_KOVA = 'galeri';

export function gorselAdresi(yol) {
	// supabase-js yüklemeden herkese açık kova adresi (getPublicUrl ile aynı biçim)
	const parca = String(yol).split('/').map(encodeURIComponent).join('/');
	return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${GALERI_KOVA}/${parca}`;
}

export async function loadGaleri() {
	try {
		const data = await restSelect('galeri', {
			select: 'id, baslik, aciklama, gorsel_yolu, tarih, created_at',
			eq: { aktif: true },
			order: ['tarih.desc.nullslast', 'created_at.desc'],
			limit: 200
		});
		if (data.length === 0) return null;
		return data.map((g) => ({
			id: g.id,
			baslik: g.baslik,
			aciklama: g.aciklama || '',
			gorsel: gorselAdresi(g.gorsel_yolu),
			tarih: g.tarih
		}));
	} catch {
		return null;
	}
}
