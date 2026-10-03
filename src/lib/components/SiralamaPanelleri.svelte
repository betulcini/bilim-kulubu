<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { supabase } from '$lib/supabaseClient.js';
	import { user } from '$lib/stores/auth.js';
	import { sfx } from '$lib/sound.js';
	import { seviyeHesapla } from '$lib/data/seviyeler.js';

	// 'sinif' = sınıflar arası yarış, 'haftalik' = bu haftanın bireysel liderleri, 'genel' = toplam Bilim Puanı
	let sekme = 'sinif';
	// Sınıf yarışında dönem: 'hafta' | 'sezon'
	let donem = 'sezon';

	let siniflar = [];
	let haftalik = [];
	let genel = [];
	let yuklendi = false;
	let hata = false;

	const sinifNorm = (s) => (s || '').trim().toLocaleUpperCase('tr-TR');
	$: benimSinif = sinifNorm($user?.class_name);

	// Pazartesi 00:00'a (Türkiye saati) kalan süre — haftalık tablo ne zaman sıfırlanıyor
	function haftaSifirlanma() {
		const simdi = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
		const gun = (simdi.getDay() + 6) % 7; // Pazartesi = 0
		const kalanGun = 7 - gun;
		if (kalanGun === 1) {
			const kalanSaat = 24 - simdi.getHours();
			return `${kalanSaat} saat sonra`;
		}
		return `${kalanGun} gün sonra`;
	}
	let sifirlanma = '';

	onMount(async () => {
		if (!browser) return;
		sifirlanma = haftaSifirlanma();
		const [sinifRes, haftaRes, genelRes] = await Promise.all([
			supabase.from('class_leaderboard_view').select('class_name, member_count, season_total, week_total, season_avg').limit(30),
			supabase.from('weekly_leaderboard_view').select('full_name, class_name, week_score, quiz_count').order('week_score', { ascending: false }).limit(10),
			// toplam_puan_view kurulu değilse (2026-10-05 SQL'i çalışmadıysa) bu sekme boş görünür, diğerleri etkilenmez
			supabase.from('toplam_puan_view').select('full_name, class_name, xp').order('xp', { ascending: false }).limit(10)
		]);
		if (sinifRes.error && haftaRes.error) hata = true;
		siniflar = sinifRes.data || [];
		haftalik = haftaRes.data || [];
		genel = genelRes.error ? [] : genelRes.data || [];
		yuklendi = true;
	});

	$: siniflarSirali = [...siniflar]
		.map((s) => ({ ...s, toplam: donem === 'hafta' ? s.week_total : s.season_total }))
		.filter((s) => s.toplam > 0)
		.sort((a, b) => b.toplam - a.toplam)
		.slice(0, 10);
	$: enYuksekSinif = siniflarSirali[0]?.toplam || 1;

	function sec(s) {
		sekme = s;
		sfx.click();
	}
</script>

<section class="siralama" aria-labelledby="siralama-baslik">
	<div class="head">
		<div>
			<p class="kicker">Sezon 2026–2027</p>
			<h2 id="siralama-baslik">Sınıf yarışı ve haftalık liderlik</h2>
		</div>
		<div class="tabs" role="tablist" aria-label="Sıralama türü">
			<button role="tab" aria-selected={sekme === 'sinif'} class:active={sekme === 'sinif'} on:click={() => sec('sinif')}>Sınıflar</button>
			<button role="tab" aria-selected={sekme === 'haftalik'} class:active={sekme === 'haftalik'} on:click={() => sec('haftalik')}>Bu hafta</button>
			<button role="tab" aria-selected={sekme === 'genel'} class:active={sekme === 'genel'} on:click={() => sec('genel')}>Toplam puan</button>
		</div>
	</div>

	{#if !yuklendi}
		<div class="card empty">Sıralama yükleniyor…</div>
	{:else if hata}
		<div class="card empty">Sıralama şu an alınamadı. Biraz sonra tekrar dene.</div>
	{:else if sekme === 'sinif'}
		<div class="sub-tabs" aria-label="Dönem">
			<button class:active={donem === 'sezon'} aria-pressed={donem === 'sezon'} on:click={() => { donem = 'sezon'; sfx.click(); }}>Tüm sezon</button>
			<button class:active={donem === 'hafta'} aria-pressed={donem === 'hafta'} on:click={() => { donem = 'hafta'; sfx.click(); }}>Bu hafta</button>
		</div>
		{#if siniflarSirali.length === 0}
			<div class="card empty">
				{donem === 'hafta' ? 'Bu hafta henüz sınıf puanı yok.' : 'Henüz sınıf puanı yok.'} Giriş yapıp sınıfını profiline ekleyen herkes quiz çözerek sınıfına puan kazandırır.
			</div>
		{:else}
			<ul class="card list">
				{#each siniflarSirali as s, i}
					<li class:mine={s.class_name === benimSinif}>
						<span class="rank rank-{i + 1}">{i + 1}</span>
						<div class="who">
							<div class="row"><strong>{s.class_name}</strong><span class="pts">{s.toplam.toLocaleString('tr-TR')} puan</span></div>
							<div class="bar" aria-hidden="true"><span style="width: {Math.max(6, (s.toplam / enYuksekSinif) * 100)}%"></span></div>
							<small>{s.member_count} kişi · kişi başı ort. {Number(s.season_avg).toLocaleString('tr-TR')}</small>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
		<p class="note">Sınıf puanı, üyelerin her konudaki en yüksek quiz skorlarının toplamıdır. Sınıfını Profilim sayfasından ayarlayabilirsin{#if benimSinif} (senin sınıfın: {benimSinif}){/if}.</p>
	{:else if sekme === 'genel'}
		{#if genel.length === 0}
			<div class="card empty">Henüz toplam puan yok. Giriş yapıp quiz çözerek ve siteyi ziyaret ederek puan kazan.</div>
		{:else}
			<ul class="card list">
				{#each genel as k, i}
					<li class:mine={k.full_name && k.full_name === $user?.full_name}>
						<span class="rank rank-{i + 1}">{i + 1}</span>
						<div class="who">
							<div class="row"><strong>{k.full_name || 'Bilim Meraklısı'}</strong><span class="pts">{k.xp.toLocaleString('tr-TR')} puan</span></div>
							<small>{k.class_name ? `${k.class_name} · ` : ''}{seviyeHesapla(k.xp).ad} (Seviye {seviyeHesapla(k.xp).seviye})</small>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
		<p class="note">Toplam Bilim Puanı; konu quizleri, günlük mini quiz, seri bonusu ve günlük girişlerden oluşur. Detaylı döküm için Profilim → İlerlemem sayfasına bak.</p>
	{:else}
		{#if haftalik.length === 0}
			<div class="card empty">Bu hafta henüz skor yok. İlk puanı sen kazan.</div>
		{:else}
			<ul class="card list">
				{#each haftalik as k, i}
					<li class:mine={k.full_name && k.full_name === $user?.full_name}>
						<span class="rank rank-{i + 1}">{i + 1}</span>
						<div class="who">
							<div class="row"><strong>{k.full_name || 'Bilim Meraklısı'}</strong><span class="pts">{k.week_score.toLocaleString('tr-TR')} puan</span></div>
							<small>{k.class_name ? `${k.class_name} · ` : ''}{k.quiz_count} konuda quiz</small>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
		<p class="note">Haftalık tablo Pazartesi 00:00'da (Türkiye saati) sıfırlanır{#if sifirlanma} — {sifirlanma}{/if}. Puan, bu hafta her konuda aldığın en yüksek skorların toplamıdır.</p>
	{/if}
</section>

<style>
	.siralama { margin-top: 52px; max-width: 760px; }
	.head { display: flex; justify-content: space-between; align-items: end; gap: 14px; flex-wrap: wrap; margin-bottom: 16px; }
	.kicker { color: var(--accent); font-family: var(--font-display); font-size: var(--fs-sm); font-weight: 600; margin: 0 0 4px; }
	h2 { margin: 0; }
	.tabs, .sub-tabs { display: inline-flex; gap: 6px; }
	.sub-tabs { margin-bottom: 12px; }
	.tabs button, .sub-tabs button {
		background: var(--surface);
		border: 1px solid var(--border-strong);
		color: var(--text-muted);
		padding: 8px 14px;
		border-radius: 999px;
		cursor: pointer;
		font-size: var(--fs-sm);
		white-space: nowrap;
	}
	.tabs button.active, .sub-tabs button.active { background: var(--accent); border-color: var(--accent); color: var(--accent-contrast); font-weight: 600; }
	.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
	.empty { padding: 28px 20px; text-align: center; color: var(--text-muted); }
	.list { list-style: none; margin: 0; padding: 0; }
	.list li { display: flex; align-items: center; gap: 14px; padding: 13px 16px; border-bottom: 1px solid var(--border); }
	.list li:last-child { border-bottom: 0; }
	.list li.mine { background: var(--accent-soft); }
	.who { flex: 1; min-width: 0; }
	.row { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
	.row strong { overflow-wrap: anywhere; }
	.pts { color: var(--accent); font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
	.bar { height: 5px; border-radius: 999px; background: var(--bg-alt); margin: 7px 0 5px; overflow: hidden; }
	.bar span { display: block; height: 100%; border-radius: 999px; background: var(--accent); }
	small { color: var(--text-faint); font-size: var(--fs-xs); }
	.rank {
		display: inline-flex; align-items: center; justify-content: center; flex: none;
		min-width: 28px; height: 28px; padding: 0 6px; border-radius: 999px;
		font-family: var(--font-display); font-weight: 700; font-size: var(--fs-xs); color: var(--text-muted);
	}
	.rank-1 { background: #d9a93f; color: #2a1f08; }
	.rank-2 { background: #b9c0c4; color: #1f2a2e; }
	.rank-3 { background: #c98a5a; color: #2e1a0c; }
	.note { color: var(--text-faint); font-size: var(--fs-sm); margin-top: 12px; }
	@media (max-width: 520px) {
		.head { align-items: start; flex-direction: column; }
		.list li { padding: 12px; gap: 10px; }
	}
</style>
