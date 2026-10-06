<script>
	import { page } from '$app/stores';
	import UyeGirisGerekli from '$lib/components/UyeGirisGerekli.svelte';
</script>

{#if $page.url.pathname === '/oyunlar' || $page.url.pathname === '/oyunlar/'}
	<slot />
{:else}
	<UyeGirisGerekli><slot /></UyeGirisGerekli>
{/if}
