<script>
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { user, authReady, signOut } from '$lib/stores/auth.js';
	import { goto } from '$app/navigation';

	$: if ($authReady && !$user) {
		goto('/giris');
	}

	async function handleSignOut() {
		await signOut();
		goto('/');
	}
</script>

<svelte:head><title>Profilim · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader eyebrow="Hesap" title="Profilim" desc="Hesap bilgilerin." />

<div class="content-max" style="margin-bottom: 60px;">
	{#if $user}
		<div class="bracket-card" style="max-width: 480px; margin: 0 auto;">
			<div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
				<span style="width: 48px; height: 48px; border-radius: 50%; background: var(--accent); color: var(--bg); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 1.2rem;">
					{($user.full_name || $user.email).charAt(0).toUpperCase()}
				</span>
				<div>
					<h3 style="margin: 0;">{$user.full_name || 'İsimsiz Üye'}</h3>
					<span style="font-size: var(--fs-xs); color: var(--text-muted);">{$user.email}</span>
				</div>
			</div>

			{#if $user.class_name}
				<p style="font-size: var(--fs-sm); color: var(--text-muted); margin-bottom: 20px;">Sınıf / şube: <b style="color: var(--text);">{$user.class_name}</b></p>
			{/if}

			<div class="bracket-card" style="background: var(--bg-alt); margin-bottom: 20px;">
				<p style="margin: 0; font-size: var(--fs-sm); color: var(--text-muted);">
					🚧 Profil düzenleme, rozetler ve "Sana Özel" bölümü yakında eklenecek.
				</p>
			</div>

			<button class="btn btn-ghost" on:click={handleSignOut}>Çıkış Yap</button>
		</div>
	{/if}
</div>
