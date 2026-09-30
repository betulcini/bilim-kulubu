// Kayıt ve profil sayfasında seçilen ilgi alanları.
// "Sana Özel" bölümü bu tanımlara göre içerik önerir.
//   sciKategori : lib/data/bilim-insanlari.js içindeki "kategori" değeri
//   quiz        : /yarismalar/quiz?konu=... değeri
//   takvim      : bilim-takvimi.js içindeki kategoriler (tutulma, uzay olayı vb.)
//   etiketler   : announcements.js içindeki "etiket" değerleri
export const interests = [
	{ id: 'fizik', quizBaslik: 'Fizik Quiz', label: 'Fizik', emoji: 'atom', sciKategori: 'Fizik', quiz: 'fizik', takvim: [], etiketler: ['Enerji'] },
	{ id: 'kimya', quizBaslik: 'Kimya Quiz', label: 'Kimya', emoji: 'flask', sciKategori: 'Kimya', quiz: 'kimya', takvim: [], etiketler: ['Çevre'] },
	{ id: 'biyoloji', quizBaslik: 'Biyoloji Quiz', label: 'Biyoloji & Tıp', emoji: 'dna', sciKategori: 'Biyoloji & Tıp', quiz: 'biyoloji', takvim: [], etiketler: ['Biyoteknoloji'] },
	{ id: 'astronomi', quizBaslik: 'Astronomi Quiz', label: 'Astronomi & Uzay', emoji: 'telescope', sciKategori: 'Astronomi', quiz: 'astronomi', takvim: ['Uzay Olayları', 'Tutulma'], etiketler: ['Uzay'] },
	{ id: 'matematik', quizBaslik: 'Matematik Quiz', label: 'Matematik', emoji: 'ruler', sciKategori: 'Matematik', quiz: 'matematik', takvim: [], etiketler: [] },
	{ id: 'bilgisayar', quizBaslik: 'Genel Bilim Quiz', label: 'Yazılım, Yapay Zekâ & Mühendislik', emoji: 'code', sciKategori: 'Bilgisayar & Mühendislik', quiz: 'genel-bilim', takvim: [], etiketler: ['Yapay Zekâ'] }
];

export const interestById = Object.fromEntries(interests.map((i) => [i.id, i]));

// Geçersiz / bilinmeyen id'leri ayıkla
export function cleanInterests(list) {
	if (!Array.isArray(list)) return [];
	return [...new Set(list.filter((id) => typeof id === 'string' && interestById[id]))];
}
