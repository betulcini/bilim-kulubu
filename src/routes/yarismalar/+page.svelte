<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { competitionFilters, competitions } from '$lib/data/competitions.js';
	import { sfx } from '$lib/sound.js';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient.js';

	let activeFilter = 'Tümü';
	$: visibleCompetitions = activeFilter === 'Tümü' ? competitions : competitions.filter((competition) => competition.tur === activeFilter);
	function badgeClass(durum) { return durum === 'Katıl' || durum === 'Kayıt açık' ? 'live' : 'dev'; }

	// --- Skor tablosu: önce gerçek/ortak Supabase verisi, yoksa bu cihazdaki sonuçlar, o da yoksa boş durum ---
	let leaderboard = [];
	let leaderboardSource = 'empty'; // 'shared' | 'local' | 'empty'

	function fromLocalStorage() {
		try {
			const raw = JSON.parse(localStorage.getItem('btk_quiz_scores') || '[]');
			if (!Array.isArray(raw) || raw.length === 0) return null;

			const enIyiSkorlar = new Map();
			for (const kayit of raw) {
				const isim = (kayit.name || 'Bilim Meraklısı').trim();
				const anahtar = isim.toLocaleLowerCase('tr-TR');
				const mevcut = enIyiSkorlar.get(anahtar);
				if (!mevcut || kayit.score > mevcut.puan) {
					enIyiSkorlar.set(anahtar, { ad: isim, puan: kayit.score });
				}
			}

			const liste = [...enIyiSkorlar.values()]
				.sort((a, b) => b.puan - a.puan)
				.slice(0, 8)
				.map((kisi, i) => ({ sira: i + 1, ad: kisi.ad, puan: kisi.puan }));

			return liste.length > 0 ? liste : null;
		} catch (e) {
			return null;
		}
	}

	onMount(async () => {
		if (!browser) return;

		// 1) Önce gerçek/ortak skor tablosunu dene (tüm kullanıcılar arasında, giriş yapmış olanlardan)
		const { data, error } = await supabase
			.from('leaderboard_view')
			.select('full_name, class_name, best_score')
			.order('best_score', { ascending: false })
			.limit(8);

		if (!error && data && data.length > 0) {
			leaderboard = data.map((kisi, i) => ({
				sira: i + 1,
				ad: kisi.full_name || 'Bilim Meraklısı',
				sinif: kisi.class_name,
				puan: kisi.best_score
			}));
			leaderboardSource = 'shared';
			return;
		}

		// 2) Ortak tablo boşsa, bu cihazdaki (giriş yapılmamış) tahmini veriyi göster
		const yerelListe = fromLocalStorage();
		if (yerelListe) {
			leaderboard = yerelListe;
			leaderboardSource = 'local';
		}
	});
</script>

<svelte:head>
	<title>Yarışmalar · Bilim ve Teknoloji Kulübü</title>
	<meta name="description" content="Fizik, biyoloji, kimya ve astronomi quizlerini çöz, kulüp skor tablosunda yerini al ve yarışmalara katıl." />
</svelte:head>
<PageHeader eyebrow="Yarışmalar" title="Bilgini yarıştır" desc="Quizleri çöz, çevrimiçi turnuvalara katıl veya kulüp içindeki yüz yüze yarışmalarda takımınla yer al." />

<div class="content-max competitions-page">
	<section aria-labelledby="yarismalar-listesi">
		<div class="section-heading"><div><p class="section-kicker">Yarışma takvimi</p><h2 id="yarismalar-listesi">Sana uygun yarışmayı seç</h2></div><p class="count">{visibleCompetitions.length} yarışma gösteriliyor</p></div>
		<div class="filter-bar" aria-label="Yarışma türü filtresi">
			{#each competitionFilters as filter}
				<button class:active={activeFilter === filter} aria-pressed={activeFilter === filter} on:click={() => { activeFilter = filter; sfx.click(); }}>{filter}</button>
			{/each}
		</div>
		<div class="card-grid">
			{#each visibleCompetitions as competition}
				{#if competition.href}
					<a class="bracket-card competition-card quiz-card" href={competition.href} on:click={() => sfx.nav()}><span class="badge info">{competition.tur}</span><h3>{competition.ad}</h3><p>{competition.aciklama}</p><div class="foot"><span>{competition.platform}</span><strong>Quize başla →</strong></div></a>
				{:else}
					<article class="bracket-card competition-card"><span class="badge {badgeClass(competition.durum)}">{competition.durum}</span><h3>{competition.ad}</h3><p>{competition.aciklama}</p><div class="foot"><span>{competition.platform}</span><span class="tarih">{competition.tarih}</span></div></article>
				{/if}
			{/each}
		</div>
	</section>

	<section class="leaderboard-section" aria-labelledby="skor-tablosu">
		<div class="leaderboard-heading"><div><p class="section-kicker">Sezon 2026–2027</p><h2 id="skor-tablosu">Skor tablosu</h2></div>{#if leaderboard.length > 0}<span class="badge live">Güncel sıralama</span>{/if}</div>
		{#if leaderboard.length === 0}<div class="leaderboard-card" style="padding: 28px 20px; text-align: center; color: var(--text-muted);">Henüz kaydedilmiş bir quiz skoru yok. Bir quiz çöz, ilk sırada sen ol.</div>{:else}<div class="leaderboard-card"><table><thead><tr><th>Sıra</th><th>Yarışmacı</th><th>Puan</th></tr></thead><tbody>{#each leaderboard as player}<tr><td><span class="rank rank-{player.sira}">{player.sira}</span></td><td>{player.ad}</td><td><strong>{player.puan.toLocaleString('tr-TR')}</strong></td></tr>{/each}</tbody></table></div>{/if}
		<p class="leaderboard-note">
			{#if leaderboardSource === 'empty'}
				Giriş yapıp bir quiz çözdüğünde skorun herkese görünen ortak tabloya eklenir.
			{:else if leaderboardSource === 'local'}
				Henüz giriş yapmış kimse skor kaydetmedi — bu cihazdaki quiz sonuçlarına göre tahmini bir sıralama gösteriliyor. <a href="/giris" style="color: var(--accent);">Giriş yaparsan</a> skorun herkese görünen ortak tabloya eklenir.
			{:else}
				Giriş yapmış üyelerin en yüksek quiz skorlarına göre sıralanmıştır.
			{/if}
		</p>
	</section>
</div>

<style>
	.competitions-page { margin-bottom: 56px; }
	.section-heading, .leaderboard-heading { display: flex; justify-content: space-between; gap: 18px; align-items: end; margin-bottom: 18px; }
	.section-kicker { color: var(--accent); font-family: var(--font-display); font-size: var(--fs-sm); font-weight: 600; margin-bottom: 4px; }
	.count { color: var(--text-faint); font-size: var(--fs-sm); margin: 0; }
	.filter-bar { display: flex; gap: 9px; overflow-x: auto; padding: 2px 0 12px; margin-bottom: 8px; }
	.filter-bar button { white-space: nowrap; background: var(--surface); border: 1px solid var(--border-strong); color: var(--text-muted); padding: 8px 13px; border-radius: 999px; cursor: pointer; font-size: var(--fs-sm); }
	.filter-bar button:hover, .filter-bar button.active { background: var(--accent); border-color: var(--accent); color: var(--accent-contrast); font-weight: 600; }
	.competition-card { display: flex; flex-direction: column; min-height: 230px; }
	.competition-card h3 { margin-top: 12px; }
	.competition-card p { color: var(--text-muted); }
	.quiz-card { text-decoration: none; color: var(--text); }
	.foot { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: auto; font-size: var(--fs-xs); color: var(--text-faint); }
	.foot strong, .tarih { color: var(--accent); }
	.leaderboard-section { margin-top: 52px; max-width: 760px; }
	.leaderboard-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
	table { width: 100%; border-collapse: collapse; }
	th, td { text-align: left; padding: 13px 18px; border-bottom: 1px solid var(--border); }
	th { color: var(--text-faint); font-size: var(--fs-xs); font-weight: 600; }
	td:last-child, th:last-child { text-align: right; }
	tbody tr:last-child td { border-bottom: 0; }
	tbody tr:first-child { background: var(--accent-soft); }
	.rank {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 28px;
		height: 28px;
		padding: 0 6px;
		border-radius: 999px;
		white-space: nowrap;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--fs-xs);
		color: var(--text-muted);
	}
	.rank-1 { background: #d9a93f; color: #2a1f08; }
	.rank-2 { background: #b9c0c4; color: #1f2a2e; }
	.rank-3 { background: #c98a5a; color: #2e1a0c; }
	.leaderboard-note { color: var(--text-faint); font-size: var(--fs-sm); margin-top: 12px; }
	@media (max-width: 520px) { .section-heading, .leaderboard-heading { align-items: start; flex-direction: column; gap: 5px; } th, td { padding: 12px; } }
</style>
