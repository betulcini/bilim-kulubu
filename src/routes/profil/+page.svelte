<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import InterestPicker from '$lib/components/InterestPicker.svelte';
	import SanaOzel from '$lib/components/SanaOzel.svelte';
	import { user, authReady, signOut, updateProfile } from '$lib/stores/auth.js';
	import { activity } from '$lib/stores/activity.js';
	import { computeBadges } from '$lib/data/badges.js';
	import { supabase } from '$lib/supabaseClient.js';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { sfx } from '$lib/sound.js';

	$: if ($authReady && !$user) {
		goto('/giris');
	}

	async function handleSignOut() {
		await signOut();
		goto('/');
	}

	// ---------- profil düzenleme ----------
	let ad = '';
	let sinif = '';
	let ilgiler = [];
	let formHazir = false;
	let kaydediliyor = false;
	let hata = '';
	let basari = false;

	// Form, kullanıcı ilk yüklendiğinde bir kez doldurulur (sonradan yazdıklarını ezmesin)
	$: if ($user && !formHazir) {
		ad = $user.full_name || '';
		sinif = $user.class_name || '';
		ilgiler = [...($user.interests || [])];
		formHazir = true;
	}

	async function kaydet() {
		hata = '';
		basari = false;
		if (!ad.trim()) {
			hata = 'Ad soyad boş olamaz.';
			return;
		}
		kaydediliyor = true;
		const { error } = await updateProfile({ full_name: ad, class_name: sinif, interests: ilgiler });
		kaydediliyor = false;
		if (error) {
			hata = 'Kaydedilemedi: ' + error.message;
			return;
		}
		basari = true;
		sfx.nav();
	}

	// ---------- rozetler ----------
	let scores = [];
	let loadedFor = null;

	function localScores() {
		try {
			const raw = JSON.parse(localStorage.getItem('btk_quiz_scores') || '[]');
			return Array.isArray(raw) ? raw.map((r) => ({ subject: r.subject, score: Number(r.score) || 0 })) : [];
		} catch (e) {
			return [];
		}
	}

	async function loadScores(userId) {
		// Giriş yapmış kullanıcının ortak tablodaki skorları; alınamazsa bu cihazdaki geçmiş
		const { data, error } = await supabase.from('quiz_scores').select('subject, score').eq('user_id', userId);
		const remote = !error && Array.isArray(data) ? data.map((r) => ({ subject: r.subject, score: Number(r.score) || 0 })) : [];
		scores = remote.length > 0 ? remote : localScores();
	}

	$: if (browser && $user && loadedFor !== $user.id) {
		loadedFor = $user.id;
		loadScores($user.id);
	}

	$: rozetler = computeBadges({ user: $user, scores, activity: $activity });
	$: kazanilan = rozetler.filter((r) => r.kazanildi).length;
</script>

<svelte:head><title>Profilim · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader eyebrow="Hesap" title="Profilim" desc="Bilgilerini düzenle, rozetlerini gör, sana özel önerilere göz at." />

<div class="content-max page">
	{#if $user}
		<div class="bracket-card head-card">
			<span class="avatar">{($user.full_name || $user.email).charAt(0).toUpperCase()}</span>
			<div class="who">
				<h3>{$user.full_name || 'İsimsiz Üye'}</h3>
				<span class="mail">{$user.email}</span>
			</div>
			<button class="btn btn-ghost" on:click={handleSignOut}>Çıkış Yap</button>
		</div>

		<section aria-labelledby="duzenle-baslik">
			<h2 id="duzenle-baslik">Bilgilerimi düzenle</h2>
			<form class="bracket-card form" on:submit|preventDefault={kaydet}>
				<div class="row">
					<div class="field">
						<label for="p-ad">Ad Soyad</label>
						<input id="p-ad" type="text" bind:value={ad} required maxlength="60" autocomplete="name" />
					</div>
					<div class="field">
						<label for="p-sinif">Sınıf / şube <span class="opt">(isteğe bağlı)</span></label>
						<input id="p-sinif" type="text" bind:value={sinif} placeholder="Örn. 10-A" maxlength="20" />
					</div>
				</div>

				<InterestPicker bind:selected={ilgiler} legend="Yakın olduğun bilim alanları" />

				<div class="field">
					<label for="p-mail">E-posta</label>
					<input id="p-mail" type="email" value={$user.email} disabled />
				</div>

				{#if hata}<p class="msg err" role="alert">{hata}</p>{/if}
				{#if basari}<p class="msg ok" role="status">Profilin güncellendi.</p>{/if}

				<div>
					<button class="btn btn-primary" type="submit" disabled={kaydediliyor}>{kaydediliyor ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}</button>
				</div>
			</form>
		</section>

		<section aria-labelledby="rozet-baslik">
			<div class="sec-head">
				<h2 id="rozet-baslik">Rozetlerim</h2>
				<span class="badge live">{kazanilan} / {rozetler.length} kazanıldı</span>
			</div>
			<div class="badge-grid">
				{#each rozetler as r}
					<div class="bracket-card rozet" class:locked={!r.kazanildi}>
						<span class="r-emo" aria-hidden="true">{r.emoji}</span>
						<div class="r-body">
							<h3>{r.ad}</h3>
							<p>{r.aciklama}</p>
							{#if r.kazanildi}
								<span class="r-state">Kazanıldı ✓</span>
							{:else}
								<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax={r.hedef} aria-valuenow={r.deger} aria-label="{r.ad} ilerlemesi">
									<span style="width: {(r.deger / r.hedef) * 100}%"></span>
								</div>
								<span class="r-count">{r.deger} / {r.hedef}</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			<p class="note">Quiz rozetleri hesabına kayıtlı skorlardan, oyun ve bilim insanı rozetleri bu cihazdaki etkinliğinden hesaplanır.</p>
		</section>

		<SanaOzel />
	{/if}
</div>

<style>
	.page {
		margin-bottom: 60px;
		display: flex;
		flex-direction: column;
		gap: 36px;
	}
	section h2 {
		margin: 0 0 14px;
	}
	.head-card {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 14px;
	}
	.avatar {
		flex: none;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--accent);
		color: var(--bg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.2rem;
	}
	.who {
		flex: 1;
		min-width: 0;
	}
	.who h3 {
		margin: 0;
		overflow-wrap: anywhere;
	}
	.mail {
		font-size: var(--fs-xs);
		color: var(--text-muted);
		overflow-wrap: anywhere;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 18px;
		max-width: 720px;
	}
	.row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
		gap: 14px;
	}
	.form :global(.field) {
		margin-bottom: 0;
	}
	.form input {
		width: 100%;
	}
	.form input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.opt {
		opacity: 0.6;
	}
	.msg {
		margin: 0;
		font-size: var(--fs-sm);
	}
	.msg.err {
		color: var(--danger);
	}
	.msg.ok {
		color: var(--accent);
	}

	.sec-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 14px;
		margin-bottom: 14px;
	}
	.sec-head h2 {
		margin: 0;
	}
	.badge-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr));
		gap: 14px;
	}
	.rozet {
		display: flex;
		gap: 14px;
		align-items: flex-start;
	}
	.rozet.locked {
		opacity: 0.72;
	}
	.rozet.locked .r-emo {
		filter: grayscale(1);
	}
	.r-emo {
		flex: none;
		font-size: 2rem;
		line-height: 1;
	}
	.r-body {
		min-width: 0;
		flex: 1;
	}
	.r-body h3 {
		margin: 0 0 2px;
		font-size: var(--fs-base);
	}
	.r-body p {
		margin: 0 0 8px;
		font-size: var(--fs-xs);
		color: var(--text-muted);
	}
	.r-state {
		font-size: var(--fs-xs);
		font-weight: 700;
		color: var(--accent);
	}
	.bar {
		height: 6px;
		border-radius: 999px;
		background: var(--bg-alt);
		overflow: hidden;
		margin-bottom: 4px;
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--accent);
		border-radius: 999px;
	}
	.r-count {
		font-size: var(--fs-xs);
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}
	.note {
		margin: 12px 0 0;
		font-size: var(--fs-xs);
		color: var(--text-faint);
	}
</style>
