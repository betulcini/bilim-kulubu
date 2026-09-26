<script>
	import SciMotif from '$lib/components/SciMotif.svelte';

	export let eyebrow = '';
	export let title = '';
	export let desc = '';
</script>

<header class="page-head">
	<SciMotif />
	<div class="content-max">
		{#if eyebrow}<div class="eyebrow">{eyebrow}</div>{/if}
		<h1>{title}</h1>
		{#if desc}<p>{desc}</p>{/if}
	</div>
</header>

<style>
	@media (max-width: 900px) {
		:global(.page-head) { padding-top: 22px; padding-bottom: 20px; }
	}
</style>
