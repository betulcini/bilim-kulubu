<script>
	import { onMount } from 'svelte';
	import { loadAdminStats } from '$lib/yonetim.js';

	let istatistik = null;
	let yukleniyor = true;
	let hata = '';

	onMount(yukle);

	async function yukle() {
		yukleniyor = true;
		const sonuc = await loadAdminStats();
		yukleniyor = false;
		istatistik = sonuc.data;
		hata = sonuc.hata || '';
	}

	const sayi = (value) => Number(value || 0).toLocaleString('tr-TR');
</script>

<section class="istatistikler" aria-label="Toplam kullanım istatistikleri">
	<div class="ust">
		<div>
			<h2>Kullanım özeti</h2>
			<p>Yalnızca toplu sayımlar gösterilir; tek tek kullanıcıların etkinliği veya e-posta adresleri burada yer almaz.</p>
		</div>
		<button class="btn btn-ghost" type="button" disabled={yukleniyor} on:click={yukle}>{yukleniyor ? 'Yükleniyor…' : 'Yenile'}</button>
	</div>
	{#if hata}
		<p class="msg err" role="alert">{hata}</p>
	{:else if yukleniyor && !istatistik}
		<p class="muted" role="status">İstatistikler yükleniyor…</p>
	{:else if istatistik}
		<div class="kartlar">
			<div class="bracket-card kart"><span>Toplam üye</span><strong>{sayi(istatistik.member_count)}</strong></div>
			<div class="bracket-card kart"><span>Quiz denemesi</span><strong>{sayi(istatistik.quiz_attempts)}</strong></div>
			<div class="bracket-card kart"><span>Quiz çözen hesap</span><strong>{sayi(istatistik.quiz_players)}</strong></div>
			<div class="bracket-card kart"><span>Günlük quiz tamamlaması</span><strong>{sayi(istatistik.daily_quizzes)}</strong></div>
			<div class="bracket-card kart"><span>Bugünkü aktif hesap</span><strong>{sayi(istatistik.daily_active)}</strong></div>
			<div class="bracket-card kart"><span>Toplam öneri</span><strong>{sayi(istatistik.suggestions)}</strong></div>
			<div class="bracket-card kart"><span>Açık öneri</span><strong>{sayi(istatistik.suggestions_open)}</strong></div>
		</div>
		<section aria-labelledby="konu-istatistik-baslik">
			<h3 id="konu-istatistik-baslik">En çok çözülen konular</h3>
			{#if istatistik.top_topics?.length}
				<ol class="konular">
					{#each istatistik.top_topics as konu}
						<li><span>{konu.subject}</span><strong>{sayi(konu.attempts)}</strong></li>
					{/each}
				</ol>
			{:else}
				<p class="muted">Henüz quiz sonucu yok.</p>
			{/if}
		</section>
		<small class="muted">Son güncelleme: {new Date(istatistik.updated_at).toLocaleString('tr-TR')}</small>
	{/if}
</section>

<style>
	.istatistikler { display: flex; flex-direction: column; gap: 22px; }
	.ust { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
	.ust h2 { margin: 0; }
	.ust p, .muted { color: var(--text-muted); font-size: var(--fs-sm); }
	.ust p { margin: 5px 0 0; max-width: 620px; }
	.kartlar { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
	.kart { display: flex; flex-direction: column; gap: 6px; }
	.kart span { color: var(--text-muted); font-size: var(--fs-sm); }
	.kart strong { font-size: var(--fs-xl); font-variant-numeric: tabular-nums; }
	.konular { list-style: none; padding: 0; margin: 0; max-width: 600px; }
	.konular li { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
	.msg.err { color: var(--danger); }
</style>
