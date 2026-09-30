<script>
	import Icon from '$lib/components/Icon.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { supabase } from '$lib/supabaseClient.js';
	import InterestPicker from '$lib/components/InterestPicker.svelte';

	let fullName = '';
	let sinif = '';
	let secilenIlgiler = [];
	let email = '';
	let password = '';
	let passwordAgain = '';
	let loading = false;
	let errorMsg = '';
	let doneStep = false; // kayıt tamamlandı, e-posta onayı bekleniyor
	let autoLoggedIn = false; // e-posta onayı kapalıysa direkt oturum açılmış olabilir

	const HATA_MESAJLARI = {
		'User already registered': 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.'
	};

	async function handleSubmit() {
		errorMsg = '';
		if (password !== passwordAgain) {
			errorMsg = 'Şifreler eşleşmiyor.';
			return;
		}
		if (password.length < 6) {
			errorMsg = 'Şifre en az 6 karakter olmalı.';
			return;
		}
		if (secilenIlgiler.length === 0) {
			errorMsg = 'Sana özel öneriler için en az bir ilgi alanı seç.';
			return;
		}

		loading = true;
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { full_name: fullName, class_name: sinif, interests: secilenIlgiler },
				// Onay linki localhost'a değil, sitenin kendi adresine dönsün
				emailRedirectTo: `${window.location.origin}/giris`
			}
		});
		loading = false;

		if (error) {
			errorMsg = HATA_MESAJLARI[error.message] || 'Kayıt olunamadı: ' + error.message;
			return;
		}

		// E-posta onayı açıkken, kayıtlı e-posta ile tekrar kayıt hata vermez;
		// bunun yerine identities boş döner. Kullanıcıyı boşuna mail beklemesin.
		if (data.user && data.user.identities && data.user.identities.length === 0) {
			errorMsg = HATA_MESAJLARI['User already registered'];
			return;
		}

		if (data.session) {
			// E-posta onayı kapalıysa doğrudan oturum açılmış olur
			autoLoggedIn = true;
		}
		doneStep = true;
	}
</script>

<svelte:head><title>Kayıt Ol · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader eyebrow="Hesap" title="Kayıt Ol" desc="Skor tablosuna katılmak ve ilerideki üye özelliklerinden yararlanmak için hesap oluştur." />

<div class="content-max" style="margin-bottom: 60px;">
	{#if doneStep}
		<div class="bracket-card" style="max-width: 420px; margin: 0 auto; text-align: center; padding: 36px 24px;">
			<div class="ico-tile lg" style="margin: 0 auto 14px;"><Icon name={autoLoggedIn ? 'check-circle' : 'mail'} size={28} /></div>
			{#if autoLoggedIn}
				<h2 style="margin-bottom: 8px;">Hesabın hazır!</h2>
				<p style="color: var(--text-muted); margin-bottom: 20px;">Artık giriş yaptın, skor tablosuna katılabilirsin.</p>
				<a href="/" class="btn btn-primary" style="text-decoration: none;">Ana Sayfaya Dön</a>
			{:else}
				<h2 style="margin-bottom: 8px;">E-postanı kontrol et</h2>
				<p style="color: var(--text-muted); margin-bottom: 6px;">
					<b>{email}</b> adresine bir doğrulama linki gönderdik. Linke tıkladıktan sonra giriş yapabilirsin.
				</p>
				<p style="color: var(--text-muted); font-size: var(--fs-sm); margin-bottom: 20px;">
					Mail gelmediyse birkaç dakika bekle ve <b>spam / gereksiz klasörünü</b> kontrol etmeyi unutma.
				</p>
				<a href="/giris" class="btn btn-primary" style="text-decoration: none;">Giriş sayfasına git</a>
			{/if}
		</div>
	{:else}
		<form class="bracket-card" style="max-width: 420px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px;" on:submit|preventDefault={handleSubmit}>
			<div>
				<label for="fullName" style="display: block; font-size: var(--fs-xs); color: var(--text-muted); margin-bottom: 6px;">Ad Soyad</label>
				<input id="fullName" type="text" bind:value={fullName} required autocomplete="name"
					style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-alt); color: var(--text);" />
			</div>
			<div>
				<label for="sinif" style="display: block; font-size: var(--fs-xs); color: var(--text-muted); margin-bottom: 6px;">Sınıf / şube <span style="opacity: 0.6;">(isteğe bağlı)</span></label>
				<input id="sinif" type="text" bind:value={sinif} placeholder="Örn. 10-A"
					style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-alt); color: var(--text);" />
			</div>
			<div>
				<InterestPicker bind:selected={secilenIlgiler} legend="Hangi bilim alanlarına yakınsın? (en az 1 seç)" />
				<p style="font-size: var(--fs-xs); color: var(--text-muted); margin: 8px 0 0;">Buna göre profilinde ve anasayfada "Sana Özel" öneriler göreceksin. Sonra profilinden değiştirebilirsin.</p>
			</div>
			<div>
				<label for="email" style="display: block; font-size: var(--fs-xs); color: var(--text-muted); margin-bottom: 6px;">E-posta</label>
				<input id="email" type="email" bind:value={email} required autocomplete="email"
					style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-alt); color: var(--text);" />
			</div>
			<div>
				<label for="password" style="display: block; font-size: var(--fs-xs); color: var(--text-muted); margin-bottom: 6px;">Şifre</label>
				<input id="password" type="password" bind:value={password} required autocomplete="new-password" minlength="6"
					style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-alt); color: var(--text);" />
			</div>
			<div>
				<label for="passwordAgain" style="display: block; font-size: var(--fs-xs); color: var(--text-muted); margin-bottom: 6px;">Şifre (tekrar)</label>
				<input id="passwordAgain" type="password" bind:value={passwordAgain} required autocomplete="new-password" minlength="6"
					style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-alt); color: var(--text);" />
			</div>

			{#if errorMsg}
				<p style="color: var(--danger); font-size: var(--fs-sm); margin: 0;">{errorMsg}</p>
			{/if}

			<p style="font-size: var(--fs-xs); color: var(--text-muted); margin: 0;">
				Kayıt olduktan sonra sana bir doğrulama e-postası gönderilecek — <b>spam / gereksiz klasörünü</b> kontrol etmeyi unutma.
			</p>

			<button class="btn btn-primary" type="submit" disabled={loading} style="justify-content: center;">
				{loading ? 'Kaydediliyor…' : 'Kayıt Ol'}
			</button>

			<p style="text-align: center; font-size: var(--fs-sm); color: var(--text-muted); margin: 4px 0 0;">
				Zaten hesabın var mı? <a href="/giris" style="color: var(--accent);">Giriş yap</a>
			</p>
		</form>
	{/if}
</div>
