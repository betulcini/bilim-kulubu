<script>
	import { onMount } from 'svelte';
	import {
		ZORLUKLAR, SIK_HARFLERI, SAYFA_BOYUTU, YERLESIK_KONULAR, CSV_SABLONU,
		csvdenSorular, soruDogrula, konuDogrula, konuBilgisi,
		listKonular, konuEkle, konuGuncelle, konuSil,
		listSorular, soruKaydet, soruAktif, soruSil, topluEkle
	} from '$lib/quizAdmin.js';
	import { sfx } from '$lib/sound.js';

	let konular = [];
	let yukleniyor = true;
	let hata = '';
	let bilgi = '';

	// ---------- ortak ----------
	$: bilinen = [...konular.map((k) => ({ slug: k.slug, baslik: k.baslik })), ...YERLESIK_KONULAR.filter((y) => !konular.some((k) => k.slug === y.slug))];

	function mesajTemizle() {
		hata = '';
		bilgi = '';
	}

	async function konulariYukle() {
		const r = await listKonular();
		konular = r.data;
		if (r.hata) hata = r.hata;
		yukleniyor = false;
	}
	onMount(konulariYukle);

	// ---------- CSV ----------
	const MAKS_CSV_MB = 3;
	let csvAd = '';
	let csvMetin = '';
	let csvKonu = '';
	let csvHata = '';
	let csvEkleniyor = false;
	let csvIlerleme = '';
	let csvGirdi;

	$: onizleme = csvMetin ? csvdenSorular(csvMetin, { varsayilanKonu: csvKonu, bilinenKonular: bilinen }) : null;

	// Excel'in Türkçe sürümü "CSV" dosyalarını UTF-8 yerine Windows-1254 ile kaydedebilir.
	function metneCevir(buf) {
		try {
			return new TextDecoder('utf-8', { fatal: true }).decode(buf);
		} catch {
			return new TextDecoder('windows-1254').decode(buf);
		}
	}

	async function csvSec(e) {
		mesajTemizle();
		csvHata = '';
		const dosya = e.currentTarget.files?.[0];
		if (!dosya) return;
		if (dosya.size > MAKS_CSV_MB * 1024 * 1024) {
			csvHata = `Dosya çok büyük (en fazla ${MAKS_CSV_MB} MB).`;
			csvTemizle();
			return;
		}
		csvMetin = metneCevir(await dosya.arrayBuffer());
		csvAd = dosya.name;
	}

	function csvTemizle() {
		csvAd = '';
		csvMetin = '';
		if (csvGirdi) csvGirdi.value = '';
	}

	function sablonIndir() {
		const blob = new Blob(['\uFEFF' + CSV_SABLONU], { type: 'text/csv;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'quiz-sablonu.csv';
		a.click();
		URL.revokeObjectURL(url);
	}

	async function csvEkle() {
		if (!onizleme || onizleme.sorular.length === 0 || csvEkleniyor) return;
		mesajTemizle();
		csvEkleniyor = true;
		csvIlerleme = '';
		const r = await topluEkle(onizleme.sorular, onizleme.konular, (a, t) => (csvIlerleme = `${a} / ${t}`));
		csvEkleniyor = false;
		csvIlerleme = '';
		if (r.hata) {
			hata = `${r.eklenen > 0 ? r.eklenen + ' soru eklendi, ardından hata oluştu: ' : ''}${r.hata}`;
			sfx.error();
			if (r.eklenen > 0) await konulariYukle();
			return;
		}
		bilgi = `${r.eklenen} soru eklendi${r.atlanan ? `, ${r.atlanan} soru zaten kayıtlı olduğu için atlandı` : ''}. Sitede hemen görünür.`;
		sfx.success();
		csvTemizle();
		await konulariYukle();
		if (acikKonu) await sorulariYukle(acikKonu, true);
	}

	// ---------- tek soru ----------
	const YENI = '__yeni__';
	const bosSoru = () => ({ konu: '', yeniBaslik: '', soru: '', siklar: ['', '', '', ''], dogru: 0, aciklama: '', zorluk: 'Orta' });
	let sf = bosSoru();
	let duzenlenenSoru = null;
	let soruKaydediyor = false;
	let soruHata = '';

	function sikEkle() {
		if (sf.siklar.length < 6) sf.siklar = [...sf.siklar, ''];
	}
	function sikCikar() {
		if (sf.siklar.length <= 2) return;
		sf.siklar = sf.siklar.slice(0, -1);
		if (sf.dogru >= sf.siklar.length) sf.dogru = 0;
	}

	async function soruGonder(e) {
		e.preventDefault();
		if (soruKaydediyor) return;
		mesajTemizle();
		soruHata = '';

		let konu = sf.konu;
		let yeniKonu = null;
		if (!konu) {
			soruHata = 'Konu seçilmedi.';
			return;
		}
		if (konu === YENI) {
			const b = konuBilgisi(sf.yeniBaslik, bilinen);
			if (!b) {
				soruHata = 'Yeni konu için bir ad yaz.';
				return;
			}
			konu = b.slug;
			if (!konular.some((k) => k.slug === konu)) yeniKonu = b;
		} else if (!konular.some((k) => k.slug === konu)) {
			// Yerleşik konu (örn. Fizik) için ilk kez veritabanı kaydı gerekiyor
			yeniKonu = bilinen.find((k) => k.slug === konu);
		}

		const r = soruDogrula({ soru: sf.soru, secenekler: sf.siklar, dogru: SIK_HARFLERI[sf.dogru], aciklama: sf.aciklama, zorluk: sf.zorluk });
		if (r.hata) {
			soruHata = r.hata;
			sfx.error();
			return;
		}

		soruKaydediyor = true;
		if (yeniKonu) {
			const k = await konuEkle({ slug: yeniKonu.slug, baslik: yeniKonu.baslik, aciklama: '' });
			if (k.hata && !/zaten var/.test(k.hata)) {
				soruKaydediyor = false;
				soruHata = k.hata;
				sfx.error();
				return;
			}
		}
		const s = await soruKaydet({ konu, ...r.soru }, duzenlenenSoru);
		soruKaydediyor = false;
		if (s.hata) {
			soruHata = s.hata;
			sfx.error();
			return;
		}
		bilgi = duzenlenenSoru ? 'Soru güncellendi.' : 'Soru eklendi. Sitede hemen görünür.';
		sfx.success();
		const konuKalsin = konu;
		sf = { ...bosSoru(), konu: konuKalsin, zorluk: sf.zorluk };
		duzenlenenSoru = null;
		await konulariYukle();
		if (acikKonu === konu) await sorulariYukle(konu, true);
	}

	function soruDuzenle(s) {
		const siklar = [...s.secenekler];
		while (siklar.length < 4) siklar.push('');
		sf = { konu: s.konu, yeniBaslik: '', soru: s.soru, siklar, dogru: Math.max(0, s.secenekler.indexOf(s.dogru)), aciklama: s.aciklama || '', zorluk: s.zorluk };
		duzenlenenSoru = s.id;
		soruHata = '';
		mesajTemizle();
		document.getElementById('qy-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		document.getElementById('qy-soru')?.focus({ preventScroll: true });
	}

	function soruVazgec() {
		sf = { ...bosSoru(), konu: sf.konu };
		duzenlenenSoru = null;
		soruHata = '';
	}

	// ---------- konular ----------
	let kf = { baslik: '', aciklama: '', slug: '' };
	let duzenlenenKonu = null;
	let konuHata = '';
	let konuKaydediyor = false;

	async function konuGonder(e) {
		e.preventDefault();
		if (konuKaydediyor) return;
		mesajTemizle();
		konuHata = '';
		const r = konuDogrula(kf, !duzenlenenKonu);
		if (r.hata) {
			konuHata = r.hata;
			sfx.error();
			return;
		}
		konuKaydediyor = true;
		const s = duzenlenenKonu
			? await konuGuncelle(duzenlenenKonu, { baslik: r.satir.baslik, aciklama: r.satir.aciklama })
			: await konuEkle(r.satir);
		konuKaydediyor = false;
		if (s.hata) {
			konuHata = s.hata;
			sfx.error();
			return;
		}
		bilgi = duzenlenenKonu ? 'Konu güncellendi.' : 'Konu oluşturuldu. Soru ekleyince sitede görünür.';
		sfx.success();
		kf = { baslik: '', aciklama: '', slug: '' };
		duzenlenenKonu = null;
		await konulariYukle();
	}

	function konuDuzenle(k) {
		kf = { baslik: k.baslik, aciklama: k.aciklama || '', slug: k.slug };
		duzenlenenKonu = k.slug;
		konuHata = '';
		mesajTemizle();
		document.getElementById('qy-konu-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		document.getElementById('qy-konu-baslik')?.focus({ preventScroll: true });
	}

	async function konuDurum(k) {
		mesajTemizle();
		const r = await konuGuncelle(k.slug, { aktif: !k.aktif });
		if (r.hata) {
			hata = r.hata;
			return;
		}
		bilgi = k.aktif ? 'Konu yayından kaldırıldı (silinmedi).' : 'Konu yeniden yayında.';
		sfx.toggle();
		await konulariYukle();
	}

	async function konuKaldir(k) {
		if (!confirm(`"${k.baslik}" konusu ve içindeki ${k.adet} soru kalıcı olarak silinsin mi? Geri alınamaz. (Silmek yerine "Yayından kaldır" da kullanabilirsin.)`)) return;
		mesajTemizle();
		const r = await konuSil(k.slug);
		if (r.hata) {
			hata = r.hata;
			return;
		}
		bilgi = 'Konu silindi.';
		if (acikKonu === k.slug) acikKonu = null;
		if (duzenlenenKonu === k.slug) {
			kf = { baslik: '', aciklama: '', slug: '' };
			duzenlenenKonu = null;
		}
		await konulariYukle();
	}

	// ---------- konunun soruları ----------
	let acikKonu = null;
	let sorular = [];
	let sorularYukleniyor = false;
	let dahaVar = false;

	async function sorulariYukle(slug, bastan = false) {
		sorularYukleniyor = true;
		const r = await listSorular(slug, bastan ? 0 : sorular.length);
		sorularYukleniyor = false;
		if (r.hata) {
			hata = r.hata;
			return;
		}
		sorular = bastan ? r.data : [...sorular, ...r.data];
		dahaVar = r.data.length === SAYFA_BOYUTU;
	}

	async function sorulariGoster(k) {
		mesajTemizle();
		if (acikKonu === k.slug) {
			acikKonu = null;
			return;
		}
		acikKonu = k.slug;
		sorular = [];
		await sorulariYukle(k.slug, true);
	}

	async function soruDurum(s) {
		mesajTemizle();
		const r = await soruAktif(s.id, !s.aktif);
		if (r.hata) {
			hata = r.hata;
			return;
		}
		sfx.toggle();
		await sorulariYukle(acikKonu, true);
	}

	async function soruKaldir(s) {
		if (!confirm('Bu soru kalıcı olarak silinsin mi? Geri alınamaz. (Silmek yerine "Gizle" de kullanabilirsin.)')) return;
		mesajTemizle();
		const r = await soruSil(s.id);
		if (r.hata) {
			hata = r.hata;
			return;
		}
		bilgi = 'Soru silindi.';
		if (duzenlenenSoru === s.id) soruVazgec();
		await konulariYukle();
		await sorulariYukle(acikKonu, true);
	}

	const kisalt = (t, n = 90) => (t.length > n ? t.slice(0, n - 1) + '…' : t);
</script>

<div class="qy">
	{#if hata}<p class="msg err" role="alert">{hata}</p>{/if}
	{#if bilgi}<p class="msg ok" role="status">{bilgi}</p>{/if}

	<!-- ===================== CSV ===================== -->
	<section class="bracket-card kutu" aria-labelledby="qy-csv-baslik">
		<h2 id="qy-csv-baslik">CSV dosyasından toplu soru ekle</h2>
		<p class="ipucu">
			Excel ya da Google E-Tablolar'dan <strong>CSV</strong> olarak kaydet. İlk satır başlık olmalı:
			<code>konu, soru, secenek_a, secenek_b, secenek_c, secenek_d, dogru, aciklama, zorluk</code>.
			<code>dogru</code> sütununa şık harfi (A-D), şık numarası ya da şıkkın kendisi yazılabilir. <code>aciklama</code> ve <code>zorluk</code> (Kolay / Orta / Zor) boş bırakılabilir.
			Bilinen sütun adlarının Türkçe/İngilizce karşılıkları da (kategori, cevap, question, answer…) tanınır; şıklar tek bir <code>secenekler</code> sütununda <code>|</code> ile ayrılmış da olabilir.
		</p>
		<div class="alt">
			<button type="button" class="btn btn-ghost mini" on:click={sablonIndir}>Örnek şablonu indir</button>
		</div>

		<div class="field">
			<label for="qy-csv-dosya">CSV dosyası</label>
			<input id="qy-csv-dosya" type="file" accept=".csv,.txt,text/csv" bind:this={csvGirdi} on:change={csvSec} />
		</div>
		<div class="field">
			<label for="qy-csv-konu">Konu <span class="soluk">(isteğe bağlı)</span></label>
			<input id="qy-csv-konu" type="text" list="qy-konu-liste" maxlength="60" bind:value={csvKonu} autocomplete="off" placeholder="Boş bırakırsan CSV'deki konu sütunu kullanılır" />
			<small class="say">CSV'de konu sütunu yoksa ya da bütün soruları tek konuya eklemek istiyorsan doldur. Yeni bir ad yazarsan konu otomatik oluşturulur.</small>
		</div>
		<datalist id="qy-konu-liste">
			{#each bilinen as k}<option value={k.baslik.replace(/ Quiz$/, '')}></option>{/each}
		</datalist>

		{#if csvHata}<p class="msg err" role="alert">{csvHata}</p>{/if}

		{#if onizleme}
			{#if onizleme.ustHata}
				<p class="msg err" role="alert">{onizleme.ustHata}</p>
			{:else}
				<div class="ozet" role="status">
					<strong>{csvAd}</strong>:
					{onizleme.satirSayisi} satır okundu →
					<span class="iyi">{onizleme.sorular.length} geçerli soru</span>{#if onizleme.hatalar.length}, <span class="kotu">{onizleme.hatalar.length} hatalı satır</span> (atlanacak){/if}.
					{#if onizleme.konular.length}Konular: {onizleme.konular.map((k) => k.baslik).join(', ')}.{/if}
				</div>

				{#if onizleme.sorular.length}
					<div class="tablo-kap">
						<table class="onizleme">
							<caption class="sr">Eklenecek soruların ilk satırları</caption>
							<thead><tr><th scope="col">Satır</th><th scope="col">Konu</th><th scope="col">Soru</th><th scope="col">Doğru cevap</th></tr></thead>
							<tbody>
								{#each onizleme.sorular.slice(0, 5) as s}
									<tr><td>{s.no}</td><td>{s.konu}</td><td>{kisalt(s.soru)}</td><td>{kisalt(s.dogru, 40)}</td></tr>
								{/each}
							</tbody>
						</table>
					</div>
					{#if onizleme.sorular.length > 5}<small class="say">…ve {onizleme.sorular.length - 5} soru daha.</small>{/if}
				{/if}

				{#if onizleme.hatalar.length}
					<details class="hatalar">
						<summary>Hatalı satırlar ({onizleme.hatalar.length})</summary>
						<ul>
							{#each onizleme.hatalar.slice(0, 30) as h}<li>Satır {h.no}: {h.mesaj}</li>{/each}
						</ul>
						{#if onizleme.hatalar.length > 30}<small class="say">İlk 30 hata gösteriliyor.</small>{/if}
					</details>
				{/if}

				<div class="alt">
					<button type="button" class="btn btn-primary" disabled={csvEkleniyor || onizleme.sorular.length === 0} on:click={csvEkle}>
						{csvEkleniyor ? `Ekleniyor… ${csvIlerleme}` : `${onizleme.sorular.length} soruyu ekle`}
					</button>
					<button type="button" class="btn btn-ghost" disabled={csvEkleniyor} on:click={csvTemizle}>Vazgeç</button>
				</div>
				<small class="say">Aynı konuda aynı soru metni zaten varsa tekrar eklenmez.</small>
			{/if}
		{/if}
	</section>

	<!-- ===================== TEK SORU ===================== -->
	<form id="qy-form" class="bracket-card kutu" on:submit={soruGonder} novalidate>
		<h2>{duzenlenenSoru ? 'Soruyu düzenle' : 'Tek soru ekle'}</h2>

		<div class="field">
			<label for="qy-konu">Konu <span class="zor" aria-hidden="true">*</span><span class="sr">(zorunlu)</span></label>
			<select id="qy-konu" bind:value={sf.konu} disabled={duzenlenenSoru !== null}>
				<option value="">Konu seç…</option>
				{#each bilinen as k}<option value={k.slug}>{k.baslik}</option>{/each}
				<option value={YENI}>+ Yeni konu oluştur…</option>
			</select>
		</div>
		{#if sf.konu === YENI}
			<div class="field">
				<label for="qy-yeni-konu">Yeni konunun adı</label>
				<input id="qy-yeni-konu" type="text" maxlength="60" bind:value={sf.yeniBaslik} placeholder="örn. Genetik" autocomplete="off" />
			</div>
		{/if}

		<div class="field">
			<label for="qy-soru">Soru <span class="zor" aria-hidden="true">*</span><span class="sr">(zorunlu)</span></label>
			<textarea id="qy-soru" rows="3" maxlength="600" bind:value={sf.soru}></textarea>
		</div>

		<fieldset class="siklar">
			<legend>Şıklar ve doğru cevap <span class="soluk">(doğru olanı işaretle)</span></legend>
			{#each sf.siklar as _, i}
				<div class="sik">
					<input type="radio" name="qy-dogru" id="qy-dogru-{i}" value={i} bind:group={sf.dogru} aria-label="{SIK_HARFLERI[i]} şıkkı doğru cevap" />
					<label class="harf" for="qy-sik-{i}">{SIK_HARFLERI[i]}</label>
					<input id="qy-sik-{i}" type="text" maxlength="200" bind:value={sf.siklar[i]} autocomplete="off" />
				</div>
			{/each}
			<div class="alt">
				<button type="button" class="btn btn-ghost mini" on:click={sikEkle} disabled={sf.siklar.length >= 6}>Şık ekle</button>
				<button type="button" class="btn btn-ghost mini" on:click={sikCikar} disabled={sf.siklar.length <= 2}>Son şıkkı çıkar</button>
			</div>
		</fieldset>

		<div class="field">
			<label for="qy-aciklama">Açıklama <span class="soluk">(cevaptan sonra gösterilir)</span></label>
			<textarea id="qy-aciklama" rows="2" maxlength="800" bind:value={sf.aciklama}></textarea>
		</div>
		<div class="field kisa">
			<label for="qy-zorluk">Zorluk</label>
			<select id="qy-zorluk" bind:value={sf.zorluk}>
				{#each ZORLUKLAR as z}<option value={z}>{z}</option>{/each}
			</select>
		</div>

		{#if soruHata}<p class="msg err" role="alert">{soruHata}</p>{/if}
		<div class="alt">
			<button type="submit" class="btn btn-primary" disabled={soruKaydediyor}>{soruKaydediyor ? 'Kaydediliyor…' : duzenlenenSoru ? 'Değişiklikleri kaydet' : 'Soruyu ekle'}</button>
			{#if duzenlenenSoru}<button type="button" class="btn btn-ghost" on:click={soruVazgec}>Vazgeç</button>{/if}
		</div>
	</form>

	<!-- ===================== KONULAR ===================== -->
	<section aria-labelledby="qy-konular-baslik">
		<h2 id="qy-konular-baslik" class="liste-baslik">Veritabanındaki quiz konuları <span class="adet">({konular.length})</span></h2>
		<p class="ipucu">Koddaki hazır konular (Fizik, Kimya, Biyoloji, Matematik, Astronomi, Genel Bilim) burada görünmez; onlara soru eklersen aynı konunun havuzuna katılır.</p>

		<form id="qy-konu-form" class="bracket-card kutu" on:submit={konuGonder} novalidate>
			<h3>{duzenlenenKonu ? 'Konuyu düzenle' : 'Yeni boş konu oluştur'}</h3>
			<div class="field">
				<label for="qy-konu-baslik">Başlık (örn. Genetik Quiz)</label>
				<input id="qy-konu-baslik" type="text" maxlength="80" bind:value={kf.baslik} autocomplete="off" />
			</div>
			<div class="field">
				<label for="qy-konu-aciklama">Kısa açıklama</label>
				<input id="qy-konu-aciklama" type="text" maxlength="300" bind:value={kf.aciklama} autocomplete="off" />
			</div>
			{#if konuHata}<p class="msg err" role="alert">{konuHata}</p>{/if}
			<div class="alt">
				<button type="submit" class="btn btn-primary" disabled={konuKaydediyor}>{konuKaydediyor ? 'Kaydediliyor…' : duzenlenenKonu ? 'Kaydet' : 'Konu oluştur'}</button>
				{#if duzenlenenKonu}<button type="button" class="btn btn-ghost" on:click={() => { duzenlenenKonu = null; kf = { baslik: '', aciklama: '', slug: '' }; konuHata = ''; }}>Vazgeç</button>{/if}
			</div>
		</form>

		{#if yukleniyor}
			<p class="muted">Yükleniyor…</p>
		{:else if konular.length === 0}
			<div class="bracket-card bos">Henüz veritabanında quiz konusu yok. Yukarıdan CSV yükleyebilir ya da tek soru ekleyebilirsin.</div>
		{:else}
			<ul class="liste">
				{#each konular as k (k.slug)}
					<li class="bracket-card oge" class:gizli={!k.aktif}>
						<div class="oge-ust">
							<strong>{k.baslik}</strong>
							<span class="badge {k.aktif ? 'live' : 'muted'}">{k.aktif ? 'Yayında' : 'Gizli'}</span>
						</div>
						<p class="oge-meta">/yarismalar/quiz?konu={k.slug} · {k.adet} soru{k.aciklama ? ' · ' + k.aciklama : ''}</p>
						<div class="eylem">
							<button type="button" class="btn btn-ghost mini" aria-expanded={acikKonu === k.slug} on:click={() => sorulariGoster(k)}>{acikKonu === k.slug ? 'Soruları gizle' : 'Soruları göster'}</button>
							<button type="button" class="btn btn-ghost mini" on:click={() => konuDuzenle(k)} aria-label="{k.baslik} konusunu düzenle">Düzenle</button>
							<button type="button" class="btn btn-ghost mini" on:click={() => konuDurum(k)} aria-label="{k.baslik}: {k.aktif ? 'yayından kaldır' : 'yayına al'}">{k.aktif ? 'Yayından kaldır' : 'Yayına al'}</button>
							<button type="button" class="btn btn-ghost mini" on:click={() => konuKaldir(k)} aria-label="{k.baslik} konusunu sil">Sil</button>
						</div>

						{#if acikKonu === k.slug}
							<div class="sorular">
								{#if sorularYukleniyor && sorular.length === 0}
									<p class="muted">Yükleniyor…</p>
								{:else if sorular.length === 0}
									<p class="muted">Bu konuda henüz soru yok.</p>
								{:else}
									<ul class="soru-liste">
										{#each sorular as s (s.id)}
											<li class="soru-oge" class:gizli={!s.aktif}>
												<p class="soru-metin">{s.soru}</p>
												<p class="oge-meta">{s.zorluk} · Doğru: {kisalt(s.dogru, 50)}{s.aktif ? '' : ' · Gizli'}</p>
												<div class="eylem">
													<button type="button" class="btn btn-ghost mini" on:click={() => soruDuzenle(s)}>Düzenle</button>
													<button type="button" class="btn btn-ghost mini" on:click={() => soruDurum(s)}>{s.aktif ? 'Gizle' : 'Yayına al'}</button>
													<button type="button" class="btn btn-ghost mini" on:click={() => soruKaldir(s)}>Sil</button>
												</div>
											</li>
										{/each}
									</ul>
									{#if dahaVar}
										<button type="button" class="btn btn-ghost mini" disabled={sorularYukleniyor} on:click={() => sorulariYukle(k.slug)}>{sorularYukleniyor ? 'Yükleniyor…' : 'Daha fazla göster'}</button>
									{/if}
								{/if}
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<style>
	.qy { display: flex; flex-direction: column; gap: 28px; }
	.kutu { display: flex; flex-direction: column; gap: 14px; max-width: 760px; }
	.kutu h2, .kutu h3 { margin: 0; font-size: var(--fs-lg); }
	.kutu h3 { font-size: var(--fs-md, 1.05rem); }
	.ipucu { margin: 0; color: var(--text-muted); font-size: var(--fs-sm); line-height: 1.55; }
	.ipucu code { font-size: 0.92em; overflow-wrap: anywhere; }
	.field { display: flex; flex-direction: column; gap: 6px; }
	.field.kisa { max-width: 220px; }
	.field label, legend { font-size: var(--fs-sm); font-weight: 600; }
	.soluk { color: var(--text-muted); font-weight: 400; }
	.zor { color: var(--danger); }
	.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
	.say { color: var(--text-muted); font-size: var(--fs-xs); }
	.alt { display: flex; gap: 10px; flex-wrap: wrap; }
	.msg { margin: 0; font-size: var(--fs-sm); max-width: 760px; }
	.msg.ok { color: var(--accent); }
	.msg.err { color: var(--danger); }
	.muted { color: var(--text-muted); }
	.bos { padding: 24px 20px; color: var(--text-muted); max-width: 760px; }
	.mini { padding: 7px 12px; font-size: var(--fs-xs); }

	.ozet { font-size: var(--fs-sm); line-height: 1.55; }
	.iyi { color: var(--accent); font-weight: 600; }
	.kotu { color: var(--danger); font-weight: 600; }
	.tablo-kap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-sm); }
	.onizleme { width: 100%; border-collapse: collapse; font-size: var(--fs-xs); }
	.onizleme th, .onizleme td { padding: 8px 10px; text-align: left; border-bottom: 1px solid var(--border); vertical-align: top; }
	.onizleme tr:last-child td { border-bottom: 0; }
	.hatalar { font-size: var(--fs-xs); color: var(--danger); }
	.hatalar summary { cursor: pointer; font-weight: 600; }
	.hatalar ul { margin: 8px 0 0; padding-left: 18px; display: grid; gap: 4px; }

	.siklar { border: 0; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
	.sik { display: flex; align-items: center; gap: 8px; }
	.sik input[type='text'] { flex: 1 1 0; min-width: 0; }
	.sik input[type='radio'] { flex: none; width: 20px; height: 20px; accent-color: var(--accent); }
	.harf { flex: none; width: 22px; font-weight: 700; color: var(--accent); }

	.liste-baslik { font-size: var(--fs-lg); margin: 0 0 8px; }
	.adet { color: var(--text-muted); font-weight: 400; font-size: var(--fs-sm); }
	.liste { list-style: none; margin: 16px 0 0; padding: 0; display: grid; gap: 10px; max-width: 760px; }
	.oge.gizli, .soru-oge.gizli { opacity: 0.75; }
	.oge-ust { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
	.oge-ust strong { overflow-wrap: anywhere; }
	.oge-meta { margin: 4px 0 10px; color: var(--text-muted); font-size: var(--fs-xs); overflow-wrap: anywhere; }
	.eylem { display: flex; gap: 8px; flex-wrap: wrap; }
	.sorular { margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-strong); display: flex; flex-direction: column; gap: 10px; }
	.soru-liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
	.soru-oge { padding-bottom: 12px; border-bottom: 1px solid var(--border); }
	.soru-oge:last-child { border-bottom: 0; padding-bottom: 0; }
	.soru-metin { margin: 0; font-size: var(--fs-sm); overflow-wrap: anywhere; }
</style>
