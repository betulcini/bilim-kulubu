<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { galleryItems } from '$lib/data/gallery.js';
	import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head><title>Galeri · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
	eyebrow="Galeri"
	title="Etkinliklerden kareler"
	desc="Fotoğraflar geliştirme aşamasında — gerçek etkinlik fotoğrafları eklendikçe bu alanlar güncellenecek."
/>

<div class="content-max">
	<div class="gallery-grid" style="margin-bottom:48px">
		{#each galleryItems as g}
			<figure class="tile">
				<div
					class="tile-visual"
					style="background: linear-gradient(135deg, {g.renk[0]}33, {g.renk[1]})"
				>
					<Icon name="gallery" size={26} />
				</div>
				<figcaption>
					<strong>{g.baslik}</strong>
					<span>{g.aciklama}</span>
				</figcaption>
			</figure>
		{/each}
	</div>
</div>

<style>
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
