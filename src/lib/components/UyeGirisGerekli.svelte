<script>
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { user, authReady } from '$lib/stores/auth.js';
	import { safeReturnPath } from '$lib/returnTo.js';
	$: sonraki = safeReturnPath(`${$page.url.pathname}${browser ? $page.url.search : ''}`);
</script>

{#if !$authReady}
	<div class="content-max durum" role="status">Üyelik durumu kontrol ediliyor…</div>
{:else if !$user}
	<section class="content-max erisim" aria-labelledby="uyelik-gerekli-baslik">
		<div class="bracket-card mesaj">
			<span class="badge info">Üyelere özel</span>
			<h2 id="uyelik-gerekli-baslik">Katılmak için üye girişi gerekli</h2>
			<p>Yarışmalara katılmak ve oyun oynamak için hesabına giriş yap veya ücretsiz üye ol.</p>
			<div class="eylemler">
				<a class="btn btn-primary" href="/kayit?next={encodeURIComponent(sonraki)}">Ücretsiz üye ol</a>
				<a class="btn btn-ghost" href="/giris?next={encodeURIComponent(sonraki)}">Giriş yap</a>
			</div>
		</div>
	</section>
{:else}
	<slot />
{/if}

<style>
	.erisim { margin-bottom: 56px; }
	.mesaj { max-width: 700px; margin: 30px auto; }
	.mesaj h2 { margin: 14px 0 8px; }
	.mesaj p, .durum { color: var(--text-muted); }
	.eylemler { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
	.eylemler a { text-decoration: none; }
</style>
