<script>
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/auth.js';
	import { addManagerWithAccess, listManagers, removeManager, updateManagerAccess, YONETICI_BOLUMLERI } from '$lib/yonetim.js';
	import { sfx } from '$lib/sound.js';

	let yoneticiler = [];
	let email = '';
	let rol = 'sinirli';
	let bolumler = ['duyurular'];
	let yukleniyor = true;
	let listeYuklendi = false;
	let kaydediyor = false;
	let guncellenenId = null;
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
		yoneticiler = sonuc.data.map((yonetici) => ({
			...yonetici,
			duzenlenenRol: yonetici.rol,
			duzenlenenBolumler: [...(yonetici.bolumler || [])]
		}));
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
		if (rol === 'sinirli' && bolumler.length === 0) {
			hata = 'Sınırlı yetkili yönetici için en az bir bölüm seçin.';
			return;
		}
		kaydediyor = true;
		const sonuc = await addManagerWithAccess(adres, rol, bolumler);
		kaydediyor = false;
		if (sonuc.hata) {
			hata = sonuc.hata;
			sfx.error();
			return;
		}
		email = '';
		bilgi = 'Yönetici rolü kaydedildi.';
		sfx.success();
		await yukle();
	}

	async function yetkiKaydet(yonetici) {
		if (kaydediyor || guncellenenId) return;
		if (yonetici.duzenlenenRol === 'sinirli' && yonetici.duzenlenenBolumler.length === 0) {
			hata = 'Sınırlı yetkili yönetici için en az bir bölüm seçin.';
			return;
		}
		kaydediyor = true;
		guncellenenId = yonetici.user_id;
		hata = '';
		bilgi = '';
		const sonuc = await updateManagerAccess(
			yonetici.user_id,
			yonetici.duzenlenenRol,
			yonetici.duzenlenenBolumler
		);
		kaydediyor = false;
		guncellenenId = null;
		if (sonuc.hata) {
			hata = sonuc.hata;
			sfx.error();
			return;
		}
		bilgi = `${yonetici.email} için yönetici yetkileri güncellendi.`;
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
		<p>Yalnızca tam yetkili yöneticiler başka yöneticileri ekleyebilir ve yetkilerini değiştirebilir.</p>
		<form on:submit={ekle}>
			<label for="yonetici-email">Hesap e-posta adresi</label>
			<div class="ekle-satir">
				<input id="yonetici-email" type="email" autocomplete="email" bind:value={email} required />
				<label class="rol-sec">Yetki türü
					<select bind:value={rol}>
						<option value="sinirli">Seçili bölümler</option>
						<option value="tam">Tam yetki</option>
					</select>
				</label>
			</div>
			{#if rol === 'sinirli'}
				<fieldset class="bolum-secimleri">
					<legend>Erişebileceği bölümler</legend>
					{#each YONETICI_BOLUMLERI as bolum}
						<label><input type="checkbox" value={bolum.id} bind:group={bolumler} /> {bolum.label}</label>
					{/each}
				</fieldset>
			{/if}
			<button class="btn btn-primary" type="submit" disabled={kaydediyor}>{kaydediyor ? 'Ekleniyor…' : 'Yönetici ekle'}</button>
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
								<small>{yonetici.rol === 'tam' ? 'Tam yetki' : `Seçili bölümler: ${YONETICI_BOLUMLERI.filter((bolum) => yonetici.bolumler.includes(bolum.id)).map((bolum) => bolum.label).join(', ')}`}</small>
								<small>Eklenme: {new Date(yonetici.created_at).toLocaleDateString('tr-TR')}</small>
							</div>
							{#if yonetici.user_id !== $user?.id}
								<span class="oge-eylemler">
									<button class="btn btn-ghost mini" type="button" on:click={() => kaldir(yonetici)}>Yöneticiliği kaldır</button>
								</span>
							{:else}
								<span class="badge live">Siz</span>
							{/if}
						</div>
						{#if yonetici.user_id !== $user?.id}
							<div class="yetki-editor">
								<label>Yetki türü
									<select bind:value={yonetici.duzenlenenRol}>
										<option value="sinirli">Seçili bölümler</option>
										<option value="tam">Tam yetki</option>
									</select>
								</label>
								{#if yonetici.duzenlenenRol === 'sinirli'}
									<fieldset class="bolum-secimleri">
										<legend>Erişebileceği bölümler</legend>
										{#each YONETICI_BOLUMLERI as bolum}
											<label><input type="checkbox" value={bolum.id} bind:group={yonetici.duzenlenenBolumler} /> {bolum.label}</label>
										{/each}
									</fieldset>
								{/if}
								<button class="btn btn-primary mini" type="button" disabled={kaydediyor} on:click={() => yetkiKaydet(yonetici)}>{guncellenenId === yonetici.user_id ? 'Kaydediliyor…' : 'Yetkileri kaydet'}</button>
							</div>
						{/if}
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
	.rol-sec, .yetki-editor > label { display: flex; flex-direction: column; gap: 5px; }
	.bolum-secimleri { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 8px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px; }
	.bolum-secimleri legend { padding: 0 6px; color: var(--text-muted); font-size: var(--fs-xs); }
	.bolum-secimleri label { display: flex; gap: 7px; align-items: center; font-weight: 400; font-size: var(--fs-xs); }
	.bolum-secimleri input { accent-color: var(--accent); }
	.msg { font-size: var(--fs-sm); }
	.msg.ok { color: var(--accent); }
	.msg.err { color: var(--danger); }
	.liste-baslik { font-size: var(--fs-lg); margin: 0 0 12px; }
	.liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; max-width: 760px; }
	.oge-ust { display: flex; justify-content: space-between; gap: 10px; align-items: center; }
	.oge-ust div { display: flex; flex-direction: column; gap: 4px; min-width: 0; overflow-wrap: anywhere; }
	.oge-ust small, .muted { color: var(--text-muted); font-size: var(--fs-xs); }
	.oge-eylemler { display: flex; gap: 8px; flex-wrap: wrap; }
	.yetki-editor { display: grid; gap: 12px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); }
	.mini { padding: 7px 12px; font-size: var(--fs-xs); }
	.bos { padding: 18px; }
	@media (max-width: 520px) { .oge-ust { align-items: flex-start; flex-direction: column; } }
</style>
