<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { onMount } from 'svelte';
	import { opportunities as yedek } from '$lib/data/opportunities.js';
	import { loadOpportunities, sortOpportunities } from '$lib/content.js';
	import { isNew, markSeen } from '$lib/stores/newContent.js';

	let kaynakListe = yedek;
	onMount(async () => {
		const d = await loadOpportunities();
		if (d) kaynakListe = d;
		markSeen('firsatlar');
	});

	const durumlar = {
		acik: { ad: 'Başvuru açık', sinif: 'live' },
		yaklasan: { ad: 'Yaklaşan', sinif: 'dev' },
		etkinlik: { ad: 'Etkinlik', sinif: 'info' },
		'okul-ici': { ad: 'Okul içi', sinif: 'muted' }
	};

	$: liste = sortOpportunities(kaynakListe);
</script>

<svelte:head><title>Fırsat Duyuruları · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
	eyebrow="Fırsatlar"
	title="Yarışma, etkinlik ve eğitim fırsatları"
	desc="Kulüp üyelerini ilgilendirebilecek dış başvuru ve etkinlikler. Her kartta başvuru sayfasının ve bilginin alındığı kaynağın bağlantısı var; başvurmadan önce resmi sayfadan tarihleri bir kez daha kontrol et."
/>

<div class="content-max">
	<div class="card-grid" style="margin-bottom:48px">
		{#each liste as o}
			<article class="bracket-card opp" class:kapali={o.kapandi}>
				<div class="badges">
					{#if o.kapandi}
						<span class="badge muted">Kapandı</span>
					{:else}
						<span class="badge {durumlar[o.durum].sinif}">{durumlar[o.durum].ad}</span>
					{/if}
					<span class="badge muted">{o.tur}</span>
					{#if isNew('firsatlar', o)}<span class="badge live">Yeni</span>{/if}
				</div>
				<h3 aria-level="2">{o.baslik}</h3>
				<p>{o.ozet}</p>
				<div class="foot">
					<span class="kurum">{o.kurum}</span>
					<span class="son">{o.son}</span>
				</div>
				{#if o.link || o.kaynak}
					<div class="links">
						{#if o.link}
							<a class="btn btn-primary" href={o.link} target="_blank" rel="noopener noreferrer">
								{o.linkAd || 'Başvuru / detay'} <Icon name="chevron" size={14} />
							</a>
						{/if}
						{#if o.kaynak && o.kaynak !== o.link}
							<a class="src" href={o.kaynak} target="_blank" rel="noopener noreferrer">Kaynak: {o.kaynakAd || 'haber'}</a>
						{/if}
					</div>
				{/if}
			</article>
		{/each}
	</div>
</div>

<style>
	.opp {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.opp.kapali {
		opacity: 0.65;
	}
	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.opp h3 {
		margin: 4px 0 0;
	}
	.opp p {
		margin: 0;
	}
	.foot {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: var(--fs-xs);
		color: var(--text-faint);
	}
	.son {
		color: var(--accent-2);
		font-weight: 600;
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px 14px;
		margin-top: auto;
		padding-top: 6px;
	}
	.links .btn {
		padding: 8px 14px;
		font-size: var(--fs-xs);
		text-decoration: none;
	}
	.src {
		font-size: var(--fs-xs);
		color: var(--text-muted);
		text-decoration: underline;
		text-underline-offset: 3px;
		overflow-wrap: anywhere;
	}
	.src:hover {
		color: var(--accent);
	}
</style>
