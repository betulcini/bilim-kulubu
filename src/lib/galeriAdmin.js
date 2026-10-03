import { supabase } from '$lib/supabaseClient.js';
import { hataMetni as hataMetniGenel } from '$lib/yonetim.js';
import { GALERI_KOVA, gorselAdresi } from '$lib/galeriDb.js';

// Yönetici paneli: galeri fotoğrafı ekle / düzenle / gizle / sil.
// Kurulum: supabase/2026-10-04-quiz-galeri-yonetimi.sql
const hataMetni = (e) => hataMetniGenel(e, '2026-10-04-quiz-galeri-yonetimi.sql');

export { gorselAdresi };
export const MAKS_KENAR = 1600; // px: büyük fotoğraflar yüklenmeden önce küçültülür
export const MAKS_DOSYA_MB = 20; // seçilebilecek en büyük özgün dosya
export const KABUL = 'image/jpeg,image/png,image/webp';

// Fotoğrafı tarayıcıda küçültüp JPEG'e çevirir (hızlı açılır, depolama dolmaz).
export async function gorselHazirla(dosya) {
	if (!/^image\/(jpeg|png|webp)$/.test(dosya.type)) {
		throw new Error(`"${dosya.name}" desteklenmiyor (JPG, PNG veya WebP olmalı).`);
	}
	if (dosya.size > MAKS_DOSYA_MB * 1024 * 1024) {
		throw new Error(`"${dosya.name}" çok büyük (en fazla ${MAKS_DOSYA_MB} MB).`);
	}
	let bmp;
	try {
		bmp = await createImageBitmap(dosya, { imageOrientation: 'from-image' });
	} catch {
		bmp = await new Promise((coz, red) => {
			const img = new Image();
			const url = URL.createObjectURL(dosya);
			img.onload = () => {
				URL.revokeObjectURL(url);
				coz(img);
			};
			img.onerror = () => {
				URL.revokeObjectURL(url);
				red(new Error(`"${dosya.name}" okunamadı.`));
			};
			img.src = url;
		});
	}
	const w0 = bmp.width;
	const h0 = bmp.height;
	const oran = Math.min(1, MAKS_KENAR / Math.max(w0, h0));
	const w = Math.max(1, Math.round(w0 * oran));
	const h = Math.max(1, Math.round(h0 * oran));
	const tuval = document.createElement('canvas');
	tuval.width = w;
	tuval.height = h;
	const bag = tuval.getContext('2d');
	bag.fillStyle = '#fff'; // saydam PNG'ler siyah kalmasın
	bag.fillRect(0, 0, w, h);
	bag.drawImage(bmp, 0, 0, w, h);
	if (bmp.close) bmp.close();
	const blob = await new Promise((coz) => tuval.toBlob(coz, 'image/jpeg', 0.85));
	if (!blob) throw new Error(`"${dosya.name}" dönüştürülemedi.`);
	return blob;
}

export function baslikOner(dosyaAdi) {
	const t = dosyaAdi.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
	return t ? t.charAt(0).toLocaleUpperCase('tr-TR') + t.slice(1) : '';
}

export function galeriDogrula(f) {
	const baslik = String(f.baslik ?? '').trim();
	const aciklama = String(f.aciklama ?? '').trim();
	const tarih = String(f.tarih ?? '').trim();
	if (baslik.length < 2) return { hata: 'Başlık en az 2 karakter olmalı.' };
	if (baslik.length > 120) return { hata: 'Başlık en fazla 120 karakter olabilir.' };
	if (aciklama.length > 400) return { hata: 'Açıklama en fazla 400 karakter olabilir.' };
	if (tarih && Number.isNaN(new Date(tarih + 'T12:00:00').getTime())) return { hata: 'Tarih geçerli değil.' };
	return { satir: { baslik, aciklama: aciklama || null, tarih: tarih || null } };
}

export async function listGaleri() {
	const { data, error } = await supabase.from('galeri').select('*').order('created_at', { ascending: false }).limit(300);
	return { data: data || [], hata: hataMetni(error) };
}

// Tek fotoğrafı yükler ve kaydını oluşturur. Kayıt başarısız olursa yüklenen dosya geri silinir.
export async function fotografEkle(dosya, bilgi) {
	let blob;
	try {
		blob = await gorselHazirla(dosya);
	} catch (e) {
		return { hata: e.message };
	}
	const yil = new Date().getFullYear();
	const yol = `${yil}/${crypto.randomUUID()}.jpg`;
	const yuk = await supabase.storage.from(GALERI_KOVA).upload(yol, blob, {
		contentType: 'image/jpeg',
		cacheControl: '31536000',
		upsert: false
	});
	if (yuk.error) return { hata: hataMetni(yuk.error) };
	const { error } = await supabase.from('galeri').insert({ ...bilgi, gorsel_yolu: yol, aktif: true });
	if (error) {
		await supabase.storage.from(GALERI_KOVA).remove([yol]);
		return { hata: hataMetni(error) };
	}
	return { hata: null };
}

export async function galeriGuncelle(id, alanlar) {
	const { error } = await supabase.from('galeri').update(alanlar).eq('id', id);
	return { hata: hataMetni(error) };
}

export async function galeriSil(kayit) {
	const { error } = await supabase.from('galeri').delete().eq('id', kayit.id);
	if (error) return { hata: hataMetni(error) };
	// Kayıt gitti; dosya silinemezse sadece depoda artık bir dosya kalır (site etkilenmez).
	await supabase.storage.from(GALERI_KOVA).remove([kayit.gorsel_yolu]);
	return { hata: null };
}
