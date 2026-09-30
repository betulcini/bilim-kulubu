<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { sfx } from '$lib/sound.js';
	import { supabase } from '$lib/supabaseClient.js';

	const storageKey = 'btk-oneriler';
	const kategoriler = ['Etkinlik fikri', 'Seri / tiyatro konusu', 'Gezi önerisi', 'Platform ile ilgili', 'Diğer'];

	let isim = '';
	let kategori = kategoriler[0];
	let mesaj = '';
	let oneriler = [];
	let gonderildi = false;
	let gonderiliyor = false;
	let hata = '';
	let sonGonderim = 0;

	onMount(() => {
		if (!browser) return;
		try {
			oneriler = JSON.parse(localStorage.getItem(storageKey) || '[]');
		} catch (e) {
			oneriler = [];
		}
	});

	async function gonder() {
		if (!mesaj.trim() || gonderiliyor) return;
		hata = '';

		// Art arda gönderimi engelle (yanlışlıkla çift tıklama / spam)
		if (Date.now() - sonGonderim < 10000) {
			hata = 'Lütfen birkaç saniye bekleyip tekrar dene.';
			return;
		}

		const kayit = {
			isim: isim.trim() || null,
			kategori,
			mesaj: mesaj.trim()
		};

		gonderiliyor = true;
		const { error } = await supabase.from('oneriler').insert(kayit);
		gonderiliyor = false;

		if (error) {
			hata = 'Önerin gönderilemedi. İnternet bağlantını kontrol edip tekrar dene; yazdığın metin silinmedi.';
			return;
		}

		sonGonderim = Date.now();
		// Yalnızca bu cihazda "gönderdiklerim" listesi olarak da tut
		const yeni = {
			id: Date.now(),
			isim: kayit.isim || 'İsimsiz',
			kategori,
			mesaj: kayit.mesaj,
			tarih: new Date().toLocaleDateString('tr-TR')
		};
		oneriler = [yeni, ...oneriler];
		if (browser) localStorage.setItem(storageKey, JSON.stringify(oneriler));
		mesaj = '';
		isim = '';
		gonderildi = true;
		sfx.success();
		setTimeout(() => (gonderildi = false), 3200);
	}

	function sil(id) {
		oneriler = oneriler.filter((o) => o.id !== id);
		if (browser) localStorage.setItem(storageKey, JSON.stringify(oneriler));
	}
</script>

<svelte:head><title>Öneri Kutusu · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
	eyebrow="Öneri Kutusu"
	title="Fikrini kulüple paylaş"
	desc="Etkinlik, seri, gezi ya da platformla ilgili öneride bulun. Önerilerin kulüp yönetimine iletilir; diğer üyeler göremez."
/>

<div class="content-max layout">
	<form class="bracket-card form-card" on:submit|preventDefault={gonder}>
		<div class="field">
			<label for="isim">Adın (isteğe bağlı)</label>
			<input id="isim" type="text" bind:value={isim} maxlength="60" placeholder="Örn. Ada Y." />
		</div>
		<div class="field">
			<label for="kategori">Kategori</label>
			<select id="kategori" bind:value={kategori}>
				{#each kategoriler as k}
					<option value={k}>{k}</option>
				{/each}
			</select>
		</div>
		<div class="field">
			<label for="mesaj">Önerin</label>
			<textarea id="mesaj" bind:value={mesaj} maxlength="1000" placeholder="Aklındaki fikri buraya yaz..." required></textarea>
		</div>
		<button class="btn btn-primary" type="submit" disabled={gonderiliyor}>{gonderiliyor ? 'Gönderiliyor...' : 'Öneriyi gönder'}</button>
		{#if gonderildi}<p class="confirm">Teşekkürler, önerin kulübe iletildi.</p>{/if}
		{#if hata}<p class="err" role="alert">{hata}</p>{/if}
	</form>

	<div class="list-side">
		<h2>Bu cihazdan gönderdiklerin <span class="count">({oneriler.length})</span></h2>
		{#if oneriler.length === 0}
			<p class="empty">Henüz bu cihazdan öneri göndermedin. İlk öneriyi sen bırak.</p>
		{:else}
			<ul class="oneri-list">
				{#each oneriler as o (o.id)}
					<li class="bracket-card">
						<div class="row">
							<span class="badge info">{o.kategori}</span>
							<button class="del" on:click={() => sil(o.id)} aria-label="Bu cihazdaki kaydı sil" title="Sadece bu cihazdaki kaydı siler">
								<Icon name="close" size={15} />
							</button>
						</div>
						<p>{o.mesaj}</p>
						<div class="meta">{o.isim} · {o.tarih}</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
		gap: 28px;
		align-items: start;
		margin-bottom: 48px;
	}
	.form-card {
		display: flex;
		flex-direction: column;
	}
	.confirm {
		color: var(--accent);
		font-size: var(--fs-sm);
		margin: 10px 0 0;
	}
	.err {
		color: var(--danger);
		font-size: var(--fs-sm);
		margin: 10px 0 0;
	}
	.list-side h2 {
		font-size: var(--fs-lg);
	}
	.count {
		color: var(--text-faint);
		font-family: var(--font-body);
		font-weight: 400;
		font-size: var(--fs-sm);
	}
	.empty {
		color: var(--text-muted);
		font-size: var(--fs-sm);
	}
	.oneri-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 12px;
	}
	.oneri-list p {
		margin: 10px 0 8px;
	}
	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.del {
		background: transparent;
		border: none;
		color: var(--text-faint);
		cursor: pointer;
		padding: 4px;
		border-radius: 6px;
	}
	.del:hover {
		color: var(--danger);
		background: var(--danger-soft);
	}
	.meta {
		font-size: var(--fs-xs);
		color: var(--text-faint);
	}

	@media (max-width: 860px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
</style>
