<script>
    import PageHeader from '$lib/components/PageHeader.svelte';
    import { sfx } from '$lib/sound.js';

    const oyunlar = [

        {
            href: '/oyunlar/hafiza',
            baslik: 'Kart Eşleştirme',
            aciklama: 'Soru/tepkime kartını doğru cevap/ürün kartıyla eşleştir — 20 konu, 200+ kart çifti.',
            aktif: true
        },
        {
            href: '/oyunlar/biyoloji-enerji',
            baslik: 'Hücresel Solunum & Fotosentez',
            aciklama: 'Campbell Biyoloji temelli enerji akışı ve metabolizma simülasyonu.',
            aktif: true
        },
        {
            href: '/oyunlar/adam-asmaca',
            baslik: 'Bilimsel Adam Asmaca',
            aciklama: 'Fizik, biyoloji, kimya ve daha fazlasından 690+ terimi harf harf çöz.',
            aktif: true
        },
        {
            href: '/oyunlar/bilim-tabu',
            baslik: 'Bilim Tabu',
            aciklama: 'Yasaklı kelimeleri söylemeden bilimsel terimi anlat — iki takımlı, süreli, 840+ kartlık tabu.',
            aktif: true
        },
        {
            href: null,
            baslik: 'Kimya Laboratuvarı Simülasyonu',
            aciklama: 'Sanal ortamda güvenli deney tasarlama oyunu.',
            aktif: false
        }
    ];
</script>

<svelte:head><title>Oyunlar · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
    eyebrow="Oyunlar"
    title="Oynayarak öğren"
    desc="Kulübün bilim temalı mini oyunları. Yeni oyunlar zaman içinde eklenecek."
/>

<div class="content-max">
    <div class="card-grid" style="margin-bottom:48px">
        {#each oyunlar as o}
            {#if o.aktif}
                <a href={o.href} class="bracket-card game-card" on:click={() => sfx.nav()}>
                    <span class="badge live">Oynanabilir</span>
                    <h3 aria-level="2" style="margin-top:12px">{o.baslik}</h3>
                    <p>{o.aciklama}</p>
                </a>
            {:else}
                <div class="bracket-card game-card disabled">
                    <span class="badge dev">Geliştirme aşamasında</span>
                    <h3 style="margin-top:12px">{o.baslik}</h3>
                    <p>{o.aciklama}</p>
                </div>
            {/if}
        {/each}
    </div>
</div>

<style>
    .game-card {
        text-decoration: none;
        color: var(--text);
        display: block;
    }
    .game-card.disabled {
        opacity: 0.65;
    }
</style>