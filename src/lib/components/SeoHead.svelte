<script>
	import { page } from '$app/stores';
	import { SITE_URL } from '$lib/site.js';
	import { defaultSeo, seoByPath } from '$lib/data/seo.js';

	$: yol = $page.url.pathname.replace(/\/+$/, '') || '/';
	$: bilgi = seoByPath[yol] || (yol.startsWith('/oyunlar/') ? seoByPath['/oyunlar'] : yol.startsWith('/yarismalar/') ? seoByPath['/yarismalar'] : null);
	$: baslik = bilgi ? `${bilgi.title} · ${defaultSeo.title}` : defaultSeo.title;
	$: aciklama = bilgi ? bilgi.desc : defaultSeo.desc;
	$: resim = `${SITE_URL}/og-image.png`;
</script>

<svelte:head>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={defaultSeo.title} />
	<meta property="og:locale" content="tr_TR" />
	<meta property="og:title" content={baslik} />
	<meta property="og:description" content={aciklama} />
	<meta property="og:image" content={resim} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Bilim ve Teknoloji Kulübü" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={baslik} />
	<meta name="twitter:description" content={aciklama} />
	<meta name="twitter:image" content={resim} />
	{#if SITE_URL}
		<meta property="og:url" content={SITE_URL + (yol === '/' ? '' : yol)} />
		<link rel="canonical" href={SITE_URL + (yol === '/' ? '' : yol)} />
	{/if}
</svelte:head>
