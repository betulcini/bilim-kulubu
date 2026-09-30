<script>
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { install, promptInstall, dismissInstall } from '$lib/stores/install.js';
	import { sfx } from '$lib/sound.js';

	let waited = false;
	let steps = false;

	// Sayfa açılır açılmaz değil, kullanıcı biraz gezindikten sonra göster
	onMount(() => {
		const t = setTimeout(() => (waited = true), 7000);
		return () => clearTimeout(t);
	});

	$: visible = waited && $install.ready && $install.phone && !$install.installed && !$install.dismissed && ($install.canPrompt || $install.ios);

	async function add() {
		sfx.nav();
		if ($install.canPrompt) {
			const outcome = await promptInstall();
			if (outcome === 'dismissed') dismissInstall();
		} else {
			steps = !steps;
		}
	}

	function later() {
		sfx.nav();
		dismissInstall();
	}
</script>

{#if visible}
	<div class="install" role="dialog" aria-label="Uygulama olarak ekle">
		<div class="top">
			<img class="app-icon" src="/icon-192.png" alt="" width="44" height="44" />
			<div class="txt">
				<strong>Telefonuna ekle</strong>
				<p>Ana ekrandan tek dokunuşla aç, uygulama gibi tam ekran kullan.</p>
			</div>
			<button class="x" on:click={later} aria-label="Kapat"><Icon name="close" size={16} /></button>
		</div>

		{#if steps && $install.ios}
			<ol class="steps">
				<li><span class="s-ico"><Icon name="share" size={16} /></span> Safari'nin alt çubuğundaki <b>Paylaş</b> simgesine dokun</li>
				<li><span class="s-ico"><Icon name="add-square" size={16} /></span> <b>Ana Ekrana Ekle</b> seçeneğini seç</li>
				<li><span class="s-ico"><Icon name="check" size={16} /></span> Sağ üstteki <b>Ekle</b>'ye bas</li>
			</ol>
		{/if}

		<div class="actions">
			<button class="btn btn-primary" on:click={add}>
				<Icon name={$install.canPrompt ? 'download' : 'phone'} size={16} />
				{$install.canPrompt ? 'Ana ekrana ekle' : steps ? 'Adımları gizle' : 'Nasıl eklenir?'}
			</button>
			<button class="btn btn-ghost" on:click={later}>Şimdi değil</button>
		</div>
	</div>
{/if}

<style>
	.install {
		position: fixed;
		left: 12px;
		right: 12px;
		bottom: calc(12px + env(safe-area-inset-bottom, 0px));
		z-index: 60;
		max-width: 460px;
		margin-inline: auto;
		padding: 14px;
		border-radius: var(--radius-md);
		background: var(--surface-raised);
		border: 1px solid var(--border-strong);
		box-shadow: var(--shadow);
		animation: rise 320ms var(--ease);
	}
	.top {
		display: flex;
		gap: 12px;
		align-items: flex-start;
	}
	.app-icon {
		flex: none;
		border-radius: 12px;
	}
	.txt {
		flex: 1;
		min-width: 0;
	}
	.txt strong {
		font-family: var(--font-display);
		font-size: var(--fs-base);
		color: var(--text);
	}
	.txt p {
		margin: 2px 0 0;
		font-size: var(--fs-xs);
		color: var(--text-muted);
		line-height: 1.4;
	}
	.x {
		flex: none;
		display: inline-flex;
		padding: 6px;
		border-radius: 8px;
		border: 0;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
	}
	.steps {
		list-style: none;
		margin: 12px 0 0;
		padding: 10px 12px;
		display: grid;
		gap: 8px;
		border-radius: var(--radius-sm);
		background: var(--bg-alt);
		font-size: var(--fs-xs);
		color: var(--text-muted);
	}
	.steps li {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.s-ico {
		flex: none;
		display: inline-flex;
		padding: 6px;
		border-radius: 8px;
		background: var(--accent-soft);
		color: var(--accent);
	}
	.actions {
		display: flex;
		gap: 8px;
		margin-top: 12px;
	}
	.actions .btn {
		flex: 1;
		padding: 10px 12px;
		font-size: var(--fs-xs);
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.install {
			animation: none;
		}
	}
</style>
