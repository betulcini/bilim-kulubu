<script>
	import { createEventDispatcher } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import InterestPicker from '$lib/components/InterestPicker.svelte';
	import { user } from '$lib/stores/auth.js';
	import { interestById, interests } from '$lib/data/interests.js';
	import { loadMyCommunity, loadBlockedIds, reportUser, SIKAYET_SEBEPLERI } from '$lib/community.js';
	import { loadListings, createListing, setListingOpen, deleteListing, tabloYok, ilanTarihi, MAX_ACIK_ILAN, MAX_ILAN_ALANI } from '$lib/projeIlanlari.js';
	import { sfx } from '$lib/sound.js';

	const dispatch = createEventDispatcher();

	let ilanlar = [];
	let yukleniyor = true;
	let hata = '';
	let kurulumEksik = false;
	let profilAcik = true;
	let engelli = new Set();

	// ---- ilan verme formu ----
	let formAcik = false;
	let baslik = '';
	let aciklama = '';
	let aranan = '';
	let alanlar = [];
	let gonderiyor = false;
	let formHata = '';
	let bilgi = '';

	// ---- filtre ----
	let arama = '';
	let alanSecim = '';
	let kapalilariGoster = false;

	// ---- şikayet ----
	let sikayetId = null;
	let sikayetSebep = SIKAYET_SEBEPLERI[0];
	let sikayetMesaj = '';

	let yuklenen = null;
	$: if ($user && yuklenen !== $user.id) {
		yuklenen = $user.id;
		yukle($user.id);
	}

	async function yukle(uid) {
		yukleniyor = true;
		hata = '';
		const [liste, benim, blok] = await Promise.all([loadListings(), loadMyCommunity(uid), loadBlockedIds()]);
		if (liste.error) {
			if (tabloYok(liste.error)) kurulumEksik = true;
			else hata = 'İlanlar yüklenemedi. Biraz sonra tekrar dene.';
		}
		engelli = blok;
		ilanlar = liste.data.filter((i) => !blok.has(i.sahip));
		profilAcik = !!benim.data?.is_public;
		yukleniyor = false;
	}

	const norm = (t) => (t || '').toLocaleLowerCase('tr');

	$: benimAcikSayim = ilanlar.filter((i) => i.sahip === $user?.id && i.acik).length;
	$: filtreli = ilanlar.filter((i) => {
		if (!kapalilariGoster && !i.acik) return false;
		if (alanSecim && !i.alanlar.includes(alanSecim)) return false;
		const q = norm(arama.trim());
		if (q && !norm(i.baslik + ' ' + i.aciklama + ' ' + i.aranan + ' ' + i.ad).includes(q)) return false;
		return true;
	});

	function formuAc() {
		formAcik = !formAcik;
		formHata = '';
		bilgi = '';
		sfx.nav();
	}

	async function paylas(e) {
		e.preventDefault();
		if (gonderiyor) return;
		formHata = '';
		bilgi = '';
		gonderiyor = true;
		const { error } = await createListing({ baslik, aciklama, aranan, alanlar });
		gonderiyor = false;
		if (error) {
			formHata = error.message;
			sfx.error();
			return;
		}
		baslik = aciklama = aranan = '';
		alanlar = [];
		formAcik = false;
		bilgi = 'İlanın yayında. İlgilenenler sana site içi mesajla yazacak.';
		sfx.success();
		await yukle($user.id);
	}

	async function durumDegistir(i) {
		const { error } = await setListingOpen(i.id, !i.acik);
		if (error) {
			hata = error.message;
			return;
		}
		sfx.toggle();
		await yukle($user.id);
	}

	async function sil(i) {
		if (!confirm('Bu ilanı silmek istediğine emin misin?')) return;
		const { error } = await deleteListing(i.id);
		if (error) {
			hata = 'İlan silinemedi.';
			return;
		}
		ilanlar = ilanlar.filter((x) => x.id !== i.id);
	}

	function sikayetAc(i) {
		sikayetId = sikayetId === i.id ? null : i.id;
		sikayetSebep = SIKAYET_SEBEPLERI[0];
		sikayetMesaj = '';
	}

	async function sikayetGonder(i) {
		const { error } = await reportUser(i.sahip, sikayetSebep, `Proje ilanı: "${i.baslik}" (#${i.id})`);
		sikayetMesaj = error ? 'Şikayet gönderilemedi.' : 'Teşekkürler, şikayetin yöneticilere iletildi.';
		if (!error) setTimeout(() => (sikayetId = null), 1800);
	}
</script>

<div class="ilanlar">
	{#if kurulumEksik}
		<div class="bracket-card empty" role="alert">
			Proje ilanları için veritabanı kurulumu eksik. <code>supabase/2026-10-02-proje-ilanlari.sql</code> dosyasını SQL Editor'de bir kez çalıştır.
		</div>
	{:else}
		<div class="ust bracket-card">
			<div class="ust-metin">
				<h2>Proje arkadaşı ilanları</h2>
				<p>Bir projen mi var? Ekip arkadaşı ara ya da ilgini çeken bir ilana yaz.</p>
			</div>
			<button type="button" class="btn btn-primary" aria-expanded={formAcik} aria-controls="ilan-formu" on:click={formuAc}>
				<Icon name="add-square" size={16} /> {formAcik ? 'Formu kapat' : 'İlan ver'}
			</button>
		</div>

		{#if bilgi}<p class="msg ok" role="status">{bilgi}</p>{/if}

		{#if formAcik}
			<form id="ilan-formu" class="bracket-card form" on:submit={paylas} novalidate>
				{#if !profilAcik}
					<p class="msg err" role="alert">
						İlan verebilmek için topluluk profilinin herkese açık olması gerekiyor; ilgilenenler sana mesajla ulaşır.
						<a href="/profil#topluluk">Profilimi aç</a>
					</p>
				{/if}
				<div class="field">
					<label for="il-baslik">Proje başlığı</label>
					<input id="il-baslik" bind:value={baslik} maxlength="80" placeholder="Örn. Arduino ile akıllı sera" required />
				</div>
				<div class="field">
					<label for="il-aciklama">Proje nedir, ne yapacaksınız?</label>
					<textarea id="il-aciklama" bind:value={aciklama} maxlength="500" rows="4" placeholder="Kısaca anlat: amaç, şu anki durum, ne zaman çalışmayı düşünüyorsun…" required></textarea>
					<small class="say">{aciklama.length} / 500</small>
				</div>
				<div class="field">
					<label for="il-aranan">Kimi arıyorsun? (isteğe bağlı)</label>
					<input id="il-aranan" bind:value={aranan} maxlength="120" placeholder="Örn. 1 yazılımcı, 1 tasarımcı" />
				</div>
				<InterestPicker bind:selected={alanlar} legend="Proje alanları (en fazla {MAX_ILAN_ALANI})" limit={MAX_ILAN_ALANI} />
				{#if formHata}<p class="msg err" role="alert">{formHata}</p>{/if}
				<p class="kural">Aynı anda en fazla {MAX_ACIK_ILAN} açık ilanın olabilir (şu an {benimAcikSayim}). İlanlar 60 gün sonra listeden düşer. Telefon, e-posta gibi kişisel bilgi yazma; iletişim site içi mesajla olur.</p>
				<div class="form-alt">
					<button type="submit" class="btn btn-primary" disabled={gonderiyor || !profilAcik}>{gonderiyor ? 'Paylaşılıyor…' : 'İlanı paylaş'}</button>
					<button type="button" class="btn btn-ghost" on:click={formuAc}>Vazgeç</button>
				</div>
			</form>
		{/if}

		<section class="bracket-card filtre" aria-label="İlan filtreleri">
			<div class="f-row">
				<div class="field">
					<label for="il-ara">İlanlarda ara</label>
					<input id="il-ara" type="search" bind:value={arama} maxlength="60" placeholder="Örn. robot, sera, yapay zekâ" />
				</div>
				<div class="field">
					<label for="il-alan">Proje alanı</label>
					<select id="il-alan" bind:value={alanSecim}>
						<option value="">Hepsi</option>
						{#each interests as it}<option value={it.id}>{it.label}</option>{/each}
					</select>
				</div>
			</div>
			<label class="check">
				<input type="checkbox" bind:checked={kapalilariGoster} />
				<span>Ekibi tamamlanmış ilanları da göster</span>
			</label>
		</section>

		<section aria-live="polite" aria-label="İlan listesi">
			{#if yukleniyor}
				<p class="muted">Yükleniyor…</p>
			{:else if hata}
				<p class="msg err" role="alert">{hata}</p>
			{:else if filtreli.length === 0}
				<div class="bracket-card empty">
					{ilanlar.length === 0 ? 'Henüz ilan yok. İlk ilanı sen ver!' : 'Bu filtrelere uyan ilan bulunamadı.'}
				</div>
			{:else}
				<div class="grid">
					{#each filtreli as i (i.id)}
						<article class="bracket-card kart" class:kapali={!i.acik}>
							<div class="baslik-satiri">
								<h3>{i.baslik}</h3>
								<span class="badge {i.acik ? 'live' : 'muted'}">{i.acik ? 'Ekip arıyor' : 'Ekip tamam'}</span>
							</div>
							<p class="sahip">{i.ad}{i.sinif ? ' · ' + i.sinif : ''} · {ilanTarihi(i.created_at)}</p>
							<p class="acik">{i.aciklama}</p>
							{#if i.aranan}<p class="aranan"><Icon name="users" size={15} /> <span><strong>Aranan:</strong> {i.aranan}</span></p>{/if}
							{#if i.alanlar.length > 0}
								<ul class="tags" aria-label="Proje alanları">
									{#each i.alanlar as id}
										{#if interestById[id]}<li><Icon name={interestById[id].emoji} size={13} /><span>{interestById[id].label}</span></li>{/if}
									{/each}
								</ul>
							{/if}

							<div class="eylemler">
								{#if i.sahip === $user?.id}
									<button type="button" class="btn btn-ghost mini" on:click={() => durumDegistir(i)}>{i.acik ? 'Ekip tamam, kapat' : 'Yeniden aç'}</button>
									<button type="button" class="btn btn-ghost mini" on:click={() => sil(i)}>Sil</button>
								{:else}
									{#if i.acik}
										<button type="button" class="btn btn-primary mini" on:click={() => dispatch('mesaj', i.sahip)}>
											<Icon name="mail" size={15} /> Katılmak için yaz
										</button>
									{/if}
									<button type="button" class="btn btn-ghost mini" aria-expanded={sikayetId === i.id} on:click={() => sikayetAc(i)}>Şikayet et</button>
								{/if}
							</div>

							{#if sikayetId === i.id}
								<div class="sikayet">
									<label for="sk-{i.id}">Sebep</label>
									<select id="sk-{i.id}" bind:value={sikayetSebep}>
										{#each SIKAYET_SEBEPLERI as s}<option value={s}>{s}</option>{/each}
									</select>
									<button type="button" class="btn btn-ghost mini" on:click={() => sikayetGonder(i)}>Gönder</button>
									{#if sikayetMesaj}<span class="msg-kucuk" role="status">{sikayetMesaj}</span>{/if}
								</div>
							{/if}
						</article>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</div>

<style>
	.ilanlar { display: flex; flex-direction: column; gap: 18px; }
	.ust { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px 16px; }
	.ust-metin h2 { margin: 0 0 4px; font-size: var(--fs-lg); }
	.ust-metin p { margin: 0; color: var(--text-muted); font-size: var(--fs-sm); }
	.form { display: flex; flex-direction: column; gap: 14px; }
	.field { display: flex; flex-direction: column; gap: 6px; }
	.field label { font-size: var(--fs-sm); font-weight: 600; }
	.say { align-self: flex-end; color: var(--text-muted); font-size: var(--fs-xs); }
	.kural { margin: 0; color: var(--text-muted); font-size: var(--fs-xs); line-height: 1.5; }
	.form-alt { display: flex; gap: 10px; flex-wrap: wrap; }
	.f-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
	.check { display: flex; gap: 8px; align-items: center; font-size: var(--fs-sm); color: var(--text-muted); }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 14px; }
	.kart { display: flex; flex-direction: column; gap: 8px; }
	.kart.kapali { opacity: 0.7; }
	.baslik-satiri { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
	.baslik-satiri h3 { margin: 0; font-size: var(--fs-md); overflow-wrap: anywhere; }
	.sahip { margin: 0; color: var(--text-muted); font-size: var(--fs-xs); }
	.acik { margin: 0; font-size: var(--fs-sm); line-height: 1.55; overflow-wrap: anywhere; }
	.aranan { margin: 0; display: flex; gap: 8px; align-items: flex-start; font-size: var(--fs-sm); color: var(--text); }
	.tags { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
	.tags li { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 999px; font-size: var(--fs-xs); background: var(--accent-soft); color: var(--accent); }
	.eylemler { display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; padding-top: 6px; }
	.mini { padding: 7px 12px; font-size: var(--fs-xs); display: inline-flex; align-items: center; gap: 6px; }
	.sikayet { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: var(--fs-xs); }
	.msg-kucuk { color: var(--text-muted); }
	.msg { margin: 0; font-size: var(--fs-sm); }
	.msg.ok { color: var(--accent); }
	.msg.err { color: var(--danger); }
	.muted { color: var(--text-muted); }
	.empty { padding: 24px 20px; text-align: center; color: var(--text-muted); }
	code { font-size: 0.85em; overflow-wrap: anywhere; }
	@media (max-width: 560px) { .f-row { grid-template-columns: 1fr; } }
</style>
