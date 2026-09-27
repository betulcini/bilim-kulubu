// Bilim_Quizleri_Dataset.csv dosyasından otomatik üretildi (145 soru, 6 kategori)
export const quizData = {
    "fizik": {
        "title": "Fizik Quiz",
        "desc": "Kuvvet, enerji, elektrik ve optikten geniş bir soru havuzu — her turda farklı sorular.",
        "questions": [
            {
                "soru": "Bir cismin sabit hızla hareket ettiği bir sistemde, cisme etki eden net kuvvet için aşağıdakilerden hangisi söylenebilir?",
                "secenekler": [
                    "Net kuvvet sıfırdır",
                    "Net kuvvet cisme etki eder",
                    "Net kuvvet kütle ile doğru orantılıdır",
                    "Net kuvvet hız ile doğru orantılıdır"
                ],
                "dogru": "Net kuvvet sıfırdır",
                "aciklama": "Newton'un birinci yasasına göre (eylemsizlik yasası), bir cisim sabit hızla hareket ediyorsa veya duruyorsa üzerine etki eden net kuvvet sıfırdır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir araba 10 saniyede 0'dan 20 m/s hıza ulaşıyorsa ivmesi kaç m/s²'dir?",
                "secenekler": [
                    "1 m/s²",
                    "2 m/s²",
                    "3 m/s²",
                    "0.5 m/s²"
                ],
                "dogru": "2 m/s²",
                "aciklama": "İvme = Δv / Δt = (20 - 0) / 10 = 2 m/s². Hızdaki değişimin zamana oranı ivmeyi verir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir yay 5 N kuvvetle 0.2 m uzadığında yayın yay sabiti (k) kaç N/m'dir?",
                "secenekler": [
                    "10 N/m",
                    "25 N/m",
                    "20 N/m",
                    "50 N/m"
                ],
                "dogru": "25 N/m",
                "aciklama": "Hooke yasasına göre F = kx. k = F/x = 5/0.2 = 25 N/m. Yay sabiti, birim uzama başına gereken kuvvettir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir cismin kütlesi Dünya'da 60 kg ise Ay'da ağırlığı yaklaşık kaç N'dir? (g_ay ≈ 1.6 m/s²)",
                "secenekler": [
                    "60 N",
                    "96 N",
                    "600 N",
                    "980 N"
                ],
                "dogru": "96 N",
                "aciklama": "Ağırlık W = m × g. Ay'da W = 60 × 1.6 = 96 N. Kütle yerden yere değişmez ama ağırlık yerçekimine bağlı olarak değişir.",
                "zorluk": "Orta"
            },
            {
                "soru": "İki direnç (6Ω ve 3Ω) seri bağlandığında eşdeğer direnç kaç Ω'dür?",
                "secenekler": [
                    "2 Ω",
                    "9 Ω",
                    "18 Ω",
                    "3 Ω"
                ],
                "dogru": "9 Ω",
                "aciklama": "Seri bağlamada dirençler toplanır: R = 6 + 3 = 9 Ω. Seri bağlantıda toplam direnç her zaman en büyük dirençten büyüktür.",
                "zorluk": "Kolay"
            },
            {
                "soru": "İki direnç (6Ω ve 3Ω) paralel bağlandığında eşdeğer direnç kaç Ω'dür?",
                "secenekler": [
                    "9 Ω",
                    "2 Ω",
                    "3 Ω",
                    "18 Ω"
                ],
                "dogru": "2 Ω",
                "aciklama": "Paralel bağlamada 1/R = 1/R₁ + 1/R₂ = 1/6 + 1/3 = 1/2. R = 2 Ω. Paralelde toplam direnç her zaman en küçük dirençten küçüktür.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir optikte ışığın bir ortamdan başka bir ortama geçerken yön değiştirmesine ne denir?",
                "secenekler": [
                    "Yansıma",
                    "Kırılma",
                    "Saçılma",
                    "Girişim"
                ],
                "dogru": "Kırılma",
                "aciklama": "Kırılma (refraction), ışığın yoğunluğu farklı ortamlarda farklı hızlarda ilerlemesi nedeniyle yön değiştirmesidir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir hareket halindeki tren içinde yolcu yukarı bir top atıyor. Top trenin referans çerçevesinde nereye düşer?",
                "secenekler": [
                    "Yolcunun önüne",
                    "Yolcunun arkasına",
                    "Yolcunun eline geri",
                    "Trenden dışarı"
                ],
                "dogru": "Yolcunun eline geri",
                "aciklama": "Eylemsizlik referans çerçevesinde, top yatayda trenle aynı hıza sahip olduğundan yolcunun eline geri döner. Newton birinci yasasının bir sonucudur.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir ses dalgasının frekansı artarsa, sesin algılanan perdesi nasıl değişir?",
                "secenekler": [
                    "Daha alçak olur",
                    "Daha yüksek olur",
                    "Aynı kalır",
                    "Ses kesilir"
                ],
                "dogru": "Daha yüksek olur",
                "aciklama": "Frekans arttıkça sesin perdesi (pitch) yükselir. Yüksek frekanslı dalgalar daha tiz sesler üretir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir ısıtıcı 220V gerilimde 2A akım çekiyorsa, harcadığı güç kaç Watt'tır?",
                "secenekler": [
                    "110 W",
                    "220 W",
                    "440 W",
                    "44 W"
                ],
                "dogru": "440 W",
                "aciklama": "Güç P = V × I = 220 × 2 = 440 W. Elektrik gücü, gerilim ve akımın çarpımıyla hesaplanır.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir cisim serbest düşmeye bırakıldığında 3 saniye sonra hızı kaç m/s'dir? (g ≈ 10 m/s²)",
                "secenekler": [
                    "10 m/s",
                    "20 m/s",
                    "30 m/s",
                    "15 m/s"
                ],
                "dogru": "30 m/s",
                "aciklama": "v = g × t = 10 × 3 = 30 m/s. Serbest düşmede cisim her saniye 10 m/s hız kazanır (yerçekimi ivmesi).",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir mıknatısın manyetik alan çizgileri aşağıdaki ifadelerden hangisinde doğru açıklanmıştır?",
                "secenekler": [
                    "Kuzey kutuptan güney kutba gider",
                    "Güney kutuptan kuzey kutba gider",
                    "İki kutup arasında düz çizgidir",
                    "Mıknatısdan bağımsızdır"
                ],
                "dogru": "Kuzey kutuptan güney kutba gider",
                "aciklama": "Manyetik alan çizgileri mıknatısın dışında kuzey kutuptan çıkıp güney kutba girer. İçeride ise güneyden kuzeye gider.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir cisim 5 m yükseklikten serbest düşerse yere çarpma hızı kaç m/s'dir? (g ≈ 10 m/s²)",
                "secenekler": [
                    "5 m/s",
                    "10 m/s",
                    "15 m/s",
                    "20 m/s"
                ],
                "dogru": "10 m/s",
                "aciklama": "v² = 2gh = 2 × 10 × 5 = 100, v = 10 m/s. Potansiyel enerji kinetik enerjiye dönüşür: mgh = ½mv².",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir araba düz bir yolda sabit hızla giderken sürtünme kuvveti 500 N ve motor gücü 10 kW ise arabanın hızı kaç m/s'dir?",
                "secenekler": [
                    "10 m/s",
                    "20 m/s",
                    "50 m/s",
                    "5 m/s"
                ],
                "dogru": "20 m/s",
                "aciklama": "P = F × v → v = P/F = 10000/500 = 20 m/s. Güç, kuvvet ve hızın çarpımıdır.",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir kabarcık hareket halinde iken iç basınca ne olur?",
                "secenekler": [
                    "Artar",
                    "Azalır",
                    "Aynı kalır",
                    "Sıfıra iner"
                ],
                "dogru": "Azalır",
                "aciklama": "Derinlik azaldıkça hidrostatik basınç azalır, bu yüzden kabarcık genişler ve iç basınç azalır (Boyle yasası ilişkili).",
                "zorluk": "Zor"
            },
            {
                "soru": "İki cisim arasında kütleçekim kuvveti iki cisim arasındaki mesafe iki katına çıktığında nasıl değişir?",
                "secenekler": [
                    "İki kat artar",
                    "Yarıya iner",
                    "Dört kat artar",
                    "Dörtte birine iner"
                ],
                "dogru": "Dörtte birine iner",
                "aciklama": "F = G(m₁m₂)/r². Mesafe iki katına çıkınca kuvvet 1/4'e iner. Kütleçekim, mesafenin karesiyle ters orantılıdır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir dalga hareketinin dalga boyu 2 m ve frekansı 5 Hz ise dalga hızı kaç m/s'dir?",
                "secenekler": [
                    "2.5 m/s",
                    "7 m/s",
                    "10 m/s",
                    "3 m/s"
                ],
                "dogru": "10 m/s",
                "aciklama": "v = λ × f = 2 × 5 = 10 m/s. Dalga hızı, dalga boyu ve frekansın çarpımıdır.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir kondansatörün kapasitesi 10 µF ve gerilimi 12V ise depoladığı yük kaç Coulomb'dur?",
                "secenekler": [
                    "120 µC",
                    "1.2 µC",
                    "0.12 mC",
                    "12 µC"
                ],
                "dogru": "120 µC",
                "aciklama": "Q = C × V = 10 × 12 = 120 µC. Kondansatörün depoladığı yük, kapasite ve gerilimin çarpımıdır.",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir cismin kütlesi 2 kg ve hızı 3 m/s ise kinetik enerjisi kaç Joule'dur?",
                "secenekler": [
                    "3 J",
                    "6 J",
                    "9 J",
                    "18 J"
                ],
                "dogru": "9 J",
                "aciklama": "KE = ½mv² = ½ × 2 × 3² = ½ × 2 × 9 = 9 J. Kinetik enerji, kütle ve hızın karesiyle doğru orantılıdır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir iletken telde akım 5 A ve telin direnci 4 Ω ise telde kaybedilen güç kaç Watt'tır?",
                "secenekler": [
                    "20 W",
                    "100 W",
                    "80 W",
                    "9 W"
                ],
                "dogru": "100 W",
                "aciklama": "P = I²R = 5² × 4 = 25 × 4 = 100 W. Joule ısınması, akımın karesi ve dirençle doğru orantılıdır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir gök cisminin yaydığı ışığın dalga boyu arttıkça, ışığın frekansı nasıl değişir?",
                "secenekler": [
                    "Artar",
                    "Azalır",
                    "Aynı kalır",
                    "Sıfır olur"
                ],
                "dogru": "Azalır",
                "aciklama": "c = λ × f. Işık hızı sabit olduğundan dalga boyu arttıkça frekans azalır. Ters orantılıdırlar.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir kitap masada dururken kitaba etki eden yerçekimi kuvveti 20 N ise, masanın kitaba uyguladığı normal kuvvet kaç N'dir?",
                "secenekler": [
                    "0 N",
                    "10 N",
                    "20 N",
                    "40 N"
                ],
                "dogru": "20 N",
                "aciklama": "Kitap dengede olduğundan yerçekimi kuvveti ile normal kuvvet eşittir: N = mg = 20 N. Newton 3. yasası gereği.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir ışık ışını hava-su sınırında suya girerken nasıl kırılır?",
                "secenekler": [
                    "normale yaklaşarak",
                    "normalden uzaklaşarak",
                    "aynı doğrultuda devam ederek",
                    "Tam yansıma yaparak"
                ],
                "dogru": "normale yaklaşarak",
                "aciklama": "Su havadan daha yoğun olduğundan ışık normale yaklaşarak kırılır. Yavaşlar ve normale doğru yönelir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir sarkaç 1 saniyede bir salınım yapıyorsa frekansı kaç Hz'dir?",
                "secenekler": [
                    "0.5 Hz",
                    "1 Hz",
                    "2 Hz",
                    "60 Hz"
                ],
                "dogru": "1 Hz",
                "aciklama": "Frekans = 1/periyot = 1/1 = 1 Hz. Bir saniyedeki salınım sayısı frekanstır.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir araba virajı alırken hangi kuvvet merkezkaç kuvvetine karşı koyar?",
                "secenekler": [
                    "Sürtünme kuvveti",
                    "Yerçekimi kuvveti",
                    "Normal kuvvet",
                    "İvme kuvveti"
                ],
                "dogru": "Sürtünme kuvveti",
                "aciklama": "Virajda sürtünme kuvveti merkezkaç kuvvetine karşı koyar ve aracın düz gitmesini sağlar. Sürtünme yetersizse araç kayar.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir buz kalıbı eridiğinde hacmi nasıl değişir?",
                "secenekler": [
                    "Artar",
                    "Azalır",
                    "Aynı kalır",
                    "Önce artar sonra azalır"
                ],
                "dogru": "Azalır",
                "aciklama": "Buz eriyince hacmi azalır çünkü suyun katı hali (buz) sıvı halinden daha hacimlidir. Su bu özelliğiyle çoğu maddeden farklıdır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir silindir içindeki gaz sabit sıcaklıkta hacminin yarısına sıkıştırılırsa basıncı nasıl değişir?",
                "secenekler": [
                    "Yarıya iner",
                    "İki kat artar",
                    "Aynı kalır",
                    "Dört kat artar"
                ],
                "dogru": "İki kat artar",
                "aciklama": "Boyle yasasına göre PV = sabit. Hacim yarıya inince basınç iki kat artar. Sabit sıcaklıkta P ve V ters orantılıdır.",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir bataryanın EMK'sı 12V ve iç direnci 1Ω ise, 5Ω'luk dış dirence bağlandığında devreden geçen akım kaç A'dir?",
                "secenekler": [
                    "1 A",
                    "2 A",
                    "2.4 A",
                    "12 A"
                ],
                "dogru": "2 A",
                "aciklama": "I = EMK/(R_dış + R_iç) = 12/(5+1) = 12/6 = 2 A. İç direnç akımı sınırlar.",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir ayna düzlem ayna ise, aynadaki görüntü için aşağıdakilerden hangisi yanlıştır?",
                "secenekler": [
                    "Sanaldır",
                    "Boyu eşittir",
                    "Eşit uzaklıktadır",
                    "Gerçektir"
                ],
                "dogru": "Gerçektir",
                "aciklama": "Düzlem aynada görüntü sanaldır (gerçek ışık ışınlarından oluşmaz). Boyu ve uzaklığı eşittir ama görüntü gerçek değildir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir araba 20 m/s hızla giderken fren yaparak 4 saniyede duruyorsa frenleme ivmesi kaç m/s²'dir?",
                "secenekler": [
                    "4 m/s²",
                    "5 m/s²",
                    "6 m/s²",
                    "80 m/s²"
                ],
                "dogru": "5 m/s²",
                "aciklama": "a = Δv/Δt = (0-20)/4 = -5 m/s². İşaret negatif çünkü yavaşlama (frenleme) ivmesi hareket yönünün tersinedir.",
                "zorluk": "Orta"
            }
        ]
    },
    "kimya": {
        "title": "Kimya Quiz",
        "desc": "Elementler, tepkimeler ve periyodik tablo üzerine geniş bir soru havuzu.",
        "questions": [
            {
                "soru": "Bir atomun nötr olması için aşağıdakilerden hangisi doğru olmalıdır?",
                "secenekler": [
                    "Proton sayısı = Nötron sayısı",
                    "Proton sayısı = Elektron sayısı",
                    "Nötron sayısı = Elektron sayısı",
                    "Proton + Nötron = Elektron"
                ],
                "dogru": "Proton sayısı = Elektron sayısı",
                "aciklama": "Nötr bir atomda proton sayısı (pozitif yük) elektron sayısına (negatif yük) eşittir. Nötronlar yüksüzdür.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Aşağıdaki elementlerden hangisi soy gazdır?",
                "secenekler": [
                    "Oksijen",
                    "Hidrojen",
                    "Helyum",
                    "Karbon"
                ],
                "dogru": "Helyum",
                "aciklama": "Helyum (He) bir soy gazdır. Soy gazlar (Grup 18) çok kararlıdır ve genellikle tepkimeye girmezler. Tam dolu elektron kabuğuna sahiptirler.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir çözeltinin pH değeri 3 ise, bu çözelti için aşağıdakilerden hangisi söylenebilir?",
                "secenekler": [
                    "Nötrdür",
                    "Baziktir",
                    "Asidiktir",
                    "Tuzdur"
                ],
                "dogru": "Asidiktir",
                "aciklama": "pH 7 nötr, 7'den küçük asidik, 7'den büyük baziktir. pH 3 güçlü bir asidik çözeltiyi gösterir. H⁺ iyonu yoğunluğu yüksektir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Sodyum (Na) atomunun değerlik elektron sayısı kaçtır?",
                "secenekler": [
                    "1",
                    "2",
                    "7",
                    "8"
                ],
                "dogru": "1",
                "aciklama": "Sodyum, periyodik tabloda 1A grubundadır ve 3 elektron kabuğu vardır. En dış kabukta 1 değerlik elektronu bulunur.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir kimyasal tepkimede kütlenin korunumu yasası kime aittir?",
                "secenekler": [
                    "Newton",
                    "Lavoisier",
                    "Einstein",
                    "Boyle"
                ],
                "dogru": "Lavoisier",
                "aciklama": "Antoine Lavoisier, kimyasal tepkimelerde toplam kütlenin değişmediğini (korunduğunu) deneysel olarak kanıtlamıştır.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir atomun elektron diziliminde en dış kabukta 7 elektron varsa, bu atomun özelliği nedir?",
                "secenekler": [
                    "Metal",
                    "Ametal",
                    "Soy gaz",
                    "Geçiş metali"
                ],
                "dogru": "Ametal",
                "aciklama": "En dış kabukta 7 elektron olan atomlar ametaldir (7A grubu - halojenler). 1 elektron alarak soy gaz dizilimine ulaşmaya çalışırlar.",
                "zorluk": "Orta"
            },
            {
                "soru": "Aşağıdakilerden hangisi kimyasal bir değişimdir?",
                "secenekler": [
                    "Buzun erimesi",
                    "Suyun buharlaşması",
                    "Demirin paslanması",
                    "Kağıdın yırtılması"
                ],
                "dogru": "Demirin paslanması",
                "aciklama": "Demirin paslanması kimyasal bir değişimdir (yeni madde oluşur: demir oksit). Diğerleri fiziksel değişimdir (madde aynı kalır).",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir bileşiğin molekül formülü H₂O ise, bu bileşikteki elementlerin kütle oranları nasıldır? (H=1, O=16)",
                "secenekler": [
                    "1:8",
                    "1:16",
                    "2:16",
                    "1:2"
                ],
                "dogru": "1:8",
                "aciklama": "H₂O'da 2×1=2 (H) ve 1×16=16 (O). Kütle oranı H:O = 2:16 = 1:8. Oksijen çok daha ağır olduğu için oranı büyüktür.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir iyonik bağda hangi tür elektron transferi gerçekleşir?",
                "secenekler": [
                    "Paylaşım",
                    "Transfer (metal → ametal)",
                    "Hiçbiri",
                    "Ortak kullanım"
                ],
                "dogru": "Transfer (metal → ametal)",
                "aciklama": "İyonik bağda metal atom elektron verir (katyon), ametal elektron alır (anyon). Zıt yüklü iyonlar arasındaki çekim iyonik bağı oluşturur.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir gazın basıncı, sıcaklığı ve hacmi arasındaki ilişkiyi veren gaz yasası hangisidir?",
                "secenekler": [
                    "Ohm yasası",
                    "İdeal gaz yasası (PV=nRT)",
                    "Newton yasası",
                    "Hooke yasası"
                ],
                "dogru": "İdeal gaz yasası (PV=nRT)",
                "aciklama": "İdeal gaz yasası PV = nRT'dir. P basınç, V hacim, n mol sayısı, R gaz sabiti, T sıcaklıktır. Tüm gaz yasalarını birleştirir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir çözeltiye biraz asit eklendiğinde pH nasıl değişir?",
                "secenekler": [
                    "Artar",
                    "Azalır",
                    "Aynı kalır",
                    "7'ye yaklaşır"
                ],
                "dogru": "Azalır",
                "aciklama": "Asit eklendiğinde H⁺ iyonu yoğunluğu artar, bu yüzden pH azalır. Daha asidik = daha düşük pH.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir elementin atom numarası, aşağıdakilerden hangisini belirtir?",
                "secenekler": [
                    "Nötron sayısı",
                    "Proton sayısı",
                    "Elektron sayısı (nötr atomda)",
                    "B ve C"
                ],
                "dogru": "B ve C",
                "aciklama": "Atom numarası, çekirdekteki proton sayısıdır. Nötr atomda proton sayısı = elektron sayısıdır. Nötron sayısı = kütle numarası - atom numarası.",
                "zorluk": "Orta"
            },
            {
                "soru": "Klor (Cl) atomunun elektron diziliminde 3. kabukta kaç elektron vardır?",
                "secenekler": [
                    "5",
                    "6",
                    "7",
                    "8"
                ],
                "dogru": "7",
                "aciklama": "Klor (Z=17) dizilimi: 2, 8, 7. 3. kabukta 7 elektron vardır. Halojen grubundadır, 1 elektron alarak Cl⁻ iyonu olur.",
                "zorluk": "Orta"
            },
            {
                "soru": "Aşağıdaki bileşiklerden hangisi kovalent bağlıdır?",
                "secenekler": [
                    "NaCl",
                    "MgO",
                    "H₂O",
                    "KBr"
                ],
                "dogru": "H₂O",
                "aciklama": "H₂O kovalent bağlıdır (iki ametal arasında elektron paylaşımı). NaCl, MgO ve KBr iyonik bağlı bileşiklerdir (metal-ametal).",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir tepkimenin denkleştirilmesinde korunması gereken yasalar aşağıdakilerden hangileridir?",
                "secenekler": [
                    "Kütlenin korunumu",
                    "Atom sayısının korunumu",
                    "Elektron sayısının korunumu",
                    "A ve B"
                ],
                "dogru": "A ve B",
                "aciklama": "Bir tepkime denkleştirilirken kütle ve atom sayısı korunmalıdır (Lavoisier). Her elementin atom sayısı tepkime öncesi ve sonrası eşit olmalıdır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir maddenin 1 molü kaç taneciğe eşittir?",
                "secenekler": [
                    "6.022 × 10²³",
                    "6.022 × 10²²",
                    "3.011 × 10²³",
                    "1.2 × 10²⁴"
                ],
                "dogru": "6.022 × 10²³",
                "aciklama": "Avogadro sayısı 6.022 × 10²³'tür. 1 mol herhangi bir madde bu kadar taneciğe sahiptir. Bu, kimyasal hesaplamaların temelidir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir bileşiğin empirik formülü CH₂ ise ve molekül ağırlığı 28 g/mol ise, molekül formülü nedir? (C=12, H=1)",
                "secenekler": [
                    "CH₂",
                    "C₂H₄",
                    "C₃H₆",
                    "C₄H₈"
                ],
                "dogru": "C₂H₄",
                "aciklama": "Empirik formül ağırlığı = 12 + 2 = 14. 28/14 = 2. Molekül formülü = (CH₂)₂ = C₂H₄ (etilen).",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir çözeltide 0.1 M HCl varsa, H⁺ iyonu konsantrasyonu kaç M'dir?",
                "secenekler": [
                    "0.01 M",
                    "0.1 M",
                    "1 M",
                    "0.001 M"
                ],
                "dogru": "0.1 M",
                "aciklama": "HCl güçlü bir asittir ve tamamen iyonlaşır: HCl → H⁺ + Cl⁻. Bu yüzden [H⁺] = 0.1 M. pH = -log(0.1) = 1.",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir metalin oksijenle tepkimesiyle oluşan bileşik aşağıdakilerden hangisi olabilir?",
                "secenekler": [
                    "CO₂",
                    "Na₂O",
                    "H₂O",
                    "NO₂"
                ],
                "dogru": "Na₂O",
                "aciklama": "Na₂O (sodyum oksit), metal (Na) ve oksijenin tepkimesiyle oluşur. CO₂, H₂O ve NO₂ ametal-oksijen bileşikleridir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir tepkimenin aktive enerjisi neyi temsil eder?",
                "secenekler": [
                    "Tepkimenin açığa çıkardığı enerji",
                    "Tepkimenin başlaması için gereken enerji",
                    "Tepkimenin toplam enerjisi",
                    "Ürünlerin enerjisi"
                ],
                "dogru": "Tepkimenin başlaması için gereken enerji",
                "aciklama": "Aktive enerjisi, tepkimenin başlaması için aşılması gereken enerji bariyeridir. Katalizörler bu enerjiyi düşürerek tepkimiyi hızlandırır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Periyodik tabloda bir grupta aşağı yukarı gidildikçe atom yarıçapı nasıl değişir?",
                "secenekler": [
                    "Artar",
                    "Azalır",
                    "Aynı kalır",
                    "Önce artar sonra azalır"
                ],
                "dogru": "Artar",
                "aciklama": "Bir grupta yukarıdan aşağıya gidildikçe elektron kabuk sayısı artar, bu yüzden atom yarıçapı artar.",
                "zorluk": "Orta"
            },
            {
                "soru": "Periyodik tabloda bir periyotta soldan sağa gidildikçe metalik özellik nasıl değişir?",
                "secenekler": [
                    "Artar",
                    "Azalır",
                    "Aynı kalır",
                    "Düzenli değişmez"
                ],
                "dogru": "Azalır",
                "aciklama": "Bir periyotta soldan sağa gidildikçe proton sayısı artar, değerlik elektronları daha sıkı tutulur, metalik özellik azalır (ametale doğru).",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir gaz sabit hacimde ısındığında basıncı nasıl değişir?",
                "secenekler": [
                    "Artar",
                    "Azalır",
                    "Aynı kalır",
                    "Sıfıra iner"
                ],
                "dogru": "Artar",
                "aciklama": "Sabit hacimde sıcaklık artınca gaz molekülleri daha hızlı hareket eder ve duvara daha sık çarpar, basınç artar (Gay-Lussac yasası).",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir bileşikteki elementlerin kütle yüzdelerinden bileşiğin formülü bulunduğunda, önce hangi formül hesaplanır?",
                "secenekler": [
                    "Molekül formülü",
                    "Empirik (en basit) formül",
                    "Yapısal formül",
                    "İyonik formül"
                ],
                "dogru": "Empirik (en basit) formül",
                "aciklama": "Önce empirik (en basit oran) formülü bulunur, sonra molekül ağırlığı kullanılarak molekül formülü belirlenir.",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir sulu çözeltide [H⁺] = 10⁻⁵ M ise pH kaçtır?",
                "secenekler": [
                    "3",
                    "5",
                    "7",
                    "9"
                ],
                "dogru": "5",
                "aciklama": "pH = -log[H⁺] = -log(10⁻⁵) = 5. pH 5 asidik bir çözeltiyi gösterir (7'den küçük).",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir nötr atomdan bir elektron çıkarıldığında oluşan iyon aşağıdakilerden hangisidir?",
                "secenekler": [
                    "Anyon",
                    "Katyon",
                    "Molekül",
                    "İzotop"
                ],
                "dogru": "Katyon",
                "aciklama": "Elektron çıkarıldığında proton sayısı elektron sayısından fazla olur, pozitif yüklü katyon oluşur. Örn: Na → Na⁺ + e⁻.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir kimyasal bağda iki atom arasında elektron paylaşımı olduğunda, bu bağ türü nedir?",
                "secenekler": [
                    "İyonik bağ",
                    "Kovalent bağ",
                    "Metalik bağ",
                    "Hidrojen bağı"
                ],
                "dogru": "Kovalent bağ",
                "aciklama": "Kovalent bağda iki atom (genellikle ametal) elektron çiftini paylaşır. Su (H₂O) ve metan (CH₄) kovalent bağlı bileşiklerdir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir elementin izotopları aşağıdakilerden hangisinde farklıdır?",
                "secenekler": [
                    "Proton sayısı",
                    "Nötron sayısı",
                    "Elektron sayısı",
                    "Atom numarası"
                ],
                "dogru": "Nötron sayısı",
                "aciklama": "İzotoplar aynı proton sayısına (atom numarası) ama farklı nötron sayısına sahiptir. Bu yüzden kütle numaraları farklıdır. Örn: C-12, C-13, C-14.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir gaz 0°C ve 1 atm'de 22.4 L hacim kaplıyorsa, bu gazın miktarı kaç moldür?",
                "secenekler": [
                    "0.5 mol",
                    "1 mol",
                    "2 mol",
                    "22.4 mol"
                ],
                "dogru": "1 mol",
                "aciklama": "İdeal gazın STP'de (0°C, 1 atm) hacmi 22.4 L/mol'dür. 22.4 L hacim kaplayan gaz 1 moldür (Avogadro hipotezi).",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir tepkimede katalizörün görevi nedir?",
                "secenekler": [
                    "Tepkimeyi yavaşlatır",
                    "Aktive enerjisini düşürerek tepkimeyi hızlandırır",
                    "Ürün miktarını artırır",
                    "Tepkimeyi durdurur"
                ],
                "dogru": "Aktive enerjisini düşürerek tepkimeyi hızlandırır",
                "aciklama": "Katalizör, aktive enerjisini düşürerek tepkimenin daha hızlı gerçekleşmesini sağlar. Katalizör tepkimede tükenmez ve ürün miktarını değiştirmez.",
                "zorluk": "Orta"
            }
        ]
    },
    "biyoloji": {
        "title": "Biyoloji Quiz",
        "desc": "Hücrelerden ekosistemlere, canlılar dünyası üzerine geniş bir soru havuzu.",
        "questions": [
            {
                "soru": "Fotosentez olayında bitkiler aşağıdakilerden hangisini üretir?",
                "secenekler": [
                    "Karbondioksit ve su",
                    "Glikoz ve oksijen",
                    "Azot ve hidrojen",
                    "Metan ve karbondioksit"
                ],
                "dogru": "Glikoz ve oksijen",
                "aciklama": "Fotosentezde bitkiler ışık enerjisini kullanarak CO₂ ve sudan glikoz (besin) ve oksijen üretir. 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.",
                "zorluk": "Kolay"
            },
            {
                "soru": "DNA molekülünün yapısında aşağıdaki bazlardan hangisi bulunmaz?",
                "secenekler": [
                    "Adenin",
                    "Guanin",
                    "Sitozin",
                    "Urasil"
                ],
                "dogru": "Urasil",
                "aciklama": "DNA'da A, T, G, C bazları bulunur. Urasil (U) sadece RNA'da bulunur, DNA'da timin (T) vardır. A-T ve G-C eşleşir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Mitokondri'nin hücredeki temel görevi nedir?",
                "secenekler": [
                    "Protein sentezi",
                    "Enerji (ATP) üretimi",
                    "Atık madde parçalanması",
                    "Fotosentez"
                ],
                "dogru": "Enerji (ATP) üretimi",
                "aciklama": "Mitokondri, hücrenin enerji santralidir. Oksijenli solunumla ATP (enerji) üretir. Kendi DNA'sı vardır (maternal kalıtım).",
                "zorluk": "Kolay"
            },
            {
                "soru": "Aşağıdakilerden hangisi bir bitki hücresinde bulunur ama hayvan hücresinde bulunmaz?",
                "secenekler": [
                    "Çekirdek",
                    "Mitokondri",
                    "Hücre çeperi (duvarı)",
                    "Ribozom"
                ],
                "dogru": "Hücre çeperi (duvarı)",
                "aciklama": "Hücre çeperi (duvarı) sadece bitki hücrelerinde bulunur. Selülozdan oluşur. Hayvan hücrelerinde bulunmaz.",
                "zorluk": "Kolay"
            },
            {
                "soru": "İnsanda kanı vücuda pompalayan organ hangisidir?",
                "secenekler": [
                    "Akciğer",
                    "Karaciğer",
                    "Kalp",
                    "Böbrek"
                ],
                "dogru": "Kalp",
                "aciklama": "Kalp, kanı vücuda pompalayan kasılı bir organdır. Sağ ve sol karıncık ve kulakçıklardan oluşur. Günde ~100.000 kez atar.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir genin ifade edilmesi (protein üretimi) sürecine ne denir?",
                "secenekler": [
                    "Replikasyon",
                    "Transkripsiyon ve translasyon",
                    "Mutasyon",
                    "Fotosentez"
                ],
                "dogru": "Transkripsiyon ve translasyon",
                "aciklama": "Gen ifadesi iki aşamadan oluşur: transkripsiyon (DNA→mRNA) ve translasyon (mRNA→protein). Merkezi dogmanın temelidir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Mayoz bölünme sonucu kaç hücre oluşur ve kromozom sayısı nasıl değişir?",
                "secenekler": [
                    "2 hücre, aynı kromozom sayısı",
                    "4 hücre, kromozom sayısı yarıya iner",
                    "4 hücre, kromozom sayısı iki katına çıkar",
                    "2 hücre, kromozom sayısı yarıya iner"
                ],
                "dogru": "4 hücre, kromozom sayısı yarıya iner",
                "aciklama": "Mayoz bölünmede bir hücreden 4 hücre oluşur ve kromozom sayısı yarıya iner (diploit → haploit). Üreme hücrelerini üretir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir canlının çevresine uyum sağlaması için doğal seleksiyon mekanizmasını öneren bilim insanı kimdir?",
                "secenekler": [
                    "Mendel",
                    "Darwin",
                    "Pasteur",
                    "Linne"
                ],
                "dogru": "Darwin",
                "aciklama": "Charles Darwin, doğal seleksiyon mekanizmasını önermiştir. Ortama en iyi uyum sağlayan bireyler hayatta kalır ve ürer.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir protein molekülünün birincil yapısı neyi belirtir?",
                "secenekler": [
                    "Üç boyutlu katlanmış şekil",
                    "Aminoasit dizilim sırası",
                    "İki veya daha fazla polipeptid zinciri",
                    "Proteinin işlevi"
                ],
                "dogru": "Aminoasit dizilim sırası",
                "aciklama": "Proteinin birincil yapısı, aminoasitlerin dizilim sırasını belirtir. Bu sıra, DNA'daki gen tarafından belirlenir.",
                "zorluk": "Orta"
            },
            {
                "soru": "İnsanda oksijen taşıyan kan hücresi aşağıdakilerden hangisidir?",
                "secenekler": [
                    "Akyuvar (lökosit)",
                    "Alyuvar (eritrosit)",
                    "Trombosit",
                    "Plazma"
                ],
                "dogru": "Alyuvar (eritrosit)",
                "aciklama": "Alyuvarlar (eritrositler), hemoglobin taşıyarak oksijeni akciğerlerden dokulara taşır. Çekirdeksizdirler, disk şeklindedirler.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir besin zincirinde üretici olarak aşağıdakilerden hangisi görev yapar?",
                "secenekler": [
                    "Otçul hayvan",
                    "Etçil hayvan",
                    "Yeşil bitki",
                    "Ayrıştırıcı"
                ],
                "dogru": "Yeşil bitki",
                "aciklama": "Besin zincirinde üretici (ototrof), fotosentez yapan yeşil bitkilerdir. Güneş enerjisini besine dönüştürürler.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir hücrede protein sentezi aşağıdaki organellerden hangisinde gerçekleşir?",
                "secenekler": [
                    "Mitokondri",
                    "Ribozom",
                    "Golgi cisimciği",
                    "Lizozom"
                ],
                "dogru": "Ribozom",
                "aciklama": "Ribozom, hücrede protein sentezi yapılan organelidir. mRNA'daki genetik koda göre aminoasitleri birleştirir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir nöronun bir başka nörona veya hücreye iletişim kurduğu bağlantı noktasına ne denir?",
                "secenekler": [
                    "Sinaps",
                    "Akson",
                    "Dendrit",
                    "Miyelin kılıf"
                ],
                "dogru": "Sinaps",
                "aciklama": "Sinaps, iki nöron arasındaki bağlantı noktasıdır. Elektriksel veya kimyasal (nörotransmitter) sinyal iletimi burada olur.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir insanın kan grubu AB ise, aşağıdaki kan gruplarından hangisini alabilir?",
                "secenekler": [
                    "Sadece A",
                    "Sadece B",
                    "A ve B",
                    "Tüm kan grupları"
                ],
                "dogru": "A ve B",
                "aciklama": "AB kan grubu evrensel alıcıdır. Hem A hem B antijenlerini taşıdığından A, B, AB ve 0 kan gruplarını alabilir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir DNA molekülünde adenin oranı %30 ise, guanin oranı kaçtır?",
                "secenekler": [
                    "20%",
                    "30%",
                    "40%",
                    "50%"
                ],
                "dogru": "20%",
                "aciklama": "Chargaff kuralına göre A=T, G=C. A=%30 ise T=%30. Geriye %40 kalır, G=C=%20. A+T+G+C = %100.",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir bitkinin köklerinden yapraklarına su taşıyan doku aşağıdakilerden hangisidir?",
                "secenekler": [
                    "Floem",
                    "Ksilem",
                    "Epidermis",
                    "Kambiyum"
                ],
                "dogru": "Ksilem",
                "aciklama": "Ksilem, köklerden yapraklara su ve mineralleri taşıyan dokudur. Odunsu yapısı vardır. Floem ise besin (öz suyu) taşır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir canlının kalıtsal özelliklerini belirleyen molekül hangisidir?",
                "secenekler": [
                    "Protein",
                    "DNA",
                    "Lipid",
                    "Karbonhidrat"
                ],
                "dogru": "DNA",
                "aciklama": "DNA, canlının kalıtsal özelliklerini belirleyen moleküldür. Genetik bilgiyi taşır ve sonraki nesle aktarır.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir hücrede sindirilmiş maddeleri paketleyip gönderen organel hangisidir?",
                "secenekler": [
                    "Ribozom",
                    "Golgi cisimciği",
                    "Mitokondri",
                    "Çekirdek"
                ],
                "dogru": "Golgi cisimciği",
                "aciklama": "Golgi cisimciği, protein ve lipidleri paketleyip hedeflere gönderen organeldir. Hücrenin postanesi olarak da bilinir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir canlı hücrede oksijenli solunumun gerçekleştiği organel hangisidir?",
                "secenekler": [
                    "Kloroplast",
                    "Mitokondri",
                    "Ribozom",
                    "Golgi"
                ],
                "dogru": "Mitokondri",
                "aciklama": "Mitokondri, oksijenli solunumun gerçekleştiği organeldir. Glikozu parçalayarak ATP (enerji) üretir. Hücrenin enerji santralidir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir hücre bölünmesinde kromozomların ikiye ayrıldığı evre hangisidir?",
                "secenekler": [
                    "İnterfaz",
                    "Anafaz",
                    "Metafaz",
                    "Telofaz"
                ],
                "dogru": "Anafaz",
                "aciklama": "Anafaz evresinde, kardeş kromatidler ikiye ayrılarak hücrenin kutuplarına doğru hareket eder.",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir kalıtım özelliğinde bir genin farklı versiyonlarına ne denir?",
                "secenekler": [
                    "Kromozom",
                    "Alel",
                    "Genom",
                    "Mutasyon"
                ],
                "dogru": "Alel",
                "aciklama": "Alel, bir genin farklı versiyonlarıdır. Örn: göz rengi geninde kahverengi ve mavi aleller vardır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir ekosistemde enerji akışı aşağıdaki yönlarden hangisine gerçekleşir?",
                "secenekler": [
                    "Üretici → Ayrıştırıcı → Tüketici",
                    "Üretici → Tüketici → Ayrıştırıcı",
                    "Ayrıştırıcı → Üretici → Tüketici",
                    "Tüketici → Üretici → Ayrıştırıcı"
                ],
                "dogru": "Üretici → Tüketici → Ayrıştırıcı",
                "aciklama": "Enerji akışı üreticiden başlar (bitki), tüketiciye (hayvan) geçer ve ayrıştırıcıya (mantar, bakteri) ulaşır. Enerji geri dönmez.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir insanda idrar üretiminden sorumlu organ hangisidir?",
                "secenekler": [
                    "Karaciğer",
                    "Böbrek",
                    "Akciğer",
                    "Dalak"
                ],
                "dogru": "Böbrek",
                "aciklama": "Böbrekler, kandaki atık maddeleri süzerek idrar üretir. İki adettir. Kanı süzer ve sıvı dengesini korur.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir canlının bireysel gelişimi sırasında hücre sayısının artması süreci nedir?",
                "secenekler": [
                    "Büyüme",
                    "Üreme",
                    "Solunum",
                    "Beslenme"
                ],
                "dogru": "Büyüme",
                "aciklama": "Büyüme, canlının hücre sayısının artması ve hacminin büyümesidir. Hücre bölünmesi (mitoz) ile gerçekleşir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir proteinin üç boyutlu şekli aşağıdakilerden hangisine bağlıdır?",
                "secenekler": [
                    "Aminoasit sayısı",
                    "Aminoasit dizilimi",
                    "Proteinin rengi",
                    "Proteinin büyüklüğü"
                ],
                "dogru": "Aminoasit dizilimi",
                "aciklama": "Proteinin üç boyutlu şekli (katlanması), aminoasit dizilimine bağlıdır. Dizilim, proteinin işlevini belirler.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir insanda şeker hastalığının (diyabet) temel nedeni nedir?",
                "secenekler": [
                    "Tiroksin eksikliği",
                    "İnsülin eksikliği veya direnci",
                    "Adrenalin fazlalığı",
                    "Büyüme hormonu eksikliği"
                ],
                "dogru": "İnsülin eksikliği veya direnci",
                "aciklama": "Diyabet, insülin eksikliği (Tip 1) veya insülin direnci (Tip 2) nedeniyle oluşur. Pankreas insülin üretir, insülin kan şekerini düşürür.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir bitkide döllenme sonrası tohumu oluşturan yapı hangisidir?",
                "secenekler": [
                    "Yumurtalık",
                    "Toz kesesi",
                    "Taç yaprak",
                    "Dişicik borusu"
                ],
                "dogru": "Yumurtalık",
                "aciklama": "Yumurtalık, döllenme sonrası gelişerek meyveyi ve içindeki tohumları oluşturur. Tohum, embriyo ve besin deposu içerir.",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir canlının bireysel gelişiminde zigottan başlayıp ergin bireye ulaşmasına ne denir?",
                "secenekler": [
                    "Üreme",
                    "Büyüme ve gelişme",
                    "Döllenme",
                    "Mutasyon"
                ],
                "dogru": "Büyüme ve gelişme",
                "aciklama": "Büyüme ve gelişme, zigottan başlayıp ergin bireye ulaşma sürecidir. Büyüme hücre sayısının artması, gelişme hücrelerin farklılaşmasıdır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir hücrede atık maddelerin parçalanmasından sorumlu organel hangisidir?",
                "secenekler": [
                    "Ribozom",
                    "Lizozom",
                    "Mitokondri",
                    "Golgi"
                ],
                "dogru": "Lizozom",
                "aciklama": "Lizozom, hücrede sindirim enzimleri içeren organeldir. Atık maddeleri ve yaşlı organelleri parçalar. Hücrenin temizlikçisidir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir canlının çevreye uyum sağlaması için bazı özelliklerinin değişmesi süreci nedir?",
                "secenekler": [
                    "Mutasyon",
                    "Adaptasyon",
                    "Üreme",
                    "Büyüme"
                ],
                "dogru": "Adaptasyon",
                "aciklama": "Adaptasyon, bir canlının çevreye uyum sağlamak için bazı özelliklerini değiştirmesi veya geliştirmesidir. Doğal seleksiyonla gerçekleşir.",
                "zorluk": "Kolay"
            }
        ]
    },
    "matematik": {
        "title": "Matematik Quiz",
        "desc": "Cebir, geometri ve temel formüllerden geniş bir soru havuzu.",
        "questions": [
            {
                "soru": "Bir dik üçgende dik kenarlar 3 ve 4 birim ise hipotenüs kaç birimdir?",
                "secenekler": [
                    "5",
                    "6",
                    "7",
                    "8"
                ],
                "dogru": "5",
                "aciklama": "Pisagor teoremi: c² = a² + b² = 9 + 16 = 25. c = 5. 3-4-5 üçgeni en bilinen Pisagor üçlüsüdür.",
                "zorluk": "Kolay"
            },
            {
                "soru": "x² - 5x + 6 = 0 denkleminin kökleri nedir?",
                "secenekler": [
                    "x = 2 ve x = 3",
                    "x = 1 ve x = 6",
                    "x = -2 ve x = -3",
                    "x = -1 ve x = -6"
                ],
                "dogru": "x = 2 ve x = 3",
                "aciklama": "Çarpanlara ayırma: x² - 5x + 6 = (x-2)(x-3) = 0. Kökler x=2 ve x=3. Toplamları 5, çarpımları 6.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir çemberin yarıçapı 5 birim ise alanı kaç birim karedir? (π ≈ 3.14)",
                "secenekler": [
                    "15.7",
                    "31.4",
                    "78.5",
                    "157"
                ],
                "dogru": "78.5",
                "aciklama": "A = πr² = 3.14 × 25 = 78.5. Dairenin alanı, yarıçapın karesinin π katıdır.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir fonksiyon f(x) = 2x + 3 ise, f(5) kaçtır?",
                "secenekler": [
                    "8",
                    "10",
                    "13",
                    "16"
                ],
                "dogru": "13",
                "aciklama": "f(5) = 2×5 + 3 = 10 + 3 = 13. Değer yerine koyma yöntemiyle bulunur.",
                "zorluk": "Kolay"
            },
            {
                "soru": "log₂(8) kaçtır?",
                "secenekler": [
                    "2",
                    "3",
                    "4",
                    "8"
                ],
                "dogru": "3",
                "aciklama": "log₂(8) = x ise 2ˣ = 8. 2³ = 8, bu yüzden x = 3. Logaritma, üstel işlemin tersidir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir üçgenin iç açıları toplamı kaç derecedir?",
                "secenekler": [
                    "90°",
                    "180°",
                    "270°",
                    "360°"
                ],
                "dogru": "180°",
                "aciklama": "Her üçgenin iç açıları toplamı 180°'dir. Bu, Öklid geometrisinin temel özelliklerinden biridir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir küpün bir kenarı 3 birim ise hacmi kaç birim küptür?",
                "secenekler": [
                    "9",
                    "12",
                    "18",
                    "27"
                ],
                "dogru": "27",
                "aciklama": "Küpün hacmi V = a³ = 3³ = 27. Kenar uzunluğunun küpü alınır.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir doğrusal denklem sisteminde 2x + y = 7 ve x - y = 2 ise x kaçtır?",
                "secenekler": [
                    "1",
                    "2",
                    "3",
                    "4"
                ],
                "dogru": "3",
                "aciklama": "İki denklemi toplarsak: 3x = 9, x = 3. Yerine koyarsak y = 1. x = 3, y = 1 çözümüdür.",
                "zorluk": "Orta"
            },
            {
                "soru": "Sin(30°) + cos(60°) kaçtır?",
                "secenekler": [
                    "0",
                    "0.5",
                    "1",
                    "1.5"
                ],
                "dogru": "1",
                "aciklama": "sin(30°) = 0.5 ve cos(60°) = 0.5. Toplam = 0.5 + 0.5 = 1. Bu değerler birim çemberden bilinir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir dizide 2, 4, 8, 16, ... pattern ise 6. terim kaçtır?",
                "secenekler": [
                    "32",
                    "64",
                    "128",
                    "256"
                ],
                "dogru": "64",
                "aciklama": "Dizi 2 ile başlar ve her terim bir öncekinin 2 katıdır (2ⁿ). 6. terim = 2⁶ = 64. Geometrik dizi.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir fonksiyonun türevi f(x) = x³ + 2x ise, f'(x) nedir?",
                "secenekler": [
                    "3x² + 2",
                    "x² + 2",
                    "3x + 2",
                    "x³ + 2"
                ],
                "dogru": "3x² + 2",
                "aciklama": "Türev kuralı: xⁿ → n·xⁿ⁻¹. f'(x) = 3x² + 2. Her terimin türevi ayrı ayrı alınır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir kürenin yarıçapı 2 birim ise yüzey alanı kaçtır? (π ≈ 3.14)",
                "secenekler": [
                    "12.56",
                    "25.12",
                    "50.24",
                    "100.48"
                ],
                "dogru": "50.24",
                "aciklama": "Küre yüzey alanı A = 4πr² = 4 × 3.14 × 4 = 50.24. Yarıçapın karesi 4π ile çarpılır.",
                "zorluk": "Orta"
            },
            {
                "soru": "10! / 8! kaçtır?",
                "secenekler": [
                    "10",
                    "80",
                    "90",
                    "100"
                ],
                "dogru": "90",
                "aciklama": "10!/8! = 10 × 9 = 90. Çünkü 10! = 10 × 9 × 8!, 8! sadeleşir. Permutasyon hesaplamalarında kullanılır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir ikinci dereceden denklem 2x² - 8 = 0 ise x nedir?",
                "secenekler": [
                    "x = ±2",
                    "x = ±4",
                    "x = ±8",
                    "x = 2"
                ],
                "dogru": "x = ±2",
                "aciklama": "2x² - 8 = 0 → 2x² = 8 → x² = 4 → x = ±2. Basit ikinci dereceden denklem çözümü.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir üçgenin tabanı 8 ve yüksekliği 5 ise alanı kaçtır?",
                "secenekler": [
                    "13",
                    "20",
                    "40",
                    "16"
                ],
                "dogru": "20",
                "aciklama": "Üçgen alanı A = (1/2) × taban × yükseklik = (1/2) × 8 × 5 = 20. Taban ve yüksekliğin çarpımının yarısıdır.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir düzlemde iki doğru kesiştiğinde oluşan zıt açılar nasıl ilişkilidir?",
                "secenekler": [
                    "Eştir",
                    "Tümlerdir",
                    "Bütünlerdir",
                    "İlişkisizdir"
                ],
                "dogru": "Eştir",
                "aciklama": "Kesişen iki doğrunun oluşturduğu zıt (ters) açılar birbirine eşittir. Tümler açıların toplamı 90°, bütünler 180°'dir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir sayının %20'si 30 ise sayı kaçtır?",
                "secenekler": [
                    "120",
                    "150",
                    "180",
                    "200"
                ],
                "dogru": "150",
                "aciklama": "%20 = 30 ise sayı = 30 / 0.20 = 150. Yüzde bulurken parça/yüzde oranı kullanılır.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir fonksiyon f(x) = x² - 4x + 3 ise, f(1) kaçtır?",
                "secenekler": [
                    "0",
                    "1",
                    "-1",
                    "3"
                ],
                "dogru": "0",
                "aciklama": "f(1) = 1 - 4 + 3 = 0. Değer yerine koyma yöntemiyle hesaplanır. Ayrıca (x-1)(x-3) = 0 kökleri x=1 ve x=3'tür.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir silindirin taban yarıçapı 3 ve yüksekliği 5 ise hacmi kaçtır? (π ≈ 3.14)",
                "secenekler": [
                    "47.1",
                    "141.3",
                    "94.2",
                    "188.4"
                ],
                "dogru": "141.3",
                "aciklama": "Silindir hacmi V = πr²h = 3.14 × 9 × 5 = 141.3. Taban alanı × yükseklik.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir dizide 5, 10, 15, 20, ... pattern ise 10. terim kaçtır?",
                "secenekler": [
                    "45",
                    "50",
                    "55",
                    "100"
                ],
                "dogru": "50",
                "aciklama": "Dizi aritmetik, ortak fark 5. 10. terim = 5 + (10-1)×5 = 5 + 45 = 50. Aritmetik dizi formülü: aₙ = a₁ + (n-1)d.",
                "zorluk": "Orta"
            },
            {
                "soru": "cos²(x) + sin²(x) kaçtır?",
                "secenekler": [
                    "0",
                    "1",
                    "2",
                    "x'e bağlı"
                ],
                "dogru": "1",
                "aciklama": "Pisagor trigonometrik özdeşliği: cos²(x) + sin²(x) = 1. Bu, tüm x değerleri için geçerlidir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir sayının karesi kendisine eşitse, bu sayı aşağıdakilerden hangisi olabilir?",
                "secenekler": [
                    "0 ve 1",
                    "1 ve 2",
                    "0 ve -1",
                    "Sadece 1"
                ],
                "dogru": "0 ve 1",
                "aciklama": "x² = x → x² - x = 0 → x(x-1) = 0. Çözümler x = 0 ve x = 1. Sadece bu iki sayı karesine eşittir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir çokgenin iç açıları toplamı 1080° ise kaç kenarlıdır?",
                "secenekler": [
                    "6",
                    "7",
                    "8",
                    "9"
                ],
                "dogru": "8",
                "aciklama": "İç açıların toplamı = (n-2) × 180°. 1080 = (n-2) × 180 → n-2 = 6 → n = 8. Sekizgen.",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir doğrunun denklemi y = 3x - 2 ise, eğimi kaçtır?",
                "secenekler": [
                    "-2",
                    "2",
                    "3",
                    "-3"
                ],
                "dogru": "3",
                "aciklama": "y = mx + n formunda m eğimi gösterir. Burada m = 3'tür. Eğim, x'teki birim artış başına y'deki değişimdir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir permütasyonda 5 farklı kitap bir rafa kaç farklı şekilde dizilebilir?",
                "secenekler": [
                    "25",
                    "60",
                    "120",
                    "720"
                ],
                "dogru": "120",
                "aciklama": "5! = 5 × 4 × 3 × 2 × 1 = 120. n farklı nesnenin diziliş sayısı n! ile bulunur.",
                "zorluk": "Orta"
            }
        ]
    },
    "astronomi": {
        "title": "Astronomi Quiz",
        "desc": "Gezegenler, yıldızlar ve evren üzerine geniş bir soru havuzu.",
        "questions": [
            {
                "soru": "Güneş sistemimizde kaç gezegen vardır?",
                "secenekler": [
                    "7",
                    "8",
                    "9",
                    "10"
                ],
                "dogru": "8",
                "aciklama": "2006'da Plüton cüce gezegen sınıfına alınmıştır. Güneş sisteminde 8 gezegen vardır: Merkür, Venüs, Dünya, Mars, Jüpiter, Satürn, Uranüs, Neptün.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Güneş enerjisini üreten tepkime nedir?",
                "secenekler": [
                    "Kimyasal yanma",
                    "Nükleer füzyon",
                    "Nükleer fisyon",
                    "Elektromanyetik indüksiyon"
                ],
                "dogru": "Nükleer füzyon",
                "aciklama": "Güneşte hidrojen çekirdekleri helyuma birleşerek (nükleer füzyon) devasa miktarda enerji üretir. Bu, Güneş'in enerji kaynağıdır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir ışık yılı neyi ölçer?",
                "secenekler": [
                    "Zamanı",
                    "Mesafeyi",
                    "Hızı",
                    "Kütleyi"
                ],
                "dogru": "Mesafeyi",
                "aciklama": "Işık yılı, ışığın bir yılda kat ettiği mesafedir (~9.46 × 10¹² km). Mesafe birimidir, zaman birimi değildir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Ay'ın evrelerinden dolunayda Ay nasıl görünür?",
                "secenekler": [
                    "Tamamen karanlık",
                    "Tamamen parlak (tam disk)",
                    "Yarım parlak",
                    "Hilal şeklinde"
                ],
                "dogru": "Tamamen parlak (tam disk)",
                "aciklama": "Dolunayda, Dünya Güneş ile Ay arasındadır. Ay'ın Güneş'e bakan yüzü tamamen Dünya'dan görünür.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir yıldızın parlaklığını belirleyen temel faktörler aşağıdakilerden hangileridir?",
                "secenekler": [
                    "Boyut ve sıcaklık",
                    "Uzaklık ve renk",
                    "Yaş ve kütle",
                    "Boyut, sıcaklık ve uzaklık"
                ],
                "dogru": "Boyut, sıcaklık ve uzaklık",
                "aciklama": "Bir yıldızın parlaklığı; boyutuna, sıcaklığına ve Dünya'ya olan uzaklığına bağlıdır. Yüzey sıcaklığı rengi belirler.",
                "zorluk": "Orta"
            },
            {
                "soru": "Güneş sistemimizdeki en büyük gezegen hangisidir?",
                "secenekler": [
                    "Satürn",
                    "Jüpiter",
                    "Uranüs",
                    "Neptün"
                ],
                "dogru": "Jüpiter",
                "aciklama": "Jüpiter, Güneş sistemimizdeki en büyük gezegendir. Hacmi Dünya'nın yaklaşık 1300 katıdır. 79'dan fazla uydusu vardır.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir gök cisminin ışığı bükerek arkasındaki cisimleri büyütmesi olayına ne denir?",
                "secenekler": [
                    "Yansıma",
                    "Kırınım (Gravitasyon lens)",
                    "Saçılma",
                    "Girişim"
                ],
                "dogru": "Kırınım (Gravitasyon lens)",
                "aciklama": "Kütleçekim lensi, büyük gök cisimlerinin ışığı bükerek arkasındaki cisimleri büyütüp çarpıtmasıdır. Einstein'ın genel görelilik kuramıyla açıklanır.",
                "zorluk": "Zor"
            },
            {
                "soru": "Dünya'nın ekseni eğikliği aşağıdaki olaylardan hangisine neden olur?",
                "secenekler": [
                    "Gel-git",
                    "Mevsimler",
                    "Güneş tutulması",
                    "Ay tutulması"
                ],
                "dogru": "Mevsimler",
                "aciklama": "Dünya'nın 23.5° eğik ekseni, mevsimlerin oluşmasına neden olur. Yıllık dönme sırasında farklı enlemler farklı miktarda Güneş ışığı alır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir kara deliğin olay ufku (event horizon) nedir?",
                "secenekler": [
                    "Kara deliğin merkezi",
                    "Işığın bile kaçamadığı sınır",
                    "Kara deliğin dış görünür yüzeyi",
                    "Kara deliğin uyduları"
                ],
                "dogru": "Işığın bile kaçamadığı sınır",
                "aciklama": "Olay ufku, kara deliğin çekim gücünün ışık hızından bile daha büyük olduğu sınırdır. Bu sınırı geçen hiçbir şey (ışık dahil) geri dönemez.",
                "zorluk": "Zor"
            },
            {
                "soru": "Samanyolu galaksisinin merkezindeki süper kütleli gök cisminin türü nedir?",
                "secenekler": [
                    "Nötron yıldızı",
                    "Beyaz cüce",
                    "Kara delik (Sgr A*)",
                    "Kırmızı dev"
                ],
                "dogru": "Kara delik (Sgr A*)",
                "aciklama": "Samanyolu'nun merkezinde Sgr A* adlı süper kütleli kara delik bulunur. Kütlesi Güneş'in ~4 milyon katıdır.",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir göktaşı (meteor) Dünya'ya ulaştığında ne ad alır?",
                "secenekler": [
                    "Kuyruklu yıldız",
                    "Asteroit",
                    "Meteorit",
                    "Uydu"
                ],
                "dogru": "Meteorit",
                "aciklama": "Göktaşı atmosferde yanarken meteor adını alır. Yüzeye ulaşan parçalara meteorit denir. Asteroit ise uzayda dolaşan kayaç parçasıdır.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir yıldızın yaşam döngüsünde kırmızı dev aşamasından sonra oluşabilecek gök cismi aşağıdakilerden hangisidir?",
                "secenekler": [
                    "Kara delik",
                    "Beyaz cüce",
                    "Nötron yıldızı",
                    "Hepsi"
                ],
                "dogru": "Hepsi",
                "aciklama": "Yıldızın kütlesine bağlı olarak kırmızı devden sonra beyaz cüce (küçük kütleli), nötron yıldızı (orta kütleli) veya kara delik (büyük kütleli) oluşur.",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir gezegenin Güneş etrafındaki bir turuna ne denir?",
                "secenekler": [
                    "Dönme (rotation)",
                    "Devrim (revolution)",
                    "İklim değişimi",
                    "Gel-git"
                ],
                "dogru": "Devrim (revolution)",
                "aciklama": "Devrim (revolution), bir gezegenin Güneş etrafındaki bir tam turudur. Dönme (rotation) ise gezegenin kendi ekseni etrafındaki dönüşüdür.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir gökbilimci, bir galaksinin bizden uzaklaştığını hangi gözlemle anlar?",
                "secenekler": [
                    "Rengi maviye kayar",
                    "Işığı kırmızıya kayar (redshift)",
                    "Parlaklığı artar",
                    "Boyutu büyür"
                ],
                "dogru": "Işığı kırmızıya kayar (redshift)",
                "aciklama": "Galaksiden gelen ışığın kırmızıya kayması (redshift), galaksinin bizden uzaklaştığını gösterir. Doppler etkisinin ışık versiyonudur. Hubble yasası.",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir yıldızın rengi neyi belirler?",
                "secenekler": [
                    "Yaşını",
                    "Uzaklığını",
                    "Sıcaklığını",
                    "Kütlesini"
                ],
                "dogru": "Sıcaklığını",
                "aciklama": "Yıldızın rengi yüzey sıcaklığını belirler. Mavi yıldızlar sıcak, kırmızı yıldızlar soğuktur. Sıcaklık renk spektrumunu belirler.",
                "zorluk": "Orta"
            }
        ]
    },
    "genel-bilim": {
        "title": "Genel Bilim Quiz",
        "desc": "Farklı bilim dallarından karışık, genel kültür ağırlıklı sorular.",
        "questions": [
            {
                "soru": "Bir bilimsel hipotez test edilebilir olmalı ve aşağıdaki özelliklerden hangisine sahip olmalıdır?",
                "secenekler": [
                    "Kesinlikle doğru olmalı",
                    "Yanlışlanabilir (falsifiable) olmalı",
                    "Herkes tarafından kabul görmeli",
                    "Yasa tarafından onaylanmalı"
                ],
                "dogru": "Yanlışlanabilir (falsifiable) olmalı",
                "aciklama": "Bir hipotez bilimsel olmak için test edilebilir ve yanlışlanabilir (falsifiable) olmalıdır. Karl Popper'ın bilim felsefesinin temelidir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir deneyde değiştirilmeyen ve sabit tutulan faktörlere ne denir?",
                "secenekler": [
                    "Bağımsız değişken",
                    "Bağımlı değişken",
                    "Kontrol değişkeni",
                    "Hipotez"
                ],
                "dogru": "Kontrol değişkeni",
                "aciklama": "Kontrol değişkeni, deneyde sabit tutulan faktörlerdir. Deneyin geçerliliği için diğer faktörlerin etkisi engellenir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir bilimsel kuram (teori) aşağıdakilerden hangisidir?",
                "secenekler": [
                    "Sadece bir tahmin",
                    "Kapsamlı testlerden geçmiş açıklama",
                    "Bir hipotez ile aynı şey",
                    "Kanıtlanmamış bir fikir"
                ],
                "dogru": "Kapsamlı testlerden geçmiş açıklama",
                "aciklama": "Bilimsel kuram, çok sayıda testten geçmiş ve geniş kapsamlı kanıtlarla desteklenmiş açıklamadır. Hipotezden daha güçlüdür ama kesin bilgi değildir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir deneyde ölçülen ve başka bir faktöre bağlı olarak değişen faktöre ne denir?",
                "secenekler": [
                    "Bağımsız değişken",
                    "Bağımlı değişken",
                    "Kontrol grubu",
                    "Hipotez"
                ],
                "dogru": "Bağımlı değişken",
                "aciklama": "Bağımlı değişken, deneyde ölçülen ve bağımsız değişkene bağlı olarak değişen faktördür. Sonuç değişkenidir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir bilim insanı bir deney sonucunu diğer bilim insanlarıyla paylaşmak için aşağıdakilerden hangisini yapar?",
                "secenekler": [
                    "Sonucu gizli tutar",
                    "Hakemli bir dergide yayınlar",
                    "Sadece öğrencilerine anlatır",
                    "Sonucu bir kitaba yazar"
                ],
                "dogru": "Hakemli bir dergide yayınlar",
                "aciklama": "Bilim insanları sonuçlarını hakemli dergilerde yayınlayarak diğer bilim insanlarıyla paylaşır ve eleştirilere açık hale getirir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir veri setinde en sık tekrar eden değere ne denir?",
                "secenekler": [
                    "Ortalama",
                    "Medyan",
                    "Mod",
                    "Aralık"
                ],
                "dogru": "Mod",
                "aciklama": "Mod, bir veri setinde en sık tekrar eden değerdir. Ortalama tüm değerlerin toplamının sayısına bölümü, medyan ise ortadaki değerdir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir deneyde iki grup arasındaki tek fark bağımsız değişken ise, bu gruplara ne denir?",
                "secenekler": [
                    "Kontrol ve deney grubu",
                    "Öncül ve ardıl grup",
                    "Rastgele ve seçilmiş grup",
                    "Aktif ve pasif grup"
                ],
                "dogru": "Kontrol ve deney grubu",
                "aciklama": "Kontrol grubu (etkisiz tedavi) ve deney grubu (aktif tedavi) arasındaki tek fark bağımsız değişkendir. Bu, nedensellik kurulmasını sağlar.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir bilim insanı, gözlemlerine dayanarak bir açıklama önerdiğinde bu açıklamaya ne denir?",
                "secenekler": [
                    "Kuram",
                    "Yasa",
                    "Hipotez",
                    "Aksiyom"
                ],
                "dogru": "Hipotez",
                "aciklama": "Hipotez, gözlemlere dayanarak önerilen test edilebilir açıklamadır. Test edilip doğrulanırsa kuram olabilir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir veri setindeki değerlerin ortalamadan ne kadar saptığını ölçen istatistiksel değer nedir?",
                "secenekler": [
                    "Medyan",
                    "Standart sapma",
                    "Mod",
                    "Aralık"
                ],
                "dogru": "Standart sapma",
                "aciklama": "Standart sapma, verilerin ortalamadan ne kadar saptığını ölçer. Büyük standart sapma, verilerin yayıldığını gösterir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir bilimsel yasa (law) aşağıdakilerden hangisini yapar?",
                "secenekler": [
                    "Bir olayı açıklar",
                    "Bir olayın nasıl olduğunu betimler",
                    "Yeni bir hipotez önerir",
                    "Bir kuramı çürütür"
                ],
                "dogru": "Bir olayın nasıl olduğunu betimler",
                "aciklama": "Bilimsel yasa, bir olayın nasıl olduğunu betimler (örn: Newton'un hareket yasaları). Neden olduğunu açıklamaz (onu kuram yapar).",
                "zorluk": "Zor"
            },
            {
                "soru": "Bir grafikte x eksenindeki değişken genellikle aşağıdakilerden hangisidir?",
                "secenekler": [
                    "Bağımlı değişken",
                    "Bağımsız değişken",
                    "Kontrol değişkeni",
                    "Sabit değer"
                ],
                "dogru": "Bağımsız değişken",
                "aciklama": "Grafikte x ekseni genellikle bağımsız değişkeni (neden), y ekseni ise bağımlı değişkeni (sonuç) gösterir.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir deneyin sonuçları tekrarlanabilir olması neden önemlidir?",
                "secenekler": [
                    "Daha uzun sürer",
                    "Sonuçların güvenilir olduğunu gösterir",
                    "Daha fazla para harcanır",
                    "Daha az insan gerektirir"
                ],
                "dogru": "Sonuçların güvenilir olduğunu gösterir",
                "aciklama": "Deney sonuçlarının tekrarlanabilir olması, sonuçların güvenilir ve geçerli olduğunu gösterir. Başka bilim insanları aynı sonucu alabilmelidir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir veri setinde en büyük ve en küçük değer arasındaki farka ne denir?",
                "secenekler": [
                    "Ortalama",
                    "Medyan",
                    "Aralık (range)",
                    "Mod"
                ],
                "dogru": "Aralık (range)",
                "aciklama": "Aralık (range), veri setindeki en büyük değer ile en küçük değer arasındaki farktır. Verinin yayılmasını gösteren basit bir ölçüdür.",
                "zorluk": "Kolay"
            },
            {
                "soru": "Bir bilim insanı bir deneyin sonucunu raporlarken aşağıdakilerden hangisini yapmamalıdır?",
                "secenekler": [
                    "Verileri doğru rapor eder",
                    "Yöntemi açıklar",
                    "Verileri kendi hipotezini desteklemek için çarpıtır",
                    "Sonuçların sınırlamalarını belirtir"
                ],
                "dogru": "Verileri kendi hipotezini desteklemek için çarpıtır",
                "aciklama": "Verileri çarpıtmak bilimsel etiğe aykırıdır. Bilim insanları verileri olduğu gibi rapor etmeli ve sınırlamaları açıkça belirtmelidir.",
                "zorluk": "Orta"
            },
            {
                "soru": "Bir bilimsel modelin amacı aşağıdakilerden hangisidir?",
                "secenekler": [
                    "Karmaşık bir sistemi basitleştirerek anlamak",
                    "Gerçeğin tam bir kopyasını oluşturmak",
                    "Sadece güzel görünmek",
                    "Hipotezleri çürütmek"
                ],
                "dogru": "Karmaşık bir sistemi basitleştirerek anlamak",
                "aciklama": "Bilimsel modeller, karmaşık sistemleri basitleştirerek anlamamıza yardımcı olur. Gerçeğin tam kopyası değildir ama önemli özellikleri temsil eder.",
                "zorluk": "Orta"
            }
        ]
    }
};
