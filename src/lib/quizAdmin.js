import { supabase } from '$lib/supabaseClient.js';
import { hataMetni as hataMetniGenel } from '$lib/yonetim.js';
import { quizData } from '$lib/data/bilim-quizleri.js';
import { soruDogrula } from '$lib/quizValidation.js';

// Yönetici paneli: quiz konuları / soruları + CSV'den toplu içe aktarma.
// Yetki kontrolü veritabanında (RLS + is_yonetici) yapılır; burası sadece arayüzü besler.
// Kurulum: supabase/2026-10-04-quiz-galeri-yonetimi.sql
const KURULUM = '2026-10-04-quiz-galeri-yonetimi.sql';
const hataMetni = (e) => hataMetniGenel(e, KURULUM);

export const ZORLUKLAR = ['Kolay', 'Orta', 'Zor'];
export const SIK_HARFLERI = ['A', 'B', 'C', 'D', 'E', 'F'];
const SORU_MIN = 5;
const SORU_MAX = 600;
const SIK_MAX = 200;
const ACIKLAMA_MAX = 800;

// ---------------------------------------------------------------- yardımcılar
const TR_ASCII = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };

function anahtar(s) {
	return String(s ?? '')
		.trim()
		.toLocaleLowerCase('tr-TR')
		.replace(/[çğıöşüâîû]/g, (c) => TR_ASCII[c])
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');
}

export function slugYap(metin) {
	return anahtar(metin).replace(/_/g, '-').slice(0, 40).replace(/-+$/g, '');
}

const normMetin = (t) => String(t ?? '').trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ');

function bastanBuyuk(t) {
	const s = String(t).trim();
	return s ? s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1) : s;
}

// Yerleşik (koddaki) konular: CSV'deki "Fizik" gibi satırlar bunlara eklenir.
export const YERLESIK_KONULAR = Object.entries(quizData).map(([slug, v]) => ({ slug, baslik: v.title }));

// ---------------------------------------------------------------- CSV ayrıştırma
function tirnakDisiSay(satir, ayirici) {
	let n = 0;
	let ic = false;
	for (const c of satir) {
		if (c === '"') ic = !ic;
		else if (!ic && c === ayirici) n++;
	}
	return n;
}

// RFC 4180'e uygun: tırnaklı alanlar, "" kaçışı, alan içinde satır sonu, CRLF, BOM; ayırıcı , ; veya sekme
export function csvAyristir(metin) {
	const t = String(metin ?? '').replace(/^\uFEFF/, '');
	const ilk = t.split(/\r?\n/, 1)[0] || '';
	let ayirici = ',';
	let en = -1;
	for (const a of [',', ';', '\t']) {
		const n = tirnakDisiSay(ilk, a);
		if (n > en) {
			en = n;
			ayirici = a;
		}
	}

	const kayitlar = [];
	let alan = '';
	let satir = [];
	let tirnak = false;
	let no = 1;
	const bitir = () => {
		satir.push(alan);
		alan = '';
		if (satir.some((x) => x.trim() !== '')) kayitlar.push({ no, hucreler: satir });
		satir = [];
		no++;
	};
	for (let i = 0; i < t.length; i++) {
		const c = t[i];
		if (tirnak) {
			if (c === '"') {
				if (t[i + 1] === '"') {
					alan += '"';
					i++;
				} else tirnak = false;
			} else alan += c;
		} else if (c === '"' && alan === '') tirnak = true;
		else if (c === ayirici) {
			satir.push(alan);
			alan = '';
		} else if (c === '\n' || c === '\r') {
			if (c === '\r' && t[i + 1] === '\n') i++;
			bitir();
		} else alan += c;
	}
	if (alan !== '' || satir.length) bitir();
	return { ayirici, kayitlar };
}

export { soruDogrula };

// ---------------------------------------------------------------- CSV → sorular
const SUTUN = {
	konu: ['konu', 'kategori', 'ders', 'alan', 'category', 'topic', 'subject'],
	soru: ['soru', 'soru_metni', 'soru_koku', 'question', 'question_text'],
	dogru: ['dogru', 'dogru_cevap', 'dogru_secenek', 'dogru_sik', 'cevap', 'answer', 'correct', 'correct_answer'],
	aciklama: ['aciklama', 'aciklama_metni', 'cozum', 'explanation'],
	zorluk: ['zorluk', 'zorluk_seviyesi', 'seviye', 'difficulty', 'level'],
	secenekler: ['secenekler', 'siklar', 'options', 'choices']
};

function sutunBul(basliklar, adaylar) {
	return basliklar.findIndex((b) => adaylar.includes(b));
}

// Şık sütunları: secenek_a / sik_1 / option_c / a / b ...
function sikSutunlari(basliklar) {
	const sonuc = [];
	basliklar.forEach((b, i) => {
		let m = b.match(/^(?:secenek|sik|option|choice)_?([a-f1-6])$/) || b.match(/^([a-f])$/);
		if (!m) return;
		const harf = m[1];
		const sira = /\d/.test(harf) ? Number(harf) - 1 : harf.charCodeAt(0) - 97;
		sonuc.push({ sira, sutun: i });
	});
	return sonuc.sort((a, b) => a.sira - b.sira);
}

export function konuBilgisi(ham, bilinenler = []) {
	const slug = slugYap(ham);
	if (!slug) return null;
	const var_ = bilinenler.find((k) => k.slug === slug);
	if (var_) return { slug, baslik: var_.baslik };
	const metin = bastanBuyuk(ham);
	const baslik = /quiz$/i.test(metin) ? metin : `${metin} Quiz`;
	return { slug, baslik: baslik.slice(0, 80) };
}

// opts: { varsayilanKonu: '', bilinenKonular: [{slug, baslik}] }
export function csvdenSorular(metin, opts = {}) {
	const { varsayilanKonu = '', bilinenKonular = [] } = opts;
	const { kayitlar, ayirici } = csvAyristir(metin);
	const sonuc = { ayirici, sorular: [], hatalar: [], konular: [], ustHata: '', satirSayisi: 0 };
	if (kayitlar.length < 2) {
		sonuc.ustHata = 'Dosyada başlık satırı ve en az bir soru satırı olmalı.';
		return sonuc;
	}
	const basliklar = kayitlar[0].hucreler.map(anahtar);
	if (new Set(basliklar).size !== basliklar.length) {
		sonuc.ustHata = 'Başlık satırında aynı sütun adı birden fazla kez kullanılmış.';
		return sonuc;
	}
	if (kayitlar.length - 1 > 1000) {
		sonuc.ustHata = 'Bir CSV dosyasında en fazla 1000 soru içe aktarılabilir.';
		return sonuc;
	}
	const iKonu = sutunBul(basliklar, SUTUN.konu);
	const iSoru = sutunBul(basliklar, SUTUN.soru);
	const iDogru = sutunBul(basliklar, SUTUN.dogru);
	const iAciklama = sutunBul(basliklar, SUTUN.aciklama);
	const iZorluk = sutunBul(basliklar, SUTUN.zorluk);
	const iTekSik = sutunBul(basliklar, SUTUN.secenekler);
	const sikSut = sikSutunlari(basliklar);

	if (iSoru < 0) sonuc.ustHata = 'Başlık satırında "soru" sütunu bulunamadı.';
	else if (iDogru < 0) sonuc.ustHata = 'Başlık satırında "dogru" (doğru cevap) sütunu bulunamadı.';
	else if (iTekSik < 0 && sikSut.length < 2) sonuc.ustHata = 'Şık sütunları bulunamadı (secenek_a, secenek_b, … ya da tek bir "secenekler" sütunu olmalı).';
	else if (iKonu < 0 && !slugYap(varsayilanKonu)) sonuc.ustHata = 'CSV\'de "konu" sütunu yok. Yukarıdaki "Konu" kutusuna soruların ekleneceği konuyu yaz.';
	if (sonuc.ustHata) return sonuc;

	const konuHaritasi = new Map();
	const varsayilan = konuBilgisi(varsayilanKonu, bilinenKonular);
	const bilinen = [...bilinenKonular];
	const soruAnahtarlari = new Set();

	for (const k of kayitlar.slice(1)) {
		const h = k.hucreler;
		sonuc.satirSayisi++;
		let konu = varsayilan;
		if (!konu) {
			const hamKonu = (h[iKonu] || '').trim();
			if (!hamKonu) {
				sonuc.hatalar.push({ no: k.no, mesaj: 'Konu boş.' });
				continue;
			}
			konu = konuBilgisi(hamKonu, bilinen);
			if (!konu) {
				sonuc.hatalar.push({ no: k.no, mesaj: `Konu adı ("${hamKonu.slice(0, 30)}") geçerli bir ada çevrilemedi.` });
				continue;
			}
		}

		let secenekler;
		if (iTekSik >= 0) {
			const hamSik = h[iTekSik] || '';
			secenekler = hamSik.includes('|') ? hamSik.split('|') : hamSik.split(/\r?\n/);
		} else {
			secenekler = [];
			for (const { sira, sutun } of sikSut) secenekler[sira] = h[sutun] || '';
			secenekler = Array.from(secenekler, (x) => x ?? '');
		}

		const r = soruDogrula({
			soru: h[iSoru],
			secenekler,
			dogru: h[iDogru],
			aciklama: iAciklama >= 0 ? h[iAciklama] : '',
			zorluk: iZorluk >= 0 ? h[iZorluk] : ''
		});
		if (r.hata) {
			sonuc.hatalar.push({ no: k.no, mesaj: r.hata });
			continue;
		}
		const soruAnahtari = `${konu.slug}|${normMetin(r.soru.soru)}`;
		if (soruAnahtarlari.has(soruAnahtari)) {
			sonuc.hatalar.push({ no: k.no, mesaj: 'Bu dosyada aynı konu ve soru metni daha önce kullanılmış.' });
			continue;
		}
		soruAnahtarlari.add(soruAnahtari);
		if (!konuHaritasi.has(konu.slug)) {
			konuHaritasi.set(konu.slug, konu);
			bilinen.push(konu);
		}
		sonuc.sorular.push({ no: k.no, konu: konu.slug, ...r.soru });
	}
	sonuc.konular = [...konuHaritasi.values()];
	return sonuc;
}

export const CSV_SABLONU =
	'konu,soru,secenek_a,secenek_b,secenek_c,secenek_d,dogru,aciklama,zorluk\r\n' +
	'Genetik,"DNA\'nın yapı taşlarına ne ad verilir?",Nükleotit,Amino asit,Glikoz,Yağ asidi,A,"DNA, nükleotit adı verilen birimlerden oluşur.",Kolay\r\n' +
	'Genetik,"İnsan hücrelerinde normalde kaç kromozom bulunur?",23,46,48,92,46,"Vücut hücrelerinde 23 çift, yani 46 kromozom bulunur.",Orta\r\n';

// ---------------------------------------------------------------- Supabase: konular
export async function listKonular() {
	const { data, error } = await supabase.from('quiz_konulari').select('*').order('created_at', { ascending: true });
	if (error) return { data: [], hata: hataMetni(error) };
	const adetler = await Promise.all(
		data.map((k) =>
			supabase.from('quiz_sorulari').select('*', { count: 'exact', head: true }).eq('konu', k.slug).then((r) => r.count ?? 0)
		)
	);
	return { data: data.map((k, i) => ({ ...k, adet: adetler[i] })), hata: null };
}

export function konuDogrula(f, yeni) {
	const baslik = String(f.baslik ?? '').trim();
	const aciklama = String(f.aciklama ?? '').trim();
	if (baslik.length < 2 || baslik.length > 80) return { hata: 'Başlık 2-80 karakter olmalı.' };
	if (aciklama.length > 300) return { hata: 'Açıklama en fazla 300 karakter olabilir.' };
	let slug = String(f.slug ?? '').trim();
	if (yeni) {
		slug = slugYap(slug || baslik);
		if (!slug) return { hata: 'Konu için geçerli bir kısa ad (slug) üretilemedi; sadece harf/rakam kullan.' };
	}
	return { satir: { slug, baslik, aciklama } };
}

export async function konuEkle(satir) {
	const { error } = await supabase.from('quiz_konulari').insert({ ...satir, aktif: true });
	if (error?.code === '23505') return { hata: 'Bu kısa adla bir konu zaten var.' };
	return { hata: hataMetni(error) };
}

export async function konuGuncelle(slug, alanlar) {
	const { error } = await supabase.from('quiz_konulari').update(alanlar).eq('slug', slug);
	return { hata: hataMetni(error) };
}

export async function konuSil(slug) {
	const { error } = await supabase.from('quiz_konulari').delete().eq('slug', slug);
	return { hata: hataMetni(error) };
}

// ---------------------------------------------------------------- Supabase: sorular
export const SAYFA_BOYUTU = 50;

export async function listSorular(konu, bas = 0) {
	const { data, error } = await supabase
		.from('quiz_sorulari')
		.select('*')
		.eq('konu', konu)
		.order('id', { ascending: false })
		.range(bas, bas + SAYFA_BOYUTU - 1);
	return { data: data || [], hata: hataMetni(error) };
}

export async function soruKaydet(satir, id = null) {
	const q = id ? supabase.from('quiz_sorulari').update(satir).eq('id', id) : supabase.from('quiz_sorulari').insert({ ...satir, aktif: true });
	const { error } = await q;
	return { hata: hataMetni(error) };
}

export async function soruAktif(id, aktif) {
	const { error } = await supabase.from('quiz_sorulari').update({ aktif }).eq('id', id);
	return { hata: hataMetni(error) };
}

export async function soruSil(id) {
	const { error } = await supabase.from('quiz_sorulari').delete().eq('id', id);
	return { hata: hataMetni(error) };
}

// ---------------------------------------------------------------- toplu ekleme
const PARCA = 200;

async function mevcutSorular(konular) {
	const var_ = new Set();
	for (const konu of konular) {
		for (let bas = 0; ; bas += 1000) {
			const { data, error } = await supabase
				.from('quiz_sorulari')
				.select('soru')
				.eq('konu', konu)
				.order('id', { ascending: true })
				.range(bas, bas + 999);
			if (error) return { hata: hataMetni(error) };
			for (const r of data) var_.add(konu + '|' + normMetin(r.soru));
			if (data.length < 1000) break;
		}
	}
	return { var_ };
}

// sorular: csvdenSorular().sorular, konular: csvdenSorular().konular
// Döndürür: { eklenen, atlanan, hata }  (hata varsa o ana kadar eklenenler kalır)
export async function topluEkle(sorular, konular, ilerleme = null) {
	if (sorular.length === 0) return { eklenen: 0, atlanan: 0, hata: null };

	// 1) Olmayan konuları oluştur (var olanlara dokunma)
	const { error: ke } = await supabase
		.from('quiz_konulari')
		.upsert(
			konular.map((k) => ({ slug: k.slug, baslik: k.baslik, aciklama: '', aktif: true })),
			{ onConflict: 'slug', ignoreDuplicates: true }
		);
	if (ke) return { eklenen: 0, atlanan: 0, hata: hataMetni(ke) };

	// 2) Zaten var olan soruları ele (aynı konu + aynı soru metni)
	const m = await mevcutSorular([...new Set(sorular.map((s) => s.konu))]);
	if (m.hata) return { eklenen: 0, atlanan: 0, hata: m.hata };
	const gorulen = new Set(m.var_);
	const yeni = [];
	let atlanan = 0;
	for (const s of sorular) {
		const anah = s.konu + '|' + normMetin(s.soru);
		if (gorulen.has(anah)) {
			atlanan++;
			continue;
		}
		gorulen.add(anah);
		yeni.push({ konu: s.konu, soru: s.soru, secenekler: s.secenekler, dogru: s.dogru, aciklama: s.aciklama, zorluk: s.zorluk, aktif: true });
	}

	// 3) Parçalar halinde ekle
	let eklenen = 0;
	for (let i = 0; i < yeni.length; i += PARCA) {
		const { error } = await supabase.from('quiz_sorulari').insert(yeni.slice(i, i + PARCA));
		if (error) return { eklenen, atlanan, hata: hataMetni(error) };
		eklenen += Math.min(PARCA, yeni.length - i);
		if (ilerleme) ilerleme(eklenen, yeni.length);
	}
	return { eklenen, atlanan, hata: null };
}
