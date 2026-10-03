<script>
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import QuizYonetimi from '$lib/components/QuizYonetimi.svelte';
	import GaleriYonetimi from '$lib/components/GaleriYonetimi.svelte';
	import { user, authReady } from '$lib/stores/auth.js';
	import { ALANLAR, bosForm, dogrula, isAdmin, listRows, saveRow, setAktif, removeRow } from '$lib/yonetim.js';
	import { formatTarih } from '$lib/content.js';
	import { sfx } from '$lib/sound.js';

	$: if ($authReady && !$user) goto('/giris');

	let kontrol = 'bekliyor'; // bekliyor | admin | yetkisiz | hata
	let kontrolHata = '';
	let sekme = 'duyurular';
	let satirlar = [];
	let yukleniyor = false;
	let form = bosForm('duyurular');
	let duzenlenen = null; // düzenlenen satırın id'si
	let hata = '';
	let bilgi = '';
	let kaydediyor = false;

	let kontrolEdilen = null;
	$: if (browser && $user && kontrolEdilen !== $user.id) {
		kontrolEdilen = $user.id;
		yetkiKontrol();
	}

	async function yetkiKontrol() {
		const r = await isAdmin();
		if (r.hata) {
			kontrol = 'hata';
			kontrolHata = r.hata;
		} else if (r.admin) {
			kontrol = 'admin';
			await yukle();
		} else {
			kontrol = 'yetkisiz';
		}
	}

	async function yukle() {
		yukleniyor = true;
		const r = await listRows(sekme);
		satirlar = r.data;
		if (r.hata) hata = r.hata;
		yukleniyor = false;
	}

	const TABLAR = [
		{ id: 'duyurular', ad: 'Duyurular' },
		{ id: 'firsatlar', ad: 'Fırsatlar' },
		{ id: 'quizler', ad: 'Quizler' },
		{ id: 'galeri', ad: 'Galeri' }
	];
	const FORMLU = ['duyurular', 'firsatlar']; // ortak form + liste kullanan sekmeler

	async function sekmeSec(ad) {
		if (sekme === ad) return;
		sekme = ad;
		sfx.nav();
		if (FORMLU.includes(ad)) {
			temizle();
			await yukle();
		} else {
			hata = '';
			bilgi = '';
		}
	}

	function sekmeKlavye(e) {
		const i = TABLAR.findIndex((t) => t.id === sekme);
		let yeni = -1;
		if (e.key === 'ArrowRight') yeni = (i + 1) % TABLAR.length;
		else if (e.key === 'ArrowLeft') yeni = (i - 1 + TABLAR.length) % TABLAR.length;
		else if (e.key === 'Home') yeni = 0;
		else if (e.key === 'End') yeni = TABLAR.length - 1;
		if (yeni < 0) return;
		e.preventDefault();
		const id = TABLAR[yeni].id;
		sekmeSec(id);
		document.getElementById('yt-' + id)?.focus();
	}

	function temizle() {
		form = bosForm(sekme);
		duzenlenen = null;
		hata = '';
		bilgi = '';
	}

	function duzenle(satir) {
		const f = bosForm(sekme);
		for (const a of ALANLAR[sekme]) f[a.k] = satir[a.k] ?? '';
		form = f;
		duzenlenen = satir.id;
		hata = '';
		bilgi = '';
		if (browser) document.getElementById('yform')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		document.getElementById('y-' + ALANLAR[sekme][0].k)?.focus({ preventScroll: true });
	}

	async function kaydet(e) {
		e.preventDefault();
		if (kaydediyor) return;
		hata = '';
		bilgi = '';
		const r = dogrula(sekme, form);
		if (r.hata) {
			hata = r.hata;
			sfx.error();
			return;
		}
		kaydediyor = true;
		const s = await saveRow(sekme, r.satir, duzenlenen);
		kaydediyor = false;
		if (s.hata) {
			hata = s.hata;
			sfx.error();
			return;
		}
		bilgi = duzenlenen ? 'Değişiklikler kaydedildi.' : 'Yayınlandı. Sitede hemen görünür.';
		sfx.success();
		form = bosForm(sekme);
		duzenlenen = null;
		await yukle();
	}

	async function durumDegistir(s) {
		const r = await setAktif(sekme, s.id, !s.aktif);
		if (r.hata) {
			hata = r.hata;
			return;
		}
		bilgi = s.aktif ? 'Yayından kaldırıldı (silinmedi, istersen geri alabilirsin).' : 'Yeniden yayında.';
		sfx.toggle();
		await yukle();
	}

	async function sil(s) {
		if (!confirm(`"${s.baslik}" kalıcı olarak silinsin mi? Geri alınamaz. (Silmek yerine "Yayından kaldır" da kullanabilirsin.)`)) return;
		const r = await removeRow(sekme, s.id);
		if (r.hata) {
			hata = r.hata;
			return;
		}
		bilgi = 'Silindi.';
		if (duzenlenen === s.id) temizle();
		await yukle();
	}

	const meta = (s) => (sekme === 'duyurular' ? [formatTarih(s.tarih), s.etiket].filter(Boolean).join(' · ') : [s.kurum, s.durum].filter(Boolean).join(' · '));
</script>

<svelte:head><title>Yönetim · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader eyebrow="Yönetici" title="Yönetim paneli" desc="Duyuru, fırsat, quiz ve galeri içeriklerini buradan ekle, düzenle, yayından kaldır ya da sil. Değişiklikler sitede hemen görünür." />

<div class="content-max sayfa">
	{#if kontrol === 'bekliyor'}
		<p class="muted" role="status">Yetki kontrol ediliyor…</p>
	{:else if kontrol === 'hata'}
		<p class="msg err" role="alert">{kontrolHata}</p>
	{:else if kontrol === 'yetkisiz'}
		<div class="bracket-card bos" role="alert">
			<h2>Bu sayfa sadece yöneticiler içindir</h2>
			<p>Hesabın yönetici listesinde değil. Yönetici olarak eklenmen gerekiyorsa site sahibine ulaş.</p>
			<a class="btn btn-ghost" href="/">Ana sayfaya dön</a>
		</div>
	{:else}
		<div class="tabs" role="tablist" aria-label="Yönetilecek içerik">
			{#each TABLAR as t (t.id)}
				<button type="button" role="tab" id="yt-{t.id}" class="tab" class:on={sekme === t.id} aria-selected={sekme === t.id} aria-controls="yp" tabindex={sekme === t.id ? 0 : -1} on:click={() => sekmeSec(t.id)} on:keydown={sekmeKlavye}>{t.ad}</button>
			{/each}
		</div>

		<div id="yp" role="tabpanel" aria-labelledby="yt-{sekme}" class="panel">
			{#if sekme === 'quizler'}
				<QuizYonetimi />
			{:else if sekme === 'galeri'}
				<GaleriYonetimi />
			{:else}
			<form id="yform" class="bracket-card form" on:submit={kaydet} novalidate>
				<h2>{duzenlenen ? 'Kaydı düzenle' : sekme === 'duyurular' ? 'Yeni duyuru ekle' : 'Yeni fırsat ekle'}</h2>
				{#each ALANLAR[sekme] as a (a.k)}
					<div class="field">
						<label for="y-{a.k}">{a.l}{#if a.zorunlu} <span class="zor" aria-hidden="true">*</span><span class="sr">(zorunlu)</span>{/if}</label>
						{#if a.t === 'textarea'}
							<textarea id="y-{a.k}" rows="4" maxlength={a.max} bind:value={form[a.k]}></textarea>
							<small class="say">{(form[a.k] || '').length} / {a.max}</small>
						{:else if a.t === 'select'}
							<select id="y-{a.k}" bind:value={form[a.k]}>
								{#if !a.zorunlu}<option value="">Seçilmedi</option>{/if}
								{#each a.secenekler as o}<option value={o.id}>{o.label}</option>{/each}
							</select>
						{:else}
							<input id="y-{a.k}" type={a.t} maxlength={a.max} bind:value={form[a.k]} list={a.liste ? 'liste-' + a.k : undefined} autocomplete="off" />
							{#if a.liste}<datalist id="liste-{a.k}">{#each a.liste as x}<option value={x}></option>{/each}</datalist>{/if}
						{/if}
					</div>
				{/each}

				{#if hata}<p class="msg err" role="alert">{hata}</p>{/if}
				{#if bilgi}<p class="msg ok" role="status">{bilgi}</p>{/if}

				<div class="alt">
					<button type="submit" class="btn btn-primary" disabled={kaydediyor}>{kaydediyor ? 'Kaydediliyor…' : duzenlenen ? 'Değişiklikleri kaydet' : 'Yayınla'}</button>
					{#if duzenlenen}<button type="button" class="btn btn-ghost" on:click={temizle}>Vazgeç</button>{/if}
				</div>
			</form>

			<section aria-label="Mevcut kayıtlar">
				<h2 class="liste-baslik">Mevcut kayıtlar <span class="adet">({satirlar.length})</span></h2>
				{#if yukleniyor}
					<p class="muted">Yükleniyor…</p>
				{:else if satirlar.length === 0}
					<div class="bracket-card bos">Henüz kayıt yok.</div>
				{:else}
					<ul class="liste">
						{#each satirlar as s (s.id)}
							<li class="bracket-card oge" class:gizli={!s.aktif}>
								<div class="oge-ust">
									<strong>{s.baslik}</strong>
									<span class="badge {s.aktif ? 'live' : 'muted'}">{s.aktif ? 'Yayında' : 'Gizli'}</span>
								</div>
								<p class="oge-meta">{meta(s)}</p>
								<div class="eylem">
									<button type="button" class="btn btn-ghost mini" on:click={() => duzenle(s)} aria-label="{s.baslik} kaydını düzenle">Düzenle</button>
									<button type="button" class="btn btn-ghost mini" on:click={() => durumDegistir(s)} aria-label="{s.baslik}: {s.aktif ? 'yayından kaldır' : 'yayına al'}">{s.aktif ? 'Yayından kaldır' : 'Yayına al'}</button>
									<button type="button" class="btn btn-ghost mini" on:click={() => sil(s)} aria-label="{s.baslik} kaydını sil">Sil</button>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
			{/if}
		</div>
	{/if}
</div>

<style>
	.sayfa { margin-bottom: 60px; display: flex; flex-direction: column; gap: 20px; }
	.tabs { display: flex; gap: 6px; padding: 5px; width: fit-content; max-width: 100%; overflow-x: auto; border-radius: var(--radius-sm); border: 1px solid var(--border-strong); background: var(--bg-alt); }
	.tab { white-space: nowrap; min-height: 42px; padding: 8px 18px; border: 1px solid transparent; border-radius: 9px; background: transparent; color: var(--text-muted); font-family: var(--font-display); font-size: var(--fs-sm); font-weight: 600; cursor: pointer; }
	.tab:hover { color: var(--text); }
	.tab.on { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
	.tab:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
	.panel { display: flex; flex-direction: column; gap: 28px; }
	.form { display: flex; flex-direction: column; gap: 14px; max-width: 760px; }
	.form h2 { margin: 0; font-size: var(--fs-lg); }
	.field { display: flex; flex-direction: column; gap: 6px; }
	.field label { font-size: var(--fs-sm); font-weight: 600; }
	.zor { color: var(--danger); }
	.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
	.say { align-self: flex-end; color: var(--text-muted); font-size: var(--fs-xs); }
	.alt { display: flex; gap: 10px; flex-wrap: wrap; }
	.msg { margin: 0; font-size: var(--fs-sm); }
	.msg.ok { color: var(--accent); }
	.msg.err { color: var(--danger); }
	.muted { color: var(--text-muted); }
	.bos { padding: 24px 20px; color: var(--text-muted); }
	.bos h2 { margin-top: 0; color: var(--text); }
	.liste-baslik { font-size: var(--fs-lg); margin: 0 0 12px; }
	.adet { color: var(--text-muted); font-weight: 400; font-size: var(--fs-sm); }
	.liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; max-width: 760px; }
	.oge.gizli { opacity: 0.75; }
	.oge-ust { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
	.oge-ust strong { overflow-wrap: anywhere; }
	.oge-meta { margin: 4px 0 10px; color: var(--text-muted); font-size: var(--fs-xs); }
	.eylem { display: flex; gap: 8px; flex-wrap: wrap; }
	.mini { padding: 7px 12px; font-size: var(--fs-xs); }
</style>
