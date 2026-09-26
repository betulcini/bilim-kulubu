<script>
    import PageHeader from '$lib/components/PageHeader.svelte';
    import { sfx } from '$lib/sound.js';
    import { onMount } from 'svelte';

    const wordList = [
        { word: "APOPTOZ", hint: "Programlanmış hücre ölümü süreci." },
        { word: "ENDOSİMBİYOZ", hint: "Mitokondri ve kloroplastın kökenini açıklayan hücresel ortak yaşam teorisi." },
        { word: "KAOS", hint: "Başlangıç koşullarına aşırı duyarlılık gösteren dinamik sistemler teorisi." },
        { word: "ENTROPİ", hint: "Termodinamiğin ikinci kanunu; evrendeki düzensizlik ölçüsü." },
        { word: "FOTOLİZ", hint: "Işık yardımıyla su moleküllerinin elektron, proton ve oksijene ayrışması." },
        { word: "HOMEOSTAZİ", hint: "Canlının iç dengesini kararlı tutma hali." },
        { word: "KUANTUM", hint: "Enerjinin kesikli (paketçikler halinde) yayılması veya soğurulması durumu." },
        { word: "BİYOMİKRASİ", hint: "Doğadaki form ve süreçlerin mühendislik tasarımlarında taklit edilmesi." }
    ];

    let currentWordObj = { word: '', hint: '' };
    let guessedLetters = new Set();
    let wrongGuessCount = 0;
    const maxWrong = 6;
    let finished = false;
    let won = false;
    let scoreEarned = 0;
    let playerName = '';

    function startNewGame() {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        currentWordObj = wordList[randomIndex];
        guessedLetters = new Set();
        wrongGuessCount = 0;
        finished = false;
        won = false;
        scoreEarned = 0;
    }

    onMount(() => {
        const saved = localStorage.getItem('bilim_kulubu_player_name');
        if (saved) playerName = saved;
        startNewGame();
    });

    const alphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";

    function guessLetter(letter) {
        if (finished || guessedLetters.has(letter)) return;
        guessedLetters.add(letter);
        guessedLetters = new Set(guessedLetters);
        sfx.nav();

        if (!currentWordObj.word.includes(letter)) {
            wrongGuessCount++;
            if (wrongGuessCount >= maxWrong) {
                finished = true;
                won = false;
            }
        } else {
            const isWon = currentWordObj.word.split('').every(char => guessedLetters.has(char));
            if (isWon) {
                finished = true;
                won = true;
                scoreEarned = (maxWrong - wrongGuessCount) * 15 + 50;
            }
        }
    }
</script>

<svelte:head><title>Bilimsel Adam Asmaca · Oyunlar</title></svelte:head>

<PageHeader eyebrow="Zihin Egzersizi" title="Bilimsel Adam Asmaca" desc="İleri düzey bilimsel terimleri ve teorileri harf harf çözerek keşfet." />

<div class="content-max" style="margin-bottom: 60px;">
    <div class="bracket-card" style="max-width: 800px; margin: 0 auto; text-align: center;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <span class="badge dev">Kategori: Bilimsel Terimler</span>
            <span style="color: var(--danger);">Hata Hakkı: {wrongGuessCount} / {maxWrong}</span>
        </div>

        <div style="font-size: 2.5rem; margin: 15px 0;">
            {#if wrongGuessCount === 0} 🔬🧬🧪⚛️🔭🧠
            {:else if wrongGuessCount <= 2} 🔬🧬🧪⚛️
            {:else if wrongGuessCount <= 4} 🔬🧬
            {:else} ⚠️ Bağlantı Koptu!
            {/if}
        </div>

        <p style="text-align: center; font-style: italic; color: var(--text-muted); margin-bottom: 20px;">
            💡 İpucu: {currentWordObj.hint}
        </p>

        <div style="font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 2.5rem); letter-spacing: 8px; margin: 25px 0; font-weight: bold; color: var(--accent);">
            {currentWordObj.word.split('').map(char => guessedLetters.has(char) ? char : '_').join(' ')}
        </div>

        {#if !finished}
            <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; max-width: 600px; margin: 0 auto;">
                {#each alphabet.split('') as letter}
                    <button 
                        class="btn {guessedLetters.has(letter) ? 'btn-ghost' : 'btn-primary'}" 
                        style="min-width: 38px; padding: 8px 10px; font-size: 0.85rem;"
                        disabled={guessedLetters.has(letter)}
                        on:click={() => guessLetter(letter)}>
                        {letter}
                    </button>
                {/each}
            </div>
        {:else}
            <div style="margin-top: 20px; padding: 20px; background: var(--bg-alt); border-radius: var(--radius-sm); border: 1px solid var(--border-strong);">
                {#if won}
                    <h3 style="color: var(--accent-3);">Tebrikler, Bildiniz! 🎉</h3>
                    <p style="text-align: center; margin: 5px 0;">Kazanılan Puan: <b>{scoreEarned}</b></p>
                {:else}
                    <h3 style="color: var(--danger);">Süreç Başarısız Oldu... Doğru Kelime: {currentWordObj.word}</h3>
                {/if}
                <div style="display: flex; justify-content: center; gap: 12px; margin-top: 15px;">
                    <button class="btn btn-primary" on:click={startNewGame}>Yeni Kelimeye Geç</button>
                    <a href="/oyunlar" class="btn btn-ghost" style="text-decoration: none;">Menüye Dön</a>
                </div>
            </div>
        {/if}
    </div>
</div>