<script>
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import QuizYonetimi from '$lib/components/QuizYonetimi.svelte';
	import GaleriYonetimi from '$lib/components/GaleriYonetimi.svelte';
	import YoneticiYonetimi from '$lib/components/YoneticiYonetimi.svelte';
	import OneriYonetimi from '$lib/components/OneriYonetimi.svelte';
	import IstatistikYonetimi from '$lib/components/IstatistikYonetimi.svelte';
	import IcerikYedekleme from '$lib/components/IcerikYedekleme.svelte';
	import IcerikKalitesi from '$lib/components/IcerikKalitesi.svelte';
	import YoneticiGecmisi from '$lib/components/YoneticiGecmisi.svelte';
	import VideoTanitimKarti from '$lib/components/VideoTanitimKarti.svelte';
	import YoutubeOynatici from '$lib/components/YoutubeOynatici.svelte';
	import { user, authReady } from '$lib/stores/auth.js';
	import { ALANLAR, VIDEO_BOLUMLERI, GEZI_DURUMLARI, LISTE_SAYFA_BOYUTU, bosForm, dogrula, isAdmin, listRows, saveRow, setAktif, removeRow } from '$lib/yonetim.js';
	import { youtubeMedia, kapakAdresi } from '$lib/video.js';
	import { formatTarih } from '$lib/content.js';
	import { sfx } from '$lib/sound.js';

	$: if ($authReady && !$user) goto('/giris');

	let kontrol = 'bekliyor'; // bekliyor | admin | yetkisiz | hata
	let kontrolHata = '';
	let sekme = 'duyurular';
	let satirlar = [];
	let yukleniyor = false;
	let sayfa = 0;
	let sonrakiVar = false;
	let form = bosForm('duyurular');
	let duzenlenen = null; // düzenlenen satırın id'si
	let hata = '';
	let bilgi = '';
	let kaydediyor = false;
	let yayinda = false;

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

	async function yukle(devam = false) {
		yukleniyor = true;
		const r = await listRows(sekme, sayfa);
		if (r.hata) {
			hata = r.hata;
			if (!devam) {
				satirlar = [];
				sonrakiVar = false;
			}
		} else {
			satirlar = devam ? [...satirlar, ...r.data] : r.data;
			sonrakiVar = r.data.length === LISTE_SAYFA_BOYUTU;
		}
		yukleniyor = false;
	}

	const TABLAR = [
		{ id: 'duyurular', ad: 'Duyurular' },
		{ id: 'firsatlar', ad: 'Fırsatlar' },
		{ id: 'geziler', ad: 'Geziler' },
		{ id: 'videolar', ad: 'Videolar' },
		{ id: 'kartlar', ad: 'Seri / tiyatro kartları' },
		{ id: 'quizler', ad: 'Quizler' },
		{ id: 'galeri', ad: 'Galeri' },
		{ id: 'yoneticiler', ad: 'Yöneticiler' },
		{ id: 'oneriler', ad: 'Öneriler' },
		{ id: 'istatistik', ad: 'İstatistikler' },
		{ id: 'yedek', ad: 'İçerik yedeği' },
		{ id: 'kalite', ad: 'İçerik kalite kontrolü' },
		{ id: 'gecmis', ad: 'Yönetici işlem geçmişi' }
	];
	const GRUPLAR = [
		{ ad: 'İçerik', sekmeler: ['duyurular', 'firsatlar', 'geziler', 'videolar', 'kartlar'] },
		{ ad: 'Öğrenme', sekmeler: ['quizler', 'galeri'] },
		{ ad: 'Yönetim', sekmeler: ['oneriler', 'yoneticiler', 'istatistik', 'yedek'] },
		{ ad: 'Kontrol', sekmeler: ['kalite', 'gecmis'] }
	];
	const FORMLU = ['duyurular', 'firsatlar', 'geziler', 'videolar', 'kartlar']; // ortak form + liste kullanan sekmeler

	async function sekmeSec(ad) {
		if (sekme === ad) return;
		sekme = ad;
		sfx.nav();
		if (FORMLU.includes(ad)) {
			temizle();
			sayfa = 0;
			await yukle();
		} else {
			hata = '';
			bilgi = '';
		}
	}

	function temizle() {
		form = bosForm(sekme);
		yayinda = sekme !== 'videolar' && sekme !== 'kartlar';
		duzenlenen = null;
		hata = '';
		bilgi = '';
	}

	function duzenle(satir) {
		const f = bosForm(sekme);
		for (const a of ALANLAR[sekme]) {
			if (a.k === 'youtube') {
				f[a.k] = satir.playlist_id
					? `https://www.youtube.com/playlist?list=${satir.playlist_id}`
					: satir.youtube_id
						? `https://www.youtube.com/watch?v=${satir.youtube_id}`
						: '';
			} else if (a.t === 'datetime-local' && satir[a.k]) {
				const dt = new Date(satir[a.k]);
				dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
				f[a.k] = dt.toISOString().slice(0, 16);
			} else {
				f[a.k] = satir[a.k] ?? (a.k === 'sira' ? 0 : '');
			}
		}
		form = f;
		yayinda = Boolean(satir.aktif);
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
		const s = await saveRow(sekme, r.satir, duzenlenen, yayinda);
		kaydediyor = false;
		if (s.hata) {
			hata = s.hata;
			sfx.error();
			return;
		}
		bilgi = (sekme === 'videolar' || sekme === 'kartlar') && !yayinda
			? 'Taslak kaydedildi. Yayına alana kadar ziyaretçiler göremez.'
			: duzenlenen
				? 'Değişiklikler kaydedildi.'
				: 'Yayınlandı. Sitede hemen görünür.';
		sfx.success();
		form = bosForm(sekme);
		yayinda = sekme !== 'videolar' && sekme !== 'kartlar';
		duzenlenen = null;
		sayfa = 0;
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
		sayfa = 0;
		await yukle();
	}

	async function sil(s) {
		if (!confirm(`"${ad(s)}" kalıcı olarak silinsin mi? Geri alınamaz. (Silmek yerine "Yayından kaldır" da kullanabilirsin.)`)) return;
		const r = await removeRow(sekme, s.id);
		if (r.hata) {
			hata = r.hata;
			return;
		}
		bilgi = 'Silindi.';
		if (duzenlenen === s.id) temizle();
		sayfa = 0;
		await yukle();
	}

	async function dahaFazlaYukle() {
		if (yukleniyor || !sonrakiVar) return;
		hata = '';
		sayfa += 1;
		await yukle(true);
		if (hata) sayfa -= 1;
	}

	const YENI = { duyurular: 'Yeni duyuru ekle', firsatlar: 'Yeni fırsat ekle', geziler: 'Yeni gezi duyurusu ekle', videolar: 'Yeni video ekle', kartlar: 'Yeni seri / tiyatro kartı ekle' };
	const ad = (s) => s.baslik ?? s.yer ?? '';
	const etiketOf = (liste, id) => liste.find((x) => x.id === id)?.label || id;
	const yayinEtiketi = (s) => {
		if (!s.aktif) return 'Gizli';
		const now = Date.now();
		if (s.yayina_basla && new Date(s.yayina_basla).getTime() > now) return 'Zamanlandı';
		if (s.yayindan_kaldir && new Date(s.yayindan_kaldir).getTime() <= now) return 'Süresi doldu';
		return 'Yayında';
	};
	const meta = (s) => {
		const yayin = [s.yayina_basla && `Başlangıç: ${new Date(s.yayina_basla).toLocaleString('tr-TR')}`, s.yayindan_kaldir && `Bitiş: ${new Date(s.yayindan_kaldir).toLocaleString('tr-TR')}`].filter(Boolean);
		if (sekme === 'duyurular') return [formatTarih(s.tarih), s.etiket, ...yayin].filter(Boolean).join(' · ');
		if (sekme === 'geziler') return [etiketOf(GEZI_DURUMLARI, s.durum), s.tarih_metni || formatTarih(s.gun)].filter(Boolean).join(' · ');
		if (sekme === 'videolar') return [etiketOf(VIDEO_BOLUMLERI, s.bolum), s.grup, `Sıra: ${s.sira ?? 0}`].filter(Boolean).join(' · ');
		if (sekme === 'kartlar') return [etiketOf(VIDEO_BOLUMLERI, s.bolum), s.rozet, `Sıra: ${s.sira ?? 0}`].filter(Boolean).join(' · ');
		return [s.kurum, s.durum, ...yayin].filter(Boolean).join(' · ');
	};
	$: onizleme = sekme === 'videolar' ? youtubeMedia(form.youtube) : null;
	$: kartOnizleme = {
		title: form.baslik || 'Kart başlığı',
		desc: form.aciklama || 'Kart açıklaması burada görünür.',
		durum: form.durum || '',
		detay: form.alt_bilgi || '',
		rozet: form.rozet || ''
	};
</script>

<svelte:head><title>Yönetim · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader eyebrow="Yönetici" title="Yönetim paneli" desc="İçerikleri, topluluk önerilerini ve yönetici araçlarını tek yerden yönet." />

<div class="content-max sayfa">
	{#if kontrol === 'bekliyor'}
		<p class="muted" role="status">Yetki kontrol ediliyor…</p>
	{/if}
	{#if kontrol === 'hata'}
		<p class="msg err" role="alert">{kontrolHata}</p>
	{/if}
	{#if kontrol === 'yetkisiz'}
		<div class="bracket-card bos" role="alert">
			<h2>Bu sayfa sadece yöneticiler içindir</h2>
			<p>Hesabın yönetici listesinde değil. Mevcut yöneticilerden biri hesabını yönetici olarak ekleyebilir.</p>
			<a class="btn btn-ghost" href="/">Ana sayfaya dön</a>
		</div>
	{/if}
		<div class="admin-layout" hidden={kontrol !== 'admin'}>
			<nav class="menu" aria-label="Yönetim bölümleri">
				<p class="menu-yardim">BÖLÜMLER <span>İçerik açmak için bir düğme seç</span></p>
				{#each GRUPLAR as grup (grup.ad)}
					<section class="menu-grup" aria-label={grup.ad}>
						<h2>{grup.ad}</h2>
						<div class="menu-ogeleri">
							{#each TABLAR.filter((oge) => grup.sekmeler.includes(oge.id)) as t (t.id)}
									<button type="button" id="yt-{t.id}" class="menu-dugme" class:aktif={sekme === t.id} aria-current={sekme === t.id ? 'page' : undefined} aria-controls="yp" on:click={() => sekmeSec(t.id)}><span class="menu-ikon" aria-hidden="true">{sekme === t.id ? '●' : '○'}</span>{t.ad}</button>
							{/each}
						</div>
					</section>
				{/each}
			</nav>

		<div id="yp" class="panel" aria-labelledby="yt-{sekme}">
			{#if sekme === 'istatistik'}
				<IstatistikYonetimi />
			{:else if sekme === 'yedek'}
				<IcerikYedekleme />
			{:else if sekme === 'kalite'}
				<IcerikKalitesi />
			{:else if sekme === 'gecmis'}
				<YoneticiGecmisi />
			{:else if sekme === 'quizler'}
				<QuizYonetimi />
			{:else if sekme === 'galeri'}
				<GaleriYonetimi />
			{:else if sekme === 'yoneticiler'}
				<YoneticiYonetimi />
			{:else if sekme === 'oneriler'}
				<OneriYonetimi />
			{:else}
			<form id="yform" class="bracket-card form" on:submit={kaydet} novalidate>
				<h2>{duzenlenen ? 'Kaydı düzenle' : YENI[sekme]}</h2>
				{#if sekme === 'videolar' || sekme === 'kartlar'}
					<div class="field">
						<label for="y-yayin-durumu">Yayın durumu</label>
						<select id="y-yayin-durumu" bind:value={yayinda}>
							<option value={false}>Taslak — sitede gösterme</option>
							<option value={true}>Yayında — ziyaretçilere göster</option>
						</select>
					</div>
				{/if}
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
							<input id="y-{a.k}" type={a.t === 'youtube' ? 'text' : a.t} min={a.min} max={a.max} maxlength={a.max} bind:value={form[a.k]} list={a.liste ? 'liste-' + a.k : undefined} autocomplete="off" />
							{#if a.t === 'datetime-local'}<small class="ipucu">Saat, bu cihazın yerel saat dilimine göre kaydedilir.</small>{/if}
							{#if a.liste}<datalist id="liste-{a.k}">{#each a.liste as x}<option value={x}></option>{/each}</datalist>{/if}
						{/if}
					</div>
				{/each}

				{#if sekme === 'videolar'}
					{#if onizleme?.videoId}
						<div class="onizleme"><img src={kapakAdresi(onizleme.videoId)} alt="Videonun kapak görüntüsü" loading="lazy" /><small>Video bulundu. Sitede kapak görüntüsüyle görünür, dokununca oynar.</small></div>
					{:else if onizleme?.playlistId}
						<p class="ipucu">Oynatma listesi bulundu. Liste kartta gömülü oynatıcı olarak açılacak.</p>
					{/if}
					<small class="ipucu">Video ya da oynatma listesi gömülemiyorsa YouTube Studio'daki yerleştirme izinlerini kontrol et. Gizli (özel) içerikler gömülemez.</small>
					<div class="onizleme-karti" aria-label="Video kartı önizlemesi">
						{#if onizleme}
							<YoutubeOynatici id={onizleme.videoId} playlistId={onizleme.playlistId} baslik={form.baslik || 'Video başlığı'} />
						{/if}
						{#if form.grup}<span class="onizleme-grup">{form.grup}</span>{/if}
						<h3>{form.baslik || 'Video başlığı'}</h3>
						{#if form.aciklama}<p>{form.aciklama}</p>{/if}
					</div>
				{:else if sekme === 'kartlar'}
					<div class="onizleme-karti" aria-label="Seri / tiyatro kartı önizlemesi">
						<VideoTanitimKarti kart={kartOnizleme} />
					</div>
				{:else if sekme === 'geziler'}
					<small class="ipucu">Gezi yapıldıktan sonra durumu "Gerçekleşti" yap; iptal olursa "İptal edildi" seç. Kaldırmak istersen "Yayından kaldır" ya da "Sil" kullan.</small>
				{/if}

				{#if hata}<p class="msg err" role="alert">{hata}</p>{/if}
				{#if bilgi}<p class="msg ok" role="status">{bilgi}</p>{/if}

				<div class="alt">
					<button type="submit" class="btn btn-primary" disabled={kaydediyor}>{kaydediyor ? 'Kaydediliyor…' : duzenlenen ? 'Değişiklikleri kaydet' : (sekme === 'videolar' || sekme === 'kartlar') && !yayinda ? 'Taslağı kaydet' : 'Yayınla'}</button>
					{#if duzenlenen}<button type="button" class="btn btn-ghost" on:click={temizle}>Vazgeç</button>{/if}
				</div>
			</form>

			<section aria-label="Mevcut kayıtlar">
				<h2 class="liste-baslik">Mevcut kayıtlar <span class="adet">({sonrakiVar ? `en az ${satirlar.length}` : satirlar.length})</span></h2>
				{#if yukleniyor}
					<p class="muted">Yükleniyor…</p>
				{:else if satirlar.length === 0}
					<div class="bracket-card bos">Henüz kayıt yok.</div>
				{:else}
					<ul class="liste">
						{#each satirlar as s (s.id)}
							<li class="bracket-card oge" class:gizli={!s.aktif}>
								<div class="oge-ust">
									<strong>{ad(s)}</strong>
									<span class="badge {yayinEtiketi(s) === 'Yayında' ? 'live' : yayinEtiketi(s) === 'Zamanlandı' ? 'info' : 'muted'}">{yayinEtiketi(s)}</span>
								</div>
								<p class="oge-meta">{meta(s)}</p>
								<div class="eylem">
									<button type="button" class="btn btn-ghost mini" on:click={() => duzenle(s)} aria-label="{ad(s)} kaydını düzenle">Düzenle</button>
									<button type="button" class="btn btn-ghost mini" on:click={() => durumDegistir(s)} aria-label="{ad(s)}: {s.aktif ? 'yayından kaldır' : 'yayına al'}">{s.aktif ? 'Yayından kaldır' : 'Yayına al'}</button>
									<button type="button" class="btn btn-ghost mini" on:click={() => sil(s)} aria-label="{ad(s)} kaydını sil">Sil</button>
								</div>
							</li>
						{/each}
					</ul>
					{#if sonrakiVar}
						<button type="button" class="btn btn-ghost daha-fazla" disabled={yukleniyor} on:click={dahaFazlaYukle}>{yukleniyor ? 'Yükleniyor…' : 'Daha fazla yükle'}</button>
					{/if}
				{/if}
			</section>
			{/if}
		</div>
	</div>
</div>

<style>
	.sayfa { margin-bottom: 60px; display: flex; flex-direction: column; gap: 20px; }
	.admin-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); align-items: start; gap: 28px; }
	.admin-layout[hidden] { display: none; }
	.menu { position: sticky; top: 18px; display: flex; flex-direction: column; gap: 18px; padding: 16px 12px; max-height: calc(100vh - 36px); overflow-y: auto; border: 1px solid var(--border-strong); border-radius: var(--radius-md); background: var(--bg-alt); }
	.menu-yardim { display: flex; flex-direction: column; gap: 4px; margin: 0 8px; padding-bottom: 12px; color: var(--text); font-size: var(--fs-xs); font-weight: 800; letter-spacing: .08em; border-bottom: 1px solid var(--border-strong); }
	.menu-yardim span { color: var(--text-muted); font-weight: 400; letter-spacing: normal; }
	.menu-grup { display: flex; flex-direction: column; gap: 6px; }
	.menu-grup h2 { margin: 0 8px 3px; padding-bottom: 5px; color: var(--text-muted); font-size: var(--fs-xs); font-weight: 800; text-transform: uppercase; letter-spacing: .08em; border-bottom: 1px solid var(--border); }
	.menu-ogeleri { display: flex; flex-direction: column; gap: 3px; }
	.menu-dugme { display: flex; align-items: center; gap: 9px; width: 100%; min-height: 40px; padding: 8px 10px; border: 1px solid transparent; border-radius: 8px; background: transparent; color: var(--text-muted); text-align: left; font: 600 var(--fs-sm)/1.35 var(--font-display); cursor: pointer; }
	.menu-ikon { width: 14px; color: var(--text-faint); font-size: 9px; }
	.menu-dugme:hover { color: var(--text); background: var(--bg); }
	.menu-dugme.aktif { color: var(--accent); border-color: var(--accent); border-left-width: 4px; background: var(--accent-soft); }
	.menu-dugme.aktif .menu-ikon { color: var(--accent); }
	.menu-dugme:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
	.panel { min-width: 0; display: flex; flex-direction: column; gap: 28px; }
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
	.daha-fazla { margin-top: 14px; }
	.oge.gizli { opacity: 0.75; }
	.oge-ust { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
	.oge-ust strong { overflow-wrap: anywhere; }
	.oge-meta { margin: 4px 0 10px; color: var(--text-muted); font-size: var(--fs-xs); }
	.eylem { display: flex; gap: 8px; flex-wrap: wrap; }
	.mini { padding: 7px 12px; font-size: var(--fs-xs); }
	.ipucu { color: var(--text-muted); font-size: var(--fs-xs); line-height: 1.5; }
	.onizleme { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
	.onizleme img { width: 160px; max-width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-strong); }
	.onizleme small { color: var(--text-muted); font-size: var(--fs-xs); flex: 1 1 160px; }
	.onizleme-karti { max-width: 460px; display: flex; flex-direction: column; gap: 8px; }
	.onizleme-karti h3, .onizleme-karti p { margin: 0; }
	.onizleme-grup { color: var(--accent); font-size: var(--fs-xs); font-weight: 600; }
	@media (max-width: 850px) {
		.admin-layout { grid-template-columns: minmax(0, 1fr); gap: 18px; }
		.menu { position: static; max-height: none; flex-direction: row; gap: 12px; padding: 8px; overflow-x: auto; }
		.menu-grup { flex-direction: row; flex: 0 0 auto; }
		.menu-grup + .menu-grup { border-left: 1px solid var(--border-strong); padding-left: 10px; }
		.menu-yardim { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
		.menu-grup h2 { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
		.menu-ogeleri { flex-direction: row; }
		.menu-dugme { width: auto; min-height: 38px; white-space: nowrap; }
	}
	@media (max-width: 520px) {
		.menu { margin-inline: -4px; }
		.menu-dugme { padding-inline: 9px; font-size: var(--fs-xs); }
	}
</style>
