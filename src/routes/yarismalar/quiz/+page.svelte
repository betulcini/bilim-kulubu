<script>
	import Icon from '$lib/components/Icon.svelte';
    import PageHeader from '$lib/components/PageHeader.svelte';
    import { sfx } from '$lib/sound.js';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { quizData } from '$lib/data/bilim-quizleri.js';
    import { supabase } from '$lib/supabaseClient.js';
    import { user } from '$lib/stores/auth.js';

    // Query parametresinden konuyu al (örn: ?konu=fizik)
    // NOT: prerender edilen bir sayfada url.searchParams'a build/SSR anında erişilemez,
    // bu yüzden sadece tarayıcıda (hydration sonrası) okunuyor.
    let konu = 'fizik';
    $: if (browser) {
        konu = $page.url.searchParams.get('konu') || 'fizik';
    }
    $: categoryMeta = quizData[konu] || quizData.fizik;

    // Her turda soru havuzundan rastgele bir alt küme seçilir (tekrar oynamada çeşitlilik)
    const ROUND_SIZE = 8;
    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    function pickRound(catKey) {
        const cat = quizData[catKey] || quizData.fizik;
        return shuffle(cat.questions).slice(0, Math.min(ROUND_SIZE, cat.questions.length));
    }

    let roundQuestions = pickRound(konu); // SSR-güvenli ilk tur (varsayılan: fizik)
    let lastKonu = konu;
    let currentQuestionIndex = 0;
    let selectedOption = null;
    let score = 0;
    let isFinished = false;
    let playerName = '';
    let savedToLeaderboard = false;

    // Konu değiştiğinde (URL parametresi ile) yeni bir tur başlat
    $: if (konu !== lastKonu) {
        lastKonu = konu;
        roundQuestions = pickRound(konu);
        currentQuestionIndex = 0;
        selectedOption = null;
        score = 0;
        isFinished = false;
    }

    // --- Soru başına süre sınırı ---
    const SORU_SURESI = 20; // saniye
    let timeLeft = SORU_SURESI;
    let timerId = null;

    function clearTimer() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
    }

    function startTimer() {
        clearTimer();
        timeLeft = SORU_SURESI;
        timerId = setInterval(() => {
            timeLeft -= 1;
            if (timeLeft <= 0) {
                clearTimer();
                if (selectedOption === null) {
                    // Süre doldu, otomatik olarak yanlış sayılır
                    sfx.error();
                    selectedOption = '__sure_doldu__';
                }
            }
        }, 1000);
    }

    onMount(() => {
        const saved = localStorage.getItem('bilim_kulubu_player_name');
        if (saved) playerName = saved;
        return () => clearTimer();
    });

    // Soru değiştikçe (tur başlangıcı dahil) süreyi sıfırla
    $: if (browser && roundQuestions.length > 0 && !isFinished) {
        currentQuestionIndex; // reaktif bağımlılık
        startTimer();
    }

    function handleAnswer(opt) {
        if (selectedOption !== null) return;
        clearTimer();
        sfx.nav();
        selectedOption = opt;

        if (opt === roundQuestions[currentQuestionIndex].dogru) {
            score += 25;
        }
    }

    async function nextQuestion() {
        selectedOption = null;
        if (currentQuestionIndex < roundQuestions.length - 1) {
            currentQuestionIndex++;
        } else {
            isFinished = true;
            clearTimer();
            // Skoru localStorage'a kaydet (cihazda kişisel geçmiş için, herkes)
            const savedScores = JSON.parse(localStorage.getItem('btk_quiz_scores') || '[]');
            savedScores.push({
                name: playerName || 'Bilim Meraklısı',
                score,
                subject: konu,
                subjectTitle: categoryMeta.title,
                date: new Date().toLocaleDateString('tr-TR'),
                ts: Date.now()
            });
            localStorage.setItem('btk_quiz_scores', JSON.stringify(savedScores));

            // Giriş yapmış kullanıcıysa gerçek/ortak skor tablosuna da kaydet
            if ($user) {
                const { error } = await supabase.from('quiz_scores').insert({
                    user_id: $user.id,
                    subject: konu,
                    subject_title: categoryMeta.title,
                    score
                });
                if (!error) savedToLeaderboard = true;
            }
        }
    }

    function restartQuiz() {
        roundQuestions = pickRound(konu);
        currentQuestionIndex = 0;
        selectedOption = null;
        score = 0;
        isFinished = false;
        savedToLeaderboard = false;
        startTimer();
    }

    function zorlukBadge(z) {
        if (z === 'Kolay') return 'info';
        if (z === 'Zor') return 'danger';
        return 'dev';
    }
</script>

<svelte:head>
    <title>{categoryMeta.title} · Yarışmalar</title>
    <meta name="description" content={categoryMeta.desc} />
</svelte:head>

<PageHeader eyebrow="Bilgi Quizi" title={categoryMeta.title} desc={categoryMeta.desc} />

<div class="content-max" style="margin-bottom: 60px;">
    <div class="bracket-card" style="max-width: 800px; margin: 0 auto;">
        
        <!-- Oyuncu ve Skor Bilgisi -->
        <div class="player-bar">
            <span class="player-label">Yarışmacı:</span>
            <div class="player-id">
                {#if $user}
                    <span class="player-name">{$user.full_name || $user.email}</span>
                    <span class="badge dev player-badge">Giriş yapıldı</span>
                {:else}
                    <input class="player-input" type="text" bind:value={playerName} on:input={() => localStorage.setItem('bilim_kulubu_player_name', playerName)} placeholder="Adınızı girin..." maxlength="30" aria-label="Adınız" />
                {/if}
            </div>
            <span class="badge live player-score">Puan: {score}</span>
        </div>

        {#if !isFinished}
            {@const q = roundQuestions[currentQuestionIndex]}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge dev">Soru {currentQuestionIndex + 1} / {roundQuestions.length}</span>
                    <span class="badge {zorlukBadge(q.zorluk)}">{q.zorluk}</span>
                </div>
                <span class="badge {timeLeft <= 5 && selectedOption === null ? 'danger' : 'info'}" style="font-variant-numeric: tabular-nums;">
                    <Icon name="clock" size={14} /> {selectedOption === null ? timeLeft : SORU_SURESI} sn
                </span>
            </div>

            <div style="height: 4px; border-radius: 999px; background: var(--bg-alt); overflow: hidden; margin-bottom: 18px;">
                <div style="height: 100%; border-radius: 999px; background: {timeLeft <= 5 ? 'var(--danger)' : 'var(--accent)'}; width: {selectedOption === null ? (timeLeft / SORU_SURESI) * 100 : 100}%; transition: width 1s linear;"></div>
            </div>

            <h3 class="quiz-question">{q.soru}</h3>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                {#each q.secenekler as opt}
                    <button 
                        class="btn quiz-option {selectedOption === null ? 'btn-ghost' : (opt === q.dogru ? 'btn-primary' : (selectedOption === opt ? 'btn-danger' : 'btn-ghost'))}" 
                        disabled={selectedOption !== null}
                        on:click={() => handleAnswer(opt)}>
                        {opt}
                    </button>
                {/each}
            </div>

            {#if selectedOption !== null}
                <div style="padding: 14px; border-radius: var(--radius-sm); background: var(--bg-alt); border: 1px solid var(--border-strong); margin-bottom: 20px;">
                    <p style="margin: 0 0 6px 0; font-size: var(--fs-sm); font-weight: bold; color: {selectedOption === q.dogru ? 'var(--accent)' : 'var(--danger)'};">
                        {selectedOption === q.dogru
                            ? 'Doğru cevap!'
                            : selectedOption === '__sure_doldu__'
                                ? `Süre doldu. Doğru cevap: ${q.dogru}`
                                : `Yanlış! Doğru cevap: ${q.dogru}`}
                    </p>
                    <p style="margin: 0; font-size: var(--fs-xs); color: var(--text-muted);">{q.aciklama}</p>
                </div>

                <button class="btn btn-primary" style="width: 100%; justify-content: center;" on:click={nextQuestion}>
                    {currentQuestionIndex < roundQuestions.length - 1 ? 'Sonraki Soru →' : 'Quizi Tamamla ve Sonuçları Gör'}
                </button>
            {/if}

        {:else}
            <!-- Quiz Bitiş Ekranı -->
            <div class="finish-box">
                <div class="ico-tile xl warm" style="margin: 0 auto 14px;"><Icon name="trophy" size={38} /></div>
                <h2>Tebrikler, Quizi Tamamladın!</h2>
                <p style="text-align: center; margin: 15px auto; color: var(--text-muted);">
                    {categoryMeta.title} testini başarıyla bitirdin ve toplam <b style="color: var(--accent);">{score} puan</b> kazandın.
                </p>
                {#if savedToLeaderboard}
                    <p style="font-size: var(--fs-sm); color: var(--accent);"><Icon name="check" size={14} /> Skorun ortak skor tablosuna eklendi.</p>
                {:else}
                    <p style="font-size: var(--fs-sm); color: var(--text-muted);">
                        Bu skor ortak skor tablosuna eklenmedi. <a href="/giris" style="color: var(--accent);">Giriş yaparsan</a> skorların sıralamaya kaydedilir.
                    </p>
                {/if}
                <div class="finish-actions">
                    <button class="btn btn-primary" on:click={restartQuiz}>Tekrar Çöz</button>
                    <a href="/yarismalar" class="btn btn-ghost" style="text-decoration: none; text-align: center;">Yarışmalar Menüsüne Dön</a>
                </div>
            </div>
        {/if}

    </div>
</div>

<style>
    .player-bar {
        display: flex;
        align-items: center;
        gap: 8px 12px;
        margin-bottom: 20px;
        padding: 10px 14px;
        background: var(--bg-alt);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
    }
    .player-label {
        flex: none;
        font-size: var(--fs-sm);
        color: var(--text-muted);
    }
    .player-id {
        flex: 1 1 0;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .player-name {
        flex: 1;
        min-width: 0;
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .player-input {
        flex: 1;
        width: 100%;
        min-width: 0;
        padding: 0;
        background: transparent;
        border: none;
        color: var(--text);
        font: inherit;
        font-weight: bold;
    }
    .player-badge,
    .player-score {
        flex: none;
        white-space: nowrap;
    }

    .quiz-question {
        margin-bottom: 20px;
        font-size: var(--fs-lg);
        line-height: 1.5;
        overflow-wrap: anywhere;
    }
    .quiz-option {
        padding: 14px 18px;
        text-align: left;
        justify-content: flex-start;
        font-size: var(--fs-base);
        line-height: 1.4;
        overflow-wrap: anywhere;
    }

    .finish-box {
        text-align: center;
        padding: 40px 20px;
    }
    .finish-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
        margin-top: 25px;
    }

    @media (max-width: 520px) {
        /* Üst satır: Yarışmacı ........ Puan / alt satır: ad alanı tam genişlik */
        .player-bar {
            flex-wrap: wrap;
            padding: 10px 12px;
        }
        .player-label {
            order: 1;
            flex: 1;
        }
        .player-score {
            order: 2;
        }
        .player-id {
            order: 3;
            flex: 1 1 100%;
        }
        .player-input {
            padding: 6px 0;
            border-top: 1px solid var(--border);
            font-size: var(--fs-sm);
        }
        .quiz-question {
            font-size: var(--fs-md);
            margin-bottom: 16px;
        }
        .quiz-option {
            padding: 12px 14px;
            font-size: var(--fs-sm);
        }
        .finish-box {
            padding: 24px 4px;
        }
        .finish-actions .btn {
            flex: 1 1 100%;
        }
    }
</style>
