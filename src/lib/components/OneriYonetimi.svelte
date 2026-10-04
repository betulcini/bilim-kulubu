<script>
	import { onMount } from 'svelte';
	import {
		LISTE_SAYFA_BOYUTU,
		ONERI_DURUMLARI,
		listSuggestions,
		updateSuggestion
	} from '$lib/yonetim.js';
	import { sfx } from '$lib/sound.js';

	let oneriler = [];
	let sayfa = 0;
	let sonrakiVar = false;
	let yukleniyor = true;
	let hata = '';
	let bilgi = '';
	let kaydedilenId = null;

	onMount(yukle);

	async function yukle(devam = false) {
		yukleniyor = true;
		hata = '';
		const sonuc = await listSuggestions(sayfa);
		yukleniyor = false;
		if (sonuc.hata) {
			hata = sonuc.hata;
			if (!devam) {
				oneriler = [];
				sonrakiVar = false;
			}
			return;
		}
		oneriler = devam ? [...oneriler, ...sonuc.data] : sonuc.data;
		sonrakiVar = sonuc.data.length === LISTE_SAYFA_BOYUTU;
	}

	async function dahaFazlaYukle() {
		if (yukleniyor || !sonrakiVar) return;
		sayfa += 1;
		await yukle(true);
		if (hata) sayfa -= 1;
	}

	async function kaydet(oneri) {
		if (kaydedilenId !== null) return;
		hata = '';
		bilgi = '';
		kaydedilenId = oneri.id;
		const sonuc = await updateSuggestion(oneri.id, {
			status: oneri.status,
			response: oneri.response?.trim() || null
		});
		kaydedilenId = null;
		if (sonuc.hata) {
			hata = sonuc.hata;
			sfx.error();
			return;
		}
		bilgi = 'Öneri güncellendi.';
		sfx.success();
	}

	function tarih(iso) {
		return new Date(iso).toLocaleString('tr-TR', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}
</script>

<section class="yonetim">
	{#if hata}<p class="msg err" role="alert">{hata}</p>{/if}
	{#if bilgi}<p class="msg ok" role="status">{bilgi}</p>{/if}
	<p class="ipucu">Öneriler ve yönetici notları yalnızca yöneticilere açıktır; notlar öneri sahibine otomatik olarak iletilmez.</p>
	{#if yukleniyor && oneriler.length === 0}
		<p class="muted" role="status">Öneriler yükleniyor…</p>
	{:else if oneriler.length === 0}
		<div class="bracket-card bos">Henüz öneri gönderilmemiş.</div>
	{:else}
		<ul class="liste">
			{#each oneriler as oneri (oneri.id)}
				<li class="bracket-card kart">
					<div class="ust">
						<div>
							<strong>{oneri.isim || 'İsimsiz'}</strong>
							<p class="meta">{oneri.kategori} · {tarih(oneri.created_at)}</p>
						</div>
						{#if oneri.user_id}<span class="badge info">Hesaplı gönderim</span>{:else}<span class="badge muted">Anonim</span>{/if}
					</div>
					<p class="mesaj">{oneri.mesaj}</p>
					<div class="field">
						<label for="oneri-durum-{oneri.id}">Durum</label>
						<select id="oneri-durum-{oneri.id}" bind:value={oneri.status}>
							{#each ONERI_DURUMLARI as durum}<option value={durum.id}>{durum.label}</option>{/each}
						</select>
					</div>
					<div class="field">
						<label for="oneri-yanit-{oneri.id}">Yönetici iç notu</label>
						<textarea id="oneri-yanit-{oneri.id}" rows="3" maxlength="1000" bind:value={oneri.response} placeholder="İsteğe bağlı"></textarea>
					</div>
					<button type="button" class="btn btn-primary" disabled={kaydedilenId !== null} on:click={() => kaydet(oneri)}>
						{kaydedilenId === oneri.id ? 'Kaydediliyor…' : 'Durumu ve yanıtı kaydet'}
					</button>
				</li>
			{/each}
		</ul>
		{#if sonrakiVar}
			<button type="button" class="btn btn-ghost" disabled={yukleniyor} on:click={dahaFazlaYukle}>Daha fazla yükle</button>
		{/if}
	{/if}
</section>

<style>
	.yonetim { display: flex; flex-direction: column; gap: 14px; }
	.ipucu, .meta, .muted { color: var(--text-muted); font-size: var(--fs-sm); }
	.ipucu { margin: 0; }
	.msg { margin: 0; font-size: var(--fs-sm); }
	.msg.err { color: var(--danger); }
	.msg.ok { color: var(--accent); }
	.liste { display: grid; gap: 12px; list-style: none; margin: 0; padding: 0; max-width: 760px; }
	.kart { display: flex; flex-direction: column; gap: 12px; }
	.ust { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
	.meta { margin: 4px 0 0; }
	.mesaj { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
	.field { display: flex; flex-direction: column; gap: 6px; }
	.field label { font-size: var(--fs-sm); font-weight: 600; }
	.bos { padding: 20px; color: var(--text-muted); }
</style>
