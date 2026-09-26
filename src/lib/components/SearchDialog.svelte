<script>
	import { tick } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { searchItems } from '$lib/data/search.js';

	export let open = false;
	let query = '';
	let input;

	$: normalized = query.trim().toLocaleLowerCase('tr');
	$: results = normalized
		? searchItems.filter((item) => `${item.title} ${item.text}`.toLocaleLowerCase('tr').includes(normalized))
		: searchItems;
	$: if (open) tick().then(() => input?.focus());

	function close() {
		open = false;
		query = '';
	}

	function handleKeydown(event) {
		if (event.key === 'Escape' && open) close();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
	<div class="search-layer" role="presentation">
		<button class="search-backdrop" aria-label="Aramayı kapat" on:click={close}></button>
		<dialog open class="search-dialog" aria-labelledby="search-title">
			<div class="search-heading">
				<h2 id="search-title">Sitede ara</h2>
				<button class="close-button" aria-label="Aramayı kapat" on:click={close}><Icon name="close" /></button>
			</div>
			<label class="sr-only" for="site-search">Arama terimi</label>
			<div class="search-field">
				<Icon name="search" size={19} />
				<input id="site-search" bind:this={input} bind:value={query} placeholder="Etkinlik, konu veya sayfa ara" autocomplete="off" />
			</div>
			<p class="result-summary" aria-live="polite">{results.length} sonuç</p>
			<ul class="search-results">
				{#each results as item}
					<li><a href={item.href} on:click={close}><strong>{item.title}</strong><span>{item.text}</span></a></li>
				{:else}
					<li class="empty">“{query}” için bir sonuç bulunamadı.</li>
				{/each}
			</ul>
		</dialog>
	</div>
{/if}

<style>
	.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
	.search-layer { position: fixed; inset: 0; z-index: 100; display: grid; place-items: start center; padding: min(12vh, 96px) 16px 24px; }
	.search-backdrop { position: absolute; inset: 0; border: 0; background: rgba(30, 43, 32, 0.42); backdrop-filter: blur(3px); }
	.search-dialog { position: relative; width: min(100%, 680px); max-height: min(72vh, 640px); overflow: auto; margin: 0; padding: 24px; background: var(--surface-raised); color: var(--text); border: 1px solid var(--border-strong); border-radius: var(--radius-lg); box-shadow: var(--shadow); }
	.search-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
	.search-heading h2 { margin: 0; color: var(--text); }
	.close-button { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid var(--border); border-radius: 50%; background: transparent; cursor: pointer; }
	.search-field { display: flex; align-items: center; gap: 10px; padding: 0 14px; margin-top: 18px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-alt); color: var(--accent); }
	.search-field input { width: 100%; min-width: 0; padding: 13px 0; border: 0; outline: 0; background: transparent; color: var(--text); font-size: var(--fs-base); }
	.result-summary { margin: 16px 0 8px; color: var(--text-faint); font-size: var(--fs-xs); }
	.search-results { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
	.search-results a { display: grid; gap: 2px; padding: 12px; border-radius: var(--radius-sm); color: var(--text); text-decoration: none; }
	.search-results strong { color: var(--text); }
	.search-results a:hover { background: var(--surface-hover); }
	.search-results span { color: var(--text-muted); font-size: var(--fs-xs); }
	.empty { padding: 16px 0; color: var(--text-muted); }
</style>
