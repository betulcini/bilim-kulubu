// Kulüp gezisi duyuruları (tablo: `geziler`). Herkese açık okuma, supabase-js gerekmez.
// Hata olursa (çevrimdışı, tablo yok) null döner: sayfa src/lib/data/trips.js'teki yedek listeyi gösterir.
// Tablo bilerek boşaltılmışsa [] döner: sayfa "planlanan gezi yok" der, yedek liste geri gelmez.
import { restSelect } from '$lib/publicRest.js';
import { formatTarih } from '$lib/content.js';

export async function loadGeziler() {
	try {
		const data = await restSelect('geziler', {
			select: 'id, yer, gun, tarih_metni, durum, ozet, link, link_ad, created_at',
			eq: { aktif: true },
			order: ['created_at.desc'],
			limit: 100
		});
		return data.map((g) => ({
			id: g.id,
			yer: g.yer,
			gun: g.gun,
			tarih: g.tarih_metni || formatTarih(g.gun) || 'Tarih belirlenecek',
			durum: g.durum,
			ozet: g.ozet,
			link: g.link,
			linkAd: g.link_ad
		}));
	} catch {
		return null;
	}
}

// Planlananlar önce (en yakın gün başta, günü olmayanlar sonda), sonra gerçekleşenler (en yeni başta), en sonda iptaller.
export function sirala(liste) {
	const grup = (d) => (d === 'planlaniyor' ? 0 : d === 'gerceklesti' ? 1 : 2);
	return [...liste].sort((a, b) => {
		if (grup(a.durum) !== grup(b.durum)) return grup(a.durum) - grup(b.durum);
		if (a.durum === 'planlaniyor') return (a.gun || '9999').localeCompare(b.gun || '9999');
		return (b.gun || '').localeCompare(a.gun || '');
	});
}
