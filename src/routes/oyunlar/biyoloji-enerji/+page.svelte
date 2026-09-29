<script>
    import PageHeader from '$lib/components/PageHeader.svelte';
    import { sfx } from '$lib/sound.js';
    import { onMount } from 'svelte';

    // Süreçleri biyolojik olarak doğru şekilde kategorize ediyoruz
    const pathways = {
        fotosentez: {
            name: ' 🌱 Kloroplast / Fotosentez (Anabolik Süreç)',
            desc: 'Işık enerjisi kullanılarak inorganik maddelerden organik besin sentezlenmesi.',
            stages: [
                {
                    title: '1. Aşama: Işığa Bağımlı Reaksiyonlar (Tilakoit Zar)',
                    description: 'Klorofil ışığı soğurur, fotoliz ile su parçalanır. Ortama O2 verilirken NADP+ indirgenir ve ATP üretilir.',
                    options: ['Işık Enerjisi & Su', 'Glikoz & CO2', 'Asetil CoA', 'Nişasta'],
                    correct: 'Işık Enerjisi & Su',
                    atpGain: 'ATP & NADPH Üretimi',
                    info: 'Campbell: Işığa bağımlı reaksiyonlar tilakoit zarlarda gerçekleşir ve O2 yan ürün olarak salınır.'
                },
                {
                    title: '2. Aşama: Calvin Döngüsü (Stroma)',
                    description: 'Işıktan bağımsız evrede dışarıdan alınan inorganik gaz, ışık reaksiyonlarından gelen ATP ve NADPH ile organik besine dönüştürülür.',
                    options: ['Karbondioksit (CO2)', 'Serbest O2', 'Azot Gazı', 'Metan'],
                    correct: 'Karbondioksit (CO2)',
                    atpGain: 'Glikoz (C6H12O6) Sentezi',
                    info: 'Campbell: Karbon tutulması stromada Rubisco enzimi yardımıyla gerçekleşir.'
                }
            ]
        },
        solunum: {
            name: ' ⚡ Mitokondri / Hücresel Solunum (Katabolik Süreç)',
            desc: 'Organik moleküllerin parçalanarak hücre içi kullanım için ATP enerjisine dönüştürülmesi.',
            stages: [
                {
                    title: '1. Aşama: Glikoliz (Sitoplazma)',
                    description: 'Hücredeki glikoz sitoplazmada enzimatik olarak parçalanarak pirüvata dönüştürülür ve net ATP elde edilir.',
                    options: ['Glikoz (C6H12O6)', 'Asetil CoA', 'Oksijen (O2)', 'Işık Enerjisi'],
                    correct: 'Glikoz (C6H12O6)',
                    atpGain: '+2 Net ATP & NADH',
                    info: 'Campbell: Glikoliz evrenseldir; oksijenli ve oksijensiz solunumun ortak başlangıcıdır.'
                },
                {
                    title: '2. Aşama: Krebs Döngüsü (Matriks)',
                    description: 'Pirüvattan oluşan ara bileşik mitokondri matriksine girer; CO2 açığa çıkar ve koenzimler yüklenir.',
                    options: ['Pirüvat', 'Asetil CoA', 'Su (H2O)', 'NADPH'],
                    correct: 'Asetil CoA',
                    atpGain: '+2 ATP, NADH & FADH2',
                    info: 'Campbell: Krebs döngüsü matrikste gerçekleşir ve elektron taşıyıcıları indirgenir.'
                },
                {
                    title: '3. Aşama: Oksidatif Fosforilasyon (Krista / ETS)',
                    description: 'Elektronlar ETS boyunca akar. Bu katabolik sürecin son elektron alıcısı nedir?',
                    options: ['Karbondioksit (CO2)', 'Glikoz', 'Oksijen (O2)', 'Glikojen'],
                    correct: 'Oksijen (O2)',
                    atpGain: '+28 ila +32 ATP',
                    info: 'Campbell: Oksijen son elektron alıcısı olarak elektronları yakalar ve metabolik suyu oluşturur.'
                }
            ]
        }
    };

    let selectedPathwayKey = null; // 'fotosentez' veya 'solunum'
    let currentStageIndex = 0;
    let totalEnergyScore = 0;
    let feedback = '';
    let isCompleted = false;
    let stageFinished = false;
    let playerName = '';

    onMount(() => {
        const saved = localStorage.getItem('bilim_kulubu_player_name');
        if (saved) playerName = saved;
    });

    function selectPathway(key) {
        selectedPathwayKey = key;
        currentStageIndex = 0;
        stageFinished = false;
        feedback = '';
        isCompleted = false;
    }

    function selectOption(opt) {
        if (stageFinished) return;
        sfx.nav();
        const current = pathways[selectedPathwayKey].stages[currentStageIndex];

        if (opt === current.correct) {
            totalEnergyScore += 25;
            feedback = `Başarılı! ⚡ ${current.info}`;
            stageFinished = true;
        } else {
            feedback = `Hatalı molekül seçimi! Biyokimyasal yolak aksadı. Tekrar dene.`;
        }
    }

    function nextStage() {
        stageFinished = false;
        feedback = '';
        const stagesList = pathways[selectedPathwayKey].stages;
        if (currentStageIndex < stagesList.length - 1) {
            currentStageIndex++;
        } else {
            isCompleted = true;
            const savedScores = JSON.parse(localStorage.getItem('biyoloji_scores') || '[]');
            savedScores.push({ name: `${playerName || 'Uzman'} (${selectedPathwayKey.toUpperCase()})`, score: totalEnergyScore, date: new Date().toLocaleDateString('tr-TR') });
            savedScores.sort((a, b) => b.score - a.score);
            localStorage.setItem('biyoloji_scores', JSON.stringify(savedScores));
        }
    }

    function resetToMenu() {
        selectedPathwayKey = null;
        isCompleted = false;
        stageFinished = false;
        feedback = '';
        totalEnergyScore = 0;
    }
</script>

<svelte:head><title>Hücresel Solunum & Fotosentez Simülasyonu · Oyunlar</title></svelte:head>

<PageHeader eyebrow="Biyokimya Laboratuvarı" title="Hücresel Solunum & Fotosentez Modülleri" desc="Campbell Biyoloji prensiplerine göre anabolik (fotosentez) ve katabolik (solunum) süreçleri ayrı ayrı incele ve yönet." />

<div class="content-max" style="margin-bottom: 60px;">
    <div class="bracket-card" style="max-width: 850px; margin: 0 auto;">
        
        <!-- Oyuncu Bilgisi -->
        <div class="player-bar">
            <span class="player-label">Araştırmacı:</span>
            <input type="text" bind:value={playerName} on:input={() => localStorage.setItem('bilim_kulubu_player_name', playerName)} placeholder="Adınızı girin..." class="player-input" />
            <span class="badge live score-badge">Toplam Puan: {totalEnergyScore}</span>
        </div>

        {#if selectedPathwayKey === null}
            <!-- Ana Menü: Süreç Seçimi -->
            <h3 style="margin-bottom: 15px; font-size: var(--fs-lg);">İncelemek İstediğiniz Metabolik Süreci Seçin:</h3>
            <div class="path-grid">
                {#each Object.entries(pathways) as [key, path]}
                    <div class="path-card">
                        <div>
                            <h4 style="margin-bottom: 8px; color: var(--accent);">{path.name}</h4>
                            <p style="font-size: var(--fs-sm); color: var(--text-muted); margin-bottom: 16px; line-height: 1.4;">{path.desc}</p>
                        </div>
                        <button class="btn btn-primary" on:click={() => selectPathway(key)}>
                            Simülasyonu Başlat →
                        </button>
                    </div>
                {/each}
            </div>
        {:else if !isCompleted}
            <!-- Aktif Süreç Ekranı -->
            {@const currentStage = pathways[selectedPathwayKey].stages[currentStageIndex]}
            <div class="stage-head">
                <span class="badge dev">{pathways[selectedPathwayKey].name}</span>
                <span style="font-size: var(--fs-xs); color: var(--text-muted);">Adım {currentStageIndex + 1} / {pathways[selectedPathwayKey].stages.length}</span>
            </div>

            <h4 style="margin-bottom: 10px; color: var(--text);">{currentStage.title}</h4>
            <p style="font-size: var(--fs-md); margin-bottom: 20px; line-height: 1.5;">
                {currentStage.description}
            </p>

            <!-- Seçenekler -->
            <div class="opt-grid">
                {#each currentStage.options as opt}
                    <button 
                        class="btn {stageFinished && opt === currentStage.correct ? 'btn-primary' : 'btn-ghost'}" 
                        style="padding: 16px;"
                        disabled={stageFinished}
                        on:click={() => selectOption(opt)}>
                        🧪 {opt}
                    </button>
                {/each}
            </div>

            {#if feedback}
                <div style="padding: 14px; border-radius: var(--radius-sm); background: {stageFinished ? 'var(--accent-3-soft)' : 'var(--danger-soft)'}; border: 1px solid {stageFinished ? 'var(--accent-3)' : 'var(--danger)'}; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: var(--fs-sm); color: var(--text);">{feedback}</p>
                    {#if stageFinished}
                        <p style="margin: 6px 0 0 0; font-size: var(--fs-xs); color: var(--accent);">Kazanım: <b>{currentStage.atpGain}</b></p>
                    {/if}
                </div>
            {/if}

            <div class="action-row">
                {#if stageFinished}
                    <button class="btn btn-primary next-btn" on:click={nextStage}>
                        {currentStageIndex < pathways[selectedPathwayKey].stages.length - 1 ? 'Sonraki Adıma Geç →' : 'Süreci Tamamla ve Rapor Al 🏁'}
                    </button>
                {/if}
                <button class="btn btn-ghost" on:click={resetToMenu}>← Süreç Menüsüne Dön</button>
            </div>

        {:else}
            <!-- Modül Tamamlama Raporu -->
            <div class="done-box">
                <div style="font-size: 3.5rem; margin-bottom: 10px;">🏆</div>
                <h2>Metabolik Süreç Başarıyla Simüle Edildi!</h2>
                <p style="text-align: center; margin: 15px auto; color: var(--text-muted);">
                    {pathways[selectedPathwayKey].name} yolaklarını doğru moleküler basamaklarla yöneterek laboratuvar simülasyonunu tamamladın.
                </p>
                <div class="action-row center">
                    <button class="btn btn-primary" on:click={() => selectPathway(selectedPathwayKey)}>Süreci Tekrarla</button>
                    <button class="btn btn-ghost" on:click={resetToMenu}>Süreç Menüsüne Dön</button>
                </div>
            </div>
        {/if}

    </div>
</div>

<style>
    .player-bar {
        margin-bottom: 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 12px;
        align-items: center;
        background: var(--bg-alt);
        padding: 10px 14px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
    }
    .player-label { font-size: var(--fs-sm); color: var(--text-muted); }
    .player-input {
        background: transparent;
        border: none;
        color: var(--text);
        font-weight: bold;
        flex: 1 1 140px;
        min-width: 0;
        outline: none;
    }
    .score-badge { white-space: nowrap; }

    .path-grid,
    .opt-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
        gap: 14px;
    }
    .opt-grid { margin-bottom: 20px; gap: 12px; }
    .path-card {
        background: var(--bg-alt);
        padding: 20px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-strong);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-width: 0;
    }
    .path-card h4 { overflow-wrap: anywhere; }
    .path-card :global(.btn),
    .opt-grid :global(.btn),
    .action-row :global(.btn) {
        max-width: 100%;
        white-space: normal;
        text-align: center;
        line-height: 1.3;
    }
    .opt-grid :global(.btn) { overflow-wrap: anywhere; }

    .stage-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 8px 12px;
        margin-bottom: 15px;
    }
    .stage-head :global(.badge) { min-width: 0; }

    .action-row { display: flex; flex-wrap: wrap; gap: 10px; }
    .action-row.center { justify-content: center; margin-top: 25px; }
    .next-btn { flex: 1 1 200px; }
    .done-box { text-align: center; padding: 40px 20px; }

    @media (max-width: 520px) {
        .path-card { padding: 16px; }
        .done-box { padding: 24px 4px; }
        .action-row :global(.btn) { flex: 1 1 100%; }
    }
</style>
