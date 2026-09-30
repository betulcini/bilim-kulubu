<script>
    import { navItems } from '$lib/data/nav.js';
    import { announcements } from '$lib/data/announcements.js';
    import { trips } from '$lib/data/trips.js';
    import { opportunities } from '$lib/data/opportunities.js';
    import { scientists } from '$lib/data/scientists.js';
    import { sfx } from '$lib/sound.js';
    import Icon from '$lib/components/Icon.svelte';
    import SanaOzel from '$lib/components/SanaOzel.svelte';

    const renkler = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)'];

    const descriptions = {
        '/bilim-serileri': 'Kısa video serileriyle bilimi anlatan içerikler.',
        '/bilim-tiyatrosu': 'Sahnelenmesi planlanan bilim gösterileri ve skeçler.',
        '/kulup-gezileri': 'Müze, laboratuvar ve gözlemevi gezileri.',
        '/duyurular': 'Bilim ve teknoloji dünyasından gelişmeler.',
        '/firsatlar': 'Yarışma, kamp ve burs fırsatları.',
        '/galeri': 'Etkinliklerden fotoğraf ve anılar.',
        '/oneri': 'Kulüple ilgili öneri ve fikirlerini paylaş.',
        '/yarismalar': 'Kulübün düzenlediği Kahoot ve bilgi yarışmaları.',
        '/oyunlar': 'Bilim temalı mini oyunlar.',
        '/bilim-takvimi': 'Tutulmalar, uzay olayları ve TÜBİTAK yarışma tarihleri tek takvimde.',
        '/bilim-insanlari': 'Dünyayı değiştiren bilim insanlarının hayatları ve keşifleri.',
        '/hakkinda-iletisim': 'Kulüp hakkında bilgi ve bize ulaşmanın yolları.'
    };

    const quickLinks = navItems
        .filter((n) => n.href !== '/' && n.href !== '/ayarlar')
        .map((n) => ({ ...n, desc: descriptions[n.href] }));

    const yaklasanGezi = trips.find((t) => t.durum === 'planlanıyor');
    const yaklasanFirsat = opportunities[0];
    const sonDuyuru = announcements[0];

    const steps = [
        {
            title: 'Tanışma toplantısına katıl',
            desc: 'Öneri kutusundan mesaj bırak.'
        },
        {
            title: 'Bir alan seç',
            desc: 'Seriler, tiyatro, yarışmalar veya oyun geliştirme — ilgini çeken bölümde yer al.'
        },
        {
            title: 'Projelere dahil ol',
            desc: 'Haftalık toplantılara katılarak devam eden çalışmalara katkı sağlamaya başla.'
        }
    ];
</script>

<svelte:head>
    <title>Bilim ve Teknoloji Kulübü</title>
</svelte:head>

<section class="hero">
    <div class="hero-logo" aria-hidden="true"></div>

    <div class="content-max hero-inner">
        <h1>Kulübün tüm çalışmaları tek ekranda.</h1>
        <p class="lead">
            Bilim serilerinden tiyatro gösterilerine, kulüp gezilerinden yarışmalara kadar her şeyi
            burada takip et; öneride bulun, oyunlarla bilgini sına.
        </p>
    </div>
</section>

<div class="content-max">
    <div class="quick-grid">
        {#each quickLinks as item}
            <a href={item.href} class="bracket-card quick-card" on:click={() => sfx.nav()}>
                <div class="quick-icon"><Icon name={item.icon} size={22} /></div>
                <h3>{item.label}</h3>
                <p>{item.desc}</p>
            </a>
        {/each}
    </div>

    <SanaOzel compact />

    <section class="highlights">
        <h2>Bu ay öne çıkanlar</h2>
        <div class="card-grid">
            <div class="bracket-card highlight-card">
                <span class="badge live">Duyuru</span>
                <h3>{sonDuyuru.baslik}</h3>
                <p>{sonDuyuru.ozet}</p>
                <a class="text-link" href="/duyurular">Tüm duyurular</a>
            </div>
            {#if yaklasanGezi}
                <div class="bracket-card highlight-card">
                    <span class="badge info">Gezi</span>
                    <h3>{yaklasanGezi.yer}</h3>
                    <p>{yaklasanGezi.ozet}</p>
                    <a class="text-link" href="/kulup-gezileri">Tüm geziler</a>
                </div>
            {/if}
            <div class="bracket-card highlight-card">
                <span class="badge dev">Fırsat</span>
                <h3>{yaklasanFirsat.baslik}</h3>
                <p>{yaklasanFirsat.son}</p>
                <a class="text-link" href="/firsatlar">Tüm fırsatlar</a>
            </div>
        </div>
    </section>

    <section class="scientists">
        <h2>İlham veren bilim insanları</h2>
        <div class="card-grid">
            {#each scientists as s, i}
                <div class="bracket-card sci-card">
                    <div
                        class="sci-avatar"
                        style="background: color-mix(in srgb, {renkler[i % renkler.length]} 16%, transparent); color: {renkler[i % renkler.length]}"
                    >
                        {s.harfler}
                    </div>
                    <h3>{s.isim}</h3>
                    <p class="sci-alan">{s.alan}</p>
                    <p>{s.aciklama}</p>
                </div>
            {/each}
        </div>
    </section>

    <section class="steps-section">
        <h2>Kulübe nasıl katılırım?</h2>
        <ol class="steps">
            {#each steps as step, i}
                <li>
                    <span class="step-num">{i + 1}</span>
                    <div>
                        <h3>{step.title}</h3>
                        <p>{step.desc}</p>
                    </div>
                </li>
            {/each}
        </ol>
    </section>
</div>

<style>
    .hero {
        position: relative;
        overflow: hidden;
        padding: 54px 0 18px;
    }
    .hero-inner {
        position: relative;
        z-index: 1;
        max-width: var(--content-max);
    }
    .hero-inner h1,
    .hero-inner .lead {
        max-width: min(58ch, 100%);
    }
    .lead {
        color: var(--text-muted);
        font-size: var(--fs-md);
    }

    .quick-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr));
        gap: 16px;
        margin: 8px 0 48px;
    }
    .quick-card {
        text-decoration: none;
        color: var(--text);
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .quick-card h3 {
        font-size: var(--fs-md);
        margin: 0;
    }
    .quick-card p {
        color: var(--text-muted);
        font-size: var(--fs-sm);
        margin: 0;
    }
    .quick-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--accent-soft);
        color: var(--accent);
        margin-bottom: 4px;
    }

    .highlights {
        margin-bottom: 52px;
    }
    .highlight-card {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .highlight-card h3 {
        margin: 4px 0 0;
        font-size: var(--fs-md);
    }
    .highlight-card p {
        color: var(--text-muted);
        font-size: var(--fs-sm);
        margin: 0 0 6px;
    }
    .text-link {
        color: var(--accent);
        font-size: var(--fs-sm);
        font-weight: 600;
        text-decoration: none;
        margin-top: auto;
    }
    .text-link:hover {
        text-decoration: underline;
    }

    .scientists {
        margin-bottom: 52px;
    }
    .sci-card {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .sci-avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: var(--fs-sm);
        margin-bottom: 6px;
    }
    .sci-card h3 {
        margin: 0;
        font-size: var(--fs-md);
    }
    .sci-alan {
        margin: 0 0 4px;
        color: var(--text-faint);
        font-size: var(--fs-xs);
        font-family: var(--font-display);
    }
    .sci-card p:last-child {
        color: var(--text-muted);
        font-size: var(--fs-sm);
        margin: 0;
    }

    .steps-section {
        margin-bottom: 40px;
    }
    .steps {
        list-style: none;
        margin: 20px 0 0;
        padding: 0;
        display: grid;
        gap: 16px;
    }
    .steps li {
        display: flex;
        gap: 16px;
        align-items: flex-start;
    }
    .step-num {
        flex: none;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 1px solid var(--border-strong);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-display);
        font-weight: 700;
        color: var(--accent);
    }
    .steps h3 {
        margin: 0 0 2px;
        font-size: var(--fs-md);
    }
    .steps p {
        margin: 0;
        color: var(--text-muted);
        font-size: var(--fs-sm);
    }

    /* Okul logosu: tema rengine boyanır, sağda durur, kenarlara doğru solar */
    .hero-logo {
        position: absolute;
        right: max(24px, calc((100% - var(--content-max)) / 2 + 24px));
        top: 50%;
        transform: translateY(-50%);
        width: clamp(320px, 40vw, 480px);
        aspect-ratio: 1;
        background: var(--accent-3);
        opacity: 0.4;
        -webkit-mask: url('/okul-logo.svg') center / contain no-repeat;
        mask: url('/okul-logo.svg') center / contain no-repeat;
        pointer-events: none;
        z-index: 0;
    }
    :global([data-theme='light']) .hero-logo {
        background: var(--accent);
        opacity: 0.3;
    }

    @media (min-width: 901px) {
        .hero-inner h1,
        .hero-inner .lead { max-width: min(58ch, 58%); }
    }

    @media (max-width: 900px) {
        .hero { padding-top: 28px; }
        .hero-logo {
            right: -70px;
            width: 320px;
            opacity: 0.12;
        }
    }
</style>
