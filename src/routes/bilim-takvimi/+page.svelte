<script>
	import Icon from '$lib/components/Icon.svelte';
	import { onMount, onDestroy } from 'svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { sfx } from '$lib/sound.js';
	import { takvimOlaylari, takvimKategorileri } from '$lib/data/bilim-takvimi.js';

	let secilenKategori = 'Tümü';
	let simdi = new Date();
	let saat = null;

	onMount(() => {
		saat = setInterval(() => (simdi = new Date()), 60000);
	});
	onDestroy(() => clearInterval(saat));

	const AY_ADLARI = [
		'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
		'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
	];

	function tarihAyristir(str) {
		const [y, m, d] = str.split('-').map(Number);
		return new Date(y, m - 1, d);
	}

	function formatTarih(str) {
		const d = tarihAyristir(str);
		return `${d.getDate()} ${AY_ADLARI[d.getMonth()]} ${d.getFullYear()}`;
	}

	function araligiFormatla(olay) {
		if (!olay.bitis || olay.bitis === olay.baslangic) return formatTarih(olay.baslangic);
		const b = tarihAyristir(olay.baslangic);
		const s = tarihAyristir(olay.bitis);
		if (b.getFullYear() === s.getFullYear() && b.getMonth() === s.getMonth()) {
			return `${b.getDate()}-${s.getDate()} ${AY_ADLARI[b.getMonth()]} ${b.getFullYear()}`;
		}
		return `${formatTarih(olay.baslangic)} – ${formatTarih(olay.bitis)}`;
	}

	function durum(olay) {
		const baslangic = tarihAyristir(olay.baslangic);
		const bitis = olay.bitis ? tarihAyristir(olay.bitis) : baslangic;
		bitis.setHours(23, 59, 59, 999);
		const gunFarki = Math.ceil((baslangic - simdi) / 86400000);

		if (simdi > bitis) return { etiket: 'Geçti', sinif: 'gecti' };
		if (simdi >= baslangic && simdi <= bitis) return { etiket: 'Şu an devam ediyor', sinif: 'devam' };
		if (gunFarki === 0) return { etiket: 'Bugün', sinif: 'yakin' };
		if (gunFarki <= 14) return { etiket: `${gunFarki} gün kaldı`, sinif: 'yakin' };
		return { etiket: `${gunFarki} gün kaldı`, sinif: 'uzak' };
	}

	$: siraliOlaylar = [...takvimOlaylari].sort(
		(a, b) => tarihAyristir(a.baslangic) - tarihAyristir(b.baslangic)
	);
	$: filtreliOlaylar =
		secilenKategori === 'Tümü'
			? siraliOlaylar
			: siraliOlaylar.filter((o) => o.kategori === secilenKategori);
	$: yaklasanOlay = siraliOlaylar.find((o) => {
		const bitis = o.bitis ? tarihAyristir(o.bitis) : tarihAyristir(o.baslangic);
		bitis.setHours(23, 59, 59, 999);
		return bitis >= simdi;
	});

	function kategoriSec(k) {
		sfx.toggle();
		secilenKategori = k;
	}

	const rozetSinif = {
		Tutulma: 'info',
		'TÜBİTAK Yarışmaları': 'live',
		'Uzay Olayları': 'muted',
		Festival: 'dev'
	};
</script>

<svelte:head>
	<title>Bilim Takvimi · Bilim ve Teknoloji Kulübü</title>
	<meta
		name="description"
		content="Güneş ve Ay tutulmaları, TÜBİTAK 2204-A/B başvuru tarihleri, Bilim Olimpiyatları, TEKNOFEST ve meteor yağmurları — Eylül 2026'dan Aralık 2027'ye kadar tüm bilim takvimi."
	/>
</svelte:head>

<PageHeader
	eyebrow="Bilim Takvimi"
	title="Kaçırılmayacak bilim tarihleri"
	desc="Tutulmalar, TÜBİTAK yarışma başvuru/sonuç tarihleri, TEKNOFEST ve gök olayları — 2027 sonuna kadar tek takvimde."
/>

<div class="content-max takvim-wrap">
	{#if yaklasanOlay}
		<div class="bracket-card one-cikan">
			<span class="badge live">Sıradaki</span>
			<h3 aria-level="2">{yaklasanOlay.baslik}</h3>
			<p class="tarih-satir">{araligiFormatla(yaklasanOlay)} · {durum(yaklasanOlay).etiket}</p>
		</div>
	{/if}

	<div class="filtre-satir">
		{#each takvimKategorileri as k}
			<button class="chip" class:aktif={secilenKategori === k} on:click={() => kategoriSec(k)}>
				{k}
			</button>
		{/each}
	</div>

	<div class="zaman-cizgisi">
		{#each filtreliOlaylar as olay (olay.id)}
			{@const d = durum(olay)}
			<div class="olay-satir">
				<div class="cizgi-noktasi" class:gecti={d.sinif === 'gecti'}></div>
				<div class="bracket-card olay-kart" class:sonik={d.sinif === 'gecti'}>
					<div class="ust-satir">
						<span class="badge {rozetSinif[olay.kategori] || 'muted'}">{olay.kategori}</span>
						<span class="durum-etiket {d.sinif}">{d.etiket}</span>
					</div>
					<h3>{olay.baslik}</h3>
					<p class="tarih-satir">{araligiFormatla(olay)}</p>
					<p class="aciklama">{olay.aciklama}</p>
					{#if olay.not}
						<p class="not-satir"><span class="ico-inline"><Icon name="bulb" size={16} /></span>{olay.not}</p>
					{/if}
					{#if olay.kesinlik === 'tahmini'}
						<p class="tahmini-uyari"><span class="ico-inline"><Icon name="warning" size={16} /></span>Bu tarih henüz kesinleşmedi, önceki yılların takvimine göre tahmin edilmiştir.</p>
					{/if}
				</div>
			</div>
		{/each}

		{#if filtreliOlaylar.length === 0}
			<p class="soluk">Bu kategoride kayıtlı olay yok.</p>
		{/if}
	</div>
</div>

<style>
	.takvim-wrap {
		max-width: 780px;
		margin-bottom: 56px;
	}
	.one-cikan {
		margin-bottom: 20px;
		border-color: var(--accent);
	}
	.one-cikan h3 {
		margin: 10px 0 4px;
	}

	.filtre-satir {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 26px;
	}
	.chip {
		border: 1px solid var(--border);
		background: var(--bg-alt);
		color: var(--text-muted);
		border-radius: 99px;
		padding: 7px 14px;
		font-size: var(--fs-xs);
		font-family: inherit;
		cursor: pointer;
		transition: all var(--dur) var(--ease);
	}
	.chip:hover {
		border-color: var(--accent);
	}
	.chip.aktif {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--accent-contrast);
		font-weight: 600;
	}

	.zaman-cizgisi {
		display: flex;
		flex-direction: column;
	}
	.olay-satir {
		display: grid;
		grid-template-columns: 14px 1fr;
		gap: 16px;
	}
	.cizgi-noktasi {
		position: relative;
		width: 14px;
		background: linear-gradient(var(--border-strong), var(--border-strong)) center / 2px 100% no-repeat;
	}
	.cizgi-noktasi::before {
		content: '';
		position: absolute;
		top: 22px;
		left: 3px;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
	}
	.cizgi-noktasi.gecti::before {
		background: var(--text-faint);
	}

	.olay-kart {
		margin-bottom: 16px;
	}
	.olay-kart.sonik {
		opacity: 0.55;
	}
	.ust-satir {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		flex-wrap: wrap;
		margin-bottom: 8px;
	}
	.durum-etiket {
		font-size: var(--fs-xs);
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 99px;
	}
	.durum-etiket.uzak {
		color: var(--text-muted);
		background: var(--bg-alt);
	}
	.durum-etiket.yakin {
		color: var(--accent-contrast);
		background: var(--accent);
	}
	.durum-etiket.devam {
		color: var(--accent-3);
		background: var(--accent-3-soft);
	}
	.durum-etiket.gecti {
		color: var(--text-faint);
		background: var(--bg-alt);
	}

	.olay-kart h3 {
		margin: 0 0 4px;
		font-size: var(--fs-md);
	}
	.tarih-satir {
		font-family: var(--font-display);
		color: var(--accent);
		font-weight: 600;
		margin: 0 0 8px;
		font-size: var(--fs-sm);
	}
	.aciklama {
		color: var(--text-muted);
		line-height: 1.6;
		margin: 0;
		font-size: var(--fs-sm);
	}
	.not-satir,
	.tahmini-uyari {
		margin: 10px 0 0;
		font-size: var(--fs-xs);
		line-height: 1.5;
	}
	.not-satir {
		color: var(--accent-3);
	}
	.tahmini-uyari {
		color: var(--danger);
	}
	.soluk {
		color: var(--text-muted);
	}

	@media (max-width: 520px) {
		.olay-satir {
			grid-template-columns: 10px 1fr;
			gap: 10px;
		}
	}
</style>
