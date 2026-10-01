<script>
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import InterestPicker from '$lib/components/InterestPicker.svelte';
	import { interestById } from '$lib/data/interests.js';
	import { user, authReady } from '$lib/stores/auth.js';
	import { loadDirectory, loadMyCommunity, loadBlockedIds } from '$lib/community.js';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { sfx } from '$lib/sound.js';

	$: if ($authReady && !$user) goto('/giris');

	let students = [];
	let loading = true;
	let loadError = '';
	let benGorunuyorum = true; // kendi profilim dizinde mi (uyarı bandı için)

	// ---------- filtreler ----------
	let secilen = [];
	let hepsi = false;
	let arama = '';
	let seviye = '';

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
			if (secilen.length === 0) return true;
			return hepsi ? secilen.every((i) => s.interests.includes(i)) : secilen.some((i) => s.interests.includes(i));
		})
		.map((s) => ({ ...s, ortak: s.interests.filter((i) => benimIlgilerim.includes(i)).length }))
		.sort((a, b) => b.ortak - a.ortak || a.name.localeCompare(b.name, 'tr'));

	$: filtreVar = secilen.length > 0 || arama.trim() || seviye;

	function temizle() {
		secilen = [];
		hepsi = false;
		arama = '';
		seviye = '';
		sfx.nav();
	}
</script>

<svelte:head><title>Topluluk · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader eyebrow="Tanış" title="Topluluk" desc="Aynı bilim alanlarına ilgi duyan okul arkadaşlarını bul, onlara site içinden mesaj yaz." />

<div class="content-max page">
	{#if $user}
		{#if !loading && !benGorunuyorum}
			<div class="bracket-card notice">
				<span class="ico-tile sm" aria-hidden="true"><Icon name="info" size={16} /></span>
				<p>Profilin şu an dizinde <strong>görünmüyor</strong>: başkalarını görebilirsin ama onlar seni göremez, sana yazamaz.</p>
				<a class="btn btn-primary" href="/profil#topluluk">Görünür ol</a>
			</div>
		{/if}

		<div class="layout">
			<aside class="bracket-card panel" aria-label="Filtreler">
				<h2>Filtrele</h2>

				<div class="field">
					<label for="t-ara">İsim ara</label>
					<input id="t-ara" type="search" bind:value={arama} placeholder="Örn. Ayşe" maxlength="60" />
				</div>

				<InterestPicker bind:selected={secilen} legend="Bilim alanı" />

				{#if secilen.length > 1}
					<label class="check">
						<input type="checkbox" bind:checked={hepsi} />
						<span>Seçtiğim alanların <strong>hepsine</strong> ilgi duyanlar</span>
					</label>
				{/if}

				{#if seviyeler.length > 0}
					<div class="field">
						<label for="t-sinif">Sınıf seviyesi</label>
						<select id="t-sinif" bind:value={seviye}>
							<option value="">Hepsi</option>
							{#each seviyeler as sv}<option value={sv}>{sv}. sınıf</option>{/each}
						</select>
					</div>
				{/if}

				{#if filtreVar}
					<button type="button" class="btn btn-ghost" on:click={temizle}>Filtreleri temizle</button>
				{/if}
			</aside>

			<section aria-live="polite" aria-label="Öğrenci listesi">
				{#if loading}
					<p class="muted">Yükleniyor…</p>
				{:else if loadError}
					<p class="msg err" role="alert">{loadError}</p>
				{:else}
					<p class="count">{filtreli.length} öğrenci{filtreVar ? ' bulundu' : ' dizinde'}</p>

					{#if filtreli.length === 0}
						<div class="bracket-card empty">
							{#if students.length === 0}
								Henüz profilini herkese açan öğrenci yok. İlk sen ol!
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
											{#if s.sinif}<span class="sinif">{s.sinif}</span>{/if}
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

									<a class="btn btn-ghost yaz" href="/mesajlar?kisi={s.id}" on:click={() => sfx.nav()}>
										<Icon name="mail" size={16} /> Mesaj gönder
									</a>
								</article>
							{/each}
						</div>
					{/if}
				{/if}
			</section>
		</div>
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
	.layout {
		display: grid;
		grid-template-columns: 300px minmax(0, 1fr);
		gap: 22px;
		align-items: start;
	}
	.panel {
		display: flex;
		flex-direction: column;
		gap: 16px;
		position: sticky;
		top: 16px;
	}
	.panel h2 {
		margin: 0;
		font-size: var(--fs-lg);
	}
	.panel :global(.field) {
		margin-bottom: 0;
	}
	.panel input[type='search'],
	.panel select {
		width: 100%;
	}
	.check {
		display: flex;
		gap: 8px;
		align-items: flex-start;
		font-size: var(--fs-xs);
		color: var(--text-muted);
		cursor: pointer;
	}
	.check input {
		margin-top: 2px;
		accent-color: var(--accent);
	}
	.count {
		margin: 0 0 12px;
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
	.yaz {
		margin-top: auto;
		justify-content: center;
		gap: 8px;
		text-decoration: none;
	}
	@media (max-width: 900px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
		.panel {
			position: static;
		}
	}
</style>
