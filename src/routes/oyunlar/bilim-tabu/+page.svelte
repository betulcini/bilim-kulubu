<script>
	import { onDestroy } from 'svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { sfx } from '$lib/sound.js';
	import { activity } from '$lib/stores/activity.js';
	import { tabuKelimeleri, tabuKategorileri } from '$lib/data/bilim-tabu.js';

	activity.mark('games', 'bilim-tabu');

	// ---------- ayarlar ----------
	let takimAdlari = ['Takım 1', 'Takım 2'];
	let sure = 60;
	let turSayisi = 3; // her takımın oynayacağı tur
	let pasHakki = 3;
	let zorluk = 'Karışık';
	let kategori = 'Tümü';

	// ---------- oyun durumu ----------
	// asama: 'ayar' | 'hazir' | 'oyun' | 'ozet' | 'final'
	let asama = 'ayar';
	let skorlar = [0, 0];
	let sira = 0; // toplam oynanan el sayısı; sira % 2 = hangi takım
	let kalan = 60;
	let kart = null;
	let kalanPas = 0;
	let elKayitlari = []; // { kelime, sonuc: 'dogru' | 'tabu' | 'pas' }
	let elPuani = 0;

	let kuyruk = [];
	let bitisZamani = 0;
	let sayac = null;
	let sonTik = -1;

	$: havuz = tabuKelimeleri.filter(
		(k) => (zorluk === 'Karışık' || k.zorluk === zorluk.toLowerCase()) && (kategori === 'Tümü' || k.kategori === kategori)
	);
	$: toplamEl = turSayisi * 2;
	$: aktifTakim = sira % 2;
	$: mevcutTur = Math.floor(sira / 2) + 1;
	$: dogruSayisi = elKayitlari.filter((e) => e.sonuc === 'dogru').length;
	$: tabuSayisi = elKayitlari.filter((e) => e.sonuc === 'tabu').length;

	function karistir(arr) {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	function sonrakiKart() {
		if (kuyruk.length === 0) kuyruk = karistir(havuz);
		kart = kuyruk.pop();
	}

	function adTemizle(i) {
		return (takimAdlari[i] || '').trim() || `Takım ${i + 1}`;
	}

	function oyunuBaslat() {
		if (havuz.length === 0) return;
		sfx.nav();
		takimAdlari = [adTemizle(0), adTemizle(1)];
		skorlar = [0, 0];
		sira = 0;
		kuyruk = karistir(havuz);
		asama = 'hazir';
	}

	function eliBaslat() {
		sfx.success();
		kalan = sure;
		kalanPas = pasHakki;
		elKayitlari = [];
		elPuani = 0;
		sonTik = -1;
		sonrakiKart();
		asama = 'oyun';
		bitisZamani = Date.now() + sure * 1000;
		clearInterval(sayac);
		sayac = setInterval(tik, 200);
	}

	function tik() {
		const saniye = Math.max(0, Math.ceil((bitisZamani - Date.now()) / 1000));
		if (saniye !== kalan) {
			kalan = saniye;
			if (saniye <= 10 && saniye > 0 && saniye !== sonTik) {
				sonTik = saniye;
				sfx.click();
			}
		}
		if (saniye <= 0) eliBitir();
	}

	function eliBitir() {
		clearInterval(sayac);
		sayac = null;
		if (asama !== 'oyun') return;
		sfx.error();
		skorlar[aktifTakim] += elPuani;
		skorlar = [...skorlar];
		asama = 'ozet';
	}

	function sonuc(tur) {
		if (asama !== 'oyun' || !kart) return;
		if (tur === 'pas') {
			if (kalanPas <= 0) return;
			kalanPas -= 1;
			sfx.toggle();
		} else if (tur === 'dogru') {
			elPuani += 1;
			sfx.success();
		} else {
			elPuani -= 1;
			sfx.error();
		}
		elKayitlari = [...elKayitlari, { kelime: kart.kelime, sonuc: tur }];
		sonrakiKart();
	}

	function sonrakiEl() {
		sfx.nav();
		if (sira + 1 >= toplamEl) {
			asama = 'final';
		} else {
			sira += 1;
			asama = 'hazir';
		}
	}

	function menuyeDon() {
		sfx.toggle();
		clearInterval(sayac);
		sayac = null;
		asama = 'ayar';
	}

	function klavye(e) {
		if (asama !== 'oyun') return;
		if (e.key === 'Enter' || e.key === 'ArrowRight') sonuc('dogru');
		else if (e.key === 'Backspace' || e.key === 'ArrowLeft') sonuc('tabu');
		else if (e.key === ' ' || e.key === 'ArrowDown') {
			e.preventDefault();
			sonuc('pas');
		}
	}

	onDestroy(() => clearInterval(sayac));

	$: kazanan = skorlar[0] === skorlar[1] ? -1 : skorlar[0] > skorlar[1] ? 0 : 1;
	$: yuzde = sure > 0 ? (kalan / sure) * 100 : 0;
</script>

<svelte:window on:keydown={klavye} />

<svelte:head>
	<title>Bilim Tabu · Oyunlar</title>
</svelte:head>

<PageHeader
	eyebrow="Oyunlar · Takım Oyunu"
	title="Bilim Tabu"
	desc="Karttaki bilimsel terimi yasaklı kelimeleri söylemeden anlat, takımın bulsun. İki takım, süre ve puan!"
/>

<div class="content-max game-wrap">
	{#if asama === 'ayar'}
		<div class="bracket-card">
			<span class="badge dev">Oyun ayarları</span>

			<div class="takimlar">
				{#each [0, 1] as i}
					<label class="alan">
						<span>{i + 1}. takımın adı</span>
						<input type="text" maxlength="20" bind:value={takimAdlari[i]} placeholder="Takım {i + 1}" />
					</label>
				{/each}
			</div>

			<div class="ayar-grid">
				<label class="alan">
					<span>Süre (sn)</span>
					<select bind:value={sure}>
						<option value={30}>30</option>
						<option value={45}>45</option>
						<option value={60}>60</option>
						<option value={90}>90</option>
					</select>
				</label>
				<label class="alan">
					<span>Tur (her takım)</span>
					<select bind:value={turSayisi}>
						<option value={1}>1</option>
						<option value={2}>2</option>
						<option value={3}>3</option>
						<option value={5}>5</option>
					</select>
				</label>
				<label class="alan">
					<span>Pas hakkı</span>
					<select bind:value={pasHakki}>
						<option value={1}>1</option>
						<option value={3}>3</option>
						<option value={5}>5</option>
					</select>
				</label>
				<label class="alan">
					<span>Zorluk</span>
					<select bind:value={zorluk}>
						<option>Karışık</option>
						<option>Kolay</option>
						<option>Orta</option>
						<option>Zor</option>
					</select>
				</label>
				<label class="alan">
					<span>Konu</span>
					<select bind:value={kategori}>
						<option>Tümü</option>
						{#each tabuKategorileri as k}
							<option>{k}</option>
						{/each}
					</select>
				</label>
			</div>

			<p class="kurallar">
				<b>Nasıl oynanır?</b> Sırası gelen takımdan bir kişi anlatıcı olur ve ekranı sadece kendisi görür. Anlatıcı, karttaki
				kelimeyi <b>yasaklı kelimeleri (ve kelimenin kendisini) söylemeden</b> anlatır. Rakip takım ekranı izler ve yasak bir kelime
				söylenirse <b>Tabu!</b> der. Doğru bilinen kelime +1, tabu −1 puandır; pas hakkı bitene kadar kartı geçebilirsin.
			</p>

			<div class="alt-satir">
				<span class="havuz">Havuzda <b>{havuz.length}</b> kelime var</span>
				<button class="btn btn-primary" on:click={oyunuBaslat} disabled={havuz.length === 0}>Oyunu başlat</button>
			</div>
			{#if havuz.length === 0}
				<p class="uyari">Bu seçimde kelime yok, zorluk veya konuyu değiştir.</p>
			{/if}
		</div>
	{:else}
		<div class="skor-bar">
			{#each [0, 1] as i}
				<div class="skor" class:aktif={aktifTakim === i && asama !== 'final'}>
					<span class="skor-ad">{takimAdlari[i]}</span>
					<span class="skor-puan">{skorlar[i]}</span>
				</div>
			{/each}
		</div>

		{#if asama === 'hazir'}
			<div class="bracket-card ortala">
				<span class="badge dev">Tur {mevcutTur} / {turSayisi}</span>
				<h2 class="baslik">Sıra: {takimAdlari[aktifTakim]}</h2>
				<p class="soluk">
					Anlatıcı ekranı takımından gizlesin. Rakip takım ekranı izleyip yasak kelimeleri denetlesin.
					Hazır olunca başla, süre hemen işlemeye başlar.
				</p>
				<p class="soluk kucuk">Kısayollar: <b>Enter</b> doğru · <b>Backspace</b> tabu · <b>Boşluk</b> pas</p>
				<button class="btn btn-primary" on:click={eliBaslat}>Hazırız, başla ({sure} sn)</button>
			</div>
		{:else if asama === 'oyun' && kart}
			<div class="zaman-satir">
				<span class="zaman" class:acil={kalan <= 10}>{kalan} sn</span>
				<span class="badge live">Bu el: {elPuani > 0 ? '+' : ''}{elPuani}</span>
				<span class="badge muted">Pas: {kalanPas}</span>
				<button class="btn btn-ghost bitir" on:click={eliBitir}>Eli bitir</button>
			</div>
			<div class="cubuk"><div class="cubuk-ic" class:acil={kalan <= 10} style="width:{yuzde}%"></div></div>

			<div class="bracket-card tabu-kart">
				<div class="rozetler">
					<span class="badge info">{kart.kategori}</span>
					<span class="badge muted">{kart.zorluk}</span>
				</div>
				<h2 class="hedef">{kart.kelime}</h2>
				<div class="yasak-baslik">Söylemek yasak</div>
				<ul class="yasaklar">
					{#each kart.yasakli as y}
						<li>{y}</li>
					{/each}
				</ul>
			</div>

			<div class="butonlar">
				<button class="btn btn-ghost b-tabu" on:click={() => sonuc('tabu')}>Tabu! (−1)</button>
				<button class="btn btn-ghost" on:click={() => sonuc('pas')} disabled={kalanPas <= 0}>Pas</button>
				<button class="btn btn-primary" on:click={() => sonuc('dogru')}>Doğru (+1)</button>
			</div>
		{:else if asama === 'ozet'}
			<div class="bracket-card">
				<span class="badge dev">Süre doldu · Tur {mevcutTur} / {turSayisi}</span>
				<h2 class="baslik">{takimAdlari[aktifTakim]}: {elPuani > 0 ? '+' : ''}{elPuani} puan</h2>
				<p class="soluk">{dogruSayisi} doğru · {tabuSayisi} tabu · {elKayitlari.length - dogruSayisi - tabuSayisi} pas</p>

				{#if elKayitlari.length > 0}
					<ul class="kayitlar">
						{#each elKayitlari as e}
							<li class="kayit {e.sonuc}">
								<span>{e.kelime}</span>
								<span class="etiket">{e.sonuc === 'dogru' ? 'Doğru' : e.sonuc === 'tabu' ? 'Tabu' : 'Pas'}</span>
							</li>
						{/each}
					</ul>
				{/if}

				<button class="btn btn-primary" on:click={sonrakiEl}>
					{sira + 1 >= toplamEl ? 'Sonucu gör' : `Sıradaki: ${takimAdlari[(sira + 1) % 2]}`}
				</button>
			</div>
		{:else if asama === 'final'}
			<div class="bracket-card ortala">
				<span class="badge live">Oyun bitti</span>
				<h2 class="baslik">
					{#if kazanan === -1}Berabere!{:else}Kazanan: {takimAdlari[kazanan]}{/if}
				</h2>
				<p class="soluk">{takimAdlari[0]} {skorlar[0]} – {skorlar[1]} {takimAdlari[1]}</p>
				<div class="alt-satir merkez">
					<button class="btn btn-primary" on:click={oyunuBaslat}>Aynı ayarlarla tekrar</button>
					<button class="btn btn-ghost" on:click={menuyeDon}>Ayarlara dön</button>
					<a href="/oyunlar" class="btn btn-ghost" style="text-decoration:none">Oyunlar</a>
				</div>
			</div>
		{/if}

		{#if asama !== 'final'}
			<div class="alt-satir sag">
				<button class="btn btn-ghost" on:click={menuyeDon}>Oyunu bırak</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.game-wrap {
		max-width: 760px;
		margin-bottom: 56px;
	}
	.takimlar,
	.ayar-grid {
		display: grid;
		gap: 12px;
		margin: 18px 0;
	}
	.takimlar {
		grid-template-columns: 1fr 1fr;
	}
	.ayar-grid {
		grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
	}
	.alan {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: var(--fs-xs);
		color: var(--text-muted);
	}
	.alan input,
	.alan select {
		background: var(--bg-alt);
		color: var(--text);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 9px 10px;
		font-family: inherit;
		font-size: var(--fs-sm);
	}
	.kurallar {
		font-size: var(--fs-sm);
		color: var(--text-muted);
		line-height: 1.6;
		margin: 6px 0 18px;
	}
	.alt-satir {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}
	.alt-satir.sag {
		justify-content: flex-end;
		margin-top: 18px;
	}
	.alt-satir.merkez {
		justify-content: center;
		margin-top: 18px;
	}
	.havuz {
		font-size: var(--fs-sm);
		color: var(--text-muted);
	}
	.uyari {
		color: var(--danger);
		font-size: var(--fs-sm);
		margin: 10px 0 0;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.skor-bar {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-bottom: 16px;
	}
	.skor {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		background: var(--surface);
		font-family: var(--font-display);
	}
	.skor.aktif {
		border-color: var(--accent);
		background: var(--accent-soft);
	}
	.skor-ad {
		font-size: var(--fs-sm);
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.skor-puan {
		font-size: var(--fs-xl);
		color: var(--accent);
		font-weight: 700;
	}

	.ortala {
		text-align: center;
	}
	.baslik {
		margin: 14px 0 8px;
		font-size: var(--fs-xl);
	}
	.soluk {
		color: var(--text-muted);
		line-height: 1.6;
		margin: 0 0 16px;
	}
	.soluk.kucuk {
		font-size: var(--fs-xs);
	}

	.zaman-satir {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		margin-bottom: 8px;
	}
	.zaman {
		font-family: var(--font-display);
		font-size: var(--fs-2xl);
		font-weight: 700;
		color: var(--accent);
		min-width: 90px;
	}
	.zaman.acil {
		color: var(--danger);
	}
	.bitir {
		margin-left: auto;
	}
	.cubuk {
		height: 6px;
		background: var(--bg-alt);
		border-radius: 99px;
		overflow: hidden;
		margin-bottom: 16px;
	}
	.cubuk-ic {
		height: 100%;
		background: var(--accent);
		transition: width 220ms linear;
	}
	.cubuk-ic.acil {
		background: var(--danger);
	}

	.tabu-kart {
		text-align: center;
		padding: 28px 20px;
	}
	.rozetler {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 8px;
	}
	.hedef {
		font-family: var(--font-display);
		font-size: clamp(1.8rem, 6vw, 2.9rem);
		color: var(--accent);
		margin: 10px 0 18px;
		word-break: break-word;
	}
	.yasak-baslik {
		font-size: var(--fs-xs);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--danger);
		margin-bottom: 10px;
	}
	.yasaklar {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
	}
	.yasaklar li {
		padding: 8px 14px;
		border-radius: var(--radius-sm);
		background: var(--danger-soft);
		border: 1px solid var(--danger);
		color: var(--text);
		font-weight: 600;
		font-size: var(--fs-md);
	}

	.butonlar {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 10px;
		margin-top: 16px;
	}
	.butonlar .btn {
		padding: 14px 10px;
		font-size: var(--fs-md);
		justify-content: center;
	}
	.b-tabu {
		border-color: var(--danger);
		color: var(--danger);
	}

	.kayitlar {
		list-style: none;
		padding: 0;
		margin: 0 0 18px;
		display: grid;
		gap: 6px;
		max-height: 300px;
		overflow-y: auto;
	}
	.kayit {
		display: flex;
		justify-content: space-between;
		padding: 8px 12px;
		border-radius: var(--radius-sm);
		background: var(--bg-alt);
		font-size: var(--fs-sm);
	}
	.kayit .etiket {
		font-weight: 600;
	}
	.kayit.dogru .etiket {
		color: var(--accent-3);
	}
	.kayit.tabu .etiket {
		color: var(--danger);
	}
	.kayit.pas .etiket {
		color: var(--text-faint);
	}

	@media (max-width: 520px) {
		.takimlar {
			grid-template-columns: 1fr;
		}
		.butonlar .btn {
			font-size: var(--fs-sm);
		}
	}
</style>
