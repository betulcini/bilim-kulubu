// Bilim ve teknoloji haberleri (yedek/başlangıç verisi).
// Asıl içerik Supabase'deki `duyurular` tablosundan gelir; tablo boşsa ya da bağlantı yoksa bu liste gösterilir.
// Alanlar: baslik, etiket, tarih ('YYYY-MM-DD'), ozet, link (haberin adresi), kaynakAd (yayın organı)
// Haberler 30 Eylül 2026'da kaynak sayfalardan derlendi; özetler kısaltılarak yeniden yazıldı.
const AA_DERLEME = 'https://www.bursahakimiyet.com.tr/teknoloji/bilim-dunyasinda-eylul-ayina-damga-vuran-kesifler-insan-beyinli-farelerden-ay-daki-dev-kratere-1720049';

export const announcements = [
	{
		baslik: 'Ay\u2019da yeni ve dev bir çarpma krateri bulundu',
		etiket: 'Uzay',
		tarih: '2026-09-30',
		ozet: 'NASA\u2019nın Ay Keşif Uydusu (LRO), Mayıs 2024\u2019te bir asteroit ya da kuyruklu yıldız parçasının çarpmasıyla oluşan, yaklaşık 222 metre çapında ve 43 metre derinliğindeki krateri tespit etti. Güneş Sistemi\u2019nde yakın zamanda oluştuğu bilinen en büyük çarpışma krateri olarak anılıyor.',
		link: AA_DERLEME,
		kaynakAd: 'AA, eylül derlemesi'
	},
	{
		baslik: 'Bir kuantum işlemci ilk kez Dünya yörüngesinde çalıştırıldı',
		etiket: 'Teknoloji',
		tarih: '2026-09-28',
		ozet: 'Araştırmacılar fotonik bir kuantum işlemcinin uzay ortamında kuantum davranışı üretip kontrol edebildiğini gösterdi. Sonuçlar henüz hakem değerlendirmesinden geçmedi (ön baskı) ve sistem uydu verisini gerçekten analiz edecek seviyede değil.',
		link: 'https://www.chip.com.tr/guncel/bir-kuantum-bilgisayar-ilk-kez-uzayda-calistirildi_184134.html',
		kaynakAd: 'CHIP Online'
	},
	{
		baslik: 'FAST teleskobu 1300\u2019den fazla pulsar kaydetti',
		etiket: 'Uzay',
		tarih: '2026-09-30',
		ozet: 'Çin\u2019deki dünyanın en büyük radyo teleskobu FAST, 2016\u2019da hizmete girdiğinden beri hızla dönen ve güçlü manyetik alan yayan 1300\u2019den fazla nötron yıldızı (pulsar) gözlemledi; bu, diğer tüm teleskopların toplamından fazla.',
		link: AA_DERLEME,
		kaynakAd: 'AA, eylül derlemesi'
	},
	{
		baslik: 'Ay\u2019daki su, büyük bir yerleşimi uzun süre taşımaya yetmeyebilir',
		etiket: 'Uzay',
		tarih: '2026-09-30',
		ozet: 'Frontiers in Space Technologies\u2019te yayımlanan araştırmaya göre Ay\u2019da kullanılabilir yaklaşık 1 milyar ton su olduğu varsayılsa bile 1 milyon kişilik bir kent bunu 2,5 yıldan kısa sürede tüketebilir. Yoğun geri dönüşümle bile kaynak en fazla 100 yıl yetiyor.',
		link: AA_DERLEME,
		kaynakAd: 'AA, eylül derlemesi'
	},
	{
		baslik: 'Felçli hastalar için konuşma ve beden dilini birlikte aktaran beyin-bilgisayar arayüzü',
		etiket: 'Sağlık',
		tarih: '2026-09-30',
		ozet: 'ABD Ulusal Sağlık Enstitüsü (NIH), üç felçli hastanın beyin sinyallerini makine öğrenmesiyle sanal bir karaktere dönüştüren bir sistem duyurdu. Konuşmayı ve beden hareketini aynı anda aktarabilen ilk cihaz olduğu belirtiliyor.',
		link: AA_DERLEME,
		kaynakAd: 'AA, eylül derlemesi'
	},
	{
		baslik: 'Genetiği değiştirilmiş domuz böbreğiyle 271 gün diyalizsiz yaşam',
		etiket: 'Biyoteknoloji',
		tarih: '2026-09-30',
		ozet: 'ABD\u2019de böbrek yetmezliği olan bir hasta, insan donörden böbrek bekleme sürecinde 271 gün boyunca genetiği değiştirilmiş domuz böbreğiyle diyalize girmeden yaşadı; ardından insan böbreği nakledildi.',
		link: AA_DERLEME,
		kaynakAd: 'AA, eylül derlemesi'
	},
	{
		baslik: 'Stanford\u2019da beyninin yaklaşık yarısı insan hücrelerinden oluşan fareler geliştirildi',
		etiket: 'Biyoloji',
		tarih: '2026-09-30',
		ozet: 'Araştırmacılar, fare beyninde bazı bölgelerin gelişimini genetik müdahaleyle kısıtlayıp yerine insan beyin organoidlerinden elde edilen hücreler nakletti. Hayvan beyninin hacimce yaklaşık yarısı insan hücrelerinden oluştu.',
		link: AA_DERLEME,
		kaynakAd: 'AA, eylül derlemesi'
	},
	{
		baslik: 'Afrika filleri hastalanınca şifalı bitkilere başvuruyor olabilir',
		etiket: 'Biyoloji',
		tarih: '2026-09-30',
		ozet: 'Araştırmacılar fillerin 35 bitki türünden yararlandığını, bunların 25\u2019inin yerel halk tarafından da tıbbi amaçla kullanıldığını saptadı. Anne fillerin bazı bitkileri yavrularına da yedirdiği gözlemlendi.',
		link: AA_DERLEME,
		kaynakAd: 'AA, eylül derlemesi'
	}
];
