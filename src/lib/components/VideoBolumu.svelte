<script>
	import { onMount } from 'svelte';
	import { loadVideolar } from '$lib/videoDb.js';
	import YoutubeOynatici from '$lib/components/YoutubeOynatici.svelte';

	export let bolum; // 'seri' | 'tiyatro'
	export let baslik = 'Videolar';

	let videolar = [];
	onMount(async () => {
		videolar = (await loadVideolar(bolum)) || [];
	});
</script>

{#if videolar.length > 0}
	<section class="videolar" aria-labelledby="vb-{bolum}">
		<h2 id="vb-{bolum}">{baslik}</h2>
		<div class="izgara">
			{#each videolar as v (v.id)}
				<article class="bracket-card video">
					<YoutubeOynatici id={v.youtubeId} baslik={v.baslik} />
					{#if v.grup}<span class="grup">{v.grup}</span>{/if}
					<h3 aria-level="3">{v.baslik}</h3>
					{#if v.aciklama}<p>{v.aciklama}</p>{/if}
				</article>
			{/each}
		</div>
	</section>
{/if}

<style>
	.videolar { margin-bottom: 48px; }
	.videolar h2 { font-size: var(--fs-lg); margin: 0 0 14px; }
	.izgara { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 18px; }
	.video { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
	.video h3 { margin: 4px 0 0; overflow-wrap: anywhere; }
	.video p { margin: 0; }
	.grup { color: var(--accent); font-family: var(--font-display); font-size: var(--fs-xs); font-weight: 600; margin-top: 6px; }
</style>
