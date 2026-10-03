<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		KABUL, MAKS_DOSYA_MB, baslikOner, galeriDogrula, listGaleri,
		fotografEkle, galeriGuncelle, galeriSil, gorselAdresi
	} from '$lib/galeriAdmin.js';
	import { formatTarih } from '$lib/content.js';
	import { sfx } from '$lib/sound.js';

	let kayitlar = [];
	let yukleniyor = true;
	let hata = '';
	let bilgi = '';

	// ---------- yükleme formu ----------
	let dosyalar = []; // { dosya, onizleme }
	let form = { baslik: '', aciklama: '', tarih: '' };
	let formHata = '';
	let yukluyor = false;
	let ilerleme = '';
	let girdi;

	function mesajTemizle() {
		hata = '';
		bilgi = '';
	}

	async function yukle() {
		const r = await listGaleri();
		kayitlar = r.data;
		if (r.hata) hata = r.hata;
		yukleniyor = false;
	}
	onMount(yukle);
	onDestroy(() => dosyalar.forEach((d) => URL.revokeObjectURL(d.onizleme)));

	function dosyaSec(e) {
		mesajTemizle();
		formHata = '';
		dosyalar.forEach((d) => URL.revokeObjectURL(d.onizleme));
		const secilen = [...(e.currentTarget.files || [])].slice(0, 20);
		dosyalar = secilen.map((dosya) => ({ dosya, onizleme: URL.createObjectURL(dosya) }));
		if (secilen.length === 1 && !form.baslik.trim()) form.baslik = baslikOner(secilen[0].name);
	}

	function secimiTemizle() {
		dosyalar.forEach((d) => URL.revokeObjectURL(d.onizleme));
		dosyalar = [];
		if (girdi) girdi.value = '';
	}

	async function gonder(e) {
		e.preventDefault();
		if (yukluyor) return;
		mesajTemizle();
		formHata = '';
		if (dosyalar.length === 0) {
			formHata = 'Önce en az bir fotoğraf seç.';
			return;
		}
		const r = galeriDogrula(form);
		if (r.hata) {
			formHata = r.hata;
			sfx.error();
			return;
		}
		yukluyor = true;
		let basarili = 0;
		const basarisiz = [];
		for (let i = 0; i < dosyalar.length; i++) {
			ilerleme = `${i + 1} / ${dosyalar.length}`;
			const s = await fotografEkle(dosyalar[i].dosya, r.satir);
			if (s.hata) basarisiz.push(s.hata);
			else basarili++;
		}
		yukluyor = false;
		ilerleme = '';
		if (basarisiz.length) {
			formHata = `${basarili} fotoğraf eklendi, ${basarisiz.length} tanesi eklenemedi: ${[...new Set(basarisiz)].join(' ')}`;
			sfx.error();
		} else {
			bilgi = basarili === 1 ? 'Fotoğraf eklendi. Galeride hemen görünür.' : `${basarili} fotoğraf eklendi. Galeride hemen görünür.`;
			sfx.success();
		}
		if (basarili > 0) {
			form = { baslik: '', aciklama: '', tarih: '' };
			secimiTemizle();
			await yukle();
		}
	}

	// ---------- mevcut fotoğraflar ----------
	let duzenlenen = null;
	let df = { baslik: '', aciklama: '', tarih: '' };
	let duzenHata = '';
	let duzenKaydediyor = false;

	function duzenle(k) {
		duzenlenen = k.id;
		df = { baslik: k.baslik, aciklama: k.aciklama || '', tarih: k.tarih || '' };
		duzenHata = '';
		mesajTemizle();
		setTimeout(() => document.getElementById('gy-d-baslik-' + k.id)?.focus(), 0);
	}

	async function duzenKaydet(e) {
		e.preventDefault();
		if (duzenKaydediyor) return;
		duzenHata = '';
		const r = galeriDogrula(df);
		if (r.hata) {
			duzenHata = r.hata;
			sfx.error();
			return;
		}
		duzenKaydediyor = true;
		const s = await galeriGuncelle(duzenlenen, r.satir);
		duzenKaydediyor = false;
		if (s.hata) {
			duzenHata = s.hata;
			sfx.error();
			return;
		}
		bilgi = 'Değişiklikler kaydedildi.';
		sfx.success();
		duzenlenen = null;
		await yukle();
	}

	async function durum(k) {
		mesajTemizle();
		const r = await galeriGuncelle(k.id, { aktif: !k.aktif });
		if (r.hata) {
			hata = r.hata;
			return;
		}
		bilgi = k.aktif ? 'Galeriden kaldırıldı (silinmedi, istersen geri alabilirsin).' : 'Yeniden galeride.';
		sfx.toggle();
		await yukle();
	}

	async function sil(k) {
		if (!confirm(`"${k.baslik}" fotoğrafı kalıcı olarak silinsin mi? Geri alınamaz. (Silmek yerine "Gizle" de kullanabilirsin.)`)) return;
		mesajTemizle();
		const r = await galeriSil(k);
		if (r.hata) {
			hata = r.hata;
			return;
		}
		bilgi = 'Fotoğraf silindi.';
		if (duzenlenen === k.id) duzenlenen = null;
		await yukle();
	}
</script>

<div class="gy">
	{#if hata}<p class="msg err" role="alert">{hata}</p>{/if}
	{#if bilgi}<p class="msg ok" role="status">{bilgi}</p>{/if}

	<form class="bracket-card kutu" on:submit={gonder} novalidate>
		<h2>Galeriye fotoğraf ekle</h2>
		<p class="ipucu">
			JPG, PNG veya WebP seçebilirsin (dosya başına en fazla {MAKS_DOSYA_MB} MB, tek seferde en fazla 20 fotoğraf). Büyük fotoğraflar yüklenmeden önce otomatik küçültülür.
			Birden fazla fotoğraf seçersen hepsi aynı başlık ve açıklamayla eklenir; sonra tek tek düzenleyebilirsin.
		</p>

		<div class="field">
			<label for="gy-dosya">Fotoğraf(lar) <span class="zor" aria-hidden="true">*</span><span class="sr">(zorunlu)</span></label>
			<input id="gy-dosya" type="file" accept={KABUL} multiple bind:this={girdi} on:change={dosyaSec} />
		</div>

		{#if dosyalar.length}
			<ul class="onizleme" aria-label="Seçilen fotoğraflar">
				{#each dosyalar as d}
					<li><img src={d.onizleme} alt={d.dosya.name} loading="lazy" /></li>
				{/each}
			</ul>
		{/if}

		<div class="field">
			<label for="gy-baslik">Başlık (örn. Bilim Şenliği 2026) <span class="zor" aria-hidden="true">*</span><span class="sr">(zorunlu)</span></label>
			<input id="gy-baslik" type="text" maxlength="120" bind:value={form.baslik} autocomplete="off" />
		</div>
		<div class="field">
			<label for="gy-aciklama">Açıklama <span class="soluk">(isteğe bağlı)</span></label>
			<textarea id="gy-aciklama" rows="2" maxlength="400" bind:value={form.aciklama}></textarea>
		</div>
		<div class="field kisa">
			<label for="gy-tarih">Etkinlik tarihi <span class="soluk">(isteğe bağlı)</span></label>
			<input id="gy-tarih" type="date" bind:value={form.tarih} />
		</div>

		{#if formHata}<p class="msg err" role="alert">{formHata}</p>{/if}
		<div class="alt">
			<button type="submit" class="btn btn-primary" disabled={yukluyor}>{yukluyor ? `Yükleniyor… ${ilerleme}` : dosyalar.length > 1 ? `${dosyalar.length} fotoğrafı yükle` : 'Fotoğrafı yükle'}</button>
			{#if dosyalar.length && !yukluyor}<button type="button" class="btn btn-ghost" on:click={secimiTemizle}>Seçimi temizle</button>{/if}
		</div>
	</form>

	<section aria-labelledby="gy-liste-baslik">
		<h2 id="gy-liste-baslik" class="liste-baslik">Galerideki fotoğraflar <span class="adet">({kayitlar.length})</span></h2>
		{#if yukleniyor}
			<p class="muted">Yükleniyor…</p>
		{:else if kayitlar.length === 0}
			<div class="bracket-card bos">Henüz fotoğraf yok.</div>
		{:else}
			<ul class="liste">
				{#each kayitlar as k (k.id)}
					<li class="bracket-card oge" class:gizli={!k.aktif}>
						<img class="kucuk" src={gorselAdresi(k.gorsel_yolu)} alt={k.baslik} loading="lazy" />
						<div class="oge-govde">
							{#if duzenlenen === k.id}
								<form class="duzen" on:submit={duzenKaydet} novalidate>
									<div class="field">
										<label for="gy-d-baslik-{k.id}">Başlık</label>
										<input id="gy-d-baslik-{k.id}" type="text" maxlength="120" bind:value={df.baslik} autocomplete="off" />
									</div>
									<div class="field">
										<label for="gy-d-aciklama-{k.id}">Açıklama</label>
										<textarea id="gy-d-aciklama-{k.id}" rows="2" maxlength="400" bind:value={df.aciklama}></textarea>
									</div>
									<div class="field kisa">
										<label for="gy-d-tarih-{k.id}">Etkinlik tarihi</label>
										<input id="gy-d-tarih-{k.id}" type="date" bind:value={df.tarih} />
									</div>
									{#if duzenHata}<p class="msg err" role="alert">{duzenHata}</p>{/if}
									<div class="alt">
										<button type="submit" class="btn btn-primary mini" disabled={duzenKaydediyor}>{duzenKaydediyor ? 'Kaydediliyor…' : 'Kaydet'}</button>
										<button type="button" class="btn btn-ghost mini" on:click={() => (duzenlenen = null)}>Vazgeç</button>
									</div>
								</form>
							{:else}
								<div class="oge-ust">
									<strong>{k.baslik}</strong>
									<span class="badge {k.aktif ? 'live' : 'muted'}">{k.aktif ? 'Yayında' : 'Gizli'}</span>
								</div>
								<p class="oge-meta">{[k.tarih ? formatTarih(k.tarih) : '', k.aciklama].filter(Boolean).join(' · ') || 'Açıklama yok'}</p>
								<div class="eylem">
									<button type="button" class="btn btn-ghost mini" on:click={() => duzenle(k)} aria-label="{k.baslik} fotoğrafını düzenle">Düzenle</button>
									<button type="button" class="btn btn-ghost mini" on:click={() => durum(k)} aria-label="{k.baslik}: {k.aktif ? 'galeriden kaldır' : 'galeriye al'}">{k.aktif ? 'Gizle' : 'Yayına al'}</button>
									<button type="button" class="btn btn-ghost mini" on:click={() => sil(k)} aria-label="{k.baslik} fotoğrafını sil">Sil</button>
								</div>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<style>
	.gy { display: flex; flex-direction: column; gap: 28px; }
	.kutu { display: flex; flex-direction: column; gap: 14px; max-width: 760px; }
	.kutu h2 { margin: 0; font-size: var(--fs-lg); }
	.ipucu { margin: 0; color: var(--text-muted); font-size: var(--fs-sm); line-height: 1.55; }
	.field { display: flex; flex-direction: column; gap: 6px; }
	.field.kisa { max-width: 220px; }
	.field label { font-size: var(--fs-sm); font-weight: 600; }
	.soluk { color: var(--text-muted); font-weight: 400; }
	.zor { color: var(--danger); }
	.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
	.alt { display: flex; gap: 10px; flex-wrap: wrap; }
	.msg { margin: 0; font-size: var(--fs-sm); max-width: 760px; overflow-wrap: anywhere; }
	.msg.ok { color: var(--accent); }
	.msg.err { color: var(--danger); }
	.muted { color: var(--text-muted); }
	.bos { padding: 24px 20px; color: var(--text-muted); max-width: 760px; }
	.mini { padding: 7px 12px; font-size: var(--fs-xs); }

	.onizleme { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 8px; }
	.onizleme img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border); }

	.liste-baslik { font-size: var(--fs-lg); margin: 0 0 12px; }
	.adet { color: var(--text-muted); font-weight: 400; font-size: var(--fs-sm); }
	.liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; max-width: 760px; }
	.oge { display: flex; gap: 14px; align-items: flex-start; }
	.oge.gizli { opacity: 0.75; }
	.kucuk { flex: none; width: 96px; height: 72px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border); }
	.oge-govde { flex: 1 1 0; min-width: 0; }
	.oge-ust { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
	.oge-ust strong { overflow-wrap: anywhere; }
	.oge-meta { margin: 4px 0 10px; color: var(--text-muted); font-size: var(--fs-xs); overflow-wrap: anywhere; }
	.eylem { display: flex; gap: 8px; flex-wrap: wrap; }
	.duzen { display: flex; flex-direction: column; gap: 10px; }
	@media (max-width: 480px) {
		.oge { flex-direction: column; }
		.kucuk { width: 100%; height: 160px; }
	}
</style>
