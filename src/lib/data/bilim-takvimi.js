// Gerçek, araştırılmış tarihlere dayanan bilim takvimi (Eylül 2026 – Aralık 2027).
// kesinlik: 'kesin' -> resmi kaynaklarda açıklanmış tarih
//           'tahmini' -> TÜBİTAK/organizasyon henüz kesin tarihi açıklamadı, önceki yılların takvimine göre öngörü
export const takvimKategorileri = ['Tümü', 'Tutulma', 'TÜBİTAK Yarışmaları', 'Uzay Olayları', 'Festival'];

export const takvimOlaylari = [
	{
		id: 'teknofest-2026',
		baslik: 'TEKNOFEST 2026',
		kategori: 'Festival',
		baslangic: '2026-09-30',
		bitis: '2026-10-04',
		kesinlik: 'kesin',
		aciklama:
			"Türkiye'nin en büyük havacılık, uzay ve teknoloji festivali bu yıl Şanlıurfa GAP Havalimanı'nda düzenleniyor. Roket, İHA, model uydu ve daha birçok kategoride yarışma finalleri sahne alıyor.",
		not: 'Teknoloji yarışmalarına başvurular Şubat 2026’da kapandı; bu tarihler festivalin canlı gerçekleştiği günler.'
	},
	{
		id: '2204-a-basvuru',
		baslik: 'TÜBİTAK 2204-A Lise Öğrencileri Araştırma Projeleri — Başvuru',
		kategori: 'TÜBİTAK Yarışmaları',
		baslangic: '2026-09-23',
		bitis: '2027-01-04',
		kesinlik: 'kesin',
		aciklama:
			'58. dönem lise öğrencileri araştırma projeleri yarışması başvuruları TÜBİTAK Yönetim Bilgi Sistemi (TYBS) üzerinden alınıyor. Son başvuru 4 Ocak 2027 saat 17.30’da kapanıyor.'
	},
	{
		id: '2204-b-basvuru',
		baslik: 'TÜBİTAK 2204-B Ortaokul Öğrencileri Araştırma Projeleri — Başvuru',
		kategori: 'TÜBİTAK Yarışmaları',
		baslangic: '2026-10-21',
		bitis: '2027-02-10',
		kesinlik: 'kesin',
		aciklama:
			'21. dönem ortaokul öğrencileri araştırma projeleri yarışması başvuruları TYBS üzerinden alınıyor. Son başvuru 10 Şubat 2027 saat 17.30’da kapanıyor.'
	},
	{
		id: 'orionid-2026',
		baslik: 'Orionid Meteor Yağmuru (zirve)',
		kategori: 'Uzay Olayları',
		baslangic: '2026-10-21',
		bitis: null,
		kesinlik: 'kesin',
		aciklama: 'Halley kuyruklu yıldızının bıraktığı kalıntılardan oluşan meteor yağmuru zirve yapıyor. Saatte ortalama 15-20 meteor gözlemlenebilir.'
	},
	{
		id: '34-bo-ikinci-asama',
		baslik: '34. Bilim Olimpiyatları Yaz Okulu ve İkinci Aşama Sınavı',
		kategori: 'TÜBİTAK Yarışmaları',
		baslangic: '2026-11-01',
		bitis: '2026-12-21',
		kesinlik: 'tahmini',
		aciklama:
			'Birinci Aşama Sınavı’nda (16 Mayıs 2026) başarılı olan 517 öğrenci Yaz Okulu ve Kasım Kampı sonrası İkinci Aşama Sınavı’na girecek. Geçmiş yıllarda bu sınav Aralık ayında Ankara’da yapıldı; 2026 için kesin tarih TÜBİTAK tarafından ayrıca duyurulacak.'
	},
	{
		id: 'leonid-2026',
		baslik: 'Leonid Meteor Yağmuru (zirve)',
		kategori: 'Uzay Olayları',
		baslangic: '2026-11-17',
		bitis: '2026-11-18',
		kesinlik: 'kesin',
		aciklama: 'Temple-Tuttle kuyruklu yıldızından kaynaklanan, bazı yıllarda fırtına düzeyine çıkabilen hızlı ve parlak meteorlarıyla bilinen yağmur.'
	},
	{
		id: 'geminid-2026',
		baslik: 'Geminid Meteor Yağmuru (zirve)',
		kategori: 'Uzay Olayları',
		baslangic: '2026-12-13',
		bitis: '2026-12-14',
		kesinlik: 'kesin',
		aciklama: 'Yılın en güçlü meteor yağmurlarından biri; ay ışığının az olduğu koşullarda saatte 100’e yakın meteor görülebilir.'
	},
	{
		id: 'ursid-2026',
		baslik: 'Ursid Meteor Yağmuru (zirve)',
		kategori: 'Uzay Olayları',
		baslangic: '2026-12-22',
		bitis: null,
		kesinlik: 'kesin',
		aciklama: 'Yıl sonuna denk gelen, daha az yoğun ama gözlemi keyifli bir meteor yağmuru.'
	},
	{
		id: 'kuadrantid-2027',
		baslik: 'Kuadrantid Meteor Yağmuru (zirve)',
		kategori: 'Uzay Olayları',
		baslangic: '2027-01-03',
		bitis: '2027-01-04',
		kesinlik: 'kesin',
		aciklama: 'Yılın ilk büyük meteor yağmuru; zirve süresi kısa olduğu için doğru saatte gözlem önemli.'
	},
	{
		id: '2204-bolge-sergisi-2027',
		baslik: 'TÜBİTAK 2204-A/B Bölge Sergileri (tahmini)',
		kategori: 'TÜBİTAK Yarışmaları',
		baslangic: '2027-02-01',
		bitis: '2027-02-28',
		kesinlik: 'tahmini',
		aciklama:
			'Başvurular arasından seçilen projeler bölge merkezlerinde sergilenip jüri tarafından değerlendirilir. Önceki dönemde bölge sergileri Şubat ayında yapıldı; bu dönemin kesin takvimi TÜBİTAK tarafından okullara bildirilecek.'
	},
	{
		id: 'gunes-tutulmasi-subat-2027',
		baslik: 'Halkalı Güneş Tutulması',
		kategori: 'Tutulma',
		baslangic: '2027-02-06',
		bitis: null,
		kesinlik: 'kesin',
		aciklama: 'Ay Güneş’i tam örtmediği için kenarlarda ince bir “ateş halkası” oluşur. Türkiye’den izlenemiyor; güney yarımküreden gözlemlenebilecek.'
	},
	{
		id: 'ay-tutulmasi-subat-2027',
		baslik: 'Yarıgölge Ay Tutulması',
		kategori: 'Tutulma',
		baslangic: '2027-02-20',
		bitis: null,
		kesinlik: 'kesin',
		aciklama: 'Ay, Dünya’nın yarı gölgesinden geçer; parlaklıkta çok hafif bir azalma olur, çıplak gözle fark etmek zordur.'
	},
	{
		id: '35-bo-basvuru',
		baslik: '35. Bilim Olimpiyatları Birinci Aşama Sınavı — Başvurular (tahmini)',
		kategori: 'TÜBİTAK Yarışmaları',
		baslangic: '2027-01-15',
		bitis: '2027-04-20',
		kesinlik: 'tahmini',
		aciklama:
			'Astronomi-Astrofizik, Biyoloji, Bilgisayar, Coğrafya, Fizik, Kimya, Matematik ve ortaokul dallarında düzenlenen olimpiyatların başvuru takvimi her yıl Ocak ayında TÜBİTAK tarafından ilan edilir. 2027 dönemi için kesin tarihler henüz açıklanmadı; önceki yılın (12 Ocak–21 Nisan 2026) takvimine göre tahmini aralık gösterilmiştir.'
	},
	{
		id: '2204-turkiye-finali-2027',
		baslik: 'TÜBİTAK 2204-A/B Türkiye Finali (tahmini)',
		kategori: 'TÜBİTAK Yarışmaları',
		baslangic: '2027-04-20',
		bitis: '2027-05-05',
		kesinlik: 'tahmini',
		aciklama:
			'Bölge sergilerinden seçilen projelerin yarıştığı Türkiye finali ve ödül töreni. Önceki dönemde final sergisi 27-30 Nisan 2026’da Ankara’da yapıldı; bu yılki kesin tarih ve şehir TÜBİTAK tarafından ayrıca duyurulacak.'
	},
	{
		id: 'lyrid-2027',
		baslik: 'Lyrid Meteor Yağmuru (zirve)',
		kategori: 'Uzay Olayları',
		baslangic: '2027-04-22',
		bitis: null,
		kesinlik: 'kesin',
		aciklama: 'İlkbaharın en dikkat çekici meteor yağmurlarından biri, saatte ortalama 10-18 meteor.'
	},
	{
		id: 'eta-aquarid-2027',
		baslik: 'Eta Aquarid Meteor Yağmuru (zirve)',
		kategori: 'Uzay Olayları',
		baslangic: '2027-05-05',
		bitis: '2027-05-06',
		kesinlik: 'kesin',
		aciklama: 'Halley kuyruklu yıldızından kaynaklanan, güney yarımkürede daha belirgin izlenen meteor yağmuru.'
	},
	{
		id: '35-bo-birinci-asama',
		baslik: '35. Bilim Olimpiyatları Birinci Aşama Sınavı (tahmini)',
		kategori: 'TÜBİTAK Yarışmaları',
		baslangic: '2027-05-15',
		bitis: null,
		kesinlik: 'tahmini',
		aciklama: '81 il merkezinde ve KKTC’de aynı anda yapılan çoktan seçmeli sınav. Kesin tarih başvuru dönemiyle birlikte TÜBİTAK tarafından açıklanacak.'
	},
	{
		id: 'ay-tutulmasi-temmuz-2027',
		baslik: 'Yarıgölge Ay Tutulması (çok hafif)',
		kategori: 'Tutulma',
		baslangic: '2027-07-18',
		bitis: null,
		kesinlik: 'kesin',
		aciklama: 'Ay’ın yalnızca kenarı yarı gölgeye değer; gözle fark edilmesi neredeyse imkansız, daha çok astronomik bir referans noktası.'
	},
	{
		id: 'gunes-tutulmasi-agustos-2027',
		baslik: 'Tam Güneş Tutulması — Türkiye’den parçalı izlenebilecek',
		kategori: 'Tutulma',
		baslangic: '2027-08-02',
		bitis: null,
		kesinlik: 'kesin',
		aciklama:
			'21. yüzyılın en uzun tam güneş tutulmalarından biri. Türkiye tam tutulma hattında değil ama ülke genelinde parçalı olarak izlenecek: İstanbul’da Güneş’in yaklaşık %52’si, Antalya-Mersin-Adana-Gaziantep-Şanlıurfa gibi güney illerinde %65-75’i Ay tarafından örtülecek. Türkiye saatiyle yaklaşık 11.20-14.13 arasında gözlemlenebilir; Güneş’e doğrudan bakmak için mutlaka güneş gözlüğü/filtresi gerekir.',
		not: 'Kulüp için yıl içindeki en büyük gözlem etkinliği fırsatı!'
	},
	{
		id: 'perseid-2027',
		baslik: 'Perseid Meteor Yağmuru (zirve)',
		kategori: 'Uzay Olayları',
		baslangic: '2027-08-12',
		bitis: '2027-08-13',
		kesinlik: 'kesin',
		aciklama: 'Yaz aylarının en sevilen meteor yağmuru; açık ve karanlık bir gökyüzünde saatte 50-75 meteor görülebilir.'
	},
	{
		id: 'ay-tutulmasi-agustos-2027',
		baslik: 'Yarıgölge Ay Tutulması',
		kategori: 'Tutulma',
		baslangic: '2027-08-17',
		bitis: null,
		kesinlik: 'kesin',
		aciklama: 'Ay’ın parlaklığında hafif bir azalma yaşanır; çıplak gözle fark etmek zor olsa da fotoğrafla belgelemeye uygun.'
	},
	{
		id: 'teknofest-2027',
		baslik: 'TEKNOFEST 2027 (tarih tahmini)',
		kategori: 'Festival',
		baslangic: '2027-09-01',
		bitis: '2027-10-15',
		kesinlik: 'tahmini',
		aciklama:
			'TEKNOFEST her yıl Eylül-Ekim aylarında düzenleniyor; 2027 için şehir ve kesin tarih henüz açıklanmadı. Teknoloji yarışmalarına başvurular genelde bir önceki yılın Ocak-Şubat ayında açılıyor.'
	},
	{
		id: 'orionid-2027',
		baslik: 'Orionid Meteor Yağmuru (zirve)',
		kategori: 'Uzay Olayları',
		baslangic: '2027-10-21',
		bitis: null,
		kesinlik: 'kesin',
		aciklama: 'Halley kuyruklu yıldızının kalıntılarından oluşan, sonbaharın karakteristik meteor yağmuru.'
	},
	{
		id: 'leonid-2027',
		baslik: 'Leonid Meteor Yağmuru (zirve)',
		kategori: 'Uzay Olayları',
		baslangic: '2027-11-17',
		bitis: '2027-11-18',
		kesinlik: 'kesin',
		aciklama: 'Hızlı ve parlak meteorlarıyla bilinen, her yıl kasım ortasında zirve yapan yağmur.'
	},
	{
		id: 'geminid-2027',
		baslik: 'Geminid Meteor Yağmuru (zirve)',
		kategori: 'Uzay Olayları',
		baslangic: '2027-12-13',
		bitis: '2027-12-14',
		kesinlik: 'kesin',
		aciklama: 'Yılın en yoğun meteor yağmurlarından biriyle 2027’yi kapatan gözlem fırsatı.'
	},
	{
		id: 'ursid-2027',
		baslik: 'Ursid Meteor Yağmuru (zirve)',
		kategori: 'Uzay Olayları',
		baslangic: '2027-12-22',
		bitis: null,
		kesinlik: 'kesin',
		aciklama: 'Yıl sonuna denk gelen, sakin ama keyifli bir gözlem penceresi.'
	}
];
