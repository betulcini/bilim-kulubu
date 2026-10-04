<script>
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient.js';

	let bildirimler = [];
	let yukleniyor = true;
	let hata = '';
	let guncellenen = null;

	$: okunmamisSayisi = bildirimler.filter((bildirim) => !bildirim.read_at).length;

	onMount(() => {
		yukle();
		const interval = setInterval(() => {
			if (document.visibilityState === 'visible') yukle();
		}, 60_000);
		const gorunurlukDegisti = () => {
			if (document.visibilityState === 'visible') yukle();
		};
		document.addEventListener('visibilitychange', gorunurlukDegisti);
		return () => {
			clearInterval(interval);
			document.removeEventListener('visibilitychange', gorunurlukDegisti);
		};
	});

	async function yukle() {
		yukleniyor = true;
		hata = '';
		const { data, error } = await supabase.rpc('oneri_bildirimlerim');
		yukleniyor = false;
		if (error) {
			hata = 'Bildirimler yüklenemedi. Yönetim bildirim migration’ının uygulandığını kontrol et.';
			return;
		}
		bildirimler = data || [];
	}

	async function okundu(bildirim) {
		if (bildirim.read_at || guncellenen === bildirim.id) return;
		guncellenen = bildirim.id;
		const { data, error } = await supabase.rpc('oneri_bildirimini_okundu_isaretle', { p_id: bildirim.id });
		guncellenen = null;
		if (error || data !== true) {
			hata = error?.message || 'Bildirim okundu olarak işaretlenemedi.';
			return;
		}
		bildirimler = bildirimler.map((item) => item.id === bildirim.id ? { ...item, read_at: new Date().toISOString() } : item);
	}
</script>

<section class="bildirimler" aria-labelledby="bildirim-baslik">
	<div class="ust">
		<h2 id="bildirim-baslik">Öneri bildirimleri {#if okunmamisSayisi}<span class="badge info" aria-label="{okunmamisSayisi} okunmamış">{okunmamisSayisi}</span>{/if}</h2>
		<button class="btn btn-ghost mini" type="button" disabled={yukleniyor} on:click={yukle}>Yenile</button>
	</div>
	{#if hata}<p class="msg err" role="alert">{hata}</p>
	{:else if yukleniyor}<p class="muted" role="status">Bildirimler yükleniyor…</p>
	{:else if bildirimler.length === 0}<p class="muted">Henüz bildirim yok.</p>
	{:else}
		<ul>
			{#each bildirimler as bildirim (bildirim.id)}
				<li class:okunmamis={!bildirim.read_at} class="bracket-card oge">
					<div>
						<p>{bildirim.mesaj}</p>
						<small>{new Date(bildirim.created_at).toLocaleString('tr-TR')}</small>
					</div>
					{#if !bildirim.read_at}
						<button class="btn btn-ghost mini" type="button" disabled={guncellenen === bildirim.id} on:click={() => okundu(bildirim)}>
							{guncellenen === bildirim.id ? 'Kaydediliyor…' : 'Okundu işaretle'}
						</button>
					{:else}
						<span class="badge muted">Okundu</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.bildirimler { display: flex; flex-direction: column; gap: 10px; }
	.ust { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
	h2 { margin: 0; }
	ul { display: grid; gap: 8px; list-style: none; margin: 0; padding: 0; }
	.oge { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
	.oge p { margin: 0; white-space: pre-wrap; }
	.oge small, .muted { color: var(--text-muted); font-size: var(--fs-xs); }
	.oge small { display: block; margin-top: 6px; }
	.oge.okunmamis { border-left: 4px solid var(--accent); }
	.mini { padding: 7px 10px; font-size: var(--fs-xs); white-space: nowrap; }
	.msg.err { color: var(--danger); }
	@media (max-width: 600px) { .oge { flex-direction: column; } }
</style>
