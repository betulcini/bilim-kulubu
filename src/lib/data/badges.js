import { interests } from './interests.js';

export const OYUN_IDLERI = ['hafiza', 'biyoloji-enerji', 'adam-asmaca', 'bilim-tabu'];
export const QUIZ_KONULARI = ['fizik', 'kimya', 'biyoloji', 'matematik', 'astronomi', 'genel-bilim'];
export const TAM_PUAN = 200; // 8 soru x 25 puan

// Her rozet: { id, ad, aciklama, emoji (Icon adı), hedef, deger(ctx) }
// deger(ctx) mevcut ilerlemeyi döndürür; deger >= hedef ise rozet kazanılmıştır.
export const badgeDefs = [
	{ id: 'hosgeldin', ad: 'Kulübe Hoş Geldin', aciklama: 'Hesabını oluştur ve giriş yap.', emoji: 'user', hedef: 1, deger: (c) => (c.user ? 1 : 0) },
	{
		id: 'profil-tamam',
		ad: 'Tam Profil',
		aciklama: 'Ad, sınıf ve en az bir ilgi alanı ekle.',
		emoji: 'idcard',
		hedef: 3,
		deger: (c) => (c.user?.full_name ? 1 : 0) + (c.user?.class_name ? 1 : 0) + (c.user?.interests?.length ? 1 : 0)
	},
	{ id: 'ilk-quiz', ad: 'İlk Adım', aciklama: 'İlk quizini tamamla.', emoji: 'target', hedef: 1, deger: (c) => c.scores.length },
	{ id: 'quiz-ustasi', ad: 'Quiz Ustası', aciklama: 'Quiz tamamladıkça seviye atla.', emoji: 'medal', hedef: 40, seviyeler: [5, 15, 40], deger: (c) => c.scores.length },
	{ id: 'tam-puan', ad: 'Tam Puan', aciklama: 'Bir quizde 200 puanın hepsini topla.', emoji: 'check-circle', hedef: 1, deger: (c) => (c.scores.some((s) => s.score >= TAM_PUAN) ? 1 : 0) },
	{
		id: 'cok-yonlu',
		ad: 'Çok Yönlü',
		aciklama: '3 farklı konuda quiz çöz.',
		emoji: 'compass',
		hedef: 3,
		deger: (c) => new Set(c.scores.map((s) => s.subject)).size
	},
	{
		id: 'bilim-gezgini',
		ad: 'Bilim Gezgini',
		aciklama: 'Bütün quiz konularını dene.',
		emoji: 'globe',
		hedef: QUIZ_KONULARI.length,
		deger: (c) => new Set(c.scores.map((s) => s.subject).filter((k) => QUIZ_KONULARI.includes(k))).size
	},
	{ id: 'oyun-zamani', ad: 'Oyun Zamanı', aciklama: 'Bir bilim oyunu aç.', emoji: 'games', hedef: 1, deger: (c) => c.activity.games.length },
	{
		id: 'oyun-tutkunu',
		ad: 'Oyun Tutkunu',
		aciklama: 'Bütün oyunları dene.',
		emoji: 'games',
		hedef: OYUN_IDLERI.length,
		deger: (c) => c.activity.games.filter((g) => OYUN_IDLERI.includes(g)).length
	},
	{ id: 'tarih-meraklisi', ad: 'Tarih Meraklısı', aciklama: 'Farklı bilim insanlarının detayına bak.', emoji: 'book', hedef: 80, seviyeler: [10, 30, 80], deger: (c) => c.activity.scientists.length },
	{
		id: 'ilgi-alani',
		ad: 'Yolunu Buldu',
		aciklama: 'En az 3 ilgi alanı seç.',
		emoji: 'magnet',
		hedef: 3,
		deger: (c) => Math.min(c.user?.interests?.length || 0, interests.length)
	}
	,{ id: 'seri-ustasi', ad: 'Seri Ustası', aciklama: 'Günlük mini quizi art arda günlerde çöz.', emoji: 'bolt', hedef: 30, seviyeler: [3, 7, 30], deger: (c) => c.streak?.best || 0 },
	{ id: 'gunluk-duzen', ad: 'Günlük Düzen', aciklama: 'Günlük mini quizi toplam kaç gün tamamladın.', emoji: 'calendar', hedef: 40, seviyeler: [5, 15, 40], deger: (c) => c.streak?.total || 0 }
];
// ctx: { user, scores: [{subject, score}], activity: {games, scientists}, streak: {best, total} }
export const SEVIYE_ADLARI = ['', 'Bronz', 'Gümüş', 'Altın'];

// Seviyeli rozet (seviyeler: [bronz, gümüş, altın] eşikleri): kazanıldı = bronz eşiği aşıldı.
// hedef = bir sonraki seviyenin eşiği (altındaysa altın eşiği).
export function computeBadges(ctx) {
	return badgeDefs.map((b) => {
		if (b.seviyeler) {
			const ham = b.deger(ctx);
			const seviye = b.seviyeler.filter((e) => ham >= e).length; // 0..3
			const hedef = seviye >= b.seviyeler.length ? b.seviyeler[b.seviyeler.length - 1] : b.seviyeler[seviye];
			return {
				id: b.id, ad: b.ad, aciklama: b.aciklama, emoji: b.emoji,
				hedef: hedef, deger: Math.min(ham, hedef), kazanildi: seviye >= 1,
				seviye, seviyeAd: SEVIYE_ADLARI[seviye], maksimum: seviye >= b.seviyeler.length, seviyeli: true
			};
		}
		const deger = Math.min(b.deger(ctx), b.hedef);
		return { id: b.id, ad: b.ad, aciklama: b.aciklama, emoji: b.emoji, hedef: b.hedef, deger, kazanildi: deger >= b.hedef, seviye: 0, seviyeAd: '', maksimum: false, seviyeli: false };
	});
}
