<script>
	import { page } from '$app/stores';
	import PageHeader from '$lib/components/PageHeader.svelte';

	$: kod = $page.status;
	$: baslik = kod === 404 ? 'Sayfa bulunamadı' : 'Bir şeyler ters gitti';
	$: aciklama =
		kod === 404
			? 'Aradığın sayfa taşınmış, kaldırılmış olabilir ya da hiç var olmadı.'
			: ($page.error && $page.error.message) || 'Beklenmeyen bir hata oluştu, lütfen daha sonra tekrar dene.';
</script>

<svelte:head><title>{kod} · Bilim ve Teknoloji Kulübü</title></svelte:head>

<PageHeader eyebrow={`Hata ${kod}`} title={baslik} desc={aciklama} />

<div class="content-max" style="margin-bottom: 60px;">
	<div class="bracket-card" style="max-width: 560px; margin: 0 auto; text-align: center; padding: 40px 24px;">
		<div style="font-size: 3.5rem; margin-bottom: 14px;">🧭</div>
		<p style="color: var(--text-muted); margin-bottom: 24px;">
			Merak etme, kulübün geri kalanı yerinde duruyor. Aşağıdaki linklerden birine göz atabilirsin.
		</p>
		<div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
			<a href="/" class="btn btn-primary" style="text-decoration: none;">Ana Sayfaya Dön</a>
			<a href="/bilim-insanlari" class="btn btn-ghost" style="text-decoration: none;">Bilim İnsanları Galerisi</a>
			<a href="/yarismalar" class="btn btn-ghost" style="text-decoration: none;">Yarışmalar</a>
		</div>
	</div>
</div>
