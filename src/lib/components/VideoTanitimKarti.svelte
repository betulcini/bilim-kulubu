<script>
	export let kart;
</script>

<article class="bracket-card">
	{#if kart.rozet || kart.devBadge}
		<span class="badge dev">{kart.rozet || 'Geliştirme aşamasında'}</span>
	{/if}
	<h3 aria-level="2" style="margin-top:12px">{kart.title}</h3>
	<p>{kart.desc}</p>
	<div class="meta">
		{#if kart.detay || kart.bolum || kart.sahne}<span>{kart.detay || kart.bolum || kart.sahne}</span>{/if}
		{#if (kart.detay || kart.bolum || kart.sahne) && kart.durum}<span>·</span>{/if}
		{#if kart.durum}<span>{kart.durum}</span>{/if}
	</div>
</article>

<style>
	.meta { display: flex; gap: 8px; font-size: var(--fs-xs); color: var(--text-faint); }
</style>
