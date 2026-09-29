<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { theme } from '$lib/stores/theme.js';
	import { soundEnabled } from '$lib/stores/sound.js';
	import { profile } from '$lib/stores/profile.js';
	import { sfx } from '$lib/sound.js';
	import Icon from '$lib/components/Icon.svelte';

	const temalar = [
		{ id: 'dark', label: 'Koyu', icon: 'moon' },
		{ id: 'light', label: 'Aydınlık', icon: 'sun' },
		{ id: 'system', label: 'Sistem', icon: 'system' }
	];

	const roller = ['Üye', 'Kulüp yöneticisi', 'Danışman öğretmen'];
	const renkler = ['#4fd1c5', '#ffb454', '#8ea2ff', '#ff7b72', '#c084fc'];

	let form = { ...$profile };
	let kaydedildi = false;

	function setTheme(id) {
		theme.set(id);
		sfx.toggle();
	}

	function kaydet() {
		profile.save({ ...form });
		kaydedildi = true;
		sfx.success();
		setTimeout(() => (kaydedildi = false), 2400);
	}
</script>

<svelte:head><title>Ayarlar · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader eyebrow="Ayarlar" title="Platformu kendine göre ayarla" desc="Tema, ses ve profil tercihlerin bu cihazda saklanır." />

<div class="content-max settings-grid">
	<section class="bracket-card">
		<h2>Tema seç</h2>
		<p class="hint">Koyu tema varsayılandır; sistem seçeneği cihazının tercihini takip eder.</p>
		<div class="segmented">
			{#each temalar as t}
				<button class="seg-btn" class:active={$theme === t.id} on:click={() => setTheme(t.id)}>
					<Icon name={t.icon} size={17} />
					{t.label}
				</button>
			{/each}
		</div>
	</section>

	<section class="bracket-card">
		<h2>Ses ayarları</h2>
		<p class="hint">Gezinme, oyun ve form etkileşimlerinde kısa arayüz sesleri çalar.</p>
		<div class="sound-row">
			<button class="seg-btn wide" class:active={$soundEnabled} on:click={() => { soundEnabled.set(true); sfx.toggle(); }}>
				<Icon name="sound-on" size={17} /> Sesler açık
			</button>
			<button class="seg-btn wide" class:active={!$soundEnabled} on:click={() => soundEnabled.set(false)}>
				<Icon name="sound-off" size={17} /> Sesler kapalı
			</button>
		</div>
	</section>

	<section class="bracket-card profile-card">
		<h2>Profilim</h2>
		<p class="hint">Bu bilgiler yalnızca bu cihazda saklanır, kulüp yönetimiyle paylaşılmaz.</p>

		<form on:submit|preventDefault={kaydet}>
			<div class="profile-layout">
				<div class="avatar" style="background:{form.renk}22; color:{form.renk}; border-color:{form.renk}55">
					{form.isim ? form.isim.trim()[0]?.toUpperCase() : '?'}
				</div>
				<div class="profile-fields">
					<div class="field">
						<label for="p-isim">İsim</label>
						<input id="p-isim" type="text" bind:value={form.isim} placeholder="Adın Soyadın" />
					</div>
					<div class="field">
						<label for="p-sinif">Sınıf / şube</label>
						<input id="p-sinif" type="text" bind:value={form.sinif} placeholder="Örn. 10-A" />
					</div>
					<div class="field">
						<label for="p-rol">Kulüpteki rolün</label>
						<select id="p-rol" bind:value={form.rol}>
							{#each roller as r}
								<option value={r}>{r}</option>
							{/each}
						</select>
					</div>
					<div class="field">
						<label for="p-eposta">E-posta (isteğe bağlı)</label>
						<input id="p-eposta" type="email" bind:value={form.eposta} placeholder="ornek@okul.edu.tr" />
					</div>
					<div class="field">
						<span class="field-label">Profil rengi</span>
						<div class="swatches" role="group" aria-label="Profil rengi">
							{#each renkler as renk}
								<button
									type="button"
									class="swatch"
									class:active={form.renk === renk}
									style="background:{renk}"
									aria-label="Rengi seç"
									on:click={() => (form.renk = renk)}
								></button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<button class="btn btn-primary" type="submit">Profili kaydet</button>
			{#if kaydedildi}<p class="confirm">Profilin kaydedildi.</p>{/if}
		</form>
	</section>
</div>

<style>
	.settings-grid {
		display: grid;
		gap: 20px;
		max-width: 720px;
		margin-bottom: 56px;
	}
	.hint {
		color: var(--text-muted);
		font-size: var(--fs-sm);
	}
	.field-label {
    display: block;
    margin-bottom: 6px;
    font-size: var(--fs-xs);
    }

	.segmented,
	.sound-row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.seg-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-strong);
		background: var(--bg-alt);
		color: var(--text-muted);
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--fs-sm);
		cursor: pointer;
	}
	.seg-btn.wide {
		flex: 1;
		justify-content: center;
	}
	.seg-btn.active {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-soft);
	}

	.profile-layout {
		display: flex;
		gap: 20px;
		align-items: flex-start;
	}
	.avatar {
		flex: none;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		border: 1px solid;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display);
		font-size: var(--fs-xl);
		font-weight: 700;
	}
	.profile-fields {
		flex: 1;
		min-width: 0;
	}
	.swatches {
		display: flex;
		gap: 8px;
	}
	.swatch {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		border: 2px solid transparent;
		cursor: pointer;
		padding: 0;
	}
	.swatch.active {
		border-color: var(--text);
	}
	.confirm {
		color: var(--accent);
		font-size: var(--fs-sm);
		margin: 10px 0 0;
	}

	@media (max-width: 520px) {
		.profile-layout {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}
	}
</style>
