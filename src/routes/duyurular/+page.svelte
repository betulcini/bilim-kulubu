<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { announcements } from '$lib/data/announcements.js';
</script>

<svelte:head><title>Bilim Duyuruları · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
	eyebrow="Duyurular"
	title="Bilim ve teknoloji gelişmeleri"
	desc="Kulüp danışmanlığında derlenen güncel bilim ve teknoloji haberleri."
/>

<div class="content-max">
	<div class="card-grid" style="margin-bottom:48px">
		{#each announcements as a}
			<div class="bracket-card">
				<span class="badge info">{a.etiket}</span>
				<h3 style="margin-top:12px">{a.baslik}</h3>
				<p>{a.ozet}</p>
				<p class="tarih">{a.tarih}</p>
			</div>
		{/each}
	</div>
</div>

<style>
	.tarih {
		color: var(--text-faint);
		font-size: var(--fs-xs);
		margin: 0;
	}
</style>
