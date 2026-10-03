import { supabase } from '$lib/supabaseClient.js';

// Yönetici formu için Supabase yardımcıları.
// Asıl yetki kontrolü veritabanında (RLS + is_yonetici) yapılır:
// bu dosya yöneticiyi "tanımaz", sadece arayüzü besler.
// Kurulum: supabase/2026-10-03-yonetici-formu.sql

export const ETIKETLER = ['Uzay', 'Teknoloji', 'Sağlık', 'Biyoloji', 'Biyoteknoloji', 'Enerji', 'Çevre', 'Yapay Zekâ', 'Fizik', 'Kimya', 'Matematik'];
export const TURLER = ['Ulusal', 'Uluslararası', 'Etkinlik', 'Eğitim', 'Okul içi'];
export const DURUMLAR = [
	{ id: 'acik', label: 'Başvuru açık' },
	{ id: 'yaklasan', label: 'Yaklaşan' },
	{ id: 'etkinlik', label: 'Etkinlik' },
	{ id: 'okul-ici', label: 'Okul içi' }
];

// Her tablo için form alanları (form ve doğrulama aynı listeden okunur)
export const ALANLAR = {
	duyurular: [
		{ k: 'baslik', l: 'Başlık', t: 'text', min: 5, max: 160, zorunlu: true },
		{ k: 'etiket', l: 'Etiket', t: 'text', min: 2, max: 30, zorunlu: true, liste: ETIKETLER },
		{ k: 'tarih', l: 'Haber tarihi', t: 'date', zorunlu: true },
		{ k: 'ozet', l: 'Özet', t: 'textarea', min: 20, max: 700, zorunlu: true },
		{ k: 'link', l: 'Haber bağlantısı (https://…)', t: 'url', max: 500 },
		{ k: 'kaynak_ad', l: 'Kaynak adı (örn. AA, CHIP Online)', t: 'text', max: 80 }
	],
	firsatlar: [
		{ k: 'baslik', l: 'Başlık', t: 'text', min: 5, max: 160, zorunlu: true },
		{ k: 'kurum', l: 'Kurum', t: 'text', max: 120 },
		{ k: 'tur', l: 'Tür', t: 'select', secenekler: TURLER.map((x) => ({ id: x, label: x })) },
		{ k: 'durum', l: 'Durum', t: 'select', zorunlu: true, secenekler: DURUMLAR },
		{ k: 'son', l: 'Kartta görünen tarih metni (örn. Başvuru: 23 Eylül – 4 Ocak)', t: 'text', max: 160 },
		{ k: 'son_tarih', l: 'Son başvuru günü (geçince kart "Kapandı" olur)', t: 'date' },
		{ k: 'ozet', l: 'Özet', t: 'textarea', min: 20, max: 700, zorunlu: true },
		{ k: 'link', l: 'Başvuru / detay bağlantısı (https://…)', t: 'url', max: 500 },
		{ k: 'link_ad', l: 'Buton yazısı (örn. Başvuru sayfası)', t: 'text', max: 60 },
		{ k: 'kaynak', l: 'Bilginin alındığı sayfa (https://…)', t: 'url', max: 500 },
		{ k: 'kaynak_ad', l: 'Kaynak adı', t: 'text', max: 80 }
	]
};

export function bosForm(tablo) {
	const f = {};
	for (const a of ALANLAR[tablo]) f[a.k] = '';
	if (tablo === 'duyurular') f.tarih = new Date().toISOString().slice(0, 10);
	if (tablo === 'firsatlar') f.durum = 'yaklasan';
	return f;
}

const httpsMi = (v) => /^https?:\/\/\S+$/i.test(v);

// Döndürür: { hata } ya da { satir } (veritabanına gidecek temiz nesne)
export function dogrula(tablo, form) {
	const satir = {};
	for (const a of ALANLAR[tablo]) {
		const v = String(form[a.k] ?? '').trim();
		if (!v) {
			if (a.zorunlu) return { hata: `"${a.l}" boş bırakılamaz.` };
			satir[a.k] = null;
			continue;
		}
		if (a.min && v.length < a.min) return { hata: `"${a.l}" en az ${a.min} karakter olmalı.` };
		if (a.max && v.length > a.max) return { hata: `"${a.l}" en fazla ${a.max} karakter olabilir.` };
		if (a.t === 'url' && !httpsMi(v)) return { hata: `"${a.l}" http:// veya https:// ile başlayan geçerli bir adres olmalı.` };
		if (a.t === 'select' && !a.secenekler.some((s) => s.id === v)) return { hata: `"${a.l}" için geçersiz seçim.` };
		if (a.t === 'date' && Number.isNaN(new Date(v + 'T12:00:00').getTime())) return { hata: `"${a.l}" geçerli bir tarih olmalı.` };
		satir[a.k] = v;
	}
	return { satir };
}

export function hataMetni(error, kurulum = '2026-10-03-yonetici-formu.sql') {
	if (!error) return null;
	if (error.code === '42501' || /row-level security/i.test(error.message || '')) {
		return 'Bu işlem için yönetici yetkin yok.';
	}
	if (error.code === '42P01' || /does not exist|schema cache|Bucket not found/i.test(error.message || '')) {
		return `Veritabanı kurulumu eksik: supabase/${kurulum} dosyasını çalıştır.`;
	}
	if (error.code === '23514') return 'Girilen bir alan kuralları karşılamıyor (bağlantılar https:// ile başlamalı).';
	return 'İşlem yapılamadı: ' + (error.message || 'bilinmeyen hata');
}

export async function isAdmin() {
	const { data, error } = await supabase.rpc('is_yonetici');
	if (error) return { admin: false, hata: hataMetni(error) };
	return { admin: data === true, hata: null };
}

export async function listRows(tablo) {
	const sira = tablo === 'duyurular' ? 'tarih' : 'created_at';
	const { data, error } = await supabase.from(tablo).select('*').order(sira, { ascending: false }).limit(150);
	return { data: data || [], hata: hataMetni(error) };
}

export async function saveRow(tablo, satir, id = null) {
	const q = id
		? supabase.from(tablo).update(satir).eq('id', id)
		: supabase.from(tablo).insert({ ...satir, aktif: true });
	const { error } = await q;
	return { hata: hataMetni(error) };
}

export async function setAktif(tablo, id, aktif) {
	const { error } = await supabase.from(tablo).update({ aktif }).eq('id', id);
	return { hata: hataMetni(error) };
}

export async function removeRow(tablo, id) {
	const { error } = await supabase.from(tablo).delete().eq('id', id);
	return { hata: hataMetni(error) };
}
