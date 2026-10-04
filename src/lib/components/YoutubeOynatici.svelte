<script>
	import { kapakAdresi, gomuluAdres } from '$lib/video.js';

	export let id;
	export let baslik = '';

	// Sayfa hızlı açılsın diye YouTube oynatıcısı (ağır) ancak kapağa dokunulunca yüklenir.
	let acik = false;
</script>

<div class="kutu">
	{#if acik}
		<iframe
			src={gomuluAdres(id)}
			title={baslik}
			allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
			allowfullscreen
			referrerpolicy="strict-origin-when-cross-origin"
		></iframe>
	{:else}
		<button type="button" class="kapak" on:click={() => (acik = true)} aria-label="{baslik} videosunu oynat">
			<img src={kapakAdresi(id)} alt="" loading="lazy" decoding="async" />
			<span class="oynat" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="26" height="26"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
			</span>
		</button>
	{/if}
</div>

<style>
	.kutu { position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: var(--radius-sm); overflow: hidden; background: var(--bg-alt); border: 1px solid var(--border-strong); }
	iframe, .kapak { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
	.kapak { display: block; padding: 0; background: transparent; cursor: pointer; }
	.kapak img { width: 100%; height: 100%; object-fit: cover; display: block; }
	.oynat { position: absolute; left: 50%; top: 50%; width: 56px; height: 56px; margin: -28px 0 0 -28px; display: grid; place-items: center; border-radius: 50%; background: rgba(0, 0, 0, 0.62); color: #fff; transition: transform 0.15s, background 0.15s; }
	.kapak:hover .oynat { transform: scale(1.08); background: var(--accent); }
	.kapak:focus-visible { outline: 2px solid var(--accent); outline-offset: -3px; }
	@media (prefers-reduced-motion: reduce) { .oynat { transition: none; } .kapak:hover .oynat { transform: none; } }
</style>
