const ZORLUKLAR = new Set(['kolay', 'easy', '1', 'orta', 'medium', 'normal', '2', 'zor', 'hard', '3']);
const normMetin = (text) => String(text ?? '').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ');

export function soruDogrula(ham) {
	const soru = String(ham.soru ?? '').trim();
	if (soru.length < 5) return { hata: 'Soru metni en az 5 karakter olmalı.' };
	if (soru.length > 600) return { hata: 'Soru metni en fazla 600 karakter olabilir.' };

	const konumlu = (ham.secenekler || []).map((x) => String(x ?? '').trim());
	const dolu = konumlu.filter(Boolean);
	if (dolu.length < 2) return { hata: 'En az 2 şık gerekli.' };
	if (dolu.length > 6) return { hata: 'En fazla 6 şık olabilir.' };
	if (dolu.some((x) => x.length > 200)) return { hata: 'Şıklar en fazla 200 karakter olabilir.' };
	if (new Set(dolu.map(normMetin)).size !== dolu.length) return { hata: 'Aynı şık birden fazla kez yazılmış.' };

	const d = String(ham.dogru ?? '').trim();
	if (!d) return { hata: 'Doğru cevap belirtilmemiş.' };
	let dogru = dolu.find((x) => x === d) || dolu.find((x) => normMetin(x) === normMetin(d));
	if (!dogru) {
		let idx = -1;
		if (/^[A-Fa-f]$/.test(d)) idx = d.toUpperCase().charCodeAt(0) - 65;
		else if (/^[1-6]$/.test(d)) idx = Number(d) - 1;
		if (idx >= 0) {
			dogru = konumlu[idx];
			if (!dogru) return { hata: `Doğru cevap olarak "${d}" yazılmış ama bu şık boş.` };
		}
	}
	if (!dogru) return { hata: `Doğru cevap ("${d.slice(0, 40)}") şıklardan biriyle eşleşmiyor.` };

	const aciklama = String(ham.aciklama ?? '').trim();
	if (aciklama.length > 800) return { hata: 'Açıklama en fazla 800 karakter olabilir.' };

	const z = String(ham.zorluk ?? '').trim().toLocaleLowerCase('tr-TR');
	if (z && !ZORLUKLAR.has(z)) return { hata: `Zorluk "${ham.zorluk}" anlaşılamadı (Kolay, Orta veya Zor olmalı).` };
	const zorluk = ['kolay', 'easy', '1'].includes(z) ? 'Kolay' : ['zor', 'hard', '3'].includes(z) ? 'Zor' : 'Orta';

	return { soru: { soru, secenekler: dolu, dogru, aciklama: aciklama || null, zorluk } };
}
