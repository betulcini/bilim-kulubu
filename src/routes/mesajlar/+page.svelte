<script>
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { user, authReady } from '$lib/stores/auth.js';
	import { refreshUnread } from '$lib/stores/messages.js';
	import {
		SIKAYET_SEBEPLERI,
		loadMessages,
		loadPeople,
		loadBlockedIds,
		sendMessage,
		markThreadRead,
		blockUser,
		unblockUser,
		reportUser,
		sendErrorText
	} from '$lib/community.js';
	import { browser } from '$app/environment';
	import { goto, afterNavigate } from '$app/navigation';
	import { onMount, onDestroy, tick } from 'svelte';
	import { sfx } from '$lib/sound.js';

	$: if ($authReady && !$user) goto('/giris');

	let all = []; // benimle ilgili son mesajlar (yeniden eskiye)
	let people = {}; // id -> { name, sinif }
	let blocked = new Set();
	let loading = true;
	let loadError = '';

	let aktif = null; // açık sohbetteki kişinin id'si
	let taslak = '';
	let gonderiliyor = false;
	let hata = '';
	let threadEl;

	// engel / şikayet
	let sikayetAcik = false;
	let sebep = SIKAYET_SEBEPLERI[0];
	let aciklama = '';
	let sikayetDurum = '';

	// ---------- sohbet listesi ----------
	$: sohbetler = (() => {
		if (!$user) return [];
		const map = new Map();
		for (const m of all) {
			const other = m.gonderen === $user.id ? m.alici : m.gonderen;
			if (!map.has(other)) map.set(other, { id: other, son: m, okunmamis: 0 });
			if (m.alici === $user.id && !m.okundu) map.get(other).okunmamis++;
		}
		// Henüz mesajı olmayan ama açılmış sohbet de listede görünsün
		if (aktif && !map.has(aktif)) map.set(aktif, { id: aktif, son: null, okunmamis: 0 });
		return [...map.values()];
	})();

	$: mesajlar = $user && aktif
		? all.filter((m) => (m.gonderen === $user.id && m.alici === aktif) || (m.gonderen === aktif && m.alici === $user.id)).slice().reverse()
		: [];
	$: kisi = aktif ? people[aktif] : null;
	$: engelli = aktif ? blocked.has(aktif) : false;

	async function yenile(sessiz = false) {
		if (!$user) return;
		if (!sessiz) loading = true;
		const res = await loadMessages($user.id);
		if (res.error) {
			loadError = 'Mesajlar yüklenemedi. Veritabanı kurulumu (topluluk SQL dosyası) yapılmamış olabilir.';
			loading = false;
			return;
		}
		loadError = '';
		all = res.data;
		blocked = await loadBlockedIds();
		const ids = new Set(all.map((m) => (m.gonderen === $user.id ? m.alici : m.gonderen)));
		if (aktif) ids.add(aktif);
		const eksik = [...ids].filter((id) => !people[id]);
		if (eksik.length) people = { ...people, ...(await loadPeople(eksik)) };
		loading = false;

		if (aktif && all.some((m) => m.alici === $user.id && m.gonderen === aktif && !m.okundu)) {
			await markThreadRead($user.id, aktif);
			all = all.map((m) => (m.alici === $user.id && m.gonderen === aktif ? { ...m, okundu: true } : m));
			refreshUnread();
		}
	}

	let loadedFor = null;
	$: if (browser && $user && loadedFor !== $user.id) {
		loadedFor = $user.id;
		yenile();
	}

	async function ac(id) {
		sfx.nav();
		aktif = id;
		hata = '';
		sikayetAcik = false;
		sikayetDurum = '';
		if (!people[id]) people = { ...people, ...(await loadPeople([id])) };
		await yenile(true);
		await asagiKaydir();
	}

	function kapat() {
		aktif = null;
		hata = '';
	}

	async function asagiKaydir() {
		await tick();
		if (threadEl) threadEl.scrollTop = threadEl.scrollHeight;
	}

	async function gonder() {
		hata = '';
		if (!taslak.trim() || !aktif) return;
		gonderiliyor = true;
		const { error } = await sendMessage(aktif, taslak);
		gonderiliyor = false;
		if (error) {
			hata = sendErrorText(error);
			return;
		}
		taslak = '';
		sfx.nav();
		await yenile(true);
		await asagiKaydir();
	}

	function tusla(e) {
		// Enter gönderir, Shift+Enter yeni satır
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			gonder();
		}
	}

	async function engelle() {
		if (!confirm('Bu kişiyi engellemek istiyor musun? Artık sana yazamaz, sen de ona yazamazsın. İstediğin zaman engeli kaldırabilirsin.')) return;
		const { error } = await blockUser(aktif);
		if (error) hata = 'Engellenemedi: ' + error.message;
		else blocked = new Set([...blocked, aktif]);
	}

	async function engeliKaldir() {
		const { error } = await unblockUser($user.id, aktif);
		if (error) hata = 'Engel kaldırılamadı: ' + error.message;
		else {
			const b = new Set(blocked);
			b.delete(aktif);
			blocked = b;
		}
	}

	async function sikayetEt() {
		sikayetDurum = '';
		const { error } = await reportUser(aktif, sebep, aciklama);
		if (error) {
			sikayetDurum = 'Gönderilemedi: ' + error.message;
			return;
		}
		sikayetDurum = 'Bildirimin kulüp yönetimine iletildi. Teşekkürler.';
		aciklama = '';
		sikayetAcik = false;
	}

	// URL'deki ?kisi=... (Topluluk sayfasındaki "Mesaj gönder" bağlantısı)
	afterNavigate(() => {
		const k = new URLSearchParams(location.search).get('kisi');
		if (k && k !== aktif && $user) ac(k);
		else if (k && !$user) bekleyenKisi = k;
	});
	let bekleyenKisi = null;
	$: if (bekleyenKisi && $user) {
		const k = bekleyenKisi;
		bekleyenKisi = null;
		ac(k);
	}

	// Açık sohbet varken ve sekme görünürken yeni mesajları periyodik çek
	let timer;
	onMount(() => {
		timer = setInterval(() => {
			if (document.visibilityState === 'visible' && $user) yenile(true);
		}, 10000);
	});
	onDestroy(() => timer && clearInterval(timer));

	const zaman = (iso) =>
		new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
</script>

<svelte:head><title>Mesajlar · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader eyebrow="Topluluk" title="Mesajlar" desc="Topluluktaki öğrencilerle site içinden yaz. E-posta adresin kimseyle paylaşılmaz." />

<div class="content-max page">
	{#if $user}
		<div class="wrap" class:thread-open={aktif}>
			<aside class="list bracket-card" aria-label="Sohbetler">
				<div class="list-head">
					<h2>Sohbetler</h2>
					<a class="btn btn-ghost" href="/topluluk">Öğrenci bul</a>
				</div>
				{#if loading}
					<p class="muted">Yükleniyor…</p>
				{:else if loadError}
					<p class="msg err" role="alert">{loadError}</p>
				{:else if sohbetler.length === 0}
					<p class="muted">Henüz mesajın yok. Topluluk sayfasından ortak ilgi alanın olan birine yazarak başla.</p>
				{:else}
					<ul>
						{#each sohbetler as s (s.id)}
							<li>
								<button type="button" class="conv" class:on={aktif === s.id} on:click={() => ac(s.id)}>
									<span class="avatar" aria-hidden="true">{(people[s.id]?.name || '?').charAt(0).toLocaleUpperCase('tr')}</span>
									<span class="meta">
										<span class="name">{people[s.id]?.name || '…'}</span>
										<span class="snip">{s.son ? (s.son.gonderen === $user.id ? 'Sen: ' : '') + s.son.icerik : 'Yeni sohbet'}</span>
									</span>
									{#if s.okunmamis > 0}<span class="dot" aria-label="{s.okunmamis} okunmamış">{s.okunmamis}</span>{/if}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</aside>

			<section class="thread bracket-card" aria-label="Sohbet">
				{#if !aktif}
					<div class="placeholder">
						<span class="ico-tile lg" aria-hidden="true"><Icon name="mail" size={26} /></span>
						<p>Soldan bir sohbet seç ya da <a href="/topluluk">Topluluk</a> sayfasından yeni biriyle tanış.</p>
					</div>
				{:else}
					<header class="t-head">
						<button type="button" class="btn btn-ghost back" on:click={kapat} aria-label="Sohbet listesine dön">← Geri</button>
						<div class="t-who">
							<strong>{kisi?.name || '…'}</strong>
							{#if kisi?.sinif}<span class="sinif">{kisi.sinif}</span>{/if}
						</div>
						<div class="t-actions">
							{#if engelli}
								<button type="button" class="btn btn-ghost" on:click={engeliKaldir}>Engeli kaldır</button>
							{:else}
								<button type="button" class="btn btn-ghost" on:click={engelle}>Engelle</button>
							{/if}
							<button type="button" class="btn btn-ghost" on:click={() => (sikayetAcik = !sikayetAcik)} aria-expanded={sikayetAcik}>Bildir</button>
						</div>
					</header>

					{#if sikayetAcik}
						<form class="report" on:submit|preventDefault={sikayetEt}>
							<div class="field">
								<label for="m-sebep">Neden bildiriyorsun?</label>
								<select id="m-sebep" bind:value={sebep}>
									{#each SIKAYET_SEBEPLERI as s}<option>{s}</option>{/each}
								</select>
							</div>
							<div class="field">
								<label for="m-acik">Eklemek istediğin bir şey var mı? <span class="opt">(isteğe bağlı)</span></label>
								<textarea id="m-acik" rows="2" maxlength="500" bind:value={aciklama}></textarea>
							</div>
							<button class="btn btn-primary" type="submit">Bildirimi gönder</button>
						</form>
					{/if}
					{#if sikayetDurum}<p class="msg" role="status">{sikayetDurum}</p>{/if}

					<div class="msgs" bind:this={threadEl}>
						{#if mesajlar.length === 0}
							<p class="muted center">Henüz mesaj yok. İlk mesajı sen yaz.</p>
						{/if}
						{#each mesajlar as m (m.id)}
							<div class="bubble" class:mine={m.gonderen === $user.id}>
								<p>{m.icerik}</p>
								<time datetime={m.created_at}>{zaman(m.created_at)}</time>
							</div>
						{/each}
					</div>

					{#if hata}<p class="msg err" role="alert">{hata}</p>{/if}

					{#if engelli}
						<p class="muted center">Bu kişiyi engelledin; mesaj gönderemezsin.</p>
					{:else}
						<form class="composer" on:submit|preventDefault={gonder}>
							<label class="sr" for="m-yaz">Mesajın</label>
							<textarea id="m-yaz" rows="2" maxlength="1000" placeholder="Bir şeyler yaz… (Enter gönderir, Shift+Enter yeni satır)" bind:value={taslak} on:keydown={tusla}></textarea>
							<button class="btn btn-primary" type="submit" disabled={gonderiliyor || !taslak.trim()}>Gönder</button>
						</form>
						<p class="hint">Kişisel bilgilerini (telefon, adres, şifre) paylaşma. Rahatsız edici bir durumda Engelle veya Bildir'i kullan.</p>
					{/if}
				{/if}
			</section>
		</div>
	{/if}
</div>

<style>
	.page {
		margin-bottom: 60px;
	}
	.wrap {
		display: grid;
		grid-template-columns: 320px minmax(0, 1fr);
		gap: 18px;
		align-items: stretch;
	}
	.list,
	.thread {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.list-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 12px;
	}
	.list-head h2 {
		margin: 0;
		font-size: var(--fs-lg);
	}
	.list ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.conv {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		border-radius: var(--radius-sm);
		border: 1px solid transparent;
		background: transparent;
		color: var(--text);
		text-align: left;
		cursor: pointer;
		font: inherit;
	}
	.conv:hover {
		background: var(--surface-hover);
	}
	.conv.on {
		background: var(--accent-soft);
		border-color: var(--accent);
	}
	.avatar {
		flex: none;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		background: var(--accent);
		color: var(--bg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display);
		font-weight: 700;
	}
	.meta {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.name {
		font-weight: 600;
		font-size: var(--fs-sm);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.snip {
		font-size: var(--fs-xs);
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.dot {
		flex: none;
		min-width: 20px;
		padding: 1px 6px;
		border-radius: 999px;
		background: var(--accent);
		color: var(--bg);
		font-size: var(--fs-xs);
		font-weight: 700;
		text-align: center;
	}
	.muted {
		color: var(--text-muted);
		font-size: var(--fs-sm);
	}
	.center {
		text-align: center;
	}
	.msg {
		margin: 8px 0 0;
		font-size: var(--fs-sm);
		color: var(--accent);
	}
	.msg.err {
		color: var(--danger);
	}
	.placeholder {
		margin: auto;
		text-align: center;
		color: var(--text-muted);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 40px 10px;
	}
	.t-head {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px 12px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--border);
	}
	.t-who {
		flex: 1;
		min-width: 120px;
		display: flex;
		flex-direction: column;
	}
	.sinif {
		font-size: var(--fs-xs);
		color: var(--text-muted);
	}
	.t-actions {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	.t-actions .btn,
	.back {
		font-size: var(--fs-xs);
		padding: 6px 12px;
	}
	.back {
		display: none;
	}
	.report {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 12px 0;
		border-bottom: 1px solid var(--border);
	}
	.report :global(.field) {
		margin-bottom: 0;
	}
	.report select,
	.report textarea {
		width: 100%;
	}
	.opt {
		opacity: 0.6;
	}
	.msgs {
		flex: 1;
		min-height: 260px;
		max-height: 55vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 14px 2px;
	}
	.bubble {
		max-width: 78%;
		align-self: flex-start;
		padding: 8px 12px;
		border-radius: 14px;
		background: var(--bg-alt);
		border: 1px solid var(--border);
	}
	.bubble.mine {
		align-self: flex-end;
		background: var(--accent-soft);
		border-color: color-mix(in srgb, var(--accent) 40%, transparent);
	}
	.bubble p {
		margin: 0;
		font-size: var(--fs-sm);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.bubble time {
		display: block;
		margin-top: 2px;
		font-size: 0.68rem;
		color: var(--text-faint);
	}
	.composer {
		display: flex;
		gap: 10px;
		align-items: flex-end;
	}
	.composer textarea {
		flex: 1;
		min-width: 0;
		resize: vertical;
	}
	.hint {
		margin: 8px 0 0;
		font-size: var(--fs-xs);
		color: var(--text-faint);
	}
	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
	@media (max-width: 800px) {
		.wrap {
			grid-template-columns: minmax(0, 1fr);
		}
		/* Mobilde tek panel: sohbet açıksa sadece sohbet, değilse sadece liste */
		.wrap.thread-open .list {
			display: none;
		}
		.wrap:not(.thread-open) .thread {
			display: none;
		}
		.back {
			display: inline-flex;
		}
		.bubble {
			max-width: 90%;
		}
	}
</style>
