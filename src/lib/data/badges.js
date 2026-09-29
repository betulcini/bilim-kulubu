import { interests } from './interests.js';

export const OYUN_IDLERI = ['hafiza', 'biyoloji-enerji', 'adam-asmaca', 'bilim-tabu'];
export const QUIZ_KONULARI = ['fizik', 'kimya', 'biyoloji', 'matematik', 'astronomi', 'genel-bilim'];
export const TAM_PUAN = 200; // 8 soru x 25 puan

// Her rozet: { id, ad, aciklama, emoji, hedef, deger(ctx) }
// deger(ctx) mevcut ilerlemeyi döndürür; deger >= hedef ise rozet kazanılmıştır.
export const badgeDefs = [
	{ id: 'hosgeldin', ad: 'Kulübe Hoş Geldin', aciklama: 'Hesabını oluştur ve giriş yap.', emoji: '👋', hedef: 1, deger: (c) => (c.user ? 1 : 0) },
	{
		id: 'profil-tamam',
		ad: 'Tam Profil',
		aciklama: 'Ad, sınıf ve en az bir ilgi alanı ekle.',
		emoji: '🪪',
		hedef: 3,
		deger: (c) => (c.user?.full_name ? 1 : 0) + (c.user?.class_name ? 1 : 0) + (c.user?.interests?.length ? 1 : 0)
	},
	{ id: 'ilk-quiz', ad: 'İlk Adım', aciklama: 'İlk quizini tamamla.', emoji: '🎯', hedef: 1, deger: (c) => c.scores.length },
	{ id: 'quiz-5', ad: 'Quiz Meraklısı', aciklama: '5 quiz tamamla.', emoji: '📝', hedef: 5, deger: (c) => c.scores.length },
	{ id: 'quiz-15', ad: 'Quiz Ustası', aciklama: '15 quiz tamamla.', emoji: '🏅', hedef: 15, deger: (c) => c.scores.length },
	{ id: 'tam-puan', ad: 'Tam Puan', aciklama: 'Bir quizde 200 puanın hepsini topla.', emoji: '💯', hedef: 1, deger: (c) => (c.scores.some((s) => s.score >= TAM_PUAN) ? 1 : 0) },
	{
		id: 'cok-yonlu',
		ad: 'Çok Yönlü',
		aciklama: '3 farklı konuda quiz çöz.',
		emoji: '🧭',
		hedef: 3,
		deger: (c) => new Set(c.scores.map((s) => s.subject)).size
	},
	{
		id: 'bilim-gezgini',
		ad: 'Bilim Gezgini',
		aciklama: 'Bütün quiz konularını dene.',
		emoji: '🌍',
		hedef: QUIZ_KONULARI.length,
		deger: (c) => new Set(c.scores.map((s) => s.subject).filter((k) => QUIZ_KONULARI.includes(k))).size
	},
	{ id: 'oyun-zamani', ad: 'Oyun Zamanı', aciklama: 'Bir bilim oyunu aç.', emoji: '🎮', hedef: 1, deger: (c) => c.activity.games.length },
	{
		id: 'oyun-tutkunu',
		ad: 'Oyun Tutkunu',
		aciklama: 'Bütün oyunları dene.',
		emoji: '🕹️',
		hedef: OYUN_IDLERI.length,
		deger: (c) => c.activity.games.filter((g) => OYUN_IDLERI.includes(g)).length
	},
	{ id: 'tarih-meraklisi', ad: 'Tarih Meraklısı', aciklama: '10 farklı bilim insanının detayına bak.', emoji: '📜', hedef: 10, deger: (c) => c.activity.scientists.length },
	{
		id: 'ilgi-alani',
		ad: 'Yolunu Buldu',
		aciklama: 'En az 3 ilgi alanı seç.',
		emoji: '🧲',
		hedef: 3,
		deger: (c) => Math.min(c.user?.interests?.length || 0, interests.length)
	}
];

// ctx: { user, scores: [{subject, score}], activity: {games, scientists} }
export function computeBadges(ctx) {
	return badgeDefs.map((b) => {
		const deger = Math.min(b.deger(ctx), b.hedef);
		return { id: b.id, ad: b.ad, aciklama: b.aciklama, emoji: b.emoji, hedef: b.hedef, deger, kazanildi: deger >= b.hedef };
	});
}
