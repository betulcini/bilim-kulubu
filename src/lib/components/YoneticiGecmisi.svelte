<script>
	import { onMount } from 'svelte';
	import { listAdminAudit } from '$lib/yonetim.js';

	let kayitlar = [];
	let yukleniyor = true;
	let hata = '';
	let dahaVar = false;

	onMount(yukle);

	async function yukle(devam = false) {
		yukleniyor = true;
		hata = '';
		const sonuc = await listAdminAudit(devam ? kayitlar.at(-1)?.id : null);
		yukleniyor = false;
		if (sonuc.hata) {
			hata = sonuc.hata;
			return;
		}
		kayitlar = devam ? [...kayitlar, ...sonuc.data] : sonuc.data;
		dahaVar = sonuc.data.length === 50;
	}

	function eylem(ad) {
		return { INSERT: 'oluşturdu', UPDATE: 'güncelledi', DELETE: 'sildi' }[ad] || ad;
	}

	function tur(ad) {
		return {
			duyurular: 'Duyuru',
			firsatlar: 'Fırsat',
			geziler: 'Gezi',
			videolar: 'Video',
			video_kartlari: 'Seri / tiyatro kartı',
			quiz_konulari: 'Quiz konusu',
			quiz_sorulari: 'Quiz sorusu',
			galeri: 'Galeri',
			oneriler: 'Öneri'
		}[ad] || ad;
	}
</script>

<section class="gecmis" aria-labelledby="gecmis-baslik">
	<div class="ust">
		<div>
			<h2 id="gecmis-baslik">Yönetici işlem geçmişi</h2>
			<p>İçerik değişikliklerinin kim tarafından ve ne zaman yapıldığını gösterir; içerik metinleri ve özel notlar burada saklanmaz.</p>
		</div>
		<button class="btn btn-ghost" type="button" disabled={yukleniyor} on:click={() => yukle()}>Yenile</button>
	</div>
	{#if hata}<p class="msg err" role="alert">{hata}</p>
	{:else if yukleniyor && kayitlar.length === 0}<p role="status">Geçmiş yükleniyor…</p>
	{:else if kayitlar.length === 0}<p class="muted">Henüz kayıtlı yönetici işlemi yok.</p>
	{:else}
		<ol class="liste">
			{#each kayitlar as kayit (kayit.id)}
				<li class="bracket-card oge">
					<div class="ozet">
						<strong>{tur(kayit.entity_type)} · {kayit.entity_label}</strong>
						<span>{kayit.actor_name || 'Hesap bilgisi yok'} ({kayit.actor_user_id?.slice(0, 8) || 'bilinmiyor'}) {eylem(kayit.action)}</span>
					</div>
					<time datetime={kayit.created_at}>{new Date(kayit.created_at).toLocaleString('tr-TR')}</time>
					{#if kayit.changed_fields?.length}<small>Değişen alanlar: {kayit.changed_fields.join(', ')}</small>{/if}
				</li>
			{/each}
		</ol>
		{#if dahaVar}
			<button class="btn btn-ghost" type="button" disabled={yukleniyor} on:click={() => yukle(true)}>{yukleniyor ? 'Yükleniyor…' : 'Daha fazla yükle'}</button>
		{/if}
	{/if}
</section>

<style>
	.gecmis { display: flex; flex-direction: column; gap: 14px; }
	.ust { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
	h2 { margin: 0; }
	.ust p, .muted { color: var(--text-muted); font-size: var(--fs-sm); }
	.ust p { margin: 5px 0 0; }
	.liste { display: grid; gap: 8px; list-style: none; padding: 0; margin: 0; }
	.oge { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 16px; }
	.ozet { display: flex; flex-direction: column; gap: 3px; }
	.ozet span, .oge time, .oge small { color: var(--text-muted); font-size: var(--fs-xs); }
	.oge small { grid-column: 1 / -1; }
	.msg.err { color: var(--danger); }
	@media (max-width: 620px) { .oge { grid-template-columns: minmax(0, 1fr); } }
</style>
