<script>
	import { exportContentBackup, CONTENT_BACKUP_FORMAT, CONTENT_BACKUP_VERSION, restoreContentBackup } from '$lib/contentBackup.js';

	let calisiyor = false;
	let hata = '';
	let bilgi = '';
	let dosyaSecici;

	async function disariAktar() {
		if (calisiyor) return;
		calisiyor = true;
		hata = '';
		bilgi = '';
		const sonuc = await exportContentBackup();
		calisiyor = false;
		if (sonuc.error) {
			hata = sonuc.error;
			return;
		}
		const blob = new Blob([JSON.stringify(sonuc.backup, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `bilim-kulubu-icerik-${new Date().toISOString().slice(0, 10)}.json`;
		link.hidden = true;
		document.body.append(link);
		link.click();
		link.remove();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
		bilgi = 'İçerik yedeği indirildi.';
	}

	async function iceAktar(event) {
		const file = event.currentTarget.files?.[0];
		event.currentTarget.value = '';
		if (!file) return;
		if (file.size > 10 * 1024 * 1024) {
			hata = 'Yedek dosyası 10 MB sınırını aşamaz.';
			return;
		}
		if (calisiyor) return;
		calisiyor = true;
		hata = '';
		bilgi = '';
		try {
			const backup = JSON.parse(await file.text());
			if (backup?.format !== CONTENT_BACKUP_FORMAT || backup?.version !== CONTENT_BACKUP_VERSION) {
				hata = 'Bu dosya tanınan bir içerik yedeği değil veya sürümü desteklenmiyor.';
				return;
			}
			const sonuc = await restoreContentBackup(backup);
			if (sonuc.error) {
				hata = `Geri yükleme kısmen tamamlanmış olabilir (${sonuc.restored} kayıt eklendi). ${sonuc.error}`;
				return;
			}
			bilgi = `Geri yükleme tamamlandı: ${sonuc.restored} yeni kayıt eklendi, ${sonuc.skipped} yinelenen kayıt atlandı. Geri yüklenen içerikler yayından kapalı olarak eklendi; istediğin kayıtları yönetim listelerinden yayınlayabilirsin.`;
		} catch (error) {
			hata = error instanceof SyntaxError ? 'Dosya geçerli JSON biçiminde değil.' : `Dosya okunamadı: ${error.message}`;
		} finally {
			calisiyor = false;
		}
	}
</script>

<section class="yedek bracket-card" aria-labelledby="yedek-baslik">
	<div>
		<h2 id="yedek-baslik">İçerik yedeği</h2>
		<p>Yönetilebilir duyuru, fırsat, gezi, video, seri/tiyatro kartı ve quiz içeriğini JSON olarak indir veya geri yükle. Kullanıcı, yönetici ve öneri verileri yedeğe dahil edilmez.</p>
	</div>
	<div class="eylemler">
		<button class="btn btn-primary" type="button" disabled={calisiyor} on:click={disariAktar}>{calisiyor ? 'İşleniyor…' : 'JSON yedeği indir'}</button>
		<button class="btn btn-ghost" type="button" disabled={calisiyor} on:click={() => dosyaSecici?.click()}>{calisiyor ? 'İşleniyor…' : 'Yedekten geri yükle'}</button>
		<input bind:this={dosyaSecici} class="sr-only" type="file" accept="application/json,.json" aria-label="Geri yüklenecek JSON yedeğini seç" on:change={iceAktar} />
	</div>
	<p class="uyari">Geri yükleme mevcut kayıtların üzerine yazmaz, yinelenen içeriği atlar ve tüm yeni kayıtları yayından kapalı olarak ekler. İstediğin kayıtları listeden düzenleyip yayınlayabilirsin.</p>
	{#if hata}<p class="msg err" role="alert">{hata}</p>{/if}
	{#if bilgi}<p class="msg ok" role="status">{bilgi}</p>{/if}
</section>

<style>
	.yedek { display: flex; flex-direction: column; gap: 14px; }
	.yedek h2 { margin: 0; }
	.yedek p { color: var(--text-muted); font-size: var(--fs-sm); }
	.eylemler { display: flex; flex-wrap: wrap; gap: 10px; }
	.uyari { padding-top: 12px; border-top: 1px solid var(--border); }
	.msg.err { color: var(--danger); }
</style>
