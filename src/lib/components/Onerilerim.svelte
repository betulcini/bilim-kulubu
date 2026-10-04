<script>
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient.js';

	const durumAdlari = {
		yeni: 'Yeni',
		inceleniyor: 'İnceleniyor',
		planlandi: 'Planlandı',
		tamamlandi: 'Tamamlandı',
		reddedildi: 'Uygun bulunmadı'
	};

	let oneriler = [];
	let yukleniyor = true;
	let hata = '';

	onMount(yukle);

	async function yukle() {
		yukleniyor = true;
		hata = '';
		const { data, error } = await supabase.rpc('oneri_durumum');
		yukleniyor = false;
		if (error) {
			hata = 'Öneri durumları yüklenemedi. Yönetici paneli migration’larının güncel olduğundan emin olun.';
			return;
		}
		oneriler = data || [];
	}

	function tarih(iso) {
		return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
	}
</script>

<section class="oneri-takip" aria-labelledby="oneri-takip-baslik">
	<h2 id="oneri-takip-baslik">Önerilerimin durumu</h2>
	{#if yukleniyor}
		<p class="muted" role="status">Öneriler yükleniyor…</p>
	{:else if hata}
		<p class="muted" role="alert">{hata}</p>
	{:else if oneriler.length === 0}
		<p class="muted">Hesabınla gönderdiğin öneri yok. <a href="/oneri">Öneri Kutusu’ndan</a> fikir paylaşabilirsin.</p>
	{:else}
		<ul class="liste">
			{#each oneriler as oneri (oneri.id)}
				<li class="bracket-card kart">
					<div class="ust">
						<strong>{oneri.kategori}</strong>
						<span class="badge info">{durumAdlari[oneri.status] || 'Güncellendi'}</span>
					</div>
					<small class="tarih">{tarih(oneri.created_at)}</small>
					{#if oneri.public_response}
						<p class="yanit"><strong>Kulüp yanıtı:</strong> {oneri.public_response}</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.oneri-takip { display: flex; flex-direction: column; gap: 10px; }
	.oneri-takip h2 { margin: 0; }
	.muted, .tarih { color: var(--text-muted); font-size: var(--fs-sm); }
	.liste { display: grid; gap: 10px; list-style: none; padding: 0; margin: 0; }
	.kart { display: flex; flex-direction: column; gap: 6px; }
	.ust { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
	.yanit { margin: 6px 0 0; padding: 10px 12px; border-left: 3px solid var(--accent); background: var(--bg-alt); border-radius: var(--radius-sm); white-space: pre-wrap; }
</style>
