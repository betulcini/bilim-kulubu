<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { opportunities } from '$lib/data/opportunities.js';
</script>

<svelte:head><title>Fırsat Duyuruları · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
	eyebrow="Fırsatlar"
	title="Yarışma, kamp ve burs fırsatları"
	desc="Kulüp üyelerini ilgilendirebilecek dış etkinlik ve başvuru fırsatları."
/>

<div class="content-max">
	<div class="card-grid" style="margin-bottom:48px">
		{#each opportunities as o}
			<div class="bracket-card">
				<span class="badge live">{o.tur}</span>
				<h3 style="margin-top:12px">{o.baslik}</h3>
				<p>{o.ozet}</p>
				<div class="foot">
					<span>{o.kurum}</span>
					<span class="son">{o.son}</span>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.foot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--fs-xs);
		color: var(--text-faint);
		gap: 10px;
		flex-wrap: wrap;
	}
	.son {
		color: var(--accent-2);
		font-weight: 600;
	}
</style>
