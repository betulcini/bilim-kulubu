<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { quizData } from '$lib/data/bilim-quizleri.js';
	import { loadDbQuiz, birlestir } from '$lib/quizDb.js';
	import { streak, dayKey, visibleStreak } from '$lib/stores/streak.js';
	import { user, authReady } from '$lib/stores/auth.js';
	import { ilerleme, gunlukQuizKaydet } from '$lib/stores/ilerleme.js';
	import { sfx } from '$lib/sound.js';

	const SORU_SAYISI = 5;

	// Aynı gün herkese aynı sorular gelsin diye tarihe bağlı sabit rastgelelik
	function mulberry32(a) {
		return function () {
			a |= 0;
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}
	function seededShuffle(arr, rnd) {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(rnd() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}
	function seedOf(key) {
		return Number(key.replaceAll('-', '')); // 20261002 gibi
	}

	// Her gün farklı konulardan birer soru: önce konular karıştırılır, sonra her konudan bir soru seçilir
	function buildDaily(key) {
		const rnd = mulberry32(seedOf(key));
		const konular = seededShuffle(Object.keys(havuz), rnd).slice(0, SORU_SAYISI);
		return konular.map((k) => {
			const q = seededShuffle(havuz[k].questions, rnd)[0];
			return { ...q, konu: havuz[k].title.replace(' Quiz', ''), secenekler: seededShuffle(q.secenekler, rnd) };
		});
	}

	// Soru havuzu: yerleşik sorular + yönetici panelinden eklenen konular (Supabase)
	/** @type {Record<string, any>} */
	let havuz = quizData;

	let today = dayKey(); // SSR/prerender sırasında sabit kalır, onMount'ta yenilenir
	let sorular = buildDaily(today);
	let index = 0;
	let secilen = null;
	let puan = 0;
	let bitti = false;
	let onceki = null; // bugün zaten çözüldüyse sonucu
	let hazir = false;
	let kalan = '';
	let kazanilan = null; // bu quizden kazanılan Bilim Puanı (giriş yapılmışsa)
	let sunucuHata = '';

	onMount(() => {
		today = dayKey();
		sorular = buildDaily(today);
		onceki = streak.todayResult();
		if (onceki) bitti = true;
		kalan = geceyeKalan();
		hazir = true;
		loadDbQuiz().then((db) => {
			if (!db) return;
			havuz = birlestir(quizData, db);
			// Oyuncu henüz başlamadıysa güncel havuzdan bugünün sorularını yeniden kur
			if (!onceki && !bitti && index === 0 && secilen === null && puan === 0) sorular = buildDaily(today);
		});
	});

	function geceyeKalan() {
		const simdi = new Date();
		const gece = new Date(simdi);
		gece.setHours(24, 0, 0, 0);
		const dk = Math.max(1, Math.round((gece.getTime() - simdi.getTime()) / 60000));
		const s = Math.floor(dk / 60);
		return s > 0 ? `${s} saat ${dk % 60} dk` : `${dk} dk`;
	}

	$: soru = sorular[index];
	$: gorunenSeri = visibleStreak($streak);
	$: son = onceki || { score: puan, total: SORU_SAYISI };

	function cevapla(opt) {
		if (secilen !== null) return;
		secilen = opt;
		if (opt === soru.dogru) {
			puan += 1;
			sfx.success?.();
		} else {
			sfx.error?.();
		}
	}

	function ilerle() {
		sfx.nav();
		if (index < sorular.length - 1) {
			index += 1;
			secilen = null;
		} else {
			streak.complete(puan, SORU_SAYISI);
			onceki = { score: puan, total: SORU_SAYISI };
			bitti = true;
			if ($user) hesabaKaydet(puan);
		}
	}

	// Giriş yapmış kullanıcının seri ve puanı hesabına işlenir (telefon/bilgisayar arasında senkron kalır)
	async function hesabaKaydet(dogru) {
		sunucuHata = '';
		const r = await gunlukQuizKaydet($user.id, today, dogru);
		if (r.hata) sunucuHata = r.hata === 'giris' ? '' : r.hata;
		else kazanilan = r.kazanilan;
	}

	// Başka cihazda bugünkü quiz çözüldüyse (hesaptan gelen veri) tekrar çözdürme
	$: if (hazir && !onceki && !bitti && $streak.results[today]) {
		onceki = $streak.results[today];
		bitti = true;
	}

	// Son 7 günün çözüldü/çözülmedi görünümü
	$: haftaGunleri = (() => {
		if (!browser) return [];
		const gunler = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
		const out = [];
		for (let i = 6; i >= 0; i--) {
			const d = new Date();
			d.setDate(d.getDate() - i);
			const k = dayKey(d);
			out.push({ k, ad: gunler[d.getDay()], yapildi: !!$streak.results[k], bugun: i === 0 });
		}
		return out;
	})();
</script>

<svelte:head>
	<title>Günlük Mini Quiz · Bilim ve Teknoloji Kulübü</title>
</svelte:head>

<PageHeader eyebrow="Günlük Quiz" title="5 soru, 1 dakika" desc="Her gün farklı konulardan 5 soru. Her gün çözdükçe serin uzar; bir gün atlarsan sıfırlanır. Giriş yaptıysan serin ve puanın hesabına kaydedilir." />

<div class="content-max wrap">
	<div class="bracket-card box">
		<div class="seri-bar">
			<div class="seri" aria-label="Seri sayacı">
				<span class="flame" class:off={gorunenSeri === 0} aria-hidden="true">
					<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12.6 2.2c.4 3-1.2 4.6-2.6 6.2C8.7 9.8 7.5 11.3 7.5 13.6a4.5 4.5 0 0 0 9 0c0-1.5-.6-2.6-1.4-3.5-.2 1-.7 1.7-1.5 2 .5-3-.1-6.7-1-9.9ZM12 21.5a7 7 0 0 1-7-7c0-3 1.7-5 3.2-6.7 1-1.2 2-2.3 2.3-4 .1-.4.6-.6.9-.3C14.6 5 16.4 9 15.7 12c1-.5 1.6-1.4 1.8-2.6.1-.4.6-.6.9-.3 1.5 1.6 2.6 3.6 2.6 5.4a7 7 0 0 1-7 7Z" /></svg>
				</span>
				<div>
					<strong class="seri-sayi">{gorunenSeri}</strong>
					<span class="seri-etiket">günlük seri</span>
				</div>
			</div>
			<span class="badge info">En uzun seri: {$streak.best} gün</span>
		</div>

		{#if hazir}
			<div class="hafta" aria-label="Son 7 gün">
				{#each haftaGunleri as g}
					<div class="gun" class:done={g.yapildi} class:today={g.bugun}>
						<span class="nokta">{#if g.yapildi}<Icon name="check" size={14} />{/if}</span>
						<small>{g.ad}</small>
					</div>
				{/each}
			</div>
		{/if}

		{#if bitti}
			<div class="sonuc">
				<div class="ico-tile xl warm" style="margin: 0 auto 12px;"><Icon name="trophy" size={34} /></div>
				<h2>{onceki && !hazir ? '' : 'Bugünkü quiz tamam'}</h2>
				<p class="skor"><strong>{son.score}</strong> / {son.total} doğru</p>
				<p class="muted">
					{#if gorunenSeri >= 2}
						{gorunenSeri} gündür aralıksız çözüyorsun.
					{:else}
						Serin başladı. Yarın da gel, 2. güne taşı.
					{/if}
					Yeni sorular {kalan} sonra.
				</p>
				{#if $user}
					{#if kazanilan}
						<p class="kazanc" role="status">+{kazanilan} Bilim Puanı kazandın{#if $ilerleme.veri} · Toplam: {$ilerleme.veri.xp}{/if}</p>
					{:else if $ilerleme.veri}
						<p class="muted">Toplam Bilim Puanın: <strong>{$ilerleme.veri.xp}</strong></p>
					{/if}
					{#if sunucuHata}<p class="muted" role="alert">{sunucuHata}</p>{/if}
				{:else if $authReady}
					<p class="muted"><a href="/giris" style="color: var(--accent);">Giriş yaparsan</a> serin ve puanın hesabında kalır, telefon ile bilgisayar arasında senkron olur.</p>
				{/if}
				<div class="actions">
					<a class="btn btn-primary" href="/yarismalar" on:click={() => sfx.nav()}>Konu quizlerine geç</a>
					<a class="btn btn-ghost" href={$user ? '/profil/ilerleme' : '/profil'} on:click={() => sfx.nav()}>{$user ? 'İlerlememi gör' : 'Rozetlerimi gör'}</a>
				</div>
			</div>
		{:else}
			<div class="ust">
				<span class="badge dev">Soru {index + 1} / {sorular.length}</span>
				<span class="badge info">{soru.konu}</span>
			</div>
			<div class="progress" aria-hidden="true"><span style="width: {((index + (secilen !== null ? 1 : 0)) / sorular.length) * 100}%"></span></div>

			<h3 aria-level="2" class="soru">{soru.soru}</h3>
			<div class="opts">
				{#each soru.secenekler as opt}
					<button
						class="btn quiz-option {secilen === null ? 'btn-ghost' : opt === soru.dogru ? 'btn-primary' : secilen === opt ? 'btn-danger' : 'btn-ghost'}"
						disabled={secilen !== null}
						on:click={() => cevapla(opt)}>{opt}</button>
				{/each}
			</div>

			{#if secilen !== null}
				<div class="fb" class:ok={secilen === soru.dogru}>
					<p>{secilen === soru.dogru ? 'Doğru.' : `Yanlış. Doğru cevap: ${soru.dogru}`} {soru.aciklama}</p>
				</div>
				<button class="btn btn-primary next" on:click={ilerle}>{index < sorular.length - 1 ? 'Sonraki soru →' : 'Bitir'}</button>
			{/if}
		{/if}
	</div>
</div>

<style>
	.wrap { margin-bottom: 60px; }
	.box { max-width: 720px; margin: 0 auto; }
	.seri-bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
	.seri { display: flex; align-items: center; gap: 12px; }
	.flame { display: inline-flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 14px; background: var(--accent-soft); color: var(--accent); border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent); }
	.flame.off { background: var(--surface-hover); color: var(--text-faint); border-color: var(--border); }
	.seri-sayi { font-family: var(--font-display); font-size: var(--fs-xl); line-height: 1; margin-right: 6px; }
	.seri-etiket { color: var(--text-muted); font-size: var(--fs-sm); }
	.hafta { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 20px; }
	.gun { display: flex; flex-direction: column; align-items: center; gap: 4px; }
	.gun small { color: var(--text-faint); font-size: var(--fs-xs); }
	.gun.today small { color: var(--accent); font-weight: 600; }
	.nokta { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 999px; border: 1.5px solid var(--border-strong); color: var(--accent-contrast); }
	.gun.done .nokta { background: var(--accent); border-color: var(--accent); }
	.gun.today:not(.done) .nokta { border-color: var(--accent); border-style: dashed; }
	.kazanc { margin: 8px 0 0; color: var(--accent); font-weight: 600; }
	.ust { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
	.progress { height: 4px; border-radius: 999px; background: var(--bg-alt); overflow: hidden; margin-bottom: 18px; }
	.progress span { display: block; height: 100%; background: var(--accent); border-radius: 999px; transition: width 0.3s; }
	.soru { margin: 0 0 16px; line-height: 1.45; }
	.opts { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
	.opts :global(.btn) { text-align: left; }
	.fb { background: var(--bg-alt); border: 1px solid var(--border); border-left: 3px solid var(--danger); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 16px; }
	.fb.ok { border-left-color: var(--accent); }
	.fb p { margin: 0; font-size: var(--fs-sm); line-height: 1.5; }
	.next { width: 100%; }
	.sonuc { text-align: center; padding: 8px 0 4px; }
	.sonuc h2 { margin: 0 0 6px; }
	.skor { font-size: var(--fs-lg); margin: 0 0 8px; }
	.muted { color: var(--text-muted); margin: 0 auto 18px; max-width: 420px; }
	.actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
	@media (max-width: 520px) {
		.hafta { gap: 3px; }
		.nokta { width: 24px; height: 24px; }
	}
</style>
