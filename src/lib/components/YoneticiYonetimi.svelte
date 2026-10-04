<script>
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/auth.js';
	import { addManager, listManagers, removeManager } from '$lib/yonetim.js';
	import { sfx } from '$lib/sound.js';

	let yoneticiler = [];
	let email = '';
	let yukleniyor = true;
	let listeYuklendi = false;
	let kaydediyor = false;
	let hata = '';
	let bilgi = '';

	onMount(yukle);

	async function yukle() {
		yukleniyor = true;
		const sonuc = await listManagers();
		yukleniyor = false;
		if (sonuc.hata) {
			hata = sonuc.hata;
			return;
		}
		yoneticiler = sonuc.data;
		listeYuklendi = true;
	}

	async function ekle(e) {
		e.preventDefault();
		if (kaydediyor) return;
		hata = '';
		bilgi = '';
		const adres = email.trim();
		if (!adres) {
			hata = 'E-posta adresi girin.';
			return;
		}
		kaydediyor = true;
		const sonuc = await addManager(adres);
		kaydediyor = false;
		if (sonuc.hata) {
			hata = sonuc.hata;
			sfx.error();
			return;
		}
		email = '';
		bilgi = 'Kullanıcı yönetici olarak eklendi.';
		sfx.success();
		await yukle();
	}

	async function kaldir(yonetici) {
		if (!confirm(`${yonetici.email} yöneticilikten kaldırılsın mı?`)) return;
		hata = '';
		bilgi = '';
		const sonuc = await removeManager(yonetici.user_id);
		if (sonuc.hata) {
			hata = sonuc.hata;
			sfx.error();
			return;
		}
		bilgi = 'Yönetici erişimi kaldırıldı.';
		sfx.toggle();
		await yukle();
	}
</script>

<section class="yoneticiler">
	<div class="bracket-card form">
		<h2>Yönetici ekle</h2>
		<p>Yalnızca kayıtlı bir hesabın e-posta adresi eklenebilir. Bu işlemi mevcut yöneticiler yapabilir.</p>
		<form on:submit={ekle}>
			<label for="yonetici-email">Hesap e-posta adresi</label>
			<div class="ekle-satir">
				<input id="yonetici-email" type="email" autocomplete="email" bind:value={email} required />
				<button class="btn btn-primary" type="submit" disabled={kaydediyor}>{kaydediyor ? 'Ekleniyor…' : 'Yönetici ekle'}</button>
			</div>
		</form>
		{#if hata}<p class="msg err" role="alert">{hata}</p>{/if}
		{#if bilgi}<p class="msg ok" role="status">{bilgi}</p>{/if}
	</div>

	<section aria-label="Mevcut yöneticiler">
		<h2 class="liste-baslik">Mevcut yöneticiler</h2>
		{#if yukleniyor}
			<p class="muted" role="status">Yükleniyor…</p>
		{:else if !listeYuklendi}
			<p class="muted">Yönetici listesi yüklenemedi.</p>
		{:else if yoneticiler.length === 0}
			<p class="bracket-card bos">Yönetici bulunamadı.</p>
		{:else}
			<ul class="liste">
				{#each yoneticiler as yonetici (yonetici.user_id)}
					<li class="bracket-card oge">
						<div class="oge-ust">
							<div>
								<strong>{yonetici.email}</strong>
								<small>Eklenme: {new Date(yonetici.created_at).toLocaleDateString('tr-TR')}</small>
							</div>
							{#if yonetici.user_id !== $user?.id}
								<button class="btn btn-ghost mini" type="button" on:click={() => kaldir(yonetici)}>Yöneticiliği kaldır</button>
							{:else}
								<span class="badge live">Siz</span>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</section>

<style>
	.yoneticiler { display: flex; flex-direction: column; gap: 24px; }
	.form { display: flex; flex-direction: column; gap: 12px; max-width: 760px; }
	.form h2, .form p { margin: 0; }
	.form p { color: var(--text-muted); font-size: var(--fs-sm); }
	.form form { display: flex; flex-direction: column; gap: 8px; }
	.form label { font-size: var(--fs-sm); font-weight: 600; }
	.ekle-satir { display: flex; gap: 10px; flex-wrap: wrap; }
	.ekle-satir input { flex: 1 1 260px; min-width: 0; }
	.msg { font-size: var(--fs-sm); }
	.msg.ok { color: var(--accent); }
	.msg.err { color: var(--danger); }
	.liste-baslik { font-size: var(--fs-lg); margin: 0 0 12px; }
	.liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; max-width: 760px; }
	.oge-ust { display: flex; justify-content: space-between; gap: 10px; align-items: center; }
	.oge-ust div { display: flex; flex-direction: column; gap: 4px; min-width: 0; overflow-wrap: anywhere; }
	.oge-ust small, .muted { color: var(--text-muted); font-size: var(--fs-xs); }
	.mini { padding: 7px 12px; font-size: var(--fs-xs); }
	.bos { padding: 18px; }
	@media (max-width: 520px) { .oge-ust { align-items: flex-start; flex-direction: column; } }
</style>
