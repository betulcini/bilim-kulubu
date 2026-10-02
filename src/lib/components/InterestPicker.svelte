<script>
	import Icon from '$lib/components/Icon.svelte';
	import { interests, MAX_INTERESTS } from '$lib/data/interests.js';

	// Seçili ilgi alanı id'leri (bind:selected ile kullanılır)
	export let selected = [];
	export let legend = 'İlgi alanların';

	// Filtre olarak kullanılırken sınır gerekmez (limit={0})
	export let limit = MAX_INTERESTS;

	$: doldu = limit > 0 && selected.length >= limit;

	function toggle(id) {
		if (selected.includes(id)) selected = selected.filter((x) => x !== id);
		else if (!doldu) selected = [...selected, id];
	}
</script>

<fieldset class="picker">
	<legend>{legend}</legend>
	<div class="chips">
		{#each interests as item}
			<button
				type="button"
				class="chip"
				class:on={selected.includes(item.id)}
				aria-pressed={selected.includes(item.id)}
				disabled={doldu && !selected.includes(item.id)}
				on:click={() => toggle(item.id)}
			>
				<span aria-hidden="true" class="ci"><Icon name={item.emoji} size={16} /></span>
				<span>{item.label}</span>
			</button>
		{/each}
	</div>
	{#if doldu}<p class="limit">En fazla {limit} alan seçebilirsin.</p>{/if}
</fieldset>

<style>
	.picker {
		border: 0;
		margin: 0;
		padding: 0;
		min-width: 0;
	}
	legend {
		padding: 0;
		margin-bottom: 10px;
		font-size: var(--fs-sm);
		font-weight: 600;
		color: var(--text);
	}
	.limit {
		margin: 8px 0 0;
		font-size: var(--fs-xs);
		color: var(--text-muted);
	}
	.chip:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	/* Eşit genişlikli, düzenli ızgara: uzun etiketler satır kırsa bile hizalı kalır */
	.chips {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 172px), 1fr));
		gap: 8px;
	}
	.chip {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 9px;
		width: 100%;
		min-width: 0;
		min-height: 46px;
		padding: 8px 12px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-strong);
		background: var(--bg-alt);
		color: var(--text);
		font-family: var(--font-display);
		font-size: var(--fs-xs);
		font-weight: 600;
		line-height: 1.25;
		text-align: left;
		cursor: pointer;
		transition: background var(--dur) var(--ease), border-color var(--dur) var(--ease);
	}
	.chip > span:last-child {
		flex: 1;
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.ci {
		flex: none;
		display: inline-flex;
	}
	.chip:hover {
		border-color: var(--accent);
	}
	.chip.on {
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent);
	}
	.chip:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
</style>
