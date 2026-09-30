<script>
	import Icon from '$lib/components/Icon.svelte';
	import { user } from '$lib/stores/auth.js';
	import { interestById } from '$lib/data/interests.js';
	import { scientists } from '$lib/data/bilim-insanlari.js';
	import { takvimOlaylari } from '$lib/data/bilim-takvimi.js';
	import { announcements } from '$lib/data/announcements.js';
	import { sfx } from '$lib/sound.js';

	// compact: anasayfada daha az öğe göstermek için
	export let compact = false;

	const OYUNLAR = [
		{ id: 'biyoloji-enerji', href: '/oyunlar/biyoloji-enerji', ad: 'Hücresel Solunum & Fotosentez', acik: 'Enerji akışını adım adım çöz.' },
		{ id: 'hafiza', href: '/oyunlar/hafiza', ad: 'Kart Eşleştirme', acik: 'Soru ve cevap kartlarını eşleştir.' },
		{ id: 'adam-asmaca', href: '/oyunlar/adam-asmaca', ad: 'Bilimsel Adam Asmaca', acik: 'Bilimsel terimleri harf harf bul.' },
		{ id: 'bilim-tabu', href: '/oyunlar/bilim-tabu', ad: 'Bilim Tabu', acik: 'Yasaklı kelimeler olmadan anlat.' }
	];
	const GENEL_TAKVIM = ['TÜBİTAK Yarışmaları', 'Festival'];

	const gunSayisi = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
	const bugun = new Date().toISOString().slice(0, 10);

	function tarihYaz(iso) {
		return new Date(iso + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
	}

	$: secilenler = ($user?.interests || []).map((id) => interestById[id]).filter(Boolean);
	$: adet = compact ? 3 : 6;

	// Her ilgi alanından sırayla bir bilim insanı seç (günlük döner, herkese aynı sıra)
	function bilimInsanlariSec(list, n) {
		const listeler = list.map((i) => {
			const havuz = scientists.filter((s) => s.kategori === i.sciKategori);
			return havuz.length ? [...havuz.slice(gunSayisi % havuz.length), ...havuz.slice(0, gunSayisi % havuz.length)] : [];
		});
		const sonuc = [];
		for (let tur = 0; sonuc.length < n && tur < 50; tur++) {
			for (const havuz of listeler) {
				const s = havuz[tur];
				if (s && !sonuc.some((x) => x.id === s.id) && sonuc.length < n) sonuc.push(s);
			}
			if (listeler.every((h) => tur >= h.length)) break;
		}
		return sonuc;
	}

	$: bilimInsanlari = bilimInsanlariSec(secilenler, adet);

	$: quizler = [...new Map(secilenler.map((i) => [i.quiz, { konu: i.quiz, ad: i.quizBaslik }])).values()].slice(0, compact ? 3 : 6);

	$: takvimIlgili = new Set(secilenler.flatMap((i) => i.takvim));
	$: olaylar = takvimOlaylari
		.filter((e) => (e.bitis || e.baslangic) >= bugun)
		.filter((e) => takvimIlgili.has(e.kategori) || GENEL_TAKVIM.includes(e.kategori))
		.sort((a, b) => Number(!takvimIlgili.has(a.kategori)) - Number(!takvimIlgili.has(b.kategori)) || a.baslangic.localeCompare(b.baslangic))
		.slice(0, compact ? 2 : 4)
		.sort((a, b) => a.baslangic.localeCompare(b.baslangic));

	$: etiketler = new Set(secilenler.flatMap((i) => i.etiketler));
	$: duyurular = announcements.filter((a) => etiketler.has(a.etiket)).slice(0, compact ? 1 : 3);

	$: oyunlar = (() => {
		const liste = [];
		if (secilenler.some((i) => i.id === 'biyoloji')) liste.push(OYUNLAR[0]);
		const digerleri = OYUNLAR.slice(1);
		for (let k = 0; liste.length < 2 && k < digerleri.length; k++) {
			liste.push(digerleri[(gunSayisi + k) % digerleri.length]);
		}
		return liste;
	})();
</script>

{#if $user}
	<section class="sana-ozel" aria-labelledby="sana-ozel-baslik">
		<div class="head">
			<h2 id="sana-ozel-baslik">Sana Özel</h2>
			{#if secilenler.length > 0}
				<ul class="chips" aria-label="Seçtiğin ilgi alanları">
					{#each secilenler as i}
						<li class="badge live"><Icon name={i.emoji} size={14} /> {i.label}</li>
					{/each}
				</ul>
			{/if}
		</div>

		{#if secilenler.length === 0}
			<div class="bracket-card empty">
				<p>Sana özel öneriler için hangi bilim alanlarına yakın olduğunu seç.</p>
				<a class="btn btn-primary" href="/profil" on:click={() => sfx.nav()}>İlgi alanlarını seç</a>
			</div>
		{:else}
			<div class="grid">
				<div class="bracket-card block">
					<h3>İlham veren bilim insanları</h3>
					<ul class="list">
						{#each bilimInsanlari as s}
							<li>
								<a href="/bilim-insanlari" on:click={() => sfx.nav()}>
									<span class="emo" aria-hidden="true"><Icon name={s.rozet} size={18} /></span>
									<span class="txt"><b>{s.ad}</b><small>{s.alan}</small></span>
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<div class="bracket-card block">
					<h3>Bilgini sına</h3>
					<ul class="list">
						{#each quizler as q}
							<li>
								<a href="/yarismalar/quiz?konu={q.konu}" on:click={() => sfx.nav()}>
									<span class="emo" aria-hidden="true"><Icon name="target" size={18} /></span>
									<span class="txt"><b>{q.ad}</b><small>8 soru, 20 saniye sınırı</small></span>
								</a>
							</li>
						{/each}
					</ul>
				</div>

				{#if olaylar.length > 0}
					<div class="bracket-card block">
						<h3>Yaklaşan tarihler</h3>
						<ul class="list">
							{#each olaylar as e}
								<li>
									<a href="/bilim-takvimi" on:click={() => sfx.nav()}>
										<span class="emo" aria-hidden="true"><Icon name="calendar" size={18} /></span>
										<span class="txt"><b>{e.baslik}</b><small>{tarihYaz(e.baslangic)}{e.bitis && e.bitis !== e.baslangic ? ' – ' + tarihYaz(e.bitis) : ''}</small></span>
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<div class="bracket-card block">
					<h3>Oynamaya ne dersin?</h3>
					<ul class="list">
						{#each oyunlar as o}
							<li>
								<a href={o.href} on:click={() => sfx.nav()}>
									<span class="emo" aria-hidden="true"><Icon name="games" size={18} /></span>
									<span class="txt"><b>{o.ad}</b><small>{o.acik}</small></span>
								</a>
							</li>
						{/each}
					</ul>
				</div>

				{#if duyurular.length > 0}
					<div class="bracket-card block">
						<h3>Senin alanından haberler</h3>
						<ul class="list">
							{#each duyurular as d}
								<li>
									<a href="/duyurular" on:click={() => sfx.nav()}>
										<span class="emo" aria-hidden="true"><Icon name="news" size={18} /></span>
										<span class="txt"><b>{d.baslik}</b><small>{d.etiket} · {d.tarih}</small></span>
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}
	</section>
{/if}

<style>
	.sana-ozel {
		margin-bottom: 52px;
	}
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
		margin-bottom: 16px;
	}
	.head h2 {
		margin: 0;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
		gap: 16px;
	}
	.block h3 {
		margin: 0 0 10px;
		font-size: var(--fs-md);
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.list a {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px;
		border-radius: var(--radius-sm);
		color: var(--text);
		text-decoration: none;
	}
	.list a:hover {
		background: var(--surface-hover);
	}
	.emo {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: 10px;
		background: var(--accent-soft);
		color: var(--accent);
	}
	.txt {
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow-wrap: anywhere;
		line-height: 1.35;
	}
	.txt b {
		font-size: var(--fs-sm);
	}
	.txt small {
		color: var(--text-muted);
		font-size: var(--fs-xs);
	}
	.empty {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.empty p {
		margin: 0;
		color: var(--text-muted);
		font-size: var(--fs-sm);
	}
	.empty a {
		text-decoration: none;
	}
</style>
