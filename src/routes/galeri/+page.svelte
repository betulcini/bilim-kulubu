<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { galleryItems } from '$lib/data/gallery.js';
	import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head><title>Galeri · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
	eyebrow="Galeri"
	title="Etkinliklerden kareler"
	desc="Kulüp etkinliklerinden fotoğraflar burada yer alacak. Henüz paylaşılmış bir etkinlik fotoğrafı yok."
/>

<div class="content-max">
	{#if galleryItems.length === 0}
		<div class="bracket-card empty">
			<span class="ico-tile lg"><Icon name="gallery" size={28} /></span>
			<h3 aria-level="2">Henüz fotoğraf yok</h3>
			<p>Kulüp etkinlikleri yapıldıkça fotoğraflar buraya eklenecek.</p>
		</div>
	{/if}
	<div class="gallery-grid" style="margin-bottom:48px">
		{#each galleryItems as g}
			<figure class="tile">
				{#if g.gorsel}
					<img class="tile-img" src={g.gorsel} alt={g.baslik} loading="lazy" />
				{:else}
					<div class="tile-visual"><Icon name="gallery" size={26} /></div>
				{/if}
				<figcaption>
					<strong>{g.baslik}</strong>
					<span>{g.aciklama}</span>
				</figcaption>
			</figure>
		{/each}
	</div>
</div>

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
	}
	figcaption span {
		font-size: var(--fs-xs);
		color: var(--text-muted);
	}
</style>
