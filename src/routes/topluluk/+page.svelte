<script>
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import InterestPicker from '$lib/components/InterestPicker.svelte';
	import Sohbetler from '$lib/components/Sohbetler.svelte';
	import { unread } from '$lib/stores/messages.js';
	import { interestById } from '$lib/data/interests.js';
	import { user, authReady } from '$lib/stores/auth.js';
	import { loadDirectory, loadMyCommunity, loadBlockedIds, ROLLER, rolAdi, instagramUrl } from '$lib/community.js';
	import { browser } from '$app/environment';
	import { goto, afterNavigate } from '$app/navigation';
	import { sfx } from '$lib/sound.js';

	$: if ($authReady && !$user) goto('/giris');

	let students = [];
	let loading = true;
	let loadError = '';
	let benGorunuyorum = true; // kendi profilim dizinde mi (uyarı bandı için)

	// ---------- sekmeler: Öğrenciler / Mesajlar ----------
	let sekme = 'ogrenciler';
	let acilacakKisi = null;

	function sekmeSec(ad) {
		if (sekme === ad) return;
		sekme = ad;
		if (ad === 'ogrenciler') acilacakKisi = null;
		sfx.nav();
	}

	function mesajAc(id) {
		acilacakKisi = id;
		sekme = 'mesajlar';
		sfx.nav();
		if (browser) window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function sekmeKlavye(e) {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		e.preventDefault();
		const yeni = sekme === 'ogrenciler' ? 'mesajlar' : 'ogrenciler';
		sekmeSec(yeni);
		document.getElementById('tab-' + yeni)?.focus();
	}

	// Eski bağlantılar: /topluluk?sekme=mesajlar&kisi=... (ve yönlendirilen /mesajlar)
	afterNavigate(() => {
		const q = new URLSearchParams(location.search);
		const k = q.get('kisi');
		if (k) mesajAc(k);
		else if (q.get('sekme') === 'mesajlar') sekme = 'mesajlar';
	});

	// ---------- filtreler ----------
	let secilen = [];
	let hepsi = false;
	let arama = '';
	let seviye = '';
	let rolSecim = '';

	let loadedFor = null;
	$: if (browser && $user && loadedFor !== $user.id) {
		loadedFor = $user.id;
		yukle($user.id);
	}

	async function yukle(uid) {
		loading = true;
		loadError = '';
		const [dir, mine, blocked] = await Promise.all([loadDirectory(uid), loadMyCommunity(uid), loadBlockedIds()]);
		if (dir.error) {
			loadError = 'Liste yüklenemedi. Veritabanı kurulumu (topluluk SQL dosyası) yapılmamış olabilir.';
		}
		students = dir.data.filter((s) => !blocked.has(s.id));
		benGorunuyorum = !!mine.data?.is_public;
		loading = false;
	}

	const norm = (t) => (t || '').toLocaleLowerCase('tr');
	const seviyeOf = (c) => (c.match(/^\s*(\d{1,2})/) || [])[1] || '';

	$: seviyeler = [...new Set(students.map((s) => seviyeOf(s.sinif)).filter(Boolean))].sort((a, b) => a - b);
	$: benimIlgilerim = $user?.interests || [];

	$: filtreli = students
		.filter((s) => {
			if (arama.trim() && !norm(s.name).includes(norm(arama.trim()))) return false;
			if (seviye && seviyeOf(s.sinif) !== seviye) return false;
			if (rolSecim && s.role !== rolSecim) return false;
			if (secilen.length === 0) return true;
			return hepsi ? secilen.every((i) => s.interests.includes(i)) : secilen.some((i) => s.interests.includes(i));
		})
		.map((s) => ({ ...s, ortak: s.interests.filter((i) => benimIlgilerim.includes(i)).length }))
		.sort((a, b) => b.ortak - a.ortak || a.name.localeCompare(b.name, 'tr'));

	$: filtreVar = secilen.length > 0 || arama.trim() || seviye || rolSecim;

	function temizle() {
		secilen = [];
		hepsi = false;
		arama = '';
		seviye = '';
		rolSecim = '';
		sfx.nav();
	}
</script>

<svelte:head><title>Topluluk · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader eyebrow="Tanış ve yaz" title="Topluluk" desc="Aynı bilim alanlarına ilgi duyan kişileri bul, onlara site içinden mesaj yaz." />

<div class="content-max page">
	{#if $user}
		<div class="tabs" role="tablist" aria-label="Topluluk bölümleri">
			<button
				type="button"
				role="tab"
				id="tab-ogrenciler"
				class="tab"
				class:on={sekme === 'ogrenciler'}
				aria-selected={sekme === 'ogrenciler'}
				aria-controls="panel-ogrenciler"
				tabindex={sekme === 'ogrenciler' ? 0 : -1}
				on:click={() => sekmeSec('ogrenciler')}
				on:keydown={sekmeKlavye}
			>
				<Icon name="users" size={17} />
				<span>Öğrenciler</span>
			</button>
			<button
				type="button"
				role="tab"
				id="tab-mesajlar"
				class="tab"
				class:on={sekme === 'mesajlar'}
				aria-selected={sekme === 'mesajlar'}
				aria-controls="panel-mesajlar"
				tabindex={sekme === 'mesajlar' ? 0 : -1}
				on:click={() => sekmeSec('mesajlar')}
				on:keydown={sekmeKlavye}
			>
				<Icon name="mail" size={17} />
				<span>Mesajlar</span>
				{#if $unread > 0}<span class="tab-count" aria-label="{$unread} okunmamış mesaj">{$unread}</span>{/if}
			</button>
		</div>

		{#if sekme === 'mesajlar'}
			<div id="panel-mesajlar" role="tabpanel" aria-labelledby="tab-mesajlar">
				<Sohbetler kisiId={acilacakKisi} on:ogrenciler={() => sekmeSec('ogrenciler')} />
			</div>
		{:else}
			<div id="panel-ogrenciler" role="tabpanel" aria-labelledby="tab-ogrenciler" class="ogrenciler">
				{#if !loading && !benGorunuyorum}
					<div class="bracket-card notice">
						<span class="ico-tile sm" aria-hidden="true"><Icon name="info" size={16} /></span>
						<p>Profilin şu an dizinde <strong>görünmüyor</strong>: başkalarını görebilirsin ama onlar seni göremez, sana yazamaz.</p>
						<a class="btn btn-primary" href="/profil#topluluk">Görünür ol</a>
					</div>
				{/if}

				<section class="bracket-card filtre" aria-label="Filtreler">
					<div class="f-head">
						<h2>Filtrele</h2>
						<span class="count" aria-live="polite">
							{#if !loading && !loadError}{filtreli.length} kişi{filtreVar ? ' bulundu' : ' dizinde'}{/if}
						</span>
						{#if filtreVar}
							<button type="button" class="btn btn-ghost mini" on:click={temizle}>Filtreleri temizle</button>
						{/if}
					</div>

					<div class="f-row">
						<div class="field">
							<label for="t-ara">İsim ara</label>
							<input id="t-ara" type="search" bind:value={arama} placeholder="Örn. Ayşe" maxlength="60" />
						</div>
						<div class="field">
							<label for="t-rol">Kim arıyorsun?</label>
							<select id="t-rol" bind:value={rolSecim}>
								<option value="">Hepsi</option>
								{#each ROLLER as r}<option value={r.id}>{r.label}</option>{/each}
							</select>
						</div>
						<div class="field">
							<label for="t-sinif">Sınıf seviyesi</label>
							<select id="t-sinif" bind:value={seviye} disabled={seviyeler.length === 0}>
								<option value="">Hepsi</option>
								{#each seviyeler as sv}<option value={sv}>{sv}. sınıf</option>{/each}
							</select>
						</div>
					</div>

					<InterestPicker bind:selected={secilen} legend="Bilim alanı" limit={0} />

					{#if secilen.length > 1}
						<label class="check">
							<input type="checkbox" bind:checked={hepsi} />
							<span>Seçtiğim alanların <strong>hepsine</strong> ilgi duyanlar</span>
						</label>
					{/if}
				</section>

				<section aria-live="polite" aria-label="Kişi listesi">
					{#if loading}
						<p class="muted">Yükleniyor…</p>
					{:else if loadError}
						<p class="msg err" role="alert">{loadError}</p>
					{:else if filtreli.length === 0}
						<div class="bracket-card empty">
							{#if students.length === 0}
								Henüz profilini herkese açan kimse yok. İlk sen ol!
							{:else}
								Bu filtrelere uyan öğrenci bulunamadı. Filtreleri biraz gevşetmeyi dene.
							{/if}
						</div>
					{:else}
						<div class="grid">
							{#each filtreli as s (s.id)}
								<article class="bracket-card kart">
									<div class="top">
										<span class="avatar" aria-hidden="true">{s.name.charAt(0).toLocaleUpperCase('tr')}</span>
										<div class="who">
											<h3>{s.name}</h3>
											<span class="sinif">{rolAdi(s.role)}{s.sinif ? ' · ' + s.sinif : ''}</span>
										</div>
									</div>

									{#if s.interests.length > 0}
										<ul class="tags" aria-label="İlgi alanları">
											{#each s.interests as id}
												{#if interestById[id]}
													<li class:ortak={benimIlgilerim.includes(id)} class:secili={secilen.includes(id)}>
														<Icon name={interestById[id].emoji} size={13} />
														<span>{interestById[id].label}</span>
													</li>
												{/if}
											{/each}
										</ul>
									{/if}

									{#if s.bio}<p class="bio">{s.bio}</p>{/if}

									{#if s.instagram || s.linkedin}
										<div class="social">
											{#if s.instagram}
												<a href={instagramUrl(s.instagram)} target="_blank" rel="noopener noreferrer nofollow" aria-label="{s.name} Instagram hesabı (yeni sekmede açılır)">
													<Icon name="instagram" size={16} /> <span>@{s.instagram}</span>
												</a>
											{/if}
											{#if s.linkedin}
												<a href={s.linkedin} target="_blank" rel="noopener noreferrer nofollow" aria-label="{s.name} LinkedIn profili (yeni sekmede açılır)">
													<Icon name="linkedin" size={16} /> <span>LinkedIn</span>
												</a>
											{/if}
										</div>
									{/if}

									<button type="button" class="btn btn-ghost yaz" on:click={() => mesajAc(s.id)}>
										<Icon name="mail" size={16} /> Mesaj gönder
									</button>
								</article>
							{/each}
						</div>
					{/if}
				</section>
			</div>
		{/if}
	{/if}
</div>

<style>
	.page {
		margin-bottom: 60px;
		display: flex;
		flex-direction: column;
		gap: 22px;
	}
	.notice {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px 14px;
	}
	.notice p {
		margin: 0;
		flex: 1;
		min-width: 200px;
		font-size: var(--fs-sm);
		color: var(--text-muted);
	}
	.tabs {
		display: flex;
		gap: 6px;
		padding: 5px;
		width: fit-content;
		max-width: 100%;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-strong);
		background: var(--bg-alt);
	}
	.tab {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 42px;
		padding: 8px 18px;
		border: 1px solid transparent;
		border-radius: 9px;
		background: transparent;
		color: var(--text-muted);
		font-family: var(--font-display);
		font-size: var(--fs-sm);
		font-weight: 600;
		cursor: pointer;
		transition: background var(--dur) var(--ease), color var(--dur) var(--ease);
	}
	.tab:hover {
		color: var(--text);
	}
	.tab.on {
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent);
	}
	.tab:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.tab-count {
		min-width: 20px;
		padding: 1px 6px;
		border-radius: 999px;
		background: var(--accent);
		color: var(--bg);
		font-size: var(--fs-xs);
		font-weight: 700;
		text-align: center;
	}
	.ogrenciler {
		display: flex;
		flex-direction: column;
		gap: 22px;
	}
	.filtre {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.f-head {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px 14px;
	}
	.f-head h2 {
		margin: 0;
		font-size: var(--fs-lg);
	}
	.f-head .count {
		flex: 1;
	}
	.mini {
		font-size: var(--fs-xs);
		padding: 6px 12px;
	}
	.f-row {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr);
		gap: 14px;
	}
	.filtre :global(.field) {
		margin-bottom: 0;
	}
	.filtre input[type='search'],
	.filtre select {
		width: 100%;
	}
	.check {
		display: flex;
		gap: 8px;
		align-items: flex-start;
		font-size: var(--fs-sm);
		color: var(--text-muted);
		cursor: pointer;
	}
	.check input {
		margin-top: 3px;
		accent-color: var(--accent);
	}
	.count {
		margin: 0;
		font-size: var(--fs-xs);
		color: var(--text-muted);
		font-weight: 600;
	}
	.muted {
		color: var(--text-muted);
	}
	.msg.err {
		color: var(--danger);
		font-size: var(--fs-sm);
	}
	.empty {
		text-align: center;
		color: var(--text-muted);
		padding: 36px 18px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
		gap: 16px;
	}
	.kart {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.top {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.avatar {
		flex: none;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--accent);
		color: var(--bg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.1rem;
	}
	.who {
		min-width: 0;
	}
	.who h3 {
		margin: 0;
		font-size: var(--fs-base);
		overflow-wrap: anywhere;
	}
	.sinif {
		font-size: var(--fs-xs);
		color: var(--text-muted);
	}
	.tags {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.tags li {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 9px;
		border-radius: 999px;
		border: 1px solid var(--border-strong);
		background: var(--bg-alt);
		font-size: var(--fs-xs);
		color: var(--text-muted);
	}
	.tags li.ortak {
		border-color: color-mix(in srgb, var(--accent) 45%, transparent);
	}
	.tags li.secili {
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent);
		font-weight: 600;
	}
	.bio {
		margin: 0;
		font-size: var(--fs-sm);
		color: var(--text-muted);
		line-height: 1.5;
		overflow-wrap: anywhere;
	}
	.social {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 14px;
	}
	.social a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: var(--fs-xs);
		color: var(--accent);
		text-decoration: none;
		overflow-wrap: anywhere;
	}
	.social a:hover {
		text-decoration: underline;
	}
	.yaz {
		margin-top: auto;
		justify-content: center;
		gap: 8px;
		text-decoration: none;
	}
	@media (max-width: 760px) {
		.f-row {
			grid-template-columns: minmax(0, 1fr);
		}
		.tabs {
			width: 100%;
		}
		.tab {
			flex: 1;
			padding: 8px 10px;
		}
	}
</style>
