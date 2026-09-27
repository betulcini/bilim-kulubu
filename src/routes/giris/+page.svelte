<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { supabase } from '$lib/supabaseClient.js';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let loading = false;
	let errorMsg = '';

	const HATA_MESAJLARI = {
		'Invalid login credentials': 'E-posta veya şifre hatalı.',
		'Email not confirmed': 'E-postanı henüz doğrulamamışsın. Gelen kutunu (ve spam klasörünü) kontrol et.'
	};

	async function handleSubmit() {
		errorMsg = '';
		loading = true;
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		loading = false;
		if (error) {
			errorMsg = HATA_MESAJLARI[error.message] || 'Giriş yapılamadı: ' + error.message;
			return;
		}
		goto('/');
	}
</script>

<svelte:head><title>Giriş Yap · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader eyebrow="Hesap" title="Giriş Yap" desc="Skor tablosuna katılmak ve ilerideki üye özelliklerinden yararlanmak için giriş yap." />

<div class="content-max" style="margin-bottom: 60px;">
	<form class="bracket-card" style="max-width: 420px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px;" on:submit|preventDefault={handleSubmit}>
		<div>
			<label for="email" style="display: block; font-size: var(--fs-xs); color: var(--text-muted); margin-bottom: 6px;">E-posta</label>
			<input id="email" type="email" bind:value={email} required autocomplete="email"
				style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-alt); color: var(--text);" />
		</div>
		<div>
			<label for="password" style="display: block; font-size: var(--fs-xs); color: var(--text-muted); margin-bottom: 6px;">Şifre</label>
			<input id="password" type="password" bind:value={password} required autocomplete="current-password"
				style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-alt); color: var(--text);" />
		</div>

		{#if errorMsg}
			<p style="color: var(--danger); font-size: var(--fs-sm); margin: 0;">{errorMsg}</p>
		{/if}

		<button class="btn btn-primary" type="submit" disabled={loading} style="justify-content: center;">
			{loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
		</button>

		<p style="text-align: center; font-size: var(--fs-sm); color: var(--text-muted); margin: 4px 0 0;">
			Hesabın yok mu? <a href="/kayit" style="color: var(--accent);">Kayıt ol</a>
		</p>
	</form>
</div>
