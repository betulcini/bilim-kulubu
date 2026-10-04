<script>
	import { onMount } from 'svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import VideoBolumu from '$lib/components/VideoBolumu.svelte';
	import VideoTanitimKarti from '$lib/components/VideoTanitimKarti.svelte';
	import { loadVideoKartlari } from '$lib/videoDb.js';
	import { shows } from '$lib/data/theater.js';

	/** @type {{ title: string, desc: string, durum?: string, detay?: string, rozet?: string, sahne?: string, devBadge?: boolean }[]} */
	let kartlar = shows;
	onMount(async () => {
		const kayitliKartlar = await loadVideoKartlari('tiyatro');
		if (kayitliKartlar) kartlar = kayitliKartlar;
	});
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
		{#each kartlar as s}
			<VideoTanitimKarti kart={s} />
		{/each}
	</div>
</div>
