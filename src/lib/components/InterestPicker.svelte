<script>
	import Icon from '$lib/components/Icon.svelte';
	import { interests } from '$lib/data/interests.js';

	// Seçili ilgi alanı id'leri (bind:selected ile kullanılır)
	export let selected = [];
	export let legend = 'İlgi alanların';

	function toggle(id) {
		selected = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
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
				on:click={() => toggle(item.id)}
			>
				<span aria-hidden="true" class="ci"><Icon name={item.emoji} size={16} /></span>
				<span>{item.label}</span>
			</button>
		{/each}
	</div>
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
		margin-bottom: 8px;
		font-size: var(--fs-xs);
		color: var(--text-muted);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		max-width: 100%;
		padding: 8px 12px;
		border-radius: 999px;
		border: 1px solid var(--border-strong);
		background: var(--bg-alt);
		color: var(--text);
		font-family: var(--font-display);
		font-size: var(--fs-xs);
		font-weight: 600;
		text-align: left;
		cursor: pointer;
		transition: background var(--dur) var(--ease), border-color var(--dur) var(--ease);
	}
	.ci {
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
</style>
