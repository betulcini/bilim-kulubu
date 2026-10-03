<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { user, authReady } from '$lib/stores/auth.js';
	import { ilerleme } from '$lib/stores/ilerleme.js';
	import { streak, visibleStreak, dayKey } from '$lib/stores/streak.js';
	import { activity } from '$lib/stores/activity.js';
	import { computeBadges } from '$lib/data/badges.js';
	import { seviyeHesapla, PUAN_KURALLARI } from '$lib/data/seviyeler.js';
	import { supabase } from '$lib/supabaseClient.js';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	$: if ($authReady && !$user) goto('/giris');

	$: veri = $ilerleme.veri;
	$: sev = seviyeHesapla(veri?.xp || 0);
	$: yuzde = Math.round(sev.oran * 100);

	// ---------- quiz geçmişi (konu bazında en iyi skorlar, son quizler) ----------
	let skorlar = [];
	let skorHazir = false;
	let yuklenen = null;

	async function skorlariYukle(uid) {
		const { data, error } = await supabase
			.from('quiz_scores')
			.select('subject, subject_title, score, created_at')
			.eq('user_id', uid)
			.order('created_at', { ascending: false })
			.limit(300);
		skorlar = !error && Array.isArray(data) ? data : [];
		skorHazir = true;
	}

	$: if (browser && $user && yuklenen !== $user.id) {
		yuklenen = $user.id;
		skorlariYukle($user.id);
	}

	$: konular = (() => {
		const m = new Map();
		for (const s of skorlar) {
			const k = m.get(s.subject) || { subject: s.subject, ad: s.subject_title || s.subject, en_iyi: 0, adet: 0 };
			k.en_iyi = Math.max(k.en_iyi, Number(s.score) || 0);
			k.adet += 1;
			m.set(s.subject, k);
		}
		return [...m.values()].sort((a, b) => b.en_iyi - a.en_iyi);
	})();
	$: sonQuizler = skorlar.slice(0, 8);

	// ---------- son 5 haftalık takvim (Pazartesi başlangıçlı) ----------
	const GUN_ADLARI = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
	$: takvim = (() => {
		const harita = new Map((veri?.aktivite || []).map((a) => [a.gun, a]));
		const bugunKey = veri?.bugun || dayKey();
		const bugun = new Date(bugunKey + 'T12:00:00');
		const bas = new Date(bugun);
		bas.setDate(bugun.getDate() - ((bugun.getDay() + 6) % 7) - 28);
		const out = [];
		for (let i = 0; i < 35; i++) {
			const d = new Date(bas);
			d.setDate(bas.getDate() + i);
			const k = dayKey(d);
			const a = harita.get(k);
			const quiz = !!a && a.quiz_dogru !== null && a.quiz_dogru !== undefined;
			const ziyaret = !!a?.ziyaret;
			const gelecek = k > bugunKey;
			const etiket = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
			const durum = gelecek ? 'henüz gelmedi' : quiz ? `günlük quiz çözüldü (${a.quiz_dogru}/5)` : ziyaret ? 'siteye girildi' : 'etkinlik yok';
			out.push({ k, gun: d.getDate(), bugun: k === bugunKey, gelecek, quiz, ziyaret: ziyaret && !quiz, etiket, durum });
		}
		return out;
	})();

	// ---------- rozet özeti ----------
	$: rozetler = computeBadges({
		user: $user,
		scores: skorlar.map((s) => ({ subject: s.subject, score: Number(s.score) || 0 })),
		activity: $activity,
		streak: $streak,
		ilerleme: veri
	});
	$: kazanilan = rozetler.filter((r) => r.kazanildi).length;

	const tarihYaz = (t) => new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
</script>

<svelte:head><title>İlerlemem · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader eyebrow="Hesap" title="İlerlemem" desc="Bilim Puanın, seviyen, serin ve quiz geçmişin. Hepsi hesabında durur; telefonda da bilgisayarda da aynıdır." />

<div class="content-max page">
	{#if $user}
		<p><a class="geri" href="/profil">← Profilime dön</a></p>

		{#if !veri}
			<div class="bracket-card bos" role="status">
				{#if $ilerleme.hata}{$ilerleme.hata}{:else}İlerleme bilgisi yükleniyor…{/if}
			</div>
		{:else}
			<!-- Seviye -->
			<section class="bracket-card seviye" aria-labelledby="sv-baslik">
				<div class="sv-ust">
					<span class="sv-rozet" aria-hidden="true">{sev.seviye}</span>
					<div class="sv-metin">
						<h2 id="sv-baslik">Seviye {sev.seviye} · {sev.ad}</h2>
						<p class="muted">{sev.maksimum ? 'En yüksek seviyedesin.' : `${sev.sonrakiAd} seviyesine ${sev.kalan.toLocaleString('tr-TR')} puan kaldı.`}</p>
					</div>
					<div class="sv-puan"><strong>{veri.xp.toLocaleString('tr-TR')}</strong><span>Bilim Puanı</span></div>
				</div>
				<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={yuzde} aria-label="Sonraki seviyeye ilerleme"><span style="width: {yuzde}%"></span></div>
				<p class="bar-not">{sev.bas.toLocaleString('tr-TR')} puan{#if !sev.maksimum} → {sev.sonraki.toLocaleString('tr-TR')} puan{/if}</p>
			</section>

			<!-- Özet sayılar -->
			<section aria-label="Özet">
				<div class="stat-grid">
					<div class="bracket-card stat"><span class="s-etiket">Günlük seri</span><strong>{visibleStreak($streak)} <small>gün</small></strong></div>
					<div class="bracket-card stat"><span class="s-etiket">En uzun seri</span><strong>{$streak.best} <small>gün</small></strong></div>
					<div class="bracket-card stat"><span class="s-etiket">Günlük quiz</span><strong>{veri.seri.total} <small>gün</small></strong></div>
					<div class="bracket-card stat"><span class="s-etiket">Çözülen quiz</span><strong>{veri.quiz_adet}</strong></div>
					<div class="bracket-card stat"><span class="s-etiket">Giriş yapılan gün</span><strong>{veri.ziyaret_gun}</strong></div>
					<div class="bracket-card stat"><span class="s-etiket">Rozet</span><strong>{kazanilan} <small>/ {rozetler.length}</small></strong></div>
				</div>
			</section>

			<!-- Puan dökümü -->
			<section aria-labelledby="dokum-baslik">
				<h2 id="dokum-baslik">Puanın nereden geliyor?</h2>
				<ul class="bracket-card dokum">
					{#each PUAN_KURALLARI as k}
						<li>
							<div>
								<strong>{k.ad}</strong>
								<span class="muted">{k.aciklama}</span>
							</div>
							<span class="d-puan">{(veri.kirilim[k.id] || 0).toLocaleString('tr-TR')}</span>
						</li>
					{/each}
				</ul>
			</section>

			<!-- Takvim -->
			<section aria-labelledby="takvim-baslik">
				<h2 id="takvim-baslik">Son 5 hafta</h2>
				<div class="bracket-card">
					<div class="gun-adlari" aria-hidden="true">{#each GUN_ADLARI as g}<span>{g}</span>{/each}</div>
					<ul class="takvim">
						{#each takvim as t}
							<li class="hucre" class:quiz={t.quiz} class:ziyaret={t.ziyaret} class:gelecek={t.gelecek} class:bugun={t.bugun}>
								<span aria-hidden="true">{t.gun}</span>
								<span class="sr">{t.etiket}: {t.durum}</span>
							</li>
						{/each}
					</ul>
					<p class="lejant"><span class="nokta q"></span> Günlük quiz çözüldü <span class="nokta z"></span> Siteye girildi</p>
				</div>
			</section>

			<!-- Konulara göre -->
			<section aria-labelledby="konu-baslik">
				<h2 id="konu-baslik">Konulara göre en iyi skorların</h2>
				{#if !skorHazir}
					<div class="bracket-card bos">Yükleniyor…</div>
				{:else if konular.length === 0}
					<div class="bracket-card bos">Henüz konu quizi çözmedin. <a href="/yarismalar" style="color: var(--accent);">Quizlere göz at</a>.</div>
				{:else}
					<ul class="bracket-card konu-liste">
						{#each konular as k (k.subject)}
							<li>
								<div class="k-ust"><strong>{k.ad}</strong><span class="d-puan">{k.en_iyi} / 200</span></div>
								<div class="bar ince" role="progressbar" aria-valuemin="0" aria-valuemax="200" aria-valuenow={k.en_iyi} aria-label="{k.ad} en iyi skor"><span style="width: {(k.en_iyi / 200) * 100}%"></span></div>
								<small class="muted">{k.adet} kez çözüldü</small>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<!-- Son quizler -->
			{#if sonQuizler.length}
				<section aria-labelledby="son-baslik">
					<h2 id="son-baslik">Son quizlerin</h2>
					<ul class="bracket-card son-liste">
						{#each sonQuizler as s}
							<li><span>{s.subject_title || s.subject}</span><span class="muted">{tarihYaz(s.created_at)}</span><span class="d-puan">{s.score}</span></li>
						{/each}
					</ul>
				</section>
			{/if}

			<p class="not">
				Konu quizlerinde günde puanı en yüksek 3 quiz sayılır; böylece aynı quizi tekrar tekrar çözerek puan şişirilemez. Gün, Türkiye saatine göre hesaplanır.
				Rozetlerini <a href="/profil" style="color: var(--accent);">Profilim</a> sayfasında görebilirsin.
			</p>
		{/if}
	{/if}
</div>

<style>
	.page { margin-bottom: 60px; display: flex; flex-direction: column; gap: 28px; }
	.page > p { margin: 0; }
	section h2 { margin: 0 0 12px; font-size: var(--fs-lg); }
	.geri { color: var(--accent); text-decoration: none; font-size: var(--fs-sm); }
	.geri:hover { text-decoration: underline; }
	.muted { color: var(--text-muted); font-size: var(--fs-sm); }
	.bos { padding: 24px 20px; color: var(--text-muted); }
	.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

	.seviye { display: flex; flex-direction: column; gap: 12px; }
	.sv-ust { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
	.sv-rozet { flex: none; display: grid; place-items: center; width: 54px; height: 54px; border-radius: 16px; background: var(--accent); color: var(--accent-contrast); font-family: var(--font-display); font-weight: 700; font-size: var(--fs-xl); }
	.sv-metin { flex: 1 1 200px; min-width: 0; }
	.sv-metin h2 { margin: 0 0 2px; font-size: var(--fs-lg); }
	.sv-metin p { margin: 0; }
	.sv-puan { display: flex; flex-direction: column; align-items: flex-end; }
	.sv-puan strong { color: var(--accent); font-family: var(--font-display); font-size: var(--fs-xl); line-height: 1.1; }
	.sv-puan span { color: var(--text-muted); font-size: var(--fs-xs); }
	.bar { height: 10px; border-radius: 999px; background: var(--bg-alt); overflow: hidden; }
	.bar.ince { height: 6px; margin: 6px 0 4px; }
	.bar span { display: block; height: 100%; border-radius: 999px; background: var(--accent); transition: width 0.4s; }
	.bar-not { margin: 0; color: var(--text-faint); font-size: var(--fs-xs); }

	.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
	.stat { display: flex; flex-direction: column; gap: 4px; }
	.s-etiket { color: var(--text-muted); font-size: var(--fs-xs); }
	.stat strong { font-family: var(--font-display); font-size: var(--fs-xl); line-height: 1.1; }
	.stat small { font-size: var(--fs-sm); color: var(--text-muted); font-weight: 400; }

	.dokum, .konu-liste, .son-liste { list-style: none; margin: 0; padding: 0; }
	.dokum li, .son-liste li { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
	.dokum li:last-child, .son-liste li:last-child, .konu-liste li:last-child { border-bottom: 0; }
	.dokum li > div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
	.son-liste li > span:first-child { flex: 1; min-width: 0; overflow-wrap: anywhere; }
	.konu-liste li { padding: 12px 16px; border-bottom: 1px solid var(--border); }
	.k-ust { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
	.k-ust strong { overflow-wrap: anywhere; }
	.d-puan { color: var(--accent); font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }

	.gun-adlari, .takvim { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
	.gun-adlari { margin-bottom: 6px; text-align: center; color: var(--text-faint); font-size: var(--fs-xs); }
	.takvim { list-style: none; margin: 0; padding: 0; }
	.hucre { position: relative; display: grid; place-items: center; aspect-ratio: 1; max-height: 44px; border-radius: 10px; border: 1.5px solid var(--border); font-size: var(--fs-xs); color: var(--text-muted); }
	.hucre.quiz { background: var(--accent); border-color: var(--accent); color: var(--accent-contrast); font-weight: 700; }
	.hucre.ziyaret { background: var(--accent-soft); border-color: color-mix(in srgb, var(--accent) 40%, transparent); color: var(--text); }
	.hucre.gelecek { opacity: 0.4; border-style: dashed; }
	.hucre.bugun { outline: 2px solid var(--accent); outline-offset: 2px; }
	.lejant { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 12px 0 0; color: var(--text-muted); font-size: var(--fs-xs); }
	.nokta { display: inline-block; width: 12px; height: 12px; border-radius: 4px; }
	.nokta.q { background: var(--accent); }
	.nokta.z { background: var(--accent-soft); border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); margin-left: 8px; }

	.not { color: var(--text-faint); font-size: var(--fs-sm); line-height: 1.55; }
</style>
