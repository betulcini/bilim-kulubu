<script>
	import '../app.css';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import { theme } from '$lib/stores/theme.js';
	import { soundEnabled } from '$lib/stores/sound.js';
	import { sfx } from '$lib/sound.js';
	import { navItems } from '$lib/data/nav.js';
	import Icon from '$lib/components/Icon.svelte';
	import SearchDialog from '$lib/components/SearchDialog.svelte';
	import InstallPrompt from '$lib/components/InstallPrompt.svelte';
	import { initInstall } from '$lib/stores/install.js';
	import AmbientScience from '$lib/components/AmbientScience.svelte';
	import { user, authReady, initAuth, signOut } from '$lib/stores/auth.js';

	let mobileOpen = false;
	let isMobile = false;
	let menuButton;
	let drawer;
	let searchOpen = false;

	onMount(() => {
		theme.init();
		initAuth();
		initInstall();
		const media = window.matchMedia('(max-width: 900px)');
		const updateViewport = () => {
			isMobile = media.matches;
			if (!isMobile) mobileOpen = false;
		};
		updateViewport();
		media.addEventListener('change', updateViewport);
		return () => media.removeEventListener('change', updateViewport);
	});

	afterNavigate(() => {
		mobileOpen = false;
	});

	async function openMenu() {
		mobileOpen = true;
		await tick();
		drawer?.querySelector('a, button')?.focus();
	}

	function closeMenu(restoreFocus = false) {
		mobileOpen = false;
		if (restoreFocus) tick().then(() => menuButton?.focus());
	}

	function handleKeydown(event) {
		if (event.key === 'Escape' && mobileOpen) {
			event.preventDefault();
			closeMenu(true);
		}
	}

	function cycleTheme() {
		const order = ['dark', 'light', 'system'];
		const next = order[(order.indexOf($theme) + 1) % order.length];
		theme.set(next);
		sfx.toggle();
	}

	function toggleSound() {
		soundEnabled.toggle();
	}

	$: themeIcon = $theme === 'dark' ? 'moon' : $theme === 'light' ? 'sun' : 'system';
	$: themeLabel = $theme === 'dark' ? 'Koyu' : $theme === 'light' ? 'Aydınlık' : 'Sistem';
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="shell">
	<AmbientScience />
	<a class="skip-link" href="#icerik">İçeriğe geç</a>

	<!-- Mobil üst çubuk: başlık metni burada değil, çekmece içinde -->
	<div class="topbar">
		<button class="icon-btn menu-toggle" bind:this={menuButton} on:click={openMenu} aria-label="Menüyü aç" aria-expanded={mobileOpen} aria-controls="ana-menu">
			<Icon name="menu" />
		</button>
		<a class="topbar-brand" href="/" aria-label="Bilim ve Teknoloji Kulübü ana sayfa">
			<span class="brand-mark" aria-hidden="true"></span>
			<span>Bilim ve Teknoloji Kulübü</span>
		</a>
		<a class="home-button" href="/" aria-label="Ana sayfa" on:click={() => sfx.nav()}>
			<Icon name="home" />
		</a>
		<button class="search-trigger" on:click={() => (searchOpen = true)} aria-haspopup="dialog">
			<Icon name="search" />
			<span>Etkinlik, konu veya sayfa ara</span>
		</button>
		<button class="icon-btn" on:click={toggleSound} aria-label="Sesi aç/kapat">
			<Icon name={$soundEnabled ? 'sound-on' : 'sound-off'} />
		</button>
	</div>

	<!-- Kenar çubuğu (masaüstü) / çekmece (mobil) -->
	<aside id="ana-menu" class="sidebar" class:open={mobileOpen} bind:this={drawer} aria-label="Ana menü" aria-hidden={isMobile && !mobileOpen} inert={isMobile && !mobileOpen}>
		<div class="sidebar-head">
			<div class="brand">
				<span class="brand-dot"></span>
				<span>Bilim ve<br />Teknoloji Kulübü</span>
			</div>
			<button class="icon-btn only-mobile" on:click={() => closeMenu(true)} aria-label="Menüyü kapat">
				<Icon name="close" />
			</button>
		</div>

		<nav aria-label="Ana gezinme">
			<ul>
				{#each navItems as item}
					<li>
						{#if item.href === '/'}
							<a class="mobile-home" href={item.href} class:active={$page.url.pathname === item.href} on:click={() => sfx.nav()}>
								<Icon name={item.icon} />
								<span>{item.label}</span>
							</a>
						{:else}
							<a href={item.href} class:active={$page.url.pathname === item.href} on:click={() => sfx.nav()}>
								<Icon name={item.icon} />
								<span>{item.label}</span>
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>

		<div class="sidebar-foot">
			<div class="auth-box">
				{#if $authReady && $user}
					<a href="/profil" class="auth-user" on:click={() => sfx.nav()}>
						<span class="auth-avatar">{($user.full_name || $user.email || '?').charAt(0).toUpperCase()}</span>
						<span class="auth-name">{$user.full_name || $user.email}</span>
					</a>
					<button class="icon-btn" on:click={async () => { await signOut(); sfx.nav(); }} aria-label="Çıkış yap" title="Çıkış yap">
						<Icon name="close" size={16} />
					</button>
				{:else if $authReady}
					<a href="/giris" class="pill-btn" style="width: 100%; justify-content: center; text-decoration: none;" on:click={() => sfx.nav()}>
						<span>Giriş Yap</span>
					</a>
				{/if}
			</div>
			<button class="pill-btn theme-btn" on:click={cycleTheme} aria-label="{themeLabel} tema (değiştirmek için tıkla)" title="{themeLabel} tema">
				<Icon name={themeIcon} size={17} />
				<span class="theme-label">{themeLabel} tema</span>
			</button>
			<button class="pill-btn sound-pill" on:click={toggleSound}>
				<Icon name={$soundEnabled ? 'sound-on' : 'sound-off'} size={17} />
				<span>Ses {$soundEnabled ? 'açık' : 'kapalı'}</span>
			</button>
		</div>
	</aside>

	{#if mobileOpen}
		<button class="scrim" on:click={() => closeMenu(true)} aria-label="Menüyü kapat"></button>
	{/if}

	<main id="icerik">
		<slot />
		<footer class="site-footer">
			<div class="content-max">
				<p>Bilim ve Teknoloji Kulübü platformu · kulüp üyeleri tarafından geliştiriliyor.</p>
			</div>
		</footer>
	</main>
	<InstallPrompt />
	<SearchDialog bind:open={searchOpen} />
</div>

<style>
	.skip-link {
		position: absolute;
		left: -999px;
		top: 0;
		background: var(--accent);
		color: var(--accent-contrast);
		padding: 10px 16px;
		border-radius: 0 0 8px 0;
		z-index: 100;
		font-family: var(--font-display);
		font-weight: 600;
	}
	.skip-link:focus {
		left: 0;
	}

	.shell { min-height: 100%; position: relative; isolation: isolate; }

	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--fs-sm);
		line-height: 1.2;
	}
	.brand-dot {
		width: 11px;
		height: 11px;
		flex: none;
		border-radius: 3px;
		background: var(--accent);
	}

	.topbar {
		display: flex;
		position: sticky;
		top: 0;
		z-index: 30;
		align-items: center;
		justify-content: space-between;
		height: var(--topbar-h);
		padding: 0 14px;
		background: color-mix(in srgb, var(--bg) 88%, transparent);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--border);
	}
	.topbar-brand {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: var(--font-display);
		font-size: var(--fs-sm);
		font-weight: 600;
		text-decoration: none;
	}
	.brand-mark {
		position: relative;
		width: 28px;
		height: 28px;
		flex: none;
		border: 2px solid var(--accent);
		border-radius: 50%;
	}
	.brand-mark::before,
	.brand-mark::after {
		content: '';
		position: absolute;
		border-radius: 50%;
	}
	.brand-mark::before { inset: 6px; background: var(--accent); }
	.brand-mark::after { width: 6px; height: 6px; right: -4px; top: 1px; background: var(--accent-2); }
	.home-button,
	.search-trigger {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--surface);
		color: var(--text-muted);
		text-decoration: none;
		cursor: pointer;
	}
	.home-button {
		justify-content: center;
		width: 38px;
		height: 38px;
	}
	.search-trigger {
		width: clamp(220px, 27vw, 360px);
		height: 40px;
		padding: 0 15px;
		margin-left: auto;
		margin-right: 16px;
		font-size: var(--fs-sm);
		text-align: left;
	}
	.home-button:hover,
	.search-trigger:hover { border-color: var(--accent); color: var(--accent); }

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		border-radius: 10px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		cursor: pointer;
	}
	.icon-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.only-mobile {
		display: none;
	}

	.sidebar {
		position: sticky;
		top: 0;
		align-self: flex-start;
		width: var(--sidebar-w);
		height: 100vh;
		flex: none;
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--border);
		background: var(--bg-alt);
		padding: 22px 16px;
		gap: 18px;
		z-index: 1;
	}
	.sidebar-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 4px 8px;
	}

	nav {
		overflow-y: auto;
		flex: 1;
	}
	nav ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	nav a {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		border-radius: var(--radius-sm);
		text-decoration: none;
		color: var(--text-muted);
		font-size: var(--fs-sm);
		font-weight: 500;
		border: 1px solid transparent;
		transition: background var(--dur) var(--ease), color var(--dur) var(--ease);
	}
	nav a:hover {
		background: var(--surface);
		color: var(--text);
	}
	nav a.active {
		background: var(--accent-soft);
		color: var(--accent);
		border-color: color-mix(in srgb, var(--accent) 30%, transparent);
		font-weight: 600;
	}

	.sidebar-foot {
		display: flex;
		flex-direction: column;
		gap: 8px;
		border-top: 1px solid var(--border);
		padding-top: 14px;
	}
	.pill-btn {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 12px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-size: var(--fs-xs);
		font-family: var(--font-display);
		font-weight: 600;
		cursor: pointer;
		text-align: left;
	}
	.pill-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.auth-box {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.auth-user {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
		min-width: 0;
		padding: 6px 10px;
		border-radius: var(--radius-sm);
		text-decoration: none;
		color: var(--text);
	}
	.auth-user:hover {
		background: var(--surface-hover);
	}
	.auth-avatar {
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--accent);
		color: var(--bg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 13px;
	}
	.auth-name {
		font-size: var(--fs-xs);
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.scrim {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		border: none;
		z-index: 35;
		padding: 0;
	}

	main {
		flex: 1;
		min-width: 0;
		position: relative;
		z-index: 1;
	}

	.site-footer {
		margin-top: 60px;
		padding: 26px 0 40px;
		border-top: 1px solid var(--border);
	}
	.site-footer p {
		color: var(--text-faint);
		font-size: var(--fs-xs);
		margin: 0;
	}

	@media (max-width: 900px) {
		.topbar { gap: 10px; }
		.sidebar nav ul { gap: 9px; }
		.sidebar nav a { padding-block: 12px; }
		.sidebar-foot { gap: 10px; }
		.home-button { display: none; }
		.search-trigger {
			width: 38px;
			height: 38px;
			justify-content: center;
			padding: 0;
			margin: 0 0 0 auto;
		}
		.search-trigger span { display: none; }
		.only-mobile {
			display: inline-flex;
		}
		.sidebar {
			position: fixed;
			z-index: 40;
			top: 0;
			left: 0;
			height: 100dvh;
			transform: translateX(-100%);
			transition: transform var(--dur) var(--ease);
			box-shadow: var(--shadow);
		}
		.sidebar.open {
			transform: translateX(0);
		}
	}

	@media (min-width: 901px) {
		.menu-toggle { display: none; }
		.topbar {
			padding-inline: max(24px, calc((100vw - var(--content-max)) / 2));
		}
		.topbar-brand { order: 1; font-size: var(--fs-md); }
		.search-trigger { order: 2; }
		.home-button { order: 3; margin-right: 16px; }
		.icon-btn:not(.menu-toggle) { order: 4; }
		.sidebar {
			position: sticky;
			top: var(--topbar-h);
			z-index: 25;
			width: 100%;
			height: auto;
			padding: 4px max(24px, calc((100vw - var(--content-max)) / 2));
			flex-direction: row;
			align-items: center;
			gap: 10px;
			border-right: 0;
			border-bottom: 1px solid var(--border);
			background: color-mix(in srgb, var(--bg-alt) 92%, transparent);
			backdrop-filter: blur(10px);
		}
		.sidebar-head { display: none; }
		nav { min-width: 0; overflow-x: auto; overflow-y: hidden; }
		nav ul { flex-direction: row; width: max-content; gap: 4px; }
		nav a { gap: 7px; padding: 8px 10px; font-size: var(--fs-xs); white-space: nowrap; }
		.mobile-home { display: none; }
		nav a :global(svg) { width: 16px; height: 16px; }
		.sidebar-foot { flex: none; flex-direction: row; gap: 6px; padding: 0; border: 0; }
		.pill-btn { padding: 8px 10px; white-space: nowrap; }
		/* Masaüstünde ses düğmesi üst çubukta zaten var; tema düğmesi sadece ikon */
		.sound-pill { display: none; }
		.theme-label { display: none; }
		.theme-btn { padding: 8px 10px; }
	}
</style>
