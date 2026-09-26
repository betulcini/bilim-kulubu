<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { series } from '$lib/data/series.js';
</script>

<svelte:head><title>Bilim Serileri · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
	eyebrow="Bilim Serileri"
	title="Kısa video serileriyle bilim anlatımı"
	desc="Kulübün ürettiği ya da üretmeyi planladığı eğitici video serileri. Şu an bölümlerin video içerikleri geliştirme aşamasında; metin ve planlama kısımları burada güncel tutulacak."
/>

<div class="content-max">
	<div class="card-grid" style="margin-bottom:48px">
		{#each series as s}
			<div class="bracket-card">
				{#if s.devBadge}<span class="badge dev">Geliştirme aşamasında</span>{/if}
				<h3 style="margin-top:12px">{s.title}</h3>
				<p>{s.desc}</p>
				<div class="meta">
					<span>{s.bolum}</span>
					<span>·</span>
					<span>{s.durum}</span>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.meta {
		display: flex;
		gap: 8px;
		font-size: var(--fs-xs);
		color: var(--text-faint);
	}
</style>
