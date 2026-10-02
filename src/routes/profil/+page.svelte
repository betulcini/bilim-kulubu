<script>
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import InterestPicker from '$lib/components/InterestPicker.svelte';
	import SanaOzel from '$lib/components/SanaOzel.svelte';
	import { user, authReady, signOut, updateProfile } from '$lib/stores/auth.js';
	import { activity } from '$lib/stores/activity.js';
	import { streak } from '$lib/stores/streak.js';
	import { computeBadges } from '$lib/data/badges.js';
	import { supabase } from '$lib/supabaseClient.js';
	import { loadMyCommunity, saveMyCommunity, syncMyInterests, normalizeInstagram, normalizeLinkedin, ROLLER } from '$lib/community.js';
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
		if (toplulukHazir) syncMyInterests($user.id, ilgiler);
	}

	// ---------- topluluk (öğrenci dizini) ----------
	let herkeseAcik = false;
	let biyo = '';
	let rol = 'ogrenci';
	let instagram = '';
	let linkedin = '';
	let eksikAlan = false; // rol/instagram/linkedin SQL'i henüz çalışmadı
	let toplulukHazir = false; // kayıt başarıyla okunduysa true (okunamadıysa yazma yapılmaz)
	let toplulukKaydediliyor = false;
	let toplulukHata = '';
	let toplulukBasari = '';
	let communityFor = null;

	$: if (browser && $user && communityFor !== $user.id) {
		communityFor = $user.id;
		yukleTopluluk($user.id);
	}

	async function yukleTopluluk(uid) {
		const res = await loadMyCommunity(uid);
		const { data, error } = res;
		if (error) {
			toplulukHata = 'Topluluk ayarları yüklenemedi. Supabase SQL Editor\'da supabase/2026-10-01-topluluk-mesajlar.sql dosyasını bir kez çalıştırman gerekiyor.';
			return;
		}
		herkeseAcik = !!data.is_public;
		biyo = data.bio || '';
		rol = data.role || 'ogrenci';
		instagram = data.instagram || '';
		linkedin = data.linkedin || '';
		eksikAlan = !!res.eksikAlan;
		toplulukHazir = true;
	}

	async function toplulukKaydet() {
		toplulukHata = '';
		toplulukBasari = '';
		toplulukKaydediliyor = true;
		const { error } = await saveMyCommunity($user.id, {
			is_public: herkeseAcik,
			bio: biyo,
			interests: $user.interests || [],
			role: rol,
			instagram,
			linkedin
		});
		toplulukKaydediliyor = false;
		if (error) {
			toplulukHata = 'Kaydedilemedi: ' + error.message;
			return;
		}
		instagram = normalizeInstagram(instagram) ?? instagram;
		linkedin = (normalizeLinkedin(linkedin) ?? linkedin).replace('https://www.', '');
		toplulukBasari = herkeseAcik ? 'Artık Topluluk sayfasında görünüyorsun.' : 'Profilin Topluluk sayfasında gizli.';
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

	$: rozetler = computeBadges({ user: $user, scores, activity: $activity, streak: $streak });
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

		{#if toplulukHazir && !herkeseAcik}
			<div class="bracket-card notice">
				<p>Profilin şu an <strong>Topluluk sayfasında gizli</strong>. Aynı alanlara ilgi duyanlarla tanışmak için herkese açık yapabilirsin.</p>
				<a class="btn btn-primary" href="#topluluk">Herkese açık yap</a>
			</div>
		{/if}

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

		<section id="topluluk" aria-labelledby="topluluk-baslik">
			<h2 id="topluluk-baslik">Topluluk profilim</h2>
			<form class="bracket-card form" on:submit|preventDefault={toplulukKaydet}>
				<p class="hint">
					Aynı bilim alanlarına ilgi duyan kişilerle tanışmak için profilini Topluluk sayfasında gösterebilirsin.
					Açarsan <strong>adın, sınıfın, rolün, ilgi alanların, tanıtım yazın ve eklediğin sosyal medya hesapları</strong>
					giriş yapmış kulüp üyelerine görünür ve sana site içinden mesaj yazabilirler. E-posta adresin hiçbir zaman paylaşılmaz.
					İstediğin zaman kapatabilir, rahatsız edici birini engelleyebilir ya da şikayet edebilirsin.
				</p>

				{#if toplulukHata}<p class="msg err" role="alert">{toplulukHata}</p>{/if}
				{#if toplulukHazir && eksikAlan}
					<p class="hint warn">Rol, Instagram ve LinkedIn alanlarının çalışması için supabase/2026-10-01-topluluk-ek-alanlar.sql dosyası bir kez çalıştırılmalı.</p>
				{/if}

				<label class="switch" class:on={herkeseAcik}>
					<input type="checkbox" bind:checked={herkeseAcik} disabled={!toplulukHazir} />
					<span>Profilimi herkese açık yap (Topluluk sayfasında göster)</span>
				</label>
				{#if herkeseAcik && ($user.interests || []).length === 0}
					<p class="hint warn">Henüz ilgi alanı seçmedin; bilim alanına göre aramalarda çıkabilmek için yukarıdan seçip "Değişiklikleri Kaydet"e bas.</p>
				{/if}

				<div class="field">
					<label for="p-rol">Ben bir</label>
					<select id="p-rol" bind:value={rol} disabled={!toplulukHazir}>
						{#each ROLLER as r}<option value={r.id}>{r.label}</option>{/each}
					</select>
				</div>

				<div class="field">
					<label for="p-biyo">Kısa tanıtım <span class="opt">(isteğe bağlı, en fazla 280 karakter)</span></label>
					<textarea id="p-biyo" rows="3" maxlength="280" bind:value={biyo} disabled={!toplulukHazir} placeholder="Örn. Uzayla ilgileniyorum, birlikte teleskop projesi yapacak biri arıyorum."></textarea>
				</div>

				<div class="row">
					<div class="field">
						<label for="p-ig">Instagram <span class="opt">(isteğe bağlı)</span></label>
						<input id="p-ig" type="text" bind:value={instagram} disabled={!toplulukHazir || eksikAlan} maxlength="60" placeholder="kullanici_adin" autocomplete="off" autocapitalize="none" spellcheck="false" />
					</div>
					<div class="field">
						<label for="p-li">LinkedIn <span class="opt">(isteğe bağlı)</span></label>
						<input id="p-li" type="text" bind:value={linkedin} disabled={!toplulukHazir || eksikAlan} maxlength="160" placeholder="linkedin.com/in/kullanici-adin" autocomplete="off" autocapitalize="none" spellcheck="false" />
					</div>
				</div>
				<p class="hint">Sosyal medya hesapların sadece sen profilini herkese açtığında ve sadece giriş yapmış üyelere görünür. İstemiyorsan boş bırak.</p>

				{#if toplulukBasari}<p class="msg ok" role="status">{toplulukBasari}</p>{/if}

				<div class="actions">
					<button class="btn btn-primary" type="submit" disabled={toplulukKaydediliyor || !toplulukHazir}>{toplulukKaydediliyor ? 'Kaydediliyor…' : 'Topluluk ayarlarını kaydet'}</button>
					<a class="btn btn-ghost" href="/topluluk">Topluluğa git</a>
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
						<span class="r-emo tier-{r.seviye}" aria-hidden="true"><Icon name={r.emoji} size={22} /></span>
						<div class="r-body">
							<h3>{r.ad}{#if r.seviyeli && r.seviye > 0} <span class="tier-tag tier-{r.seviye}">{r.seviyeAd}</span>{/if}</h3>
							<p>{r.aciklama}</p>
							{#if r.maksimum}
								<span class="r-state"><Icon name="check" size={14} /> En yüksek seviye</span>
							{:else if r.kazanildi && !r.seviyeli}
								<span class="r-state"><Icon name="check" size={14} /> Kazanıldı</span>
							{:else}
								<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax={r.hedef} aria-valuenow={r.deger} aria-label="{r.ad} ilerlemesi">
									<span style="width: {(r.deger / r.hedef) * 100}%"></span>
								</div>
								<span class="r-count">{r.deger} / {r.hedef}{#if r.seviyeli} · sonraki: {r.seviye >= 1 ? ['', 'Gümüş', 'Altın'][r.seviye] : 'Bronz'}{/if}</span>
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
	.notice a {
		text-decoration: none;
	}
	.form select {
		width: 100%;
	}
	.hint {
		margin: 0;
		font-size: var(--fs-sm);
		color: var(--text-muted);
		line-height: 1.55;
	}
	.hint.warn {
		color: var(--text);
	}
	.switch {
		display: flex;
		align-items: center;
		gap: 10px;
		font-weight: 600;
		cursor: pointer;
	}
	.form .switch input {
		width: 20px;
		height: 20px;
		flex: none;
		accent-color: var(--accent);
	}
	.form textarea {
		width: 100%;
		resize: vertical;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	.actions a {
		text-decoration: none;
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
		background: var(--surface-hover);
		color: var(--text-faint);
		border-color: var(--border);
	}
	.r-emo {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 13px;
		background: var(--accent-soft);
		color: var(--accent);
		border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
	}
	.r-emo.tier-1, .tier-tag.tier-1 { background: color-mix(in srgb, #c98a5a 26%, transparent); color: #c98a5a; border-color: color-mix(in srgb, #c98a5a 45%, transparent); }
	.r-emo.tier-2, .tier-tag.tier-2 { background: color-mix(in srgb, #b9c0c4 26%, transparent); color: #aab3b8; border-color: color-mix(in srgb, #b9c0c4 50%, transparent); }
	.r-emo.tier-3, .tier-tag.tier-3 { background: color-mix(in srgb, #d9a93f 28%, transparent); color: #d9a93f; border-color: color-mix(in srgb, #d9a93f 50%, transparent); }
	.tier-tag { display: inline-block; vertical-align: middle; margin-left: 4px; padding: 1px 8px; border-radius: 999px; border: 1px solid; font-family: var(--font-display); font-size: var(--fs-xs); font-weight: 700; }
	.r-state {
		display: inline-flex;
		align-items: center;
		gap: 4px;
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
