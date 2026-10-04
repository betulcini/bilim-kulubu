<script>
	import { onMount } from 'svelte';
	import { LISTE_SAYFA_BOYUTU, listRows } from '$lib/yonetim.js';

	const kaynaklar = [
		{ tablo: 'duyurular', ad: 'Duyuru', gerekli: ['baslik', 'etiket', 'tarih', 'ozet'], baglantilar: ['link'] },
		{ tablo: 'firsatlar', ad: 'Fırsat', gerekli: ['baslik', 'durum', 'ozet'], baglantilar: ['link', 'kaynak'], sonTarih: true },
		{ tablo: 'geziler', ad: 'Gezi', gerekli: ['yer', 'durum', 'ozet'], baglantilar: ['link'] },
		{ tablo: 'videolar', ad: 'Video', gerekli: ['bolum', 'baslik'], baglantilar: [] },
		{ tablo: 'kartlar', ad: 'Seri / tiyatro kartı', gerekli: ['bolum', 'baslik', 'aciklama'], baglantilar: [] },
		{ tablo: 'quizler', ad: 'Quiz sorusu', gerekli: ['konu', 'soru', 'dogru'], baglantilar: [] },
		{ tablo: 'galeri', ad: 'Galeri kaydı', gerekli: ['baslik', 'gorsel_yolu'], baglantilar: [] }
	];
	const alanAdlari = {
		baslik: 'başlık',
		etiket: 'etiket',
		tarih: 'tarih',
		ozet: 'özet',
		durum: 'durum',
		yer: 'yer',
		bolum: 'bölüm',
		aciklama: 'açıklama',
		konu: 'konu',
		soru: 'soru',
		dogru: 'doğru yanıt',
		gorsel_yolu: 'görsel'
	};

	let bulgular = [];
	let taraniyor = true;
	let hata = '';
	let taranan = 0;

	onMount(tara);

	async function tumKayitlari(tablo) {
		const sonuc = [];
		for (let sayfa = 0; ; sayfa += 1) {
			const response = await listRows(tablo, sayfa);
			if (response.hata) throw new Error(response.hata);
			sonuc.push(...response.data);
			if (response.data.length < LISTE_SAYFA_BOYUTU) return sonuc;
		}
	}

	function baglantiHatasi(value) {
		try {
			const url = new URL(value);
			return !['http:', 'https:'].includes(url.protocol);
		} catch {
			return true;
		}
	}

	function bugun() {
		const date = new Date();
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	}

	async function tara() {
		taraniyor = true;
		hata = '';
		bulgular = [];
		taranan = 0;
		try {
			const results = await Promise.all(kaynaklar.map(async (kaynak) => ({
				kaynak,
				kayitlar: await tumKayitlari(kaynak.tablo)
			})));
			const yeniBulgular = [];
			for (const { kaynak, kayitlar } of results) {
				const seenLinks = new Map();
				for (const row of kayitlar) {
					taranan += 1;
					const baslik = row.baslik || row.yer || row.soru || `Kayıt #${row.id ?? row.slug ?? ''}`;
					for (const alan of kaynak.gerekli) {
						if (row[alan] === null || row[alan] === undefined || row[alan] === '') {
							yeniBulgular.push({ tip: 'Eksik bilgi', kaynak: kaynak.ad, baslik, alan: alanAdlari[alan] || alan, link: null, id: row.id });
						}
					}
					if (kaynak.sonTarih && row.aktif && row.son_tarih && row.son_tarih < bugun()) {
						yeniBulgular.push({ tip: 'Süresi geçmiş fırsat', kaynak: kaynak.ad, baslik, alan: `Son tarih: ${row.son_tarih}`, link: row.link || row.kaynak, id: row.id });
					}
					if (row.yayindan_kaldir && new Date(row.yayindan_kaldir) <= new Date() && row.aktif) {
						yeniBulgular.push({ tip: 'Yayın penceresi sona ermiş', kaynak: kaynak.ad, baslik, alan: 'İçerik etkin görünüyor ancak kaldırma zamanı geçmiş.', link: null, id: row.id });
					}
					for (const alan of kaynak.baglantilar) {
						const value = row[alan];
						if (!value) continue;
						if (baglantiHatasi(value)) {
							yeniBulgular.push({ tip: 'Geçersiz bağlantı biçimi', kaynak: kaynak.ad, baslik, alan: `${alanAdlari[alan] || alan}: ${value}`, link: null, id: row.id });
						} else if (seenLinks.has(value) && seenLinks.get(value) !== row.id) {
							yeniBulgular.push({ tip: 'Yinelenen bağlantı', kaynak: kaynak.ad, baslik, alan: 'Aynı bağlantı başka bir kayıtta da kullanılıyor.', link: value, id: row.id });
						} else {
							seenLinks.set(value, row.id);
						}
					}
				}
			}
			bulgular = yeniBulgular;
		} catch (error) {
			hata = `İçerik taraması tamamlanamadı: ${error.message}`;
		} finally {
			taraniyor = false;
		}
	}
</script>

<section class="kalite" aria-labelledby="kalite-baslik">
	<div class="ust">
		<div>
			<h2 id="kalite-baslik">İçerik kalite kontrolü</h2>
			<p>{taranan} kayıt tarandı. Zorunlu alan, hatalı/yinelenen bağlantı ve geçmiş son başvuru tarihi kontrol edilir.</p>
		</div>
		<button class="btn btn-ghost" type="button" disabled={taraniyor} on:click={tara}>{taraniyor ? 'Taranıyor…' : 'Yeniden tara'}</button>
	</div>
	<p class="ipucu">Uzak sitelerden HTTP durum kodu tarayıcı güvenlik kısıtları nedeniyle güvenilir biçimde okunamaz. Kaynak bağlantılarını açıp erişilebilirliğini kontrol et.</p>
	{#if hata}<p class="msg err" role="alert">{hata}</p>
	{:else if taraniyor}<p role="status">İçerikler taranıyor…</p>
	{:else if bulgular.length === 0}<p class="temiz bracket-card" role="status">Kontrol edilen alanlarda sorun bulunmadı.</p>
	{:else}
		<p class="ozet">{bulgular.length} kontrol bulgusu</p>
		<ul>
			{#each bulgular as bulgu, i (`${bulgu.kaynak}-${bulgu.id}-${bulgu.tip}-${i}`)}
				<li class="bracket-card bulgu">
					<div>
						<span class="badge {bulgu.tip === 'Eksik bilgi' || bulgu.tip === 'Geçersiz bağlantı biçimi' ? 'danger' : 'dev'}">{bulgu.tip}</span>
						<strong>{bulgu.kaynak}: {bulgu.baslik}</strong>
						<p>{bulgu.alan}</p>
					</div>
					{#if bulgu.link}<a href={bulgu.link} target="_blank" rel="noopener noreferrer">Bağlantıyı aç</a>{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.kalite { display: flex; flex-direction: column; gap: 12px; }
	.ust { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
	h2 { margin: 0; }
	.ust p, .ipucu, .ozet { margin: 5px 0 0; color: var(--text-muted); font-size: var(--fs-sm); }
	.ipucu { padding: 10px 12px; border-left: 3px solid var(--accent); background: var(--bg-alt); }
	.temiz { padding: 16px; }
	ul { display: grid; gap: 8px; list-style: none; margin: 0; padding: 0; }
	.bulgu { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
	.bulgu > div { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; min-width: 0; }
	.bulgu p { width: 100%; margin: 0; color: var(--text-muted); font-size: var(--fs-xs); overflow-wrap: anywhere; }
	.bulgu a { flex: 0 0 auto; font-size: var(--fs-xs); }
	.msg.err { color: var(--danger); }
	@media (max-width: 600px) { .ust, .bulgu { flex-direction: column; align-items: stretch; } }
</style>
