// Duyurular ve fırsatlar Supabase'den okunur (tablolar: `duyurular`, `firsatlar`).
// Bağlantı yoksa ya da tablo boşsa çağıran sayfa kendi yedek listesini (src/lib/data/*.js) göstermeye devam eder.
import { supabase } from '$lib/supabaseClient.js';

export async function loadAnnouncements() {
	try {
		const { data, error } = await supabase
			.from('duyurular')
			.select('baslik, etiket, tarih, ozet, link, kaynak_ad')
			.eq('aktif', true)
			.order('tarih', { ascending: false })
			.limit(40);
		if (error || !data || data.length === 0) return null;
		return data.map((d) => ({
			baslik: d.baslik,
			etiket: d.etiket,
			tarih: d.tarih,
			ozet: d.ozet,
			link: d.link,
			kaynakAd: d.kaynak_ad
		}));
	} catch {
		return null;
	}
}

export async function loadOpportunities() {
	try {
		const { data, error } = await supabase
			.from('firsatlar')
			.select('baslik, kurum, tur, durum, son, son_tarih, ozet, link, link_ad, kaynak, kaynak_ad')
			.eq('aktif', true)
			.limit(60);
		if (error || !data || data.length === 0) return null;
		return data.map((d) => ({
			baslik: d.baslik,
			kurum: d.kurum,
			tur: d.tur,
			durum: d.durum,
			son: d.son,
			sonTarih: d.son_tarih,
			ozet: d.ozet,
			link: d.link,
			linkAd: d.link_ad,
			kaynak: d.kaynak,
			kaynakAd: d.kaynak_ad
		}));
	} catch {
		return null;
	}
}

const SIRA = { acik: 0, yaklasan: 1, etkinlik: 2, 'okul-ici': 3 };

// Kapanmış olanlar sona, sonra duruma ve son tarihe göre sırala
export function sortOpportunities(list) {
	const bugun = new Date().toISOString().slice(0, 10);
	return list
		.map((o) => ({ ...o, kapandi: Boolean(o.sonTarih) && o.sonTarih < bugun }))
		.sort((a, b) => {
			if (a.kapandi !== b.kapandi) return a.kapandi ? 1 : -1;
			if (SIRA[a.durum] !== SIRA[b.durum]) return SIRA[a.durum] - SIRA[b.durum];
			return (a.sonTarih || '9999').localeCompare(b.sonTarih || '9999');
		});
}

export function formatTarih(iso) {
	if (!iso) return '';
	const d = new Date(iso + 'T12:00:00');
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}
