export const quizTopics = [
	{
		id: 'fizik', ad: 'Fizik', aciklama: 'Kuvvet, enerji ve ışık',
		sorular: [
			{ soru: 'Işık boşlukta yaklaşık hangi hızla yol alır?', secenekler: ['300.000 km/sn', '150.000 km/sn', '30.000 km/sn', '1.080 km/sn'], dogru: 0, aciklama: 'Işık hızı boşlukta yaklaşık 300.000 km/sn’dir.' },
			{ soru: 'Kuvvetin SI birimi hangisidir?', secenekler: ['Joule', 'Watt', 'Newton', 'Pascal'], dogru: 2, aciklama: 'Kuvvet, Isaac Newton’un adıyla anılan newton (N) birimiyle ölçülür.' },
			{ soru: 'Elektrik akımını ölçen araç hangisidir?', secenekler: ['Termometre', 'Ampermetre', 'Barometre', 'Dinamometre'], dogru: 1, aciklama: 'Ampermetre devredeki elektrik akımını amper cinsinden ölçer.' }
		]
	},
	{
		id: 'biyoloji', ad: 'Biyoloji', aciklama: 'Canlılar ve yaşam',
		sorular: [
			{ soru: 'Fotosentezde bitkilerin kullandığı gaz hangisidir?', secenekler: ['Oksijen', 'Azot', 'Karbondioksit', 'Hidrojen'], dogru: 2, aciklama: 'Bitkiler karbondioksit ve suyu besine dönüştürür; oksijen açığa çıkar.' },
			{ soru: 'Hücrenin yönetim merkezi hangi organeldir?', secenekler: ['Çekirdek', 'Ribozom', 'Koful', 'Lizozom'], dogru: 0, aciklama: 'Çekirdek genetik materyali taşır ve hücresel etkinlikleri yönetir.' },
			{ soru: 'DNA’nın çift sarmal modelini kimler tanımladı?', secenekler: ['Watson ve Crick', 'Darwin ve Mendel', 'Curie ve Röntgen', 'Pasteur ve Koch'], dogru: 0, aciklama: 'Watson ve Crick çift sarmal modeli 1953’te yayımladı.' }
		]
	},
	{
		id: 'astronomi', ad: 'Astronomi', aciklama: 'Gezegenler ve evren',
		sorular: [
			{ soru: 'Güneş Sistemi’nin en büyük gezegeni hangisidir?', secenekler: ['Satürn', 'Jüpiter', 'Dünya', 'Neptün'], dogru: 1, aciklama: 'Jüpiter, Güneş Sistemi’ndeki en büyük gezegendir.' },
			{ soru: 'Dünya’nın doğal uydusunun adı nedir?', secenekler: ['Titan', 'Europa', 'Ay', 'Phobos'], dogru: 2, aciklama: 'Ay, Dünya’nın tek doğal uydusudur.' },
			{ soru: 'Güneş hangi gök cismi türüdür?', secenekler: ['Gezegen', 'Yıldız', 'Kuyruklu yıldız', 'Uydu'], dogru: 1, aciklama: 'Güneş kendi ışığını ve enerjisini üreten bir yıldızdır.' }
		]
	},
	{
		id: 'kimya', ad: 'Kimya', aciklama: 'Maddeler ve tepkimeler',
		sorular: [
			{ soru: 'Periyodik tabloda “Au” hangi elementi temsil eder?', secenekler: ['Gümüş', 'Alüminyum', 'Altın', 'Argon'], dogru: 2, aciklama: 'Au, altının Latince adı aurumdan gelir.' },
			{ soru: 'pH değeri 7 olan çözelti nasıl tanımlanır?', secenekler: ['Asidik', 'Nötr', 'Bazik', 'Yükseltgen'], dogru: 1, aciklama: 'pH 7 nötrdür; saf su buna örnektir.' },
			{ soru: 'Suyun kimyasal formülü hangisidir?', secenekler: ['CO₂', 'O₂', 'H₂O', 'NaCl'], dogru: 2, aciklama: 'Bir su molekülünde iki hidrojen ve bir oksijen atomu bulunur.' }
		]
	}
];
