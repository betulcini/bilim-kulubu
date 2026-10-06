import { supabase } from '$lib/supabaseClient.js';
import { youtubeMedia } from '$lib/video.js';

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

export const YONETICI_BOLUMLERI = [
	{ id: 'duyurular', label: 'Duyurular' },
	{ id: 'firsatlar', label: 'Fırsatlar' },
	{ id: 'geziler', label: 'Geziler' },
	{ id: 'videolar', label: 'Videolar' },
	{ id: 'kartlar', label: 'Seri / tiyatro kartları' },
	{ id: 'quizler', label: 'Quizler' },
	{ id: 'galeri', label: 'Galeri' },
	{ id: 'oneriler', label: 'Öneriler' },
	{ id: 'istatistik', label: 'İstatistikler' },
	{ id: 'uyeler', label: 'Üye listesi' },
	{ id: 'yedek', label: 'İçerik yedeği' },
	{ id: 'kalite', label: 'İçerik kalite kontrolü' },
	{ id: 'gecmis', label: 'Yönetici işlem geçmişi' }
];

export const VIDEO_BOLUMLERI = [
	{ id: 'seri', label: 'Bilim Serileri' },
	{ id: 'tiyatro', label: 'Bilim Tiyatrosu' }
];
export const GEZI_DURUMLARI = [
	{ id: 'planlaniyor', label: 'Planlanıyor' },
	{ id: 'gerceklesti', label: 'Gerçekleşti' },
	{ id: 'iptal', label: 'İptal edildi' }
];

// Her tablo için form alanları (form ve doğrulama aynı listeden okunur)
export const ALANLAR = {
	duyurular: [
		{ k: 'baslik', l: 'Başlık', t: 'text', min: 5, max: 160, zorunlu: true },
		{ k: 'etiket', l: 'Etiket', t: 'text', min: 2, max: 30, zorunlu: true, liste: ETIKETLER },
		{ k: 'tarih', l: 'Haber tarihi', t: 'date', zorunlu: true },
		{ k: 'yayina_basla', l: 'Yayın başlangıcı (boşsa hemen)', t: 'datetime-local' },
		{ k: 'yayindan_kaldir', l: 'Yayından kaldırma zamanı (isteğe bağlı)', t: 'datetime-local' },
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
		{ k: 'yayina_basla', l: 'Yayın başlangıcı (boşsa hemen)', t: 'datetime-local' },
		{ k: 'yayindan_kaldir', l: 'Yayından kaldırma zamanı (isteğe bağlı)', t: 'datetime-local' },
		{ k: 'ozet', l: 'Özet', t: 'textarea', min: 20, max: 700, zorunlu: true },
		{ k: 'link', l: 'Başvuru / detay bağlantısı (https://…)', t: 'url', max: 500 },
		{ k: 'link_ad', l: 'Buton yazısı (örn. Başvuru sayfası)', t: 'text', max: 60 },
		{ k: 'kaynak', l: 'Bilginin alındığı sayfa (https://…)', t: 'url', max: 500 },
		{ k: 'kaynak_ad', l: 'Kaynak adı', t: 'text', max: 80 }
	],
	geziler: [
		{ k: 'yer', l: 'Gezi yeri / adı', t: 'text', min: 3, max: 140, zorunlu: true },
		{ k: 'durum', l: 'Durum', t: 'select', zorunlu: true, secenekler: GEZI_DURUMLARI },
		{ k: 'gun', l: 'Gezi günü (sıralama için; belli değilse boş bırak)', t: 'date' },
		{ k: 'tarih_metni', l: 'Kartta görünen tarih metni (örn. 15 Kasım 2026, 09.00 – 17.00). Boşsa gezi günü yazılır', t: 'text', max: 120 },
		{ k: 'ozet', l: 'Açıklama (program, buluşma yeri, neleri getirmeli…)', t: 'textarea', min: 10, max: 700, zorunlu: true },
		{ k: 'link', l: 'Kayıt / bilgi bağlantısı (https://…)', t: 'url', max: 500 },
		{ k: 'link_ad', l: 'Buton yazısı (örn. Kayıt formu)', t: 'text', max: 60 }
	],
	videolar: [
		{ k: 'bolum', l: 'Hangi bölümde görünsün?', t: 'select', zorunlu: true, secenekler: VIDEO_BOLUMLERI },
		{ k: 'sira', l: 'Sıra (büyük numara üstte)', t: 'number', min: 0, max: 100000, zorunlu: true },
		{ k: 'youtube', l: 'YouTube video veya oynatma listesi bağlantısı', t: 'youtube', max: 300, zorunlu: true },
		{ k: 'baslik', l: 'Video başlığı', t: 'text', min: 3, max: 140, zorunlu: true },
		{ k: 'grup', l: 'Seri / gösteri adı (isteğe bağlı, örn. Günlük Hayatta Fizik)', t: 'text', max: 80 },
		{ k: 'aciklama', l: 'Kısa açıklama (isteğe bağlı)', t: 'textarea', max: 500 }
	],
	kartlar: [
		{ k: 'bolum', l: 'Bölüm', t: 'select', zorunlu: true, secenekler: VIDEO_BOLUMLERI },
		{ k: 'sira', l: 'Sıra (küçük numara önce)', t: 'number', min: 0, max: 100000, zorunlu: true },
		{ k: 'baslik', l: 'Kart başlığı', t: 'text', min: 3, max: 140, zorunlu: true },
		{ k: 'aciklama', l: 'Açıklama', t: 'textarea', min: 10, max: 700, zorunlu: true },
		{ k: 'rozet', l: 'Rozet yazısı (isteğe bağlı)', t: 'text', max: 60 },
		{ k: 'alt_bilgi', l: 'Kart alt bilgisi (isteğe bağlı)', t: 'text', max: 120 },
		{ k: 'durum', l: 'Durum (isteğe bağlı)', t: 'text', max: 100 }
	]
};

export function bosForm(tablo) {
	const f = {};
	for (const a of ALANLAR[tablo]) f[a.k] = '';
	if (tablo === 'duyurular') f.tarih = new Date().toISOString().slice(0, 10);
	if (tablo === 'firsatlar') f.durum = 'yaklasan';
	if (tablo === 'geziler') f.durum = 'planlaniyor';
	if (tablo === 'videolar') f.bolum = 'seri';
	if (tablo === 'videolar' || tablo === 'kartlar') f.sira = 0;
	if (tablo === 'kartlar') f.bolum = 'seri';
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
		if (a.t === 'youtube') {
			const media = youtubeMedia(v);
			if (!media) return { hata: `"${a.l}" geçerli bir YouTube video veya oynatma listesi bağlantısı olmalı.` };
			satir.youtube_id = media.videoId;
			satir.playlist_id = media.playlistId;
			continue;
		}
		if (a.min && v.length < a.min) return { hata: `"${a.l}" en az ${a.min} karakter olmalı.` };
		if (a.max && v.length > a.max) return { hata: `"${a.l}" en fazla ${a.max} karakter olabilir.` };
		if (a.t === 'number') {
			const number = Number(v);
			if (!Number.isInteger(number) || number < a.min || number > a.max) {
				return { hata: `"${a.l}" ${a.min} ile ${a.max} arasında tam sayı olmalı.` };
			}
			satir[a.k] = number;
			continue;
		}
		if (a.t === 'url' && !httpsMi(v)) return { hata: `"${a.l}" http:// veya https:// ile başlayan geçerli bir adres olmalı.` };
		if (a.t === 'select' && !a.secenekler.some((s) => s.id === v)) return { hata: `"${a.l}" için geçersiz seçim.` };
		if (a.t === 'date' && Number.isNaN(new Date(v + 'T12:00:00').getTime())) return { hata: `"${a.l}" geçerli bir tarih olmalı.` };
		if (a.t === 'datetime-local') {
			const date = new Date(v);
			if (Number.isNaN(date.getTime())) return { hata: `"${a.l}" geçerli bir tarih ve saat olmalı.` };
			satir[a.k] = date.toISOString();
			continue;
		}
		satir[a.k] = v;
	}
	if ((tablo === 'duyurular' || tablo === 'firsatlar') && satir.yayina_basla && satir.yayindan_kaldir
		&& new Date(satir.yayindan_kaldir) <= new Date(satir.yayina_basla)) {
		return { hata: 'Yayından kaldırma zamanı, yayın başlangıcından sonra olmalı.' };
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
	if (error.code === '23514') return 'Girilen alanlar veritabanı kurallarını karşılamıyor.';
	return 'İşlem yapılamadı: ' + (error.message || 'bilinmeyen hata');
}

export async function isAdmin() {
	const { data, error } = await supabase.rpc('yonetici_yetkim');
	if (error) return { admin: false, tamYetkili: false, bolumler: [], hata: hataMetni(error, '2026-10-06-uyelik-ve-yonetici-rolleri.sql') };
	const bolumler = Array.isArray(data?.bolumler) ? data.bolumler : [];
	return {
		admin: data?.rol === 'tam' || data?.rol === 'sinirli',
		tamYetkili: data?.rol === 'tam',
		bolumler,
		hata: null
	};
}

const KURULUM = {
	geziler: '2026-10-06-video-ve-gezi-yonetimi.sql',
	videolar: '2026-10-07-video-katalogu-siralama-yonetici.sql',
	kartlar: '2026-10-07-video-katalogu-siralama-yonetici.sql',
	duyurular: '2026-10-11-planli-yayin-ve-yonetici-gecmisi.sql',
	firsatlar: '2026-10-11-planli-yayin-ve-yonetici-gecmisi.sql',
	quizler: '2026-10-04-quiz-galeri-yonetimi.sql'
};
const hataTablo = (tablo, error) => hataMetni(error, KURULUM[tablo]);

export const LISTE_SAYFA_BOYUTU = 50;

const TABLO_ADI = { kartlar: 'video_kartlari', quizler: 'quiz_sorulari' };

export async function listRows(tablo, sayfa = 0) {
	const tabloAdi = TABLO_ADI[tablo] || tablo;
	const sira = tablo === 'duyurular' ? 'tarih' : 'created_at';
	let query = supabase.from(tabloAdi).select('*');
	if (tablo === 'videolar' || tablo === 'kartlar') {
		query = query.order('sira', { ascending: tablo === 'kartlar' }).order('created_at', { ascending: false });
	} else {
		query = query.order(sira, { ascending: false });
	}
	const { data, error } = await query.range(sayfa * LISTE_SAYFA_BOYUTU, (sayfa + 1) * LISTE_SAYFA_BOYUTU - 1);
	return { data: data || [], hata: hataTablo(tablo, error) };
}

export async function listManagers() {
	const { data, error } = await supabase.rpc('yonetici_listesi');
	return { data: data || [], hata: hataMetni(error, '2026-10-07-video-katalogu-siralama-yonetici.sql') };
}

export async function addManagerWithAccess(email, role, sections) {
	const { error } = await supabase.rpc('yonetici_ekle', {
		p_email: email,
		p_rol: role,
		p_bolumler: role === 'tam' ? [] : sections
	});
	return { hata: hataMetni(error, '2026-10-06-uyelik-ve-yonetici-rolleri.sql') };
}

export async function updateManagerAccess(userId, role, sections) {
	const { error } = await supabase.rpc('yonetici_yetki_guncelle', {
		p_user_id: userId,
		p_rol: role,
		p_bolumler: role === 'tam' ? [] : sections
	});
	return { hata: hataMetni(error, '2026-10-06-uyelik-ve-yonetici-rolleri.sql') };
}

export async function removeManager(userId) {
	const { error } = await supabase.rpc('yonetici_kaldir', { p_user_id: userId });
	return { hata: hataMetni(error, '2026-10-06-uyelik-ve-yonetici-rolleri.sql') };
}

export const ONERI_DURUMLARI = [
	{ id: 'yeni', label: 'Yeni' },
	{ id: 'inceleniyor', label: 'İnceleniyor' },
	{ id: 'planlandi', label: 'Planlandı' },
	{ id: 'tamamlandi', label: 'Tamamlandı' },
	{ id: 'reddedildi', label: 'Uygun bulunmadı' }
];

export async function listSuggestions(sayfa = 0) {
	const { data, error } = await supabase
		.from('oneriler')
		.select('id, isim, kategori, mesaj, user_id, created_at, status, response, public_response')
		.order('created_at', { ascending: false })
		.range(sayfa * LISTE_SAYFA_BOYUTU, (sayfa + 1) * LISTE_SAYFA_BOYUTU - 1);
	return {
		data: data || [],
		hata: hataMetni(error, '2026-10-10-yonetim-istatistik-oneri-takip.sql')
	};
}

export async function updateSuggestion(id, alanlar) {
	const { error } = await supabase
		.from('oneriler')
		.update(alanlar)
		.eq('id', id);
	return { hata: hataMetni(error, '2026-10-10-yonetim-istatistik-oneri-takip.sql') };
}

export async function loadAdminStats() {
	const { data, error } = await supabase.rpc('yonetici_istatistikleri');
	return {
		data: data || null,
		hata: hataMetni(error, '2026-10-10-yonetim-istatistik-oneri-takip.sql')
	};
}

export async function listMembers(offset = 0, limit = 50) {
	const { data, error } = await supabase.rpc('yonetici_uye_listesi', {
		p_offset: offset,
		p_limit: limit
	});
	return {
		data: data || [],
		hata: hataMetni(error, '2026-10-06-uyelik-ve-yonetici-rolleri.sql')
	};
}

export async function listAdminAudit(beforeId = null, limit = 50) {
	const { data, error } = await supabase.rpc('yonetici_islem_gecmisi_listele', {
		p_before_id: beforeId,
		p_limit: limit
	});
	return {
		data: data || [],
		hata: hataMetni(error, '2026-10-11-planli-yayin-ve-yonetici-gecmisi.sql')
	};
}

export async function saveRow(tablo, satir, id = null, yayinda = true) {
	const tabloAdi = TABLO_ADI[tablo] || tablo;
	const icerik = tablo === 'videolar' || tablo === 'kartlar' ? { ...satir, aktif: yayinda } : satir;
	const q = id
		? supabase.from(tabloAdi).update(icerik).eq('id', id)
		: supabase.from(tabloAdi).insert({ ...icerik, aktif: true });
	const { error } = await q;
	return { hata: hataTablo(tablo, error) };
}

export async function setAktif(tablo, id, aktif) {
	const { error } = await supabase.from(TABLO_ADI[tablo] || tablo).update({ aktif }).eq('id', id);
	return { hata: hataTablo(tablo, error) };
}

export async function removeRow(tablo, id) {
	const { error } = await supabase.from(TABLO_ADI[tablo] || tablo).delete().eq('id', id);
	return { hata: hataTablo(tablo, error) };
}
