<script>
	import { onMount, tick } from 'svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { galleryItems } from '$lib/data/gallery.js';
	import { loadGaleri } from '$lib/galeriDb.js';
	import { formatTarih } from '$lib/content.js';
	import Icon from '$lib/components/Icon.svelte';

	// Önce koddaki yedek liste; Supabase'den (yönetici panelinden eklenenler) veri gelirse onun yerini alır.
	let items = galleryItems;
	let yuklendi = false;

	onMount(async () => {
		const db = await loadGaleri();
		if (db) items = db;
		yuklendi = true;
	});

	// ---- büyütme penceresi ----
	let acik = null; // açık fotoğrafın sırası
	let kapatDugme;
	let tetikleyen = null;

	async function ac(i, e) {
		tetikleyen = e.currentTarget;
		acik = i;
		await tick();
		kapatDugme?.focus();
	}
	function kapat() {
		acik = null;
		tetikleyen?.focus();
	}
	function git(yon) {
		acik = (acik + yon + items.length) % items.length;
	}
	function tus(e) {
		if (acik === null) return;
		if (e.key === 'Escape') kapat();
		else if (e.key === 'ArrowRight') git(1);
		else if (e.key === 'ArrowLeft') git(-1);
	}

	$: bos = yuklendi && items.length === 0;
	$: desc = items.length
		? 'Kulüp etkinliklerinden kareler. Bir fotoğrafa dokunarak büyütebilirsin.'
		: 'Kulüp etkinliklerinden fotoğraflar burada yer alacak. Henüz paylaşılmış bir etkinlik fotoğrafı yok.';
</script>

<svelte:window on:keydown={tus} />
<svelte:head><title>Galeri · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader eyebrow="Galeri" title="Etkinliklerden kareler" {desc} />

<div class="content-max">
	{#if bos}
		<div class="bracket-card empty">
			<span class="ico-tile lg"><Icon name="gallery" size={28} /></span>
			<h3 aria-level="2">Henüz fotoğraf yok</h3>
			<p>Kulüp etkinlikleri yapıldıkça fotoğraflar buraya eklenecek.</p>
		</div>
	{/if}
	<div class="gallery-grid" style="margin-bottom:48px">
		{#each items as g, i}
			<figure class="tile">
				{#if g.gorsel}
					<button type="button" class="tile-btn" on:click={(e) => ac(i, e)} aria-label="{g.baslik} fotoğrafını büyüt">
						<img class="tile-img" src={g.gorsel} alt={g.baslik} loading="lazy" />
					</button>
				{:else}
					<div class="tile-visual"><Icon name="gallery" size={26} /></div>
				{/if}
				<figcaption>
					<strong>{g.baslik}</strong>
					{#if g.aciklama}<span>{g.aciklama}</span>{/if}
					{#if g.tarih}<span>{formatTarih(g.tarih)}</span>{/if}
				</figcaption>
			</figure>
		{/each}
	</div>
</div>

{#if acik !== null && items[acik]}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
	<div class="lb" role="dialog" aria-modal="true" tabindex="-1" aria-label={items[acik].baslik} on:click|self={kapat}>
		<button type="button" class="lb-kapat" bind:this={kapatDugme} on:click={kapat} aria-label="Kapat"><Icon name="close" size={22} /></button>
		{#if items.length > 1}
			<button type="button" class="lb-ok sol" on:click={() => git(-1)} aria-label="Önceki fotoğraf"><span class="geri"><Icon name="chevron" size={22} /></span></button>
			<button type="button" class="lb-ok sag" on:click={() => git(1)} aria-label="Sonraki fotoğraf"><Icon name="chevron" size={22} /></button>
		{/if}
		<figure class="lb-kutu">
			<img src={items[acik].gorsel} alt={items[acik].baslik} />
			<figcaption>
				<strong>{items[acik].baslik}</strong>
				{#if items[acik].aciklama}<span>{items[acik].aciklama}</span>{/if}
			</figcaption>
		</figure>
	</div>
{/if}

<style>
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 10px;
		padding: 40px 20px;
		margin-bottom: 48px;
	}
	.empty h3, .empty p {
		margin: 0;
	}
	.empty p {
		color: var(--text-muted);
	}
	.tile-btn {
		display: block;
		width: 100%;
		padding: 0;
		border: 0;
		background: none;
		cursor: zoom-in;
	}
	.tile-btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}
	.tile-img {
		display: block;
		width: 100%;
		height: 180px;
		object-fit: cover;
	}
	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
		gap: 16px;
	}
	.tile {
		margin: 0;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--surface);
	}
	.tile-visual {
		height: 140px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-faint);
		border-bottom: 1px dashed var(--border-strong);
	}
	figcaption {
		padding: 12px 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	figcaption strong {
		font-family: var(--font-display);
		font-size: var(--fs-sm);
		overflow-wrap: anywhere;
	}
	figcaption span {
		font-size: var(--fs-xs);
		color: var(--text-muted);
		overflow-wrap: anywhere;
	}

	.lb {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 56px 12px 16px;
		background: rgba(0, 0, 0, 0.85);
	}
	.lb-kutu {
		margin: 0;
		max-width: min(100%, 1100px);
		max-height: 100%;
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: center;
	}
	.lb-kutu img {
		display: block;
		max-width: 100%;
		max-height: calc(100dvh - 160px);
		object-fit: contain;
		border-radius: var(--radius-sm);
	}
	.lb-kutu figcaption {
		padding: 0;
		align-items: center;
		text-align: center;
		color: #fff;
	}
	.lb-kutu figcaption span {
		color: rgba(255, 255, 255, 0.8);
	}
	.lb-kapat, .lb-ok {
		position: absolute;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.35);
		background: rgba(0, 0, 0, 0.55);
		color: #fff;
		cursor: pointer;
	}
	.lb-kapat:focus-visible, .lb-ok:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 2px;
	}
	.lb-kapat { top: 8px; right: 8px; }
	.lb-ok { top: 50%; transform: translateY(-50%); }
	.lb-ok.sol { left: 8px; }
	.lb-ok.sag { right: 8px; }
	.geri { display: inline-flex; transform: scaleX(-1); }
</style>
