<script>
	import { onMount } from 'svelte';

	let cevrimdisi = false;

	onMount(() => {
		const guncelle = () => (cevrimdisi = !navigator.onLine);
		guncelle();
		window.addEventListener('online', guncelle);
		window.addEventListener('offline', guncelle);
		return () => {
			window.removeEventListener('online', guncelle);
			window.removeEventListener('offline', guncelle);
		};
	});
</script>

<!-- Ekran okuyucular durum değişimini kendiliğinden okusun diye alan hep sayfada durur -->
<div class="cd" role="status" aria-live="polite">
	{#if cevrimdisi}
		<p>Çevrimdışısın. Daha önce açtığın sayfalar görünür; giriş, mesaj ve skor işlemleri bağlantı gelince çalışır.</p>
	{/if}
</div>

<style>
	.cd p {
		margin: 0 0 16px;
		padding: 10px 14px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-strong);
		background: var(--bg-alt);
		color: var(--text);
		font-size: var(--fs-sm);
	}
</style>
