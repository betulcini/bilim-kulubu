<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { sfx } from '$lib/sound.js';

	const symbols = ['🧪', '🔬', '🧬', '⚛️', '🌡️', '🔋', '🪐', '💡'];

	function buildDeck() {
		const pairs = symbols.flatMap((s, i) => [
			{ id: i * 2, sembol: s },
			{ id: i * 2 + 1, sembol: s }
		]);
		for (let i = pairs.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[pairs[i], pairs[j]] = [pairs[j], pairs[i]];
		}
		return pairs;
	}

	let deck = buildDeck();
	let flipped = [];
	let matched = new Set();
	let moves = 0;
	let locked = false;

	$: won = matched.size === deck.length;

	function flip(idx) {
		if (locked || flipped.includes(idx) || matched.has(deck[idx].id)) return;
		sfx.click();
		flipped = [...flipped, idx];

		if (flipped.length === 2) {
			moves += 1;
			locked = true;
			const [a, b] = flipped;
			if (deck[a].sembol === deck[b].sembol) {
				setTimeout(() => {
					matched = new Set([...matched, deck[a].id, deck[b].id]);
					flipped = [];
					locked = false;
					sfx.success();
				}, 380);
			} else {
				setTimeout(() => {
					flipped = [];
					locked = false;
				}, 700);
			}
		}
	}

	function restart() {
		deck = buildDeck();
		flipped = [];
		matched = new Set();
		moves = 0;
		locked = false;
		sfx.toggle();
	}
</script>

<svelte:head><title>Hafıza Kartları · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader
	eyebrow="Oyunlar · Hafıza Kartları"
	title="Bilim sembollerini eşleştir"
	desc="Aynı sembole sahip iki kartı bul. Amaç, en az hamlede tüm çiftleri eşleştirmek."
/>

<div class="content-max game-wrap">
	<div class="hud">
		<span>Hamle: {moves}</span>
		<span>Eşleşen: {matched.size / 2} / {symbols.length}</span>
		<button class="btn btn-ghost" on:click={restart}>Yeniden başlat</button>
	</div>

	{#if won}
		<div class="bracket-card win-card">
			<span class="badge live">Tamamlandı</span>
			<h2>Tebrikler, tüm çiftleri {moves} hamlede buldun!</h2>
			<button class="btn btn-primary" on:click={restart}>Tekrar oyna</button>
		</div>
	{:else}
		<div class="board">
			{#each deck as card, idx (card.id)}
				<button
					class="tile"
					class:flipped={flipped.includes(idx) || matched.has(card.id)}
					class:matched={matched.has(card.id)}
					on:click={() => flip(idx)}
					aria-label="Kart {idx + 1}"
				>
					<span class="face front">?</span>
					<span class="face back">{card.sembol}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.game-wrap {
		max-width: 620px;
		margin-bottom: 56px;
	}
	.hud {
		display: flex;
		align-items: center;
		gap: 16px;
		font-family: var(--font-display);
		font-size: var(--fs-sm);
		color: var(--text-muted);
		margin-bottom: 18px;
		flex-wrap: wrap;
	}
	.hud .btn {
		margin-left: auto;
	}

	.board {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
	}
	.tile {
		position: relative;
		aspect-ratio: 1;
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
		font-size: clamp(1.4rem, 4vw, 1.8rem);
		border-radius: var(--radius-sm);
		backface-visibility: hidden;
		transition: transform var(--dur) var(--ease);
	}
	.front {
		background: var(--surface);
		color: var(--text-faint);
		font-family: var(--font-display);
	}
	.back {
		background: var(--accent-soft);
		transform: rotateY(180deg);
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
		margin: 12px 0 18px;
		font-size: var(--fs-lg);
	}

	@media (max-width: 480px) {
		.board {
			grid-template-columns: repeat(4, 1fr);
			gap: 8px;
		}
	}
</style>
