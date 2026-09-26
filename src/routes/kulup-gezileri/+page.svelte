<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { trips } from '$lib/data/trips.js';
</script>

<svelte:head><title>Kulüp Gezileri · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
	eyebrow="Kulüp Gezileri"
	title="Sınıfın dışında öğrenme"
	desc="Müze, laboratuvar ve gözlemevi gezileriyle kulübün sahadaki etkinlikleri."
/>

<div class="content-max">
	<ul class="timeline">
		{#each trips as t}
			<li class="bracket-card">
				<div class="row">
					<h3>{t.yer}</h3>
					<span class="badge {t.durum === 'gerçekleşti' ? 'live' : 'dev'}">
						{t.durum === 'gerçekleşti' ? 'Gerçekleşti' : 'Planlanıyor'}
					</span>
				</div>
				<p class="tarih">{t.tarih}</p>
				<p>{t.ozet}</p>
			</li>
		{/each}
	</ul>
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
	.tarih {
		color: var(--accent);
		font-family: var(--font-display);
		font-size: var(--fs-sm);
		font-weight: 600;
		margin: 6px 0 8px;
	}
</style>
