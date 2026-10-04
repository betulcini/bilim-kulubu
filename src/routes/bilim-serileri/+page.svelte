<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import VideoBolumu from '$lib/components/VideoBolumu.svelte';
	import { series } from '$lib/data/series.js';
</script>

<svelte:head><title>Bilim Serileri · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
	eyebrow="Bilim Serileri"
	title="Kısa video serileriyle bilim anlatımı"
	desc="Kulübün ürettiği ve üretmeyi planladığı eğitici video serileri. Yayına giren videolar aşağıda izlenebilir; planlanan seriler hazırlandıkça burada güncellenecek."
/>

<div class="content-max">
	<VideoBolumu bolum="seri" baslik="Yayındaki videolar" />
	<div class="card-grid" style="margin-bottom:48px">
		{#each series as s}
			<div class="bracket-card">
				{#if s.devBadge}<span class="badge dev">Geliştirme aşamasında</span>{/if}
				<h3 aria-level="2" style="margin-top:12px">{s.title}</h3>
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
