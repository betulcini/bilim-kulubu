// Galeri fotoğrafları Supabase'den okunur (tablo: `galeri`, depo: `galeri` kovası).
// Bağlantı yoksa ya da tablo boşsa null döner; sayfa src/lib/data/gallery.js'teki yedek listeyi gösterir.
import { supabase } from '$lib/supabaseClient.js';

export const GALERI_KOVA = 'galeri';

export function gorselAdresi(yol) {
	return supabase.storage.from(GALERI_KOVA).getPublicUrl(yol).data.publicUrl;
}

export async function loadGaleri() {
	try {
		const { data, error } = await supabase
			.from('galeri')
			.select('id, baslik, aciklama, gorsel_yolu, tarih, created_at')
			.eq('aktif', true)
			.order('tarih', { ascending: false, nullsFirst: false })
			.order('created_at', { ascending: false })
			.limit(200);
		if (error || !data || data.length === 0) return null;
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
