<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { onMount } from 'svelte';
	import { announcements as yedek } from '$lib/data/announcements.js';
	import { loadAnnouncements, formatTarih } from '$lib/content.js';
	import { isNew, markSeen } from '$lib/stores/newContent.js';

	let announcements = yedek;
	onMount(async () => {
		const d = await loadAnnouncements();
		if (d) announcements = d;
		markSeen('duyurular');
	});
</script>

<svelte:head><title>Bilim Duyuruları · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
	eyebrow="Duyurular"
	title="Bilim ve teknoloji gelişmeleri"
	desc="Güncel bilim ve teknoloji haberlerinden seçmeler. Her kartta haberin alındığı kaynağın bağlantısı var."
/>

<div class="content-max">
	<div class="card-grid" style="margin-bottom:48px">
		{#each announcements as a}
			<div class="bracket-card">
				<span class="badge info">{a.etiket}</span>
				{#if isNew('duyurular', a)}<span class="badge live">Yeni</span>{/if}
				<h3 aria-level="2" style="margin-top:12px">{a.baslik}</h3>
				<p>{a.ozet}</p>
				<p class="tarih">{formatTarih(a.tarih)}{#if a.kaynakAd} · {a.kaynakAd}{/if}</p>
				{#if a.link}
					<a class="haber-link" href={a.link} target="_blank" rel="noopener noreferrer">Haberin tamamı <Icon name="chevron" size={14} /></a>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.haber-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin-top: 10px;
		font-size: var(--fs-xs);
		font-weight: 600;
		color: var(--accent);
		text-decoration: none;
	}
	.haber-link:hover {
		text-decoration: underline;
	}
	.tarih {
		color: var(--text-faint);
		font-size: var(--fs-xs);
		margin: 0;
	}
</style>
