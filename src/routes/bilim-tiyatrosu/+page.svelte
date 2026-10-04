<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import VideoBolumu from '$lib/components/VideoBolumu.svelte';
	import { shows } from '$lib/data/theater.js';
</script>

<svelte:head><title>Bilim Tiyatrosu · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
	eyebrow="Bilim Tiyatrosu"
	title="Sahneye taşınan bilim"
	desc="Kulübün okul etkinliklerinde sahnelemeyi planladığı kısa bilim gösterileri ve skeçler. Fikirler hazırlandıkça ve çalışmalar ilerledikçe burada güncellenecek; kayıtlar yayına girince aşağıda izlenebilir."
/>

<div class="content-max">
	<VideoBolumu bolum="tiyatro" baslik="Gösteri kayıtları" />
	<div class="card-grid" style="margin-bottom:48px">
		{#each shows as s}
			<div class="bracket-card">
				{#if s.devBadge}<span class="badge dev theater-status">{s.durum}</span>{/if}
				<h3 aria-level="2" style="margin-top:12px">{s.title}</h3>
				<p>{s.desc}</p>
				<div class="meta">{s.sahne}</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.meta {
		font-size: var(--fs-xs);
		color: var(--text-faint);
	}
	.theater-status { align-items: flex-start; line-height: 1.35; }
</style>
