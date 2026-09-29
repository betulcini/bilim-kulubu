<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { sfx } from '$lib/sound.js';
	import { activity } from '$lib/stores/activity.js';
	import { cardPairs, bolumler } from '$lib/data/kart-eslestirme.js';
	activity.mark('games', 'hafiza');


	const PAIR_COUNT = 6;
	const PUAN = { Kolay: 10, Orta: 15, Zor: 25 };

	let selectedBolum = 'Karışık';
	let pool = cardPairs;
	let deck = [];
	let flipped = [];
	let matched = new Set();
	let moves = 0;
	let score = 0;
	let locked = false;
	let lastMatchInfo = null;
	let infoTimeout;

	function shuffle(arr) {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	function buildDeck() {
		pool = selectedBolum === 'Karışık' ? cardPairs : cardPairs.filter((p) => p.bolum === selectedBolum);
		const secilenler = shuffle(pool).slice(0, Math.min(PAIR_COUNT, pool.length));
		const kartlar = secilenler.flatMap((p) => [
			{ key: p.id + '-a', pairId: p.id, metin: p.cardA, taraf: 'A', pair: p },
			{ key: p.id + '-b', pairId: p.id, metin: p.cardB, taraf: 'B', pair: p }
		]);
		deck = shuffle(kartlar);
		flipped = [];
		matched = new Set();
		moves = 0;
		score = 0;
		locked = false;
		lastMatchInfo = null;
	}

	buildDeck();

	$: won = deck.length > 0 && matched.size === deck.length;
	$: toplamCift = deck.length / 2;

	function handleBolumChange() {
		sfx.toggle();
		buildDeck();
	}

	function flip(idx) {
		if (locked || flipped.includes(idx) || matched.has(deck[idx].key)) return;
		sfx.click();
		flipped = [...flipped, idx];

		if (flipped.length === 2) {
			moves += 1;
			locked = true;
			const [a, b] = flipped;
			const kartA = deck[a];
			const kartB = deck[b];

			if (kartA.pairId === kartB.pairId && kartA.taraf !== kartB.taraf) {
				const zorluk = kartA.pair.zorluk;
				score += PUAN[zorluk] || 10;
				clearTimeout(infoTimeout);
				setTimeout(() => {
					matched = new Set([...matched, kartA.key, kartB.key]);
					flipped = [];
					locked = false;
					sfx.success();
					lastMatchInfo = kartA.pair;
					infoTimeout = setTimeout(() => (lastMatchInfo = null), 4500);
				}, 420);
			} else {
				setTimeout(() => {
					flipped = [];
					locked = false;
				}, 800);
			}
		}
	}

	function restart() {
		sfx.toggle();
		buildDeck();
	}
</script>

<svelte:head>
	<title>Kart Eşleştirme · Bilim ve Teknoloji Kulübü</title>
	<meta name="description" content="Fizik, kimya, biyoloji ve daha fazlasından soru-cevap kartlarını eşleştir, öğrenirken puan topla." />
</svelte:head>

<PageHeader
	eyebrow="Oyunlar · Kart Eşleştirme"
	title="Soruyu cevabıyla eşleştir"
	desc="Bir soru veya tepkime kartını, doğru cevap/ürün kartıyla eşleştir. Konu seç, kartları çevir, öğren!"
/>

<div class="content-max game-wrap">
	<div class="hud">
		<label class="bolum-select">
			<span>Konu:</span>
			<select bind:value={selectedBolum} on:change={handleBolumChange}>
				<option value="Karışık">Karışık (Tüm Konular)</option>
				{#each bolumler as b}
					<option value={b}>{b}</option>
				{/each}
			</select>
		</label>
		<span>Hamle: {moves}</span>
		<span>Eşleşen: {matched.size / 2} / {toplamCift}</span>
		<span class="badge live">Puan: {score}</span>
		<button class="btn btn-ghost" on:click={restart}>Yeniden başlat</button>
	</div>

	{#if won}
		<div class="bracket-card win-card">
			<span class="badge live">Tamamlandı</span>
			<h2>Tebrikler, tüm çiftleri {moves} hamlede buldun!</h2>
			<p style="color: var(--text-muted); margin: 0 0 18px;">Toplam puan: <b style="color: var(--accent);">{score}</b></p>
			<button class="btn btn-primary" on:click={restart}>Tekrar oyna</button>
		</div>
	{:else}
		{#if lastMatchInfo}
			<div class="bracket-card info-banner">
				<span class="badge dev">{lastMatchInfo.bolum} · {lastMatchInfo.zorluk}</span>
				<p>{lastMatchInfo.aciklama}</p>
			</div>
		{/if}

		<div class="board">
			{#each deck as card, idx (card.key)}
				<button
					class="tile"
					class:flipped={flipped.includes(idx) || matched.has(card.key)}
					class:matched={matched.has(card.key)}
					on:click={() => flip(idx)}
					aria-label="Kart {idx + 1}"
				>
					<span class="face front">?</span>
					<span class="face back">{card.metin}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.game-wrap {
		max-width: 760px;
		margin-bottom: 56px;
	}
	.hud {
		display: flex;
		align-items: center;
		gap: 14px;
		font-family: var(--font-display);
		font-size: var(--fs-sm);
		color: var(--text-muted);
		margin-bottom: 18px;
		flex-wrap: wrap;
	}
	.hud .btn {
		margin-left: auto;
	}
	.bolum-select {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.bolum-select select {
		background: var(--bg-alt);
		color: var(--text);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 6px 10px;
		font-family: inherit;
		font-size: var(--fs-xs);
		max-width: 220px;
	}

	.info-banner {
		margin-bottom: 16px;
		padding: 14px 18px;
		border-left: 3px solid var(--accent);
	}
	.info-banner p {
		margin: 6px 0 0;
		font-size: var(--fs-sm);
		color: var(--text-muted);
		line-height: 1.5;
	}

	.board {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
	}
	.tile {
		position: relative;
		min-height: 110px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-strong);
		background: var(--bg-alt);
		cursor: pointer;
		perspective: 600px;
		padding: 0;
	}
	.face {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 8px;
		border-radius: var(--radius-sm);
		backface-visibility: hidden;
		transition: transform var(--dur) var(--ease);
		overflow: hidden;
	}
	.front {
		background: var(--surface);
		color: var(--text-faint);
		font-family: var(--font-display);
		font-size: clamp(1.4rem, 4vw, 1.8rem);
	}
	.back {
		background: var(--accent-soft);
		transform: rotateY(180deg);
		font-size: clamp(0.68rem, 2.1vw, 0.85rem);
		font-weight: 600;
		line-height: 1.3;
		word-break: break-word;
	}
	.tile:not(.flipped) .front {
		transform: rotateY(0deg);
	}
	.tile:not(.flipped) .back {
		transform: rotateY(180deg);
	}
	.tile.flipped .front {
		transform: rotateY(-180deg);
	}
	.tile.flipped .back {
		transform: rotateY(0deg);
	}
	.tile.matched {
		border-color: var(--accent);
		opacity: 0.75;
	}

	.win-card {
		text-align: left;
	}
	.win-card h2 {
		margin: 12px 0 6px;
		font-size: var(--fs-lg);
	}

	@media (max-width: 640px) {
		.board {
			grid-template-columns: repeat(3, 1fr);
		}
		.tile {
			min-height: 96px;
		}
	}
	@media (max-width: 400px) {
		.board {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
