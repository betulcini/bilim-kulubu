<script>
	import { onMount } from 'svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import VideoBolumu from '$lib/components/VideoBolumu.svelte';
	import { loadVideoKartlari } from '$lib/videoDb.js';
	import { series } from '$lib/data/series.js';

	/** @type {{ title: string, desc: string, durum?: string, detay?: string, rozet?: string, bolum?: string, devBadge?: boolean }[]} */
	let kartlar = series;
	onMount(async () => {
		const kayitliKartlar = await loadVideoKartlari('seri');
		if (kayitliKartlar) kartlar = kayitliKartlar;
	});
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
		{#each kartlar as s}
			<div class="bracket-card">
				{#if s.rozet || s.devBadge}<span class="badge dev">{s.rozet || 'Geliştirme aşamasında'}</span>{/if}
				<h3 aria-level="2" style="margin-top:12px">{s.title}</h3>
				<p>{s.desc}</p>
				<div class="meta">
					{#if s.detay || s.bolum}<span>{s.detay || s.bolum}</span>{/if}
					{#if (s.detay || s.bolum) && s.durum}<span>·</span>{/if}
					{#if s.durum}<span>{s.durum}</span>{/if}
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
