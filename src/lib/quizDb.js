// Yönetici panelinden eklenen quizler Supabase'den okunur (tablolar: `quiz_konulari`, `quiz_sorulari`).
// Bağlantı yoksa ya da tablo boşsa null döner; sayfalar src/lib/data/bilim-quizleri.js'teki
// yerleşik sorularla çalışmaya devam eder.
import { supabase } from '$lib/supabaseClient.js';

const SAYFA = 1000; // Supabase tek istekte en fazla 1000 satır döndürür

let onbellek = null;

export async function loadDbQuiz() {
	if (onbellek) return onbellek;
	try {
		const k = await supabase.from('quiz_konulari').select('slug, baslik, aciklama').eq('aktif', true);
		if (k.error || !k.data || k.data.length === 0) return null;

		const sorular = [];
		for (let bas = 0; ; bas += SAYFA) {
			const s = await supabase
				.from('quiz_sorulari')
				.select('konu, soru, secenekler, dogru, aciklama, zorluk')
				.eq('aktif', true)
				.order('id', { ascending: true })
				.range(bas, bas + SAYFA - 1);
			if (s.error) return null;
			sorular.push(...(s.data || []));
			if (!s.data || s.data.length < SAYFA) break;
		}

		const sonuc = {};
		for (const t of k.data) sonuc[t.slug] = { title: t.baslik, desc: t.aciklama || 'Her turda farklı sorularla bilgini sına.', questions: [] };
		for (const q of sorular) {
			if (!sonuc[q.konu]) continue;
			sonuc[q.konu].questions.push({
				soru: q.soru,
				secenekler: q.secenekler,
				dogru: q.dogru,
				aciklama: q.aciklama || '',
				zorluk: q.zorluk || 'Orta'
			});
		}
		onbellek = sonuc;
		return sonuc;
	} catch {
		return null;
	}
}

const norm = (t) => String(t).trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ');

// Yerleşik havuz + veritabanı havuzu. Aynı konu adı (slug) varsa yerleşik başlık/açıklama kalır,
// veritabanındaki yeni sorular eklenir; aynı soru metni iki kez eklenmez.
// Sorusu olmayan konular listeye girmez.
export function birlestir(statik, db) {
	const sonuc = {};
	for (const [k, v] of Object.entries(statik)) sonuc[k] = { ...v, questions: [...v.questions] };
	if (!db) return sonuc;
	for (const [slug, t] of Object.entries(db)) {
		if (t.questions.length === 0) continue;
		if (!sonuc[slug]) {
			sonuc[slug] = { title: t.title, desc: t.desc, questions: [...t.questions] };
			continue;
		}
		const var_ = new Set(sonuc[slug].questions.map((q) => norm(q.soru)));
		for (const q of t.questions) if (!var_.has(norm(q.soru))) sonuc[slug].questions.push(q);
	}
	return sonuc;
}
