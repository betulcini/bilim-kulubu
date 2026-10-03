import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { supabase } from '$lib/supabaseClient.js';
import { streak, streakOwner, dayKey } from './streak.js';

// Giriş yapmış kullanıcının toplam puanı, serisi ve son 60 günlük hareketi (Supabase: gunluk_aktivite).
// Kurulum: supabase/2026-10-05-puan-ve-ilerleme.sql
// veri: null | { xp, kirilim: {quiz, gunluk_quiz, seri_bonusu, ziyaret}, quiz_adet, ziyaret_gun,
//                seri: {current, best, total, last_day}, aktivite: [{gun, ziyaret, quiz_dogru}], bugun }
const bos = { yukleniyor: false, hazir: false, hata: '', veri: null };
export const ilerleme = writable({ ...bos });

const KURULUM = 'supabase/2026-10-05-puan-ve-ilerleme.sql';

function hataMetni(error) {
	if (!error) return '';
	const m = error.message || '';
	if (error.code === 'PGRST202' || error.code === '42883' || error.code === '42P01' || /could not find the function|does not exist|schema cache/i.test(m)) {
		return `Puan ve ilerleme kurulumu eksik: ${KURULUM} dosyasını Supabase SQL Editor'de bir kez çalıştır.`;
	}
	return 'İlerleme bilgisi şu an alınamadı.';
}

let mevcutUid = null;
let baslatiliyor = null;

function uygula(veri, uid) {
	ilerleme.set({ yukleniyor: false, hazir: true, hata: '', veri });
	// Bu cihazdaki veri başka bir hesaba aitse karıştırma
	const sahip = streakOwner();
	streak.hydrate(veri, uid, !sahip || sahip === uid);
}

async function ozetCek() {
	const { data, error } = await supabase.rpc('ilerleme_ozeti');
	return { veri: error ? null : data, error };
}

// Sayfa açıldığında (giriş yapılmışsa) bir kez: günlük giriş puanı + eski seriyi aktar + özeti yükle
export function ilerlemeBaslat(uid) {
	if (!browser || !uid) return Promise.resolve();
	if (mevcutUid === uid && baslatiliyor) return baslatiliyor;
	mevcutUid = uid;
	ilerleme.update((s) => ({ ...s, yukleniyor: true }));

	baslatiliyor = (async () => {
		try {
			// 1) Günlük giriş (bu cihazda günde bir kez istek yeter)
			const ziyaretAnahtar = `${uid}:${dayKey()}`;
			let kaydedildi = false;
			try {
				kaydedildi = localStorage.getItem('btk_ziyaret') === ziyaretAnahtar;
			} catch (e) {
				/* önemsiz */
			}
			if (!kaydedildi) {
				const z = await supabase.rpc('ziyaret_kaydet');
				if (!z.error) {
					try {
						localStorage.setItem('btk_ziyaret', ziyaretAnahtar);
					} catch (e) {
						/* önemsiz */
					}
				} else {
					ilerleme.set({ ...bos, hata: hataMetni(z.error) });
					return;
				}
			}

			// 2) Özet
			let { veri, error } = await ozetCek();
			if (error || !veri) {
				ilerleme.set({ ...bos, hata: hataMetni(error) });
				return;
			}

			// 3) Bu cihazdaki (giriş yapmadan çözülmüş) günlük quiz sonuçlarını hesaba aktar
			const sahip = streakOwner();
			if (!sahip || sahip === uid) {
				const eksik = streak.eksikGunler(veri.aktivite);
				if (Object.keys(eksik).length > 0) {
					const r = await supabase.rpc('seri_aktar', { p_sonuclar: eksik });
					if (!r.error && r.data) veri = r.data;
				}
			}
			uygula(veri, uid);
		} catch (e) {
			ilerleme.set({ ...bos, hata: 'İlerleme bilgisi şu an alınamadı.' });
		}
	})();
	return baslatiliyor;
}

// Özeti yeniden çek (quiz bittikten sonra vb.). Döndürür: yeni veri | null
export async function ilerlemeYenile(uid) {
	if (!browser || !uid) return null;
	const { veri, error } = await ozetCek();
	if (error || !veri) {
		ilerleme.update((s) => ({ ...s, hata: hataMetni(error) }));
		return null;
	}
	uygula(veri, uid);
	return veri;
}

// Günlük quiz bitti. Döndürür: { veri, kazanilan } ya da { hata }
export async function gunlukQuizKaydet(uid, gun, dogru) {
	if (!browser || !uid) return { hata: 'giris' };
	const once = get(ilerleme).veri?.xp ?? null;
	const { data, error } = await supabase.rpc('gunluk_quiz_kaydet', { p_gun: gun, p_dogru: dogru });
	if (error || !data) return { hata: hataMetni(error) };
	uygula(data, uid);
	return { veri: data, kazanilan: once === null ? null : Math.max(0, data.xp - once) };
}

export function ilerlemeSifirla() {
	mevcutUid = null;
	baslatiliyor = null;
	ilerleme.set({ ...bos });
}
