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
	{ id: 'bilgisayar', quizBaslik: 'Genel Bilim Quiz', label: 'Yazılım, Yapay Zekâ & Mühendislik', emoji: 'code', sciKategori: 'Bilgisayar & Mühendislik', quiz: 'genel-bilim', takvim: [], etiketler: ['Yapay Zekâ'] },
	{ id: 'robotik', quizBaslik: 'Fizik Quiz', label: 'Robotik & Elektronik', emoji: 'bolt', sciKategori: 'Bilgisayar & Mühendislik', quiz: 'fizik', takvim: [], etiketler: ['Teknoloji'] },
	{ id: 'saglik', quizBaslik: 'Biyoloji Quiz', label: 'Tıp & Sağlık', emoji: 'microscope', sciKategori: 'Biyoloji & Tıp', quiz: 'biyoloji', takvim: [], etiketler: ['Sağlık', 'Biyoloji'] },
	{ id: 'beyin', quizBaslik: 'Biyoloji Quiz', label: 'Psikoloji & Beyin', emoji: 'bulb', sciKategori: 'Biyoloji & Tıp', quiz: 'biyoloji', takvim: [], etiketler: ['Biyoloji'] },
	{ id: 'cevre', quizBaslik: 'Biyoloji Quiz', label: 'Çevre & İklim', emoji: 'sprout', sciKategori: 'Biyoloji & Tıp', quiz: 'biyoloji', takvim: [], etiketler: ['Çevre'] },
	{ id: 'yer-bilimleri', quizBaslik: 'Genel Bilim Quiz', label: 'Yer Bilimleri & Doğa', emoji: 'globe', sciKategori: 'Diğer', quiz: 'genel-bilim', takvim: [], etiketler: ['Çevre'] },
	{ id: 'enerji-malzeme', quizBaslik: 'Fizik Quiz', label: 'Enerji & Malzeme Bilimi', emoji: 'magnet', sciKategori: 'Fizik', quiz: 'fizik', takvim: [], etiketler: ['Enerji'] },
	{ id: 'uzay-teknolojisi', quizBaslik: 'Astronomi Quiz', label: 'Havacılık & Uzay Teknolojisi', emoji: 'compass', sciKategori: 'Astronomi', quiz: 'astronomi', takvim: ['Uzay Olayları'], etiketler: ['Uzay', 'Teknoloji'] },
	{ id: 'tasarim', quizBaslik: 'Genel Bilim Quiz', label: 'Tasarım & 3B Modelleme', emoji: 'add-square', sciKategori: 'Bilgisayar & Mühendislik', quiz: 'genel-bilim', takvim: [], etiketler: ['Teknoloji'] },
	{ id: 'bilim-tarihi', quizBaslik: 'Genel Bilim Quiz', label: 'Bilim Tarihi & Felsefesi', emoji: 'book', sciKategori: 'Diğer', quiz: 'genel-bilim', takvim: [], etiketler: [] }
];

// Bir kişi en fazla bu kadar alan seçebilir (veritabanı kuralıyla aynı).
export const MAX_INTERESTS = 12;

export const interestById = Object.fromEntries(interests.map((i) => [i.id, i]));

// Geçersiz / bilinmeyen id'leri ayıkla
export function cleanInterests(list) {
	if (!Array.isArray(list)) return [];
	return [...new Set(list.filter((id) => typeof id === 'string' && interestById[id]))].slice(0, MAX_INTERESTS);
}
