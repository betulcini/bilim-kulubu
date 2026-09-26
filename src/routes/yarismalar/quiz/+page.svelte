<script>
    import PageHeader from '$lib/components/PageHeader.svelte';
    import { sfx } from '$lib/sound.js';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    // Query parametresinden konuyu al (örn: ?konu=fizik)
    $: konu =$page.url.searchParams.get('konu') || 'fizik';

    // Konulara göre soru havuzları
    const quizData = {
        fizik: {
            title: 'Fizik Hızlı Quiz',
            desc: 'Kuvvet, enerji, ışık ve temel fizik yasaları üzerine bilgi turu.',
            questions: [
                {
                    soru: 'Newton\'un ikinci hareket yasasına göre (F = m·a), kütlesi 2 kg olan bir cismi 6 m/s² ivmeyle hızlandırmak için kaç Newton kuvvet gerekir?',
                    secenekler: ['6 N', '8 N', '12 N', '36 N'],
                    dogru: '12 N',
                    aciklama: 'F = m · a formülünden F = 2 · 6 = 12 Newton bulunur.'
                },
                {
                    soru: 'Aşağıdakilerden hangisi vektörel bir büyüklüktür?',
                    secenekler: ['Kütle', 'Sıcaklık', 'Hız', 'Zaman'],
                    dogru: 'Hız',
                    aciklama: 'Vektörel büyüklükler yön ve doğrultu gerektirir; hız vektöreldir, kütle ve zaman skalerdir.'
                },
                {
                    soru: 'Işığın boşluktaki hızı (c) yaklaşık olarak saniyede kaç kilometredir?',
                    secenekler: ['300.000 km', '150.000 km', '3.000.000 km', '30.000 km'],
                    dogru: '300.000 km',
                    aciklama: 'Işık hızı saniyede yaklaşık 3 × 10^8 m/s (300.000 km/sn) kadardır.'
                }
            ]
        },
        biyoloji: {
            title: 'Biyoloji Keşif Quiz',
            desc: 'Hücre organelleri, kalıtım ve canlılar dünyasından temel kavramlar.',
            questions: [
                {
                    soru: 'Ökaryot bir hücrede hücrenin enerji ihtiyacını karşılayan (ATP sentezleyen) temel organel hangisidir?',
                    secenekler: ['Ribozom', 'Mitokondri', 'Golgi Cihazı', 'Endoplazmik Retikulum'],
                    dogru: 'Mitokondri',
                    aciklama: 'Mitokondri, oksijenli solunum yaparak hücrenin ATP ihtiyacını karşılayan enerji merkezidir.'
                },
                {
                    soru: 'Bitki hücrelerinde fotosentez olayının gerçekleştiği organel aşağıdakilerden hangisidir?',
                    secenekler: ['Mitokondri', 'Koful', 'Kloroplast', 'Lizozom'],
                    dogru: 'Kloroplast',
                    aciklama: 'Kloroplast, klorofil pigmenti barındırarak ışık enerjisini kimyasal bağ enerjisine çevirir.'
                },
                {
                    soru: 'DNA molekülünün yapı taşını oluşturan nükleotidin temel bileşenleri nelerdir?',
                    secenekler: [
                        'Glikoz, nişasta, yağ asidi',
                        'Azotlu organik baz, deoksiriboz şekeri, fosfat',
                        'Amino asit, enzim, su',
                        'Glerol, protein, mineral'
                    ],
                    dogru: 'Azotlu organik baz, deoksiriboz şekeri, fosfat',
                    aciklama: 'Bir nükleotit; 5 karbonlu şeker, fosfat grubu ve azotlu organik bazdan oluşur.'
                }
            ]
        },
        astronomi: {
            title: 'Astronomi Görev Quiz',
            desc: 'Gezegenler, yıldız evrimi ve evrenin yapısı üzerine hızlı bir test.',
            questions: [
                {
                    soru: 'Güneş sistemindeki en büyük gezegen hangisidir?',
                    secenekler: ['Satürn', 'Dünya', 'Jüpiter', 'Neptün'],
                    dogru: 'Jüpiter',
                    aciklama: 'Jüpiter, Güneş sisteminin kütle ve hacim olarak en büyük gaz devi gezegenidir.'
                },
                {
                    soru: 'Güneş\'e en yakın olan gezegen aşağıdakilerden hangisidir?',
                    secenekler: ['Venüs', 'Merkür', 'Mars', 'Dünya'],
                    dogru: 'Merkür',
                    aciklama: 'Merkür, Güneş sisteminde güneşe en yakın birinci gezegendir.'
                },
                {
                    soru: 'Yıldızların enerji kaynağı olan temel nükleer tepkime türü nedir?',
                    secenekler: ['Nükleer Fisyon (Bölünme)', 'Nükleer Füzyon (Kaynaşma)', 'Kimyasal Yanma', 'Radyoaktif Bozunum'],
                    dogru: 'Nükleer Füzyon (Kaynaşma)',
                    aciklama: 'Yıldızlar çekirdeklerinde hidrojen atomlarını helyuma füzyon (kaynaşma) yoluyla dönüştürerek devasa enerji üretir.'
                }
            ]
        },
        kimya: {
            title: 'Kimya Laboratuvarı Quiz',
            desc: 'Elementler, periyodik tablo ve kimyasal bağlar hakkında mini sınav.',
            questions: [
                {
                    soru: 'Periyodik tabloda "H" simgesiyle gösterilen element hangisidir?',
                    secenekler: ['Helyum', 'Hidrojen', 'Hafniyum', 'Holmiyum'],
                    dogru: 'Hidrojen',
                    aciklama: 'H simgesi evrendeki en hafif ve en bol element olan Hidrojen\'e aittir.'
                },
                {
                    soru: 'Saf suyun (H2O) oda koşullarındaki pH değeri kaçtır?',
                    secenekler: ['0', '7', '14', '5'],
                    dogru: '7',
                    aciklama: 'Nötr maddelerin pH değeri 25°C\'de tam olarak 7\'dir.'
                },
                {
                    soru: 'Aşağıdakilerden hangisi ametal özellik gösteren bir elementtir?',
                    secenekler: ['Demir (Fe)', 'Sodyum (Na)', 'Oksijen (O)', 'Bakır (Cu)'],
                    dogru: 'Oksijen (O)',
                    aciklama: 'Oksijen periyodik tablonun 6A grubunda yer alan bir ametaldir; diğerleri metaldir.'
                }
            ]
        }
    };

    $: currentQuiz = quizData[konu] || quizData.fizik;
    let currentQuestionIndex = 0;
    let selectedOption = null;
    let score = 0;
    let isFinished = false;
    let playerName = '';

    onMount(() => {
        const saved = localStorage.getItem('bilim_kulubu_player_name');
        if (saved) playerName = saved;
    });

    function handleAnswer(opt) {
        if (selectedOption !== null) return;
        sfx.nav();
        selectedOption = opt;

        if (opt === currentQuiz.questions[currentQuestionIndex].dogru) {
            score += 25;
        }
    }

    function nextQuestion() {
        selectedOption = null;
        if (currentQuestionIndex < currentQuiz.questions.length - 1) {
            currentQuestionIndex++;
        } else {
            isFinished = true;
            // Skoru kaydet
            const savedScores = JSON.parse(localStorage.getItem('biyoloji_scores') || '[]');
            savedScores.push({ name: playerName || 'Bilim Meraklısı', score: score, date: new Date().toLocaleDateString('tr-TR') });
            localStorage.setItem('biyoloji_scores', JSON.stringify(savedScores));
        }
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        selectedOption = null;
        score = 0;
        isFinished = false;
    }
</script>

<svelte:head><title>{currentQuiz.title} · Yarışmalar</title></svelte:head>

<PageHeader eyebrow="Bilgi Quizi" title={currentQuiz.title} desc={currentQuiz.desc} />

<div class="content-max" style="margin-bottom: 60px;">
    <div class="bracket-card" style="max-width: 800px; margin: 0 auto;">
        
        <!-- Oyuncu ve Skor Bilgisi -->
        <div style="margin-bottom: 20px; display: flex; gap: 12px; align-items: center; background: var(--bg-alt); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <span style="font-size: var(--fs-sm); color: var(--text-muted);">Yarışmacı:</span>
            <input type="text" bind:value={playerName} on:input={() => localStorage.setItem('bilim_kulubu_player_name', playerName)} placeholder="Adınızı girin..." style="background: transparent; border: none; color: var(--text); font-weight: bold; flex: 1; outline: none;" />
            <span class="badge live">Puan: {score}</span>
        </div>

        {#if !isFinished}
            {@const q = currentQuiz.questions[currentQuestionIndex]}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span class="badge dev">Soru {currentQuestionIndex + 1} / {currentQuiz.questions.length}</span>
            </div>

            <h3 style="margin-bottom: 20px; font-size: var(--fs-lg); line-height: 1.5;">{q.soru}</h3>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                {#each q.secenekler as opt}
                    <button 
                        class="btn {selectedOption === null ? 'btn-ghost' : (opt === q.dogru ? 'btn-primary' : (selectedOption === opt ? 'btn-danger' : 'btn-ghost'))}" 
                        style="padding: 14px 18px; text-align: left; justify-content: flex-start; font-size: var(--fs-base);"
                        disabled={selectedOption !== null}
                        on:click={() => handleAnswer(opt)}>
                        🔹 {opt}
                    </button>
                {/each}
            </div>

            {#if selectedOption !== null}
                <div style="padding: 14px; border-radius: var(--radius-sm); background: var(--bg-alt); border: 1px solid var(--border-strong); margin-bottom: 20px;">
                    <p style="margin: 0 0 6px 0; font-size: var(--fs-sm); font-weight: bold; color: {selectedOption === q.dogru ? 'var(--accent)' : 'var(--danger)'};">
                        {selectedOption === q.dogru ? 'Doğru Cevap! 🎉' : `Yanlış! Doğru cevap: ${q.dogru}`}
                    </p>
                    <p style="margin: 0; font-size: var(--fs-xs); color: var(--text-muted);">{q.aciklama}</p>
                </div>

                <button class="btn btn-primary" style="width: 100%; justify-content: center;" on:click={nextQuestion}>
                    {currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Sonraki Soru →' : 'Quizi Tamamla ve Sonuçları Gör 🏁'}
                </button>
            {/if}

        {:else}
            <!-- Quiz Bitiş Ekranı -->
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 3.5rem; margin-bottom: 10px;">🏆</div>
                <h2>Tebrikler, Quizi Tamamladın!</h2>
                <p style="text-align: center; margin: 15px auto; color: var(--text-muted);">
                    {currentQuiz.title} testini başarıyla bitirdin ve toplam <b style="color: var(--accent);">{score} puan</b> kazandın.
                </p>
                <div style="display: flex; justify-content: center; gap: 12px; margin-top: 25px;">
                    <button class="btn btn-primary" on:click={restartQuiz}>Tekrar Çöz</button>
                    <a href="/yarismalar" class="btn btn-ghost" style="text-decoration: none;">Yarışmalar Menüsüne Dön</a>
                </div>
            </div>
        {/if}

    </div>
</div>

<script>
    export const prerender = false;
</script>