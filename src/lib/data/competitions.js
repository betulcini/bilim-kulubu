export const competitionFilters = ['Tümü', 'Quizler', 'Online yarışmalar', 'Yüz yüze yarışmalar'];

export const competitions = [
	{ ad: 'Fizik Quiz', tur: 'Quizler', platform: 'Kulüp platformu', tarih: 'Her zaman açık', durum: 'Katıl', aciklama: 'Kuvvet, enerji, elektrik ve optikten 30 soruluk geniş bir havuz — her turda 8 farklı soru.', href: '/yarismalar/quiz?konu=fizik' },
	{ ad: 'Biyoloji Quiz', tur: 'Quizler', platform: 'Kulüp platformu', tarih: 'Her zaman açık', durum: 'Katıl', aciklama: 'Hücrelerden ekosistemlere, canlılar dünyasından 30 soruluk geniş bir havuz.', href: '/yarismalar/quiz?konu=biyoloji' },
	{ ad: 'Kimya Quiz', tur: 'Quizler', platform: 'Kulüp platformu', tarih: 'Her zaman açık', durum: 'Katıl', aciklama: 'Elementler, tepkimeler ve periyodik tablodan 30 soruluk geniş bir havuz.', href: '/yarismalar/quiz?konu=kimya' },
	{ ad: 'Matematik Quiz', tur: 'Quizler', platform: 'Kulüp platformu', tarih: 'Her zaman açık', durum: 'Katıl', aciklama: 'Cebir, geometri ve temel formüllerden 25 soruluk geniş bir havuz.', href: '/yarismalar/quiz?konu=matematik' },
	{ ad: 'Astronomi Quiz', tur: 'Quizler', platform: 'Kulüp platformu', tarih: 'Her zaman açık', durum: 'Katıl', aciklama: 'Gezegenler, yıldızlar ve evren üzerine 15 soruluk bir görev.', href: '/yarismalar/quiz?konu=astronomi' },
	{ ad: 'Genel Bilim Quiz', tur: 'Quizler', platform: 'Kulüp platformu', tarih: 'Her zaman açık', durum: 'Katıl', aciklama: 'Farklı bilim dallarından karışık, genel kültür ağırlıklı 15 soru.', href: '/yarismalar/quiz?konu=genel-bilim' },
	{ ad: 'Kahoot Bilim Turnuvası', tur: 'Online yarışmalar', platform: 'Kahoot', tarih: 'Tarih belirlenecek', durum: 'Planlanıyor', aciklama: 'Üyelerin telefonlarıyla canlı katılacağı çoktan seçmeli bilim turnuvası planlanıyor.' },
	{ ad: 'Hızlı Kimya Bilgi Yarışması', tur: 'Online yarışmalar', platform: 'Quizizz', tarih: 'Tarih belirlenecek', durum: 'Planlanıyor', aciklama: 'Kimya konularını eğlenceli bir formatta pekiştirmek için planlanan çevrimiçi yarışma.' },
	{ ad: 'Bilim Tabu', tur: 'Yüz yüze yarışmalar', platform: 'Takım oyunu', tarih: 'Tarih belirlenecek', durum: 'Planlanıyor', aciklama: 'Bilim terimlerinin anlatılıp tahmin edildiği, takımlar halinde oynanacak kulüp içi yarışma. Oyunun çevrimiçi sürümünü Oyunlar bölümünde şimdiden deneyebilirsin.' },
	{ ad: 'Yıl Sonu Büyük Final', tur: 'Yüz yüze yarışmalar', platform: 'Kahoot + sahne sunumu', tarih: 'Tarih belirlenecek', durum: 'Planlanıyor', aciklama: 'Yıl boyunca puan toplayan üyelerin yarışacağı final etkinliği planlanıyor.' }
];

// Skor tablosu artık sadece gerçek verilerden (Supabase `leaderboard_view` ve bu cihazdaki sonuçlar) oluşur.
