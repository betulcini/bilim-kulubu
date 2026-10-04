<script>
	import Icon from '$lib/components/Icon.svelte';
    import PageHeader from '$lib/components/PageHeader.svelte';
    import { sfx } from '$lib/sound.js';
    import { activity } from '$lib/stores/activity.js';
    import { scientists } from '$lib/data/bilim-insanlari.js';
    import { onMount } from 'svelte';

    let searchQuery = '';
    let selectedCategory = 'Tümü';

    onMount(() => {
        const ara = new URLSearchParams(window.location.search).get('ara');
        if (ara) searchQuery = ara;
    });

    const categories = ['Tümü', 'Fizik', 'Biyoloji & Tıp', 'Bilgisayar & Mühendislik', 'Kimya', 'Astronomi', 'Matematik', 'Diğer'];

    $: filteredScientists = scientists.filter(s => {
        const matchesCategory = selectedCategory === 'Tümü' || s.kategori === selectedCategory;
        const matchesSearch = s.ad.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              s.alan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              s.ozet.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    let activeModalScientist = null;

    function openModal(scientist) {
        sfx.nav();
        activity.mark('scientists', scientist.id);
        activeModalScientist = scientist;
    }

    function closeModal() {
        activeModalScientist = null;
    }

    // --- Günün Bilim İnsanı: yılın gününe göre deterministik seçim ---
    // Aynı gün içinde herkese aynı kişiyi gösterir, gün değişince otomatik değişir.
    function gununBilimInsani() {
        const bugun = new Date();
        const yilBasi = new Date(bugun.getFullYear(), 0, 0);
        const gunSayisi = Math.floor((bugun.getTime() - yilBasi.getTime()) / 86400000);
        return scientists[gunSayisi % scientists.length];
    }
    const gununKisisi = gununBilimInsani();
</script>

<svelte:head>
    <title>Bilim İnsanları Galerisi · Bilim Kulübü</title>
</svelte:head>

<PageHeader eyebrow="İlham Veren Yaşamlar" title="Bilim İnsanları Galerisi" desc="Tarihin seyrini değiştiren dâhileri, buluşlarını ve insanlığa bıraktıkları mirası keşfedin." />

<div class="content-max" style="margin-bottom: 60px;">

    <!-- Günün Bilim İnsanı -->
    <button
        type="button"
        class="bracket-card gunun-kisisi-card"
        style="width: 100%; text-align: left; cursor: pointer; margin-bottom: 30px; display: flex; align-items: center; gap: 18px; flex-wrap: wrap; font: inherit; color: inherit;"
        on:click={() => openModal(gununKisisi)}
    >
        <span class="ico-tile xl" aria-hidden="true"><Icon name={gununKisisi.rozet} size={36} /></span>
        <div style="flex: 1; min-width: 200px;">
            <span class="badge live" style="margin-bottom: 8px;">Günün Bilim İnsanı</span>
            <h3 aria-level="2" style="margin: 6px 0 4px;">{gununKisisi.ad}</h3>
            <p style="margin: 0; color: var(--text-muted); font-size: var(--fs-sm);">{gununKisisi.ozet}</p>
        </div>
        <span style="color: var(--accent); font-weight: 600; white-space: nowrap;">Detayları gör →</span>
    </button>

    <!-- Filtreler ve Arama Alanı -->
    <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;">
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            {#each categories as cat}
                <button 
                    class="btn {selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}"
                    style="font-size: var(--fs-xs); padding: 8px 16px;"
                    on:click={() => { selectedCategory = cat; sfx.nav(); }}>
                    {cat}
                </button>
            {/each}
        </div>

        <div style="display: flex; align-items: center; background: var(--bg-alt); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 14px;">
            <span style="margin-right: 10px; color: var(--text-muted); display: inline-flex;"><Icon name="search" size={18} /></span>
            <input 
                type="text" 
                bind:value={searchQuery} 
                placeholder="İsim, alan veya anahtar kelime ara (örn: Tesla, Kuantum, Penisilin)..." 
                style="background: transparent; border: none; color: var(--text); width: 100%; font-size: var(--fs-sm);"
            />
        </div>
    </div>

    <!-- Bilim İnsanları Kart Grid Yapısı -->
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        {#each filteredScientists as scientist (scientist.id)}
            <div
                class="bracket-card"
                style="cursor: pointer; display: flex; flex-direction: column;"
                role="button"
                tabindex="0"
                on:click={() => openModal(scientist)}
                on:keydown={(e) => e.key === 'Enter' && openModal(scientist)}
            >
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <span class="ico-tile lg" aria-hidden="true"><Icon name={scientist.rozet} size={28} /></span>
                    {#if scientist.donem}<span class="badge dev">{scientist.donem}</span>{/if}
                </div>
                <h3 style="margin-bottom: 6px; font-size: var(--fs-lg);">{scientist.ad}</h3>
                <p style="font-size: var(--fs-xs); color: var(--accent); font-weight: 600; margin-bottom: 12px;">{scientist.alan}</p>
                <p style="font-size: var(--fs-sm); color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">{scientist.ozet}</p>

                <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 12px; margin-top: auto;">
                    <span style="font-size: var(--fs-xs); color: var(--text-muted);">Detayları İncele</span>
                    <span style="color: var(--accent);">→</span>
                </div>
            </div>
        {:else}
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                Aradığınız kriterlere uygun bilim insanı bulunamadı.
            </div>
        {/each}
    </div>

</div>

<!-- Detay Modalı -->
{#if activeModalScientist}
<div
    style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;"
    role="button"
    tabindex="0"
    on:click={closeModal}
    on:keydown={(e) => e.key === 'Escape' && closeModal()}
>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
        class="bracket-card"
        style="max-width: 520px; width: 100%; max-height: 85vh; overflow-y: auto;"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        on:click|stopPropagation
    >
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span class="ico-tile lg" aria-hidden="true"><Icon name={activeModalScientist.rozet} size={28} /></span>
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem;">{activeModalScientist.ad}</h2>
                    <span style="font-size: var(--fs-xs); color: var(--text-muted);">{activeModalScientist.donem ? activeModalScientist.donem + ' · ' : ''}{activeModalScientist.alan}</span>
                </div>
            </div>
            <button class="btn btn-ghost" style="padding: 6px 10px;" on:click={closeModal} aria-label="Kapat"><Icon name="close" size={16} /></button>
        </div>

        <p style="font-size: var(--fs-base); line-height: 1.6; color: var(--text); margin-bottom: 20px;">
            {activeModalScientist.detay}
        </p>

        {#if activeModalScientist.soz && activeModalScientist.soz.trim()}
        <div style="background: var(--bg-alt); padding: 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--accent); margin-bottom: 25px;">
            <p style="margin: 0; font-style: italic; font-size: var(--fs-sm); color: var(--text);">
                "{activeModalScientist.soz}"
            </p>
        </div>
        {/if}

        <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-primary" on:click={closeModal}>Kapat</button>
        </div>
    </div>
</div>
{/if}