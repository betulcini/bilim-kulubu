<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	// Mesajlar artık Topluluk sayfasındaki "Mesajlar" sekmesi.
	// Eski bağlantılar (/mesajlar?kisi=...) buraya düşer ve yönlendirilir.
	onMount(() => {
		const k = new URLSearchParams(location.search).get('kisi');
		goto('/topluluk?sekme=mesajlar' + (k ? '&kisi=' + encodeURIComponent(k) : ''), { replaceState: true });
	});
</script>

<svelte:head>
	<title>Mesajlar · Bilim ve Teknoloji Kulübü</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="content-max" style="padding: 48px 0;">
	<p>Mesajlar artık <a href="/topluluk?sekme=mesajlar">Topluluk</a> sayfasında. Yönlendiriliyorsun…</p>
</div>
