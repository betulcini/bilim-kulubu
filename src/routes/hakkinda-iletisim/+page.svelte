<script>
    import PageHeader from '$lib/components/PageHeader.svelte';
    import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head>
    <title>Hakkında ve İletişim · Bilim ve Teknoloji Kulübü</title>
</svelte:head>

<PageHeader
    eyebrow="Hakkında ve İletişim"
    title="Merak eden, üreten bir kulüp"
    desc="Bilim ve Teknoloji Kulübü; öğrenmeyi paylaşmak, birlikte üretmek ve bilimi okul yaşamının bir parçası hâline getirmek için çalışır."
/>

<div class="content-max about-wrap">
    <section class="bracket-card">
        <h2>Ne yapıyoruz?</h2>
        <p>
            Bilim serileri, sahne gösterileri, geziler, yarışmalar ve oyunlarla farklı ilgi alanlarını
            bir araya getiriyoruz. Etkinlikler ve yeni katılım duyuruları bu platformdan paylaşılır.
        </p>
    </section>

    <section class="contact-grid" aria-label="İletişim seçenekleri">
        <div class="bracket-card contact-card">
            <Icon name="suggestion" size={24} />
            <h2>Öneri gönder</h2>
            <p>Etkinlik, proje veya içerik fikrini doğrudan öneri kutusuna bırakabilirsin.</p>
            <a class="btn btn-primary" href="/oneri">Öneri kutusuna git</a>
        </div>
        <div class="bracket-card contact-card">
            <Icon name="mail" size={24} />
            <h2>E-posta ile ulaşın</h2>
            <p>Sorularınız ve kulüp hakkında bilgi almak için bize e-posta gönderebilirsiniz.</p>
            <a class="btn btn-primary" href="mailto:kadikoybilimteknoloji@gmail.com">kadikoybilimteknoloji@gmail.com</a>
        </div>
        <div class="bracket-card contact-card full-width">
            <Icon name="announce" size={24} />
            <h2>Katılım ve sorular</h2>
            <p>Katılım, toplantı saatleri ve okul içi iletişim için kulüp danışmanına, okul yönetimine veya yukarıdaki e-posta adresine başvurabilirsin.</p>
        </div>
    </section>
</div>

<style>
    .about-wrap { display: grid; gap: 20px; margin-bottom: 56px; }
    .contact-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
    .contact-card { display: flex; flex-direction: column; align-items: flex-start; }
    .contact-card.full-width { grid-column: 1 / -1; }
    .contact-card :global(svg) { color: var(--accent); margin-bottom: 14px; }
    .contact-card h2 { font-size: var(--fs-lg); }
    .contact-card p { color: var(--text-muted); }
    .contact-card .btn { margin-top: auto; text-decoration: none; }
    @media (max-width: 620px) { .contact-grid { grid-template-columns: 1fr; } }
</style>