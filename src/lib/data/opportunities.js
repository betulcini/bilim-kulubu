// Fırsat duyuruları.
// Alanlar:
//   durum     : 'acik' | 'yaklasan' | 'etkinlik' | 'okul-ici'
//   sonTarih  : 'YYYY-MM-DD' (son başvuru günü; geçtiyse kart otomatik "Kapandı" olur)
//   link      : başvuru / detay için resmi sayfa
//   kaynak    : bilginin alındığı sayfa  (kaynakAd: görünen ad)
// Bilgiler 30 Eylül 2026'da kaynak sayfalardan derlendi; başvurmadan önce resmi sayfadan tekrar kontrol et.
export const opportunities = [
	{
		baslik: 'TÜBİTAK 2204-A Lise Öğrencileri Araştırma Projeleri Yarışması',
		kurum: 'TÜBİTAK',
		tur: 'Ulusal',
		durum: 'acik',
		son: 'Başvuru: 23 Eylül 2026 – 4 Ocak 2027, 17.30',
		sonTarih: '2027-01-04',
		ozet: 'Lise öğrencileri danışman öğretmenle hazırladıkları araştırma projeleriyle bölge ve Türkiye finaline yarışır. Bu yıl 58. kez düzenleniyor; başvurular TÜBİTAK Yönetim Bilgi Sistemi (TYBS) üzerinden yapılıyor.',
		link: 'https://tybsng.tubitak.gov.tr/',
		linkAd: 'TYBS başvuru sistemi',
		kaynak: 'https://tekirdagyenihaber.com/2026/09/23/2027-yili-2204-a-lise-ogrencileri-arastirma-projeleri-yarismasi-ve-2204-b-ortaokul-ogrencileri-arastirma-projeleri-yarismasi-basliyor/',
		kaynakAd: 'Çağrı duyurusu haberi'
	},
	{
		baslik: 'TÜBİTAK 2204-B Ortaokul Öğrencileri Araştırma Projeleri Yarışması',
		kurum: 'TÜBİTAK',
		tur: 'Ulusal',
		durum: 'yaklasan',
		son: 'Başvuru: 21 Ekim 2026 – 10 Şubat 2027, 17.30',
		sonTarih: '2027-02-10',
		ozet: 'Ortaokul öğrencilerinin araştırma projeleriyle katıldığı yarışma. Bu yıl 21. kez düzenleniyor; başvurular 21 Ekim 2026\u2019da başlıyor.',
		link: 'https://tubitak.gov.tr/en/competitions/2204-b-secondary-school-students-research-projects-competition',
		linkAd: 'TÜBİTAK yarışma sayfası',
		kaynak: 'https://tekirdagyenihaber.com/2026/09/23/2027-yili-2204-a-lise-ogrencileri-arastirma-projeleri-yarismasi-ve-2204-b-ortaokul-ogrencileri-arastirma-projeleri-yarismasi-basliyor/',
		kaynakAd: 'Çağrı duyurusu haberi'
	},
	{
		baslik: 'NASA Space Apps Challenge 2026',
		kurum: 'NASA',
		tur: 'Uluslararası',
		durum: 'acik',
		son: 'Hackathon: 14–15 Kasım 2026 · Kayıt 15 Kasım\u2019a kadar',
		sonTarih: '2026-11-15',
		ozet: 'NASA ve uzay ajanslarının açık verileriyle Dünya ve uzay problemlerine çözüm geliştirilen iki günlük hackathon. Herkese açık; takımlar en fazla 6 kişi olabilir. Önce hesap açıp kayıt olmak ve bir Local Event seçmek gerekiyor.',
		link: 'https://www.spaceappschallenge.org/2026/',
		linkAd: 'Kayıt sayfası',
		kaynak: 'https://www.spaceappschallenge.org/2026/',
		kaynakAd: 'NASA Space Apps resmi sitesi'
	},
	{
		baslik: 'TEKNOFEST Şanlıurfa 2026 — Yarışma Finalleri',
		kurum: 'TEKNOFEST',
		tur: 'Etkinlik',
		durum: 'etkinlik',
		son: '30 Eylül – 4 Ekim 2026, Şanlıurfa',
		sonTarih: '2026-10-04',
		ozet: 'TEKNOFEST teknoloji yarışmalarının finalleri Şanlıurfa\u2019da yapılıyor. 2026 dönemi yarışma başvuruları Şubat–Nisan aylarında kapandı; bir sonraki dönemin takvimi için TEKNOFEST sayfasını takip et.',
		link: 'https://www.teknofest.org/tr/yarismalar/insanlik-yararina-teknolojiler-yarismasi-lise-seviyesi/',
		linkAd: 'TEKNOFEST yarışma sayfası',
		kaynak: 'https://www.teknofest.org/tr/yarismalar/insanlik-yararina-teknolojiler-yarismasi-lise-seviyesi/',
		kaynakAd: 'TEKNOFEST resmi sitesi'
	},
	{
		baslik: 'TÜBİTAK Bilim Olimpiyatları (35. dönem)',
		kurum: 'TÜBİTAK',
		tur: 'Ulusal',
		durum: 'yaklasan',
		son: 'Yeni çağrı takvimi resmi sitede ilan edilecek',
		ozet: 'Astronomi, biyoloji, fizik, kimya, matematik, bilgisayar ve coğrafya dallarında ortaokul ve lise öğrencilerine açık olimpiyat programı. Geçen yıl başvurular 12 Ocak\u2019ta başlayıp Nisan\u2019a kadar sürdü, birinci aşama sınavı 16 Mayıs 2026\u2019da yapıldı.',
		link: 'https://bilimolimpiyatlari.tubitak.gov.tr/tr/duyurular',
		linkAd: 'Olimpiyat duyuruları',
		kaynak: 'https://tubitak.gov.tr/tr/duyuru/bilim-olimpiyatlari-programi-birinci-asama-sinavi-basvuru-takvimi-guncellendi',
		kaynakAd: 'TÜBİTAK duyurusu (2026 takvimi)'
	},
	{
		baslik: 'DENEYAP Teknoloji Atölyeleri',
		kurum: 'T3 Vakfı · TÜBİTAK · Sanayi ve Teknoloji Bakanlığı',
		tur: 'Eğitim',
		durum: 'yaklasan',
		son: 'Yeni dönem başvuruları deneyap.org\u2019da ilan edilecek',
		ozet: '81 ilde 36 ay boyunca ücretsiz robotik, yapay zekâ, yazılım, siber güvenlik gibi 11 başlıkta teknoloji eğitimi. Seçim e-sınavla başlıyor. Geçen dönem başvurular 27 Ocak – 30 Mart 2026 arasındaydı; 8. sınıf, hazırlık ve 9. sınıflar başvurabildi.',
		link: 'https://deneyap.org/tr/basvurular/sinav-basvuru/',
		linkAd: 'Başvuru sayfası',
		kaynak: 'https://deneyap.org/tr/basvurular/sinav-basvuru/',
		kaynakAd: 'DENEYAP resmi sitesi'
	},
	{
		baslik: 'Okul İçi Mini Hackathon',
		kurum: 'Bilim ve Teknoloji Kulübü',
		tur: 'Okul içi',
		durum: 'okul-ici',
		son: 'Kayıt: her ay son Cuma',
		ozet: 'Takım halinde bir günde küçük bir uygulama ya da prototip geliştirme etkinliği.'
	}
];
