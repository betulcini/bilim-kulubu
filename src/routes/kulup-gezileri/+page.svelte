<script>
	import { onMount } from 'svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { trips as yedekGeziler } from '$lib/data/trips.js';
	import { loadGeziler, sirala } from '$lib/gezilerDb.js';

	let geziler = yedekGeziler;
	let yuklendi = false;
	onMount(async () => {
		const d = await loadGeziler();
		if (d) geziler = d;
		yuklendi = true;
	});

	const ETIKET = { planlaniyor: 'Planlanıyor', gerceklesti: 'Gerçekleşti', iptal: 'İptal edildi' };
	const SINIF = { planlaniyor: 'dev', gerceklesti: 'live', iptal: 'muted' };
	$: sirali = sirala(geziler);
</script>

<svelte:head><title>Kulüp Gezileri · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
	eyebrow="Kulüp Gezileri"
	title="Sınıfın dışında öğrenme"
	desc="Müze, laboratuvar ve gözlemevi gezileriyle kulübün sahadaki etkinlikleri."
/>

<div class="content-max">
	{#if sirali.length === 0}
		<div class="bracket-card bos">Şu an planlanan bir gezi yok. Yeni gezi duyurulduğunda burada görünecek.</div>
	{:else}
		<ul class="timeline">
			{#each sirali as t (t.id ?? t.yer)}
				<li class="bracket-card">
					<div class="row">
						<h3 aria-level="2">{t.yer}</h3>
						<span class="badge {SINIF[t.durum] || 'dev'}">{ETIKET[t.durum] || 'Planlanıyor'}</span>
					</div>
					<p class="tarih">{t.tarih}</p>
					<p>{t.ozet}</p>
					{#if t.link}
						<a class="text-link" href={t.link} target="_blank" rel="noopener noreferrer">{t.linkAd || 'Ayrıntılar'}</a>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.timeline {
		list-style: none;
		margin: 0 0 48px;
		padding: 0;
		display: grid;
		gap: 16px;
		max-width: 760px;
	}
	.bos { max-width: 760px; margin-bottom: 48px; padding: 24px 20px; color: var(--text-muted); }
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}
	.row h3 {
		margin: 0;
	}
	.text-link { display: inline-block; margin-top: 4px; color: var(--accent); font-family: var(--font-display); font-size: var(--fs-sm); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
	.text-link:hover { text-decoration-thickness: 2px; }
	.tarih {
		color: var(--accent);
		font-family: var(--font-display);
		font-size: var(--fs-sm);
		font-weight: 600;
		margin: 6px 0 8px;
	}
</style>
