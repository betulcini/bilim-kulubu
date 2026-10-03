// Bilim Puanı → seviye. Seviye n, 100 x (n-1)² puandan başlar: 0, 100, 400, 900, 1600, 2500 …
// Puan kuralları (supabase/2026-10-05-puan-ve-ilerleme.sql ile aynı olmalı):
export const PUAN_KURALLARI = [
	{ id: 'quiz', ad: 'Konu quizleri', aciklama: 'Quizin puanı kadar (0-200). Günde en yüksek 3 quiz sayılır.' },
	{ id: 'gunluk_quiz', ad: 'Günlük mini quiz', aciklama: 'Her doğru cevap 20 puan (en fazla 100).' },
	{ id: 'seri_bonusu', ad: 'Seri bonusu', aciklama: 'Art arda gün sayısı x 10 puan (en fazla 70).' },
	{ id: 'ziyaret', ad: 'Günlük giriş', aciklama: 'Giriş yapmış olarak siteyi açtığın her gün 20 puan.' }
];

export const SEVIYE_ADLARI = ['Çaylak', 'Meraklı', 'Kaşif', 'Araştırmacı', 'Deneyci', 'Bilim Elçisi', 'Uzman', 'Usta', 'Dahi', 'Efsane'];
const ESIK = (n) => 100 * (n - 1) * (n - 1); // n. seviyenin başlangıç puanı

export function seviyeHesapla(xp) {
	const puan = Math.max(0, Math.floor(Number(xp) || 0));
	let seviye = 1;
	while (seviye < SEVIYE_ADLARI.length && puan >= ESIK(seviye + 1)) seviye++;
	const maksimum = seviye >= SEVIYE_ADLARI.length;
	const bas = ESIK(seviye);
	const sonraki = maksimum ? null : ESIK(seviye + 1);
	return {
		seviye,
		ad: SEVIYE_ADLARI[seviye - 1],
		sonrakiAd: maksimum ? '' : SEVIYE_ADLARI[seviye],
		bas,
		sonraki,
		kalan: maksimum ? 0 : sonraki - puan,
		oran: maksimum ? 1 : (puan - bas) / (sonraki - bas),
		maksimum
	};
}
