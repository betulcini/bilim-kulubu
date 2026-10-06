<script>
	import { onMount } from 'svelte';
	import { tick } from 'svelte';
	import { listMembers } from '$lib/yonetim.js';

	const SAYFA_BOYUTU = 50;
	let uyeler = [];
	let yazdirilanUyeler = [];
	let yukleniyor = false;
	let dahaFazlaVar = true;
	let hata = '';
	let bilgi = '';
	let yazdirma = false;

	async function dahaFazlaYukle() {
		if (yukleniyor) return;
		yukleniyor = true;
		hata = '';
		const sonuc = await listMembers(uyeler.length, SAYFA_BOYUTU);
		yukleniyor = false;
		if (sonuc.hata) {
			hata = sonuc.hata;
			return;
		}
		uyeler = [...uyeler, ...sonuc.data];
		dahaFazlaVar = sonuc.data.length === SAYFA_BOYUTU;
	}

	async function tumUyeleriGetir() {
		while (true) {
			const sonuc = await listMembers(uyeler.length, 500);
			if (sonuc.hata) {
				throw new Error(sonuc.hata);
			}
			uyeler = [...uyeler, ...sonuc.data];
			dahaFazlaVar = sonuc.data.length === 500;
			if (sonuc.data.length < 500) break;
		}
	}

	function csvHucre(value) {
		const text = String(value ?? '').replace(/^[\s\u0000-\u001f]*[=+\-@]/, "'$&");
		return `"${text.replace(/"/g, '""')}"`;
	}

	async function excelIndir() {
		if (yukleniyor) return;
		yukleniyor = true;
		hata = '';
		bilgi = '';
		try {
			await tumUyeleriGetir();
			const rows = [
				['Ad-soyad', 'Sınıf'],
				...uyeler.map((uye) => [uye.full_name, uye.class_name])
			];
			const csv = '\uFEFF' + rows.map((row) => row.map(csvHucre).join(';')).join('\r\n');
			const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
			const link = document.createElement('a');
			link.href = url;
			link.download = `bilim-kulubu-uyeler-${new Date().toISOString().slice(0, 10)}.csv`;
			link.click();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
			bilgi = `${uyeler.length.toLocaleString('tr-TR')} üye Excel uyumlu CSV dosyası olarak indirildi.`;
		} catch (error) {
			hata = error.message;
		} finally {
			yukleniyor = false;
		}
	}

	async function pdfYazdir() {
		if (yukleniyor) return;
		yukleniyor = true;
		hata = '';
		bilgi = '';
		try {
			await tumUyeleriGetir();
			yazdirilanUyeler = uyeler;
			yazdirma = true;
			await tick();
			window.print();
			yazdirma = false;
			bilgi = 'Yazdır penceresinde PDF olarak kaydedebilir veya yazdırabilirsin.';
		} catch (error) {
			yazdirma = false;
			hata = error.message;
		} finally {
			yukleniyor = false;
		}
	}

	onMount(dahaFazlaYukle);
</script>

<section class="uye-listesi" aria-labelledby="uye-listesi-baslik">
	{#if yazdirma}
		<div class="yazdir-alani">
			<h1>Bilim ve Teknoloji Kulübü — Üye Listesi</h1>
			<p>Toplam {yazdirilanUyeler.length.toLocaleString('tr-TR')} üye · {new Date().toLocaleDateString('tr-TR')}</p>
			<table>
				<thead><tr><th>Ad-soyad</th><th>Sınıf</th></tr></thead>
				<tbody>
					{#each yazdirilanUyeler as uye, i (`${i}-${uye.full_name}`)}
						<tr><td>{uye.full_name || '—'}</td><td>{uye.class_name || '—'}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="ust">
			<div>
				<h2 id="uye-listesi-baslik">Üye listesi</h2>
				<p>Yalnızca ad-soyad ve sınıf bilgileri gösterilir. E-posta adresleri listeye veya dışa aktarılan dosyalara eklenmez.</p>
			</div>
			<div class="eylemler">
				<button class="btn btn-ghost" type="button" disabled={yukleniyor} on:click={excelIndir}>Excel uyumlu CSV indir</button>
				<button class="btn btn-primary" type="button" disabled={yukleniyor || uyeler.length === 0} on:click={pdfYazdir}>PDF olarak kaydet / yazdır</button>
			</div>
		</div>
		{#if hata}<p class="msg err" role="alert">{hata}</p>{/if}
		{#if bilgi}<p class="msg ok" role="status">{bilgi}</p>{/if}
		<p class="adet">{uyeler.length.toLocaleString('tr-TR')} üye yüklendi</p>
		<div class="tablo-kapsayici">
			<table>
				<thead><tr><th>Ad-soyad</th><th>Sınıf</th></tr></thead>
				<tbody>
					{#each uyeler as uye, i (`${i}-${uye.full_name}`)}
						<tr><td>{uye.full_name || '—'}</td><td>{uye.class_name || '—'}</td></tr>
					{/each}
				</tbody>
			</table>
			{#if uyeler.length === 0 && !yukleniyor}
				<p class="bos">Henüz üye bulunmuyor.</p>
			{/if}
		</div>
		{#if yukleniyor}
			<p class="muted" role="status">Üyeler yükleniyor…</p>
		{:else if dahaFazlaVar}
			<button class="btn btn-ghost" type="button" on:click={dahaFazlaYukle}>Daha fazla yükle</button>
		{/if}
	{/if}
</section>

<style>
	.uye-listesi { display: flex; flex-direction: column; gap: 14px; }
	.ust { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
	h2 { margin: 0; }
	.ust p, .muted, .adet { color: var(--text-muted); font-size: var(--fs-sm); }
	.ust p { margin: 5px 0 0; max-width: 620px; }
	.eylemler { display: flex; flex-wrap: wrap; gap: 8px; }
	.tablo-kapsayici { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-md); }
	table { width: 100%; border-collapse: collapse; }
	th, td { text-align: left; padding: 11px 15px; border-bottom: 1px solid var(--border); }
	th { color: var(--text-faint); font-size: var(--fs-xs); }
	tr:last-child td { border-bottom: 0; }
	.adet { margin: 0; }
	.bos { padding: 18px; color: var(--text-muted); }
	.msg.err { color: var(--danger); }
	.msg.ok { color: var(--accent); }
	.yazdir-alani { color: #111; background: white; }
	.yazdir-alani h1 { font-size: 20px; }
	.yazdir-alani p { margin-bottom: 16px; }
	@media print {
		:global(body *) { visibility: hidden !important; }
		.yazdir-alani, .yazdir-alani * { visibility: visible !important; }
		.yazdir-alani { position: absolute; inset: 0; width: 100%; }
		.yazdir-alani table { font-size: 11pt; }
		.yazdir-alani th, .yazdir-alani td { border: 1px solid #999; }
	}
</style>
