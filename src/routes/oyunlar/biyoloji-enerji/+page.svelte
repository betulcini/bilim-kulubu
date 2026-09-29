<script>
    import PageHeader from '$lib/components/PageHeader.svelte';
    import { sfx } from '$lib/sound.js';
    import { onMount } from 'svelte';

    // Şemadaki bölgeler: renk, etiket ve şeklin türü tek yerde
    const cellRegions = {
        kloroplast: [
            { id: 'dis-zar', label: 'Dış zar', color: '#d9a441' },
            { id: 'stroma', label: 'Stroma', color: '#5fae7c' },
            { id: 'tilakoit', label: 'Tilakoit zar (granum)', color: '#2e9ea8' }
        ],
        mitokondri: [
            { id: 'sitozol', label: 'Sitozol', color: '#8aa0b8' },
            { id: 'dis-zar', label: 'Dış zar', color: '#d9a441' },
            { id: 'zarlar-arasi', label: 'Zarlar arası boşluk', color: '#e07a5f' },
            { id: 'ic-zar', label: 'İç zar (krista)', color: '#c0503a' },
            { id: 'matriks', label: 'Matriks', color: '#7fb069' }
        ]
    };
    const colorOf = (cell, id) => cellRegions[cell].find((r) => r.id === id)?.color;
    const grana = [[95, 82], [95, 158], [305, 82], [305, 158], [200, 120]];
    const edge = (x) => 72 * Math.sqrt(1 - ((x - 200) / 152) ** 2);

    // type: choice (şık seç) | locate (şemada bölge seç) | order (sırala)
    const pathways = {
        fotosentez: {
            name: '🌱 Kloroplast / Fotosentez (Anabolik Süreç)',
            desc: 'Işık enerjisiyle inorganik maddelerden organik besin sentezi. 8 adım, şemada bölge seçme ve sıralama görevleriyle.',
            cell: 'kloroplast',
            counters: [
                { key: 'O2', label: 'O₂' },
                { key: 'ATP', label: 'ATP' },
                { key: 'NADPH', label: 'NADPH' },
                { key: 'Glikoz', label: 'Glikoz' }
            ],
            stages: [
                {
                    type: 'choice',
                    title: '1. Işığın soğurulması ve fotoliz',
                    description: "Fotosistem II'deki klorofil ışığı soğurur, elektronlar uyarılıp ayrılır. Kaybedilen elektronlar hangi molekülün parçalanmasıyla yerine konur?",
                    options: ['Su (H₂O)', 'Karbondioksit (CO₂)', 'Glikoz', 'NADPH'],
                    correct: 'Su (H₂O)',
                    loc: 'tilakoit',
                    gain: { O2: 6 },
                    gainText: 'O₂ açığa çıkar (1 glikoz için toplam 6 O₂)',
                    info: "Campbell: Fotolizde su parçalanır; elektronlar klorofile gider, H⁺'lar lümende birikir, O₂ yan ürün olarak salınır."
                },
                {
                    type: 'locate',
                    title: '2. Işığa bağımlı reaksiyonların yeri',
                    description: 'Işığa bağımlı reaksiyonlar kloroplastın hangi bölgesinde gerçekleşir? Şemada o bölgeye dokun.',
                    correct: 'tilakoit',
                    info: 'Klorofil, fotosistemler, ETS ve ATP sentaz tilakoit zarında yer alır.'
                },
                {
                    type: 'choice',
                    title: '3. ETS ve kemiozmoz',
                    description: "Elektronlar tilakoit zardaki ETS'den geçerken H⁺ iyonları lümene pompalanır. H⁺'lar ATP sentaz üzerinden stromaya geri akarken ADP + Pi'den ATP yapılır. Bu olayın adı nedir?",
                    options: ['Fotofosforilasyon', 'Substrat düzeyinde fosforilasyon', 'Fermentasyon', 'Fotoliz'],
                    correct: 'Fotofosforilasyon',
                    loc: 'tilakoit',
                    gain: { ATP: 18 },
                    gainText: '+18 ATP (1 glikozluk Calvin döngüsü için)',
                    info: "Campbell: Kemiozmozda H⁺ gradyanının enerjisi ATP sentaz tarafından ATP'ye çevrilir; ışıkla yapıldığı için fotofosforilasyondur."
                },
                {
                    type: 'choice',
                    title: '4. NADPH oluşumu',
                    description: "ETS'yi terk eden elektronlar Fotosistem I'de yeniden uyarılır. Sonunda bu elektronları alıp NADPH'ye dönüşen molekül hangisidir?",
                    options: ['NADP⁺', 'NAD⁺', 'FAD', 'O₂'],
                    correct: 'NADP⁺',
                    loc: 'tilakoit',
                    gain: { NADPH: 12 },
                    gainText: '+12 NADPH (indirgeme gücü)',
                    info: 'Campbell: NADP⁺ ışık reaksiyonlarının son elektron alıcısıdır; NADPH indirgeme gücünü Calvin döngüsüne taşır.'
                },
                {
                    type: 'order',
                    title: '5. Işığa bağımlı reaksiyonların akışı',
                    description: 'Adımlara sırayla dokunarak doğru akışı kur (ilk olandan başla).',
                    items: [
                        'Klorofil ışığı soğurur (Fotosistem II)',
                        'Su parçalanır, O₂ çıkar',
                        "Elektronlar ETS'de akar, H⁺ lümene pompalanır",
                        'ATP sentaz ile ATP üretilir'
                    ],
                    loc: 'tilakoit',
                    info: 'Işık → fotoliz → ETS ve H⁺ gradyanı → ATP sentaz: ışık enerjisi önce elektron enerjisine, sonra H⁺ gradyanına, en sonunda ATP\'ye dönüşür.'
                },
                {
                    type: 'locate',
                    title: '6. Calvin döngüsünün yeri',
                    description: 'Işıktan bağımsız evre (Calvin döngüsü) kloroplastın hangi bölgesinde gerçekleşir?',
                    correct: 'stroma',
                    info: "Calvin döngüsünün enzimleri stromada çözünmüş haldedir; ATP ve NADPH buraya tilakoitlerden gelir."
                },
                {
                    type: 'choice',
                    title: '7. Karbon fiksasyonu',
                    description: "Calvin döngüsünün ilk evresinde CO₂, 5 karbonlu RuBP'ye bağlanır. Bu tepkimeyi hızlandıran enzim hangisidir?",
                    options: ['Rubisco', 'ATP sentaz', 'Amilaz', 'Katalaz'],
                    correct: 'Rubisco',
                    loc: 'stroma',
                    info: "Campbell: Karbon fiksasyonunu Rubisco katalizler; oluşan kararsız 6C'lu bileşik hemen 2 molekül 3-fosfogliserata (3-PGA) ayrılır."
                },
                {
                    type: 'order',
                    title: '8. Calvin döngüsünün evreleri',
                    description: 'Calvin döngüsünün üç evresini doğru sırayla seç.',
                    items: [
                        'Karbon fiksasyonu (CO₂ + RuBP → 3-PGA)',
                        'İndirgenme (ATP ve NADPH ile 3-PGA → G3P)',
                        "RuBP'nin yenilenmesi (G3P'lerin bir kısmı, ATP ile)"
                    ],
                    loc: 'stroma',
                    gain: { ATP: -18, NADPH: -12, Glikoz: 1 },
                    gainText: 'ATP ve NADPH harcandı, 1 glikoz elde edildi',
                    info: 'Campbell: 1 G3P çıkışı için 3 CO₂ fikse edilir; 1 glikoz için döngü 6 tur döner (18 ATP + 12 NADPH).'
                }
            ]
        },
        solunum: {
            name: '⚡ Mitokondri / Hücresel Solunum (Katabolik Süreç)',
            desc: 'Organik moleküllerin parçalanarak ATP enerjisine dönüşmesi. 9 adım, canlı ATP / NADH sayacıyla.',
            cell: 'mitokondri',
            counters: [
                { key: 'ATP', label: 'ATP' },
                { key: 'NADH', label: 'NADH' },
                { key: 'FADH2', label: 'FADH₂' },
                { key: 'CO2', label: 'CO₂' }
            ],
            stages: [
                {
                    type: 'locate',
                    title: '1. Glikolizin yeri',
                    description: 'Glikoliz hücrenin hangi bölgesinde gerçekleşir? Şemada dokun.',
                    correct: 'sitozol',
                    info: 'Glikoliz mitokondri dışında, sitozolde gerçekleşir; O₂ gerektirmez.'
                },
                {
                    type: 'choice',
                    title: '2. Glikoliz',
                    description: '1 glikoz molekülü glikolizle parçalanıyor. Sonunda net olarak ne elde edilir?',
                    options: ['2 pirüvat + net 2 ATP + 2 NADH', '6 CO₂ + 2 ATP', '2 asetil CoA + 32 ATP', '2 laktat + 36 ATP'],
                    correct: '2 pirüvat + net 2 ATP + 2 NADH',
                    loc: 'sitozol',
                    gain: { ATP: 2, NADH: 2 },
                    gainText: '+2 net ATP, +2 NADH',
                    info: 'Campbell: Glikoliz evrenseldir; oksijenli ve oksijensiz solunumun ortak başlangıcıdır. ATP substrat düzeyinde fosforilasyonla yapılır.'
                },
                {
                    type: 'choice',
                    title: '3. Pirüvat oksidasyonu',
                    description: 'Pirüvat mitokondri matriksine taşınır; CO₂ ayrılır, NAD⁺ NADH\'ye indirgenir. Geriye kalan iki karbonlu bileşik CoA ile birleşir. Bu bileşik nedir?',
                    options: ['Asetil CoA', 'Oksaloasetat', 'Laktat', 'Sitrat'],
                    correct: 'Asetil CoA',
                    loc: 'matriks',
                    gain: { NADH: 2, CO2: 2 },
                    gainText: '2 pirüvat için: +2 NADH, +2 CO₂',
                    info: 'Campbell: Asetil CoA, Krebs döngüsünün girdisidir.'
                },
                {
                    type: 'locate',
                    title: '4. Krebs döngüsünün yeri',
                    description: 'Krebs döngüsü mitokondrinin hangi bölgesinde gerçekleşir?',
                    correct: 'matriks',
                    info: 'Krebs döngüsünün enzimleri mitokondri matriksindedir.'
                },
                {
                    type: 'choice',
                    title: '5. Krebs döngüsü',
                    description: 'Krebs döngüsünde asetil CoA, hangi 4 karbonlu molekülle birleşerek sitratı oluşturur?',
                    options: ['Oksaloasetat', 'Pirüvat', 'RuBP', 'Laktat'],
                    correct: 'Oksaloasetat',
                    loc: 'matriks',
                    gain: { ATP: 2, NADH: 6, FADH2: 2, CO2: 4 },
                    gainText: '2 tur için: +2 ATP, +6 NADH, +2 FADH₂, +4 CO₂',
                    info: 'Campbell: Döngü sonunda oksaloasetat yenilenir; glikozun tüm karbonları CO₂ olarak atılmış olur.'
                },
                {
                    type: 'locate',
                    title: '6. ETS\'nin yeri',
                    description: 'Elektron taşıma zinciri ve ATP sentaz mitokondrinin hangi yapısında bulunur?',
                    correct: 'ic-zar',
                    info: "İç zarın kristalarla kıvrılması yüzeyi artırır; daha fazla ETS ve ATP sentaz yerleşebilir."
                },
                {
                    type: 'choice',
                    title: '7. Oksidatif fosforilasyon',
                    description: "NADH ve FADH₂ elektronlarını ETS'ye verir; H⁺ iyonları matriksten zarlar arası boşluğa pompalanır. H⁺'ların ATP sentaz üzerinden geri akışıyla ATP üretilir. Bu süreç nedir?",
                    options: ['Oksidatif fosforilasyon', 'Substrat düzeyinde fosforilasyon', 'Fotofosforilasyon', 'Fermentasyon'],
                    correct: 'Oksidatif fosforilasyon',
                    loc: 'ic-zar',
                    gain: { ATP: 26 },
                    gainText: '≈ +26 ATP (toplam ≈ 30–32)',
                    info: 'Campbell: ATP verimi sabit değildir; yaklaşık 26–28 ATP oksidatif fosforilasyondan gelir.'
                },
                {
                    type: 'choice',
                    title: '8. Son elektron alıcısı',
                    description: 'Elektronlar ETS boyunca akıp sonunda bir moleküle aktarılır ve su oluşur. Son elektron alıcısı nedir?',
                    options: ['Oksijen (O₂)', 'Karbondioksit (CO₂)', 'Glikoz', 'NAD⁺'],
                    correct: 'Oksijen (O₂)',
                    loc: 'ic-zar',
                    gainText: 'H₂O oluşur; O₂ olmazsa ETS durur',
                    info: 'Campbell: Oksijen son elektron alıcısı olarak elektronları yakalar ve metabolik suyu oluşturur.'
                },
                {
                    type: 'order',
                    title: '9. Hücresel solunumun akışı',
                    description: 'Dört evreyi doğru sırayla seç.',
                    items: [
                        'Glikoliz (sitozol)',
                        'Pirüvat oksidasyonu (matriks)',
                        'Krebs döngüsü (matriks)',
                        'Oksidatif fosforilasyon (iç zar)'
                    ],
                    gainText: 'Toplam ≈ 30–32 ATP',
                    info: 'Glikoz → pirüvat → asetil CoA → CO₂ + taşıyıcılar (NADH, FADH₂) → ETS → ATP ve H₂O.'
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
    let shuffledOpts = [];
    let pool = [];
    let picked = [];
    let counts = {};
    let wrongId = null;

    $: path = selectedPathwayKey ? pathways[selectedPathwayKey] : null;
    $: stage = path ? path.stages[currentStageIndex] : null;
    $: regions = path ? cellRegions[path.cell] : [];
    // locate adımında cevap bitene kadar bölge gösterilmez
    $: hlId = !stage ? null : stage.type === 'locate' ? (stageFinished ? stage.correct : null) : stage.loc ?? null;
    $: showLegend = stage && (stage.type !== 'locate' || stageFinished);

    onMount(() => {
        const saved = localStorage.getItem('bilim_kulubu_player_name');
        if (saved) playerName = saved;
    });

    function shuffle(a) {
        const r = [...a];
        for (let i = r.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [r[i], r[j]] = [r[j], r[i]];
        }
        return r;
    }

    function initStage() {
        const st = pathways[selectedPathwayKey].stages[currentStageIndex];
        stageFinished = false;
        feedback = '';
        picked = [];
        wrongId = null;
        if (st.type === 'choice') shuffledOpts = shuffle(st.options);
        if (st.type === 'order') {
            let p = shuffle(st.items);
            if (p.every((x, i) => x === st.items[i])) p = [...p].reverse();
            pool = p;
        }
    }

    function selectPathway(key) {
        selectedPathwayKey = key;
        currentStageIndex = 0;
        isCompleted = false;
        totalEnergyScore = 0;
        counts = Object.fromEntries(pathways[key].counters.map((c) => [c.key, 0]));
        initStage();
    }

    function finishStage() {
        totalEnergyScore += 25;
        stageFinished = true;
        if (stage.gain) {
            for (const k in stage.gain) counts[k] = Math.max(0, (counts[k] || 0) + stage.gain[k]);
            counts = counts;
        }
    }

    function selectOption(opt) {
        if (stageFinished) return;
        sfx.nav();
        if (opt === stage.correct) {
            feedback = `Başarılı! ⚡ ${stage.info}`;
            finishStage();
        } else {
            feedback = 'Hatalı seçim! Biyokimyasal yolak aksadı. Tekrar dene.';
        }
    }

    function pickRegion(id) {
        if (!stage || stage.type !== 'locate' || stageFinished) return;
        sfx.nav();
        if (id === stage.correct) {
            feedback = `Doğru bölge! ⚡ ${stage.info}`;
            finishStage();
        } else {
            feedback = 'Bu bölge değil. Şemadaki yapılara dikkatle bak ve tekrar dene.';
            wrongId = id;
            setTimeout(() => (wrongId = null), 700);
        }
    }

    function pickOrder(item) {
        if (stageFinished) return;
        sfx.nav();
        picked = [...picked, item];
        pool = pool.filter((x) => x !== item);
        if (pool.length === 0) {
            if (picked.every((x, i) => x === stage.items[i])) {
                feedback = `Başarılı! ⚡ ${stage.info}`;
                finishStage();
            } else {
                initStage();
                feedback = 'Sıralama yanlış. Akışı baştan kurmayı dene.';
            }
        }
    }

    function resetOrder() {
        initStage();
    }

    function nextStage() {
        if (currentStageIndex < path.stages.length - 1) {
            currentStageIndex++;
            initStage();
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

    function onKey(e, id) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            pickRegion(id);
        }
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
                {#each Object.entries(pathways) as [key, p]}
                    <div class="path-card">
                        <div>
                            <h4 style="margin-bottom: 8px; color: var(--accent);">{p.name}</h4>
                            <p style="font-size: var(--fs-sm); color: var(--text-muted); margin-bottom: 16px; line-height: 1.4;">{p.desc}</p>
                        </div>
                        <button class="btn btn-primary" on:click={() => selectPathway(key)}>Simülasyonu Başlat →</button>
                    </div>
                {/each}
            </div>
        {:else if !isCompleted}
            <!-- Aktif Süreç Ekranı -->
            <div class="stage-head">
                <span class="badge dev">{path.name}</span>
                <span style="font-size: var(--fs-xs); color: var(--text-muted);">Adım {currentStageIndex + 1} / {path.stages.length}</span>
            </div>
            <div class="progress" aria-hidden="true"><span style="width: {((currentStageIndex + (stageFinished ? 1 : 0)) / path.stages.length) * 100}%"></span></div>

            <!-- Canlı sayaçlar -->
            <div class="counters">
                {#each path.counters as c}
                    <span class="chip">{c.label} <b>{counts[c.key] ?? 0}</b></span>
                {/each}
            </div>

            <!-- Hücre şeması -->
            <div class="cell-wrap">
                <svg viewBox="0 0 400 240" role="img" aria-label={path.cell === 'kloroplast' ? 'Kloroplast şeması' : 'Mitokondri şeması'}>
                    {#if path.cell === 'kloroplast'}
                        <g class="region" class:hl={hlId === 'stroma'} class:dim={hlId && hlId !== 'stroma'} class:wrong={wrongId === 'stroma'} class:clickable={stage.type === 'locate' && !stageFinished}
                           style="--c:{colorOf('kloroplast', 'stroma')}" role="button" tabindex="0" aria-label="Stroma" on:click={() => pickRegion('stroma')} on:keydown={(e) => onKey(e, 'stroma')}>
                            <ellipse class="fill" cx="200" cy="120" rx="182" ry="98" />
                        </g>
                        <g class="region" class:hl={hlId === 'dis-zar'} class:dim={hlId && hlId !== 'dis-zar'} class:wrong={wrongId === 'dis-zar'} class:clickable={stage.type === 'locate' && !stageFinished}
                           style="--c:{colorOf('kloroplast', 'dis-zar')}" role="button" tabindex="0" aria-label="Dış zar" on:click={() => pickRegion('dis-zar')} on:keydown={(e) => onKey(e, 'dis-zar')}>
                            <ellipse class="ring" cx="200" cy="120" rx="188" ry="104" stroke-width="11" />
                        </g>
                        <g class="region" class:hl={hlId === 'tilakoit'} class:dim={hlId && hlId !== 'tilakoit'} class:wrong={wrongId === 'tilakoit'} class:clickable={stage.type === 'locate' && !stageFinished}
                           style="--c:{colorOf('kloroplast', 'tilakoit')}" role="button" tabindex="0" aria-label="Tilakoit zar" on:click={() => pickRegion('tilakoit')} on:keydown={(e) => onKey(e, 'tilakoit')}>
                            <path class="lamella" d="M127,90 L168,120 M127,150 L168,120 M232,120 L273,90 M232,120 L273,150" />
                            {#each grana as [cx, cy]}
                                <rect class="hit" x={cx - 36} y={cy - 34} width="72" height="72" />
                                {#each [0, 1, 2, 3] as k}
                                    <rect class="fill thin" x={cx - 32} y={cy - 30 + k * 16} width="64" height="11" rx="5.5" />
                                {/each}
                            {/each}
                        </g>
                    {:else}
                        <g class="region" class:hl={hlId === 'sitozol'} class:dim={hlId && hlId !== 'sitozol'} class:wrong={wrongId === 'sitozol'} class:clickable={stage.type === 'locate' && !stageFinished}
                           style="--c:{colorOf('mitokondri', 'sitozol')}" role="button" tabindex="0" aria-label="Sitozol" on:click={() => pickRegion('sitozol')} on:keydown={(e) => onKey(e, 'sitozol')}>
                            <rect class="fill bg" x="0" y="0" width="400" height="240" />
                        </g>
                        <g class="region" class:hl={hlId === 'zarlar-arasi'} class:dim={hlId && hlId !== 'zarlar-arasi'} class:wrong={wrongId === 'zarlar-arasi'} class:clickable={stage.type === 'locate' && !stageFinished}
                           style="--c:{colorOf('mitokondri', 'zarlar-arasi')}" role="button" tabindex="0" aria-label="Zarlar arası boşluk" on:click={() => pickRegion('zarlar-arasi')} on:keydown={(e) => onKey(e, 'zarlar-arasi')}>
                            <ellipse class="fill" cx="200" cy="120" rx="178" ry="98" />
                        </g>
                        <g class="region" class:hl={hlId === 'dis-zar'} class:dim={hlId && hlId !== 'dis-zar'} class:wrong={wrongId === 'dis-zar'} class:clickable={stage.type === 'locate' && !stageFinished}
                           style="--c:{colorOf('mitokondri', 'dis-zar')}" role="button" tabindex="0" aria-label="Dış zar" on:click={() => pickRegion('dis-zar')} on:keydown={(e) => onKey(e, 'dis-zar')}>
                            <ellipse class="ring" cx="200" cy="120" rx="178" ry="98" stroke-width="10" />
                        </g>
                        <g class="region" class:hl={hlId === 'matriks'} class:dim={hlId && hlId !== 'matriks'} class:wrong={wrongId === 'matriks'} class:clickable={stage.type === 'locate' && !stageFinished}
                           style="--c:{colorOf('mitokondri', 'matriks')}" role="button" tabindex="0" aria-label="Matriks" on:click={() => pickRegion('matriks')} on:keydown={(e) => onKey(e, 'matriks')}>
                            <ellipse class="fill" cx="200" cy="120" rx="152" ry="72" />
                        </g>
                        <g class="region" class:hl={hlId === 'ic-zar'} class:dim={hlId && hlId !== 'ic-zar'} class:wrong={wrongId === 'ic-zar'} class:clickable={stage.type === 'locate' && !stageFinished}
                           style="--c:{colorOf('mitokondri', 'ic-zar')}" role="button" tabindex="0" aria-label="İç zar" on:click={() => pickRegion('ic-zar')} on:keydown={(e) => onKey(e, 'ic-zar')}>
                            <ellipse class="ring" cx="200" cy="120" rx="152" ry="72" stroke-width="7" />
                            {#each [115, 195, 275] as x}
                                <path class="ring finger" d="M{x},{120 - edge(x)} v42" stroke-width="9" />
                            {/each}
                            {#each [155, 235, 315] as x}
                                <path class="ring finger" d="M{x},{120 + edge(x)} v-42" stroke-width="9" />
                            {/each}
                        </g>
                    {/if}
                </svg>
            </div>
            {#if showLegend}
                <div class="legend">
                    {#each regions as r}
                        <span class:on={hlId === r.id}><i style="background:{r.color}"></i>{r.label}</span>
                    {/each}
                </div>
            {/if}

            <h4 style="margin: 14px 0 10px; color: var(--text);">{stage.title}</h4>
            <p style="font-size: var(--fs-md); margin-bottom: 20px; line-height: 1.5;">{stage.description}</p>

            {#if stage.type === 'choice'}
                <div class="opt-grid">
                    {#each shuffledOpts as opt}
                        <button
                            class="btn {stageFinished && opt === stage.correct ? 'btn-primary' : 'btn-ghost'}"
                            style="padding: 16px;"
                            disabled={stageFinished}
                            on:click={() => selectOption(opt)}>
                            🧪 {opt}
                        </button>
                    {/each}
                </div>
            {:else if stage.type === 'locate'}
                {#if !stageFinished}<p class="hint">👆 Şemada doğru bölgeye dokun.</p>{/if}
            {:else}
                <div class="order-box">
                    <ol class="picked">
                        {#each picked as item}<li>{item}</li>{/each}
                        {#if picked.length === 0}<li class="empty">Seçtiğin adımlar burada sıralanır</li>{/if}
                    </ol>
                    {#if !stageFinished}
                        <div class="pool">
                            {#each pool as item}
                                <button class="btn btn-ghost" on:click={() => pickOrder(item)}>{item}</button>
                            {/each}
                        </div>
                        {#if picked.length > 0}<button class="btn btn-ghost small" on:click={resetOrder}>↺ Sıfırla</button>{/if}
                    {/if}
                </div>
            {/if}

            {#if feedback}
                <div class="fb" class:ok={stageFinished}>
                    <p style="margin: 0; font-size: var(--fs-sm); color: var(--text);">{feedback}</p>
                    {#if stageFinished && stage.gainText}
                        <p style="margin: 6px 0 0 0; font-size: var(--fs-xs); color: var(--accent);">Kazanım: <b>{stage.gainText}</b></p>
                    {/if}
                </div>
            {/if}

            <div class="action-row">
                {#if stageFinished}
                    <button class="btn btn-primary next-btn" on:click={nextStage}>
                        {currentStageIndex < path.stages.length - 1 ? 'Sonraki Adıma Geç →' : 'Süreci Tamamla ve Rapor Al 🏁'}
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
                    {path.name} yolaklarını doğru moleküler basamaklarla yöneterek laboratuvar simülasyonunu tamamladın.
                </p>
                <div class="counters" style="justify-content: center;">
                    {#each path.counters as c}
                        <span class="chip">{c.label} <b>{counts[c.key] ?? 0}</b></span>
                    {/each}
                </div>
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
    .action-row :global(.btn),
    .pool :global(.btn) {
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
        margin-bottom: 10px;
    }
    .stage-head :global(.badge) { min-width: 0; }
    .progress { height: 5px; border-radius: 99px; background: var(--border); overflow: hidden; margin-bottom: 14px; }
    .progress span { display: block; height: 100%; background: var(--accent); transition: width 0.3s var(--ease); }

    .counters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .chip {
        font-size: var(--fs-xs);
        padding: 4px 10px;
        border-radius: 99px;
        background: var(--accent-soft);
        border: 1px solid var(--border);
        color: var(--text-muted);
        white-space: nowrap;
    }
    .chip b { color: var(--text); margin-left: 4px; font-variant-numeric: tabular-nums; }

    /* Hücre şeması */
    .cell-wrap {
        background: var(--bg-alt);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 8px;
    }
    svg { display: block; width: 100%; max-width: 480px; height: auto; margin: 0 auto; }
    .region { transition: opacity 0.25s var(--ease); outline: none; }
    .region.dim { opacity: 0.4; }
    .region.clickable { cursor: pointer; }
    .region.clickable:hover .fill,
    .region.clickable:focus-visible .fill { fill: color-mix(in srgb, var(--c) 48%, transparent); }
    .region.clickable:hover .ring,
    .region.clickable:hover .lamella { stroke-width: 12; }
    .fill { fill: color-mix(in srgb, var(--c) 26%, transparent); stroke: none; }
    .fill.thin { fill: color-mix(in srgb, var(--c) 55%, transparent); stroke: var(--c); stroke-width: 2; }
    .fill.bg { fill: color-mix(in srgb, var(--c) 12%, transparent); }
    .hit { fill: transparent; stroke: none; }
    .ring { fill: none; stroke: var(--c); stroke-linecap: round; }
    .lamella { fill: none; stroke: var(--c); stroke-width: 3; }
    .region.hl .fill { fill: color-mix(in srgb, var(--c) 55%, transparent); }
    .region.hl .ring,
    .region.hl .fill.thin { filter: drop-shadow(0 0 5px var(--c)); }
    .region.wrong .fill,
    .region.wrong .fill.thin { fill: color-mix(in srgb, var(--danger) 50%, transparent); }
    .region.wrong .ring { stroke: var(--danger); }

    .legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 10px; font-size: var(--fs-xs); color: var(--text-muted); }
    .legend span { display: inline-flex; align-items: center; gap: 6px; }
    .legend span.on { color: var(--text); font-weight: 600; }
    .legend i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
    .hint { color: var(--accent); font-size: var(--fs-sm); margin: -8px 0 16px; }

    /* Sıralama görevi */
    .order-box { margin-bottom: 20px; display: grid; gap: 12px; }
    .picked { list-style: decimal; margin: 0; padding: 12px 12px 12px 34px; background: var(--bg-alt); border: 1px dashed var(--border-strong); border-radius: var(--radius-sm); display: grid; gap: 6px; font-size: var(--fs-sm); }
    .picked li { overflow-wrap: anywhere; }
    .picked li.empty { list-style: none; margin-left: -22px; color: var(--text-faint); }
    .pool { display: grid; gap: 8px; }
    .btn.small { justify-self: start; padding: 6px 12px; font-size: var(--fs-xs); }

    .fb { padding: 14px; border-radius: var(--radius-sm); background: var(--danger-soft); border: 1px solid var(--danger); margin-bottom: 20px; }
    .fb.ok { background: var(--accent-3-soft); border-color: var(--accent-3); }

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
