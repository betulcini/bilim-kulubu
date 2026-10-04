<script>
	import { onMount } from 'svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import VideoBolumu from '$lib/components/VideoBolumu.svelte';
	import VideoTanitimKarti from '$lib/components/VideoTanitimKarti.svelte';
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
			<VideoTanitimKarti kart={s} />
		{/each}
	</div>
</div>
