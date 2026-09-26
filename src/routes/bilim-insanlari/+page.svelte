<script>
    import PageHeader from '$lib/components/PageHeader.svelte';
    import { sfx } from '$lib/sound.js';

    let searchQuery = '';
    let selectedCategory = 'Tümü';

    const categories = ['Tümü', 'Fizik', 'Biyoloji & Tıp', 'Mühendislik & Buluş', 'Kimya'];

    const scientists = [
        {
            id: 'tesla',
            ad: 'Nikola Tesla',
            alan: 'Fizik & Mühendislik',
            kategori: 'Fizik',
            donem: '1856 - 1943',
            rozet: '⚡',
            ozet: 'Alternatif akım (AC) elektrik sistemlerinin tasarımı ve kablosuz enerji iletimi öncüsü.',
            detay: 'Tesla, elektrik enerjisinin üretim ve dağıtımında devrim yaratan Alternatif Akım (AC) sistemini geliştirmiştir. Radyo, uzaktan kumanda ve X-ışını teknolojilerine de öncülük eden pek çok patente sahiptir.',
            soz: 'Gelecek başkalarına ait, ama uğruna çalıştığım gelecek bana ait.'
        },
        {
            id: 'feynman',
            ad: 'Richard Feynman',
            alan: 'Teorik Fizik',
            kategori: 'Fizik',
            donem: '1918 - 1988',
            rozet: '⚛️',
            ozet: 'Kuantum elektrodinamiği ve karmaşık fizik konularını anlaşılır kılma üstadı.',
            detay: 'Feynman diyagramlarını geliştirerek kuantum alan teorisine katkı sağlamıştır. Fizik eğitimine getirdiği sezgisel yaklaşım ve "Feynman Fizik Dersleri" kitap serisiyle milyonlarca öğrenciye ilham olmuştur.',
            soz: 'Bir şeyi basitçe anlatamıyorsan, onu yeterince iyi anlamamışsın demektir.'
        },
        {
            id: 'curie',
            ad: 'Marie Curie',
            alan: 'Fizik & Kimya',
            kategori: 'Kimya',
            donem: '1867 - 1934',
            rozet: '🧪',
            ozet: 'Radyoaktivite teorisinin öncüsü, iki farklı alanda Nobel kazanan ilk bilim insanı.',
            detay: 'Polonyalı fizikçi ve kimyager Curie; radyoaktivite terimini türetmiş, polonyum ve radyum elementlerini keşfetmiştir. Kanser tedavisinde kullanılan mobil röntgen cihazlarının gelişimine öncülük etmiştir.',
            soz: 'Hayatta hiçbir şeyden korkmayın, sadece her şeyi anlamaya çalışın.'
        },
        {
            id: 'cezeri',
            ad: 'İsmail el-Cezeri',
            alan: 'Mühendislik & Otomasyon',
            kategori: 'Mühendislik & Buluş',
            donem: '1136 - 1206',
            rozet: '⚙️',
            ozet: 'Sibernetik biliminin kurucusu, su makineleri ve robotik mekanizmaların dâhi mühendisi.',
            detay: 'Artuklu döneminde Diyarbakır’da yaşmış olan Cezeri; su saatleri, otomatik aygıtlar, krank mili ve şanzıman sistemleri gibi mekanik buluşlarıyla modern sibernetiğin ve robotik teknolojinin temellerini atmıştır.',
            soz: 'Matematiksel ve fiziksel ilkeler üzerine kurulan her mekanik düzen, insanlığın hizmetindedir.'
        },
        {
            id: 'faraday',
            ad: 'Michael Faraday',
            alan: 'Fizik & Elektromanyetizma',
            kategori: 'Fizik',
            donem: '1791 - 1867',
            rozet: '🔋',
            ozet: 'Elektromanyetik indüksiyonu keşfeden ve ilk elektrik motorunun temellerini atan dâhi.',
            detay: 'Deneysel fiziğin en büyük isimlerinden biridir. Elektrik akımının manyetik alan oluşturabileceğini ve tersinin de mümkün olduğunu kanıtlayarak elektrik motoru ile jeneratörün icadına yol açmıştır.',
            soz: 'Hiçbir şey için imkansız deme; çünkü limitler, inancımızın bittiği yerde başlar.'
        },
        {
            id: 'fleming',
            ad: 'Alexander Fleming',
            alan: 'Biyoloji & Tıp',
            kategori: 'Biyoloji & Tıp',
            donem: '1881 - 1955',
            rozet: '🧫',
            ozet: 'Tıp tarihini değiştiren ilk antibiyotik olan penisilini keşfeden bilim insanı.',
            detay: '1928 yılında laboratuvarında küf mantarlarının (Penicillium notatum) bakterilerin üremesini engellediğini fark ederek penisilini keşfetmiştir. Bu buluş milyonlarca insanın hayatını kurtarmıştır.',
            soz: 'Bazen aramadığınız şeyleri bulursunuz; önemli olan onlara nasıl yaklaşacağınızı bilmektir.'
        },
        {
            id: 'planck',
            ad: 'Max Planck',
            alan: 'Kuantum Fiziği',
            kategori: 'Fizik',
            donem: '1858 - 1947',
            rozet: '🌌',
            ozet: 'Kuantum teorisinin kurucusu ve evrensel Planck sabiti\'nin keşfettirdiği fizikçi.',
            detay: 'Enerjinin kesintisiz bir akış olmadığını, belirli paketler (kuantalar) halinde yayıldığını öne sürerek modern fiziğin kapılarını aralamıştır. Çalışmalarıyla 1918 Nobel Fizik Ödülü\'nü almıştır.',
            soz: 'Yeni bir bilimsel hakikat, karşı çıkanları ikna ederek değil, onların ölmesini ve yeni neslin o hakikatle büyümesini sağlayarak zafer kazanır.'
        },
        {
            id: 'einstein',
            ad: 'Albert Einstein',
            alan: 'Teorik Fizik',
            kategori: 'Fizik',
            donem: '1879 - 1955',
            rozet: '🌠',
            ozet: 'Görelilik teorisiyle uzay, zaman ve kütle-enerji ilişkisini yeniden tanımlayan fizikçi.',
            detay: 'Özel ve genel görelilik teorilerini geliştirerek Newton fiziğinin sınırlarını aşmış, kütle-enerji eşdeğerliğini (E=mc²) ortaya koymuştur. Fotoelektrik etki üzerine çalışmasıyla 1921 Nobel Fizik Ödülü\'nü kazanmıştır.',
            soz: 'Hayal gücü bilgiden daha önemlidir.'
        },
        {
            id: 'darwin',
            ad: 'Charles Darwin',
            alan: 'Evrimsel Biyoloji',
            kategori: 'Biyoloji & Tıp',
            donem: '1809 - 1882',
            rozet: '🐢',
            ozet: 'Doğal seçilim yoluyla evrim teorisini ortaya koyan doğa bilimci.',
            detay: 'Beagle gemisiyle yaptığı dünya turu sırasında topladığı gözlemlerle "Türlerin Kökeni" adlı eserini yazmış ve türlerin doğal seçilim yoluyla zaman içinde evrildiğini öne sürmüştür. Modern biyolojinin temel taşlarından biri kabul edilir.',
            soz: 'Hayatta kalan tür, en güçlü ya da en zeki olan değil, değişime en iyi uyum sağlayandır.'
        },
        {
            id: 'lovelace',
            ad: 'Ada Lovelace',
            alan: 'Matematik & Bilgisayar Bilimi',
            kategori: 'Mühendislik & Buluş',
            donem: '1815 - 1852',
            rozet: '💻',
            ozet: 'Dünyanın ilk bilgisayar programcısı kabul edilen matematikçi.',
            detay: 'Charles Babbage\'ın Analitik Motoru üzerine yazdığı notlarda, bir makinenin sadece hesaplama değil, sembol işleme yapabileceğini öngörmüş ve bu makine için ilk algoritmayı tasarlamıştır. Bu çalışma, modern programlamanın kavramsal temelini oluşturur.',
            soz: 'Hayal gücü, keşif yeteneğimizin en güçlü aracıdır.'
        },
        {
            id: 'mendeleev',
            ad: 'Dmitri Mendeleev',
            alan: 'Kimya',
            kategori: 'Kimya',
            donem: '1834 - 1907',
            rozet: '🧬',
            ozet: 'Elementleri atom ağırlığına göre sınıflandırarak periyodik tabloyu oluşturan kimyager.',
            detay: 'Bilinen elementleri özelliklerine göre düzenleyerek periyodik tabloyu geliştirmiş, henüz keşfedilmemiş elementlerin varlığını ve özelliklerini bile önceden tahmin etmiştir. Bu sistematik yaklaşım modern kimyanın omurgasını oluşturur.',
            soz: 'Bilimde ölçmeden önce hayal kurmak gerekir; ama sonunda her zaman ölçmek gerekir.'
        },
        {
            id: 'ibn-i-sina',
            ad: 'İbn-i Sina',
            alan: 'Tıp & Felsefe',
            kategori: 'Biyoloji & Tıp',
            donem: '980 - 1037',
            rozet: '📜',
            ozet: 'Modern tıbbın temellerini atan, yüzyıllarca Avrupa\'da ders kitabı olarak okutulan hekim.',
            detay: 'Yazdığı "El-Kanun fi\'t-Tıb" (Tıbbın Kanunu) adlı eser, yüzyıllar boyunca hem İslam dünyasında hem de Avrupa üniversitelerinde temel tıp kaynağı olarak kullanılmıştır. Bulaşıcı hastalıklar, anatomi ve farmakoloji alanlarında öncü çalışmalar yapmıştır.',
            soz: 'Bilgi, ruhun gıdasıdır.'
        },
        {
            id: 'pasteur',
            ad: 'Louis Pasteur',
            alan: 'Mikrobiyoloji',
            kategori: 'Biyoloji & Tıp',
            donem: '1822 - 1895',
            rozet: '🦠',
            ozet: 'Mikrop teorisinin öncüsü, pastörizasyon ve kuduz aşısının mucidi.',
            detay: 'Hastalıkların mikroorganizmalardan kaynaklandığını gösteren mikrop teorisini geliştirmiş, sütün ve içeceklerin güvenli hale getirilmesini sağlayan pastörizasyon yöntemini icat etmiştir. Kuduz için ilk etkili aşıyı da o geliştirmiştir.',
            soz: 'Şans, yalnızca hazırlıklı zihinlere gülümser.'
        }
    ];

    $: filteredScientists = scientists.filter(s => {
        const matchesCategory = selectedCategory === 'Tümü' || s.kategori === selectedCategory;
        const matchesSearch = s.ad.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              s.alan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              s.ozet.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    let activeModalScientist = null;

    function openModal(scientist) {
        sfx.nav();
        activeModalScientist = scientist;
    }

    function closeModal() {
        activeModalScientist = null;
    }
</script>

<svelte:head><title>Bilim İnsanları Galerisi · Bilim Kulübü</title></svelte:head>

<PageHeader eyebrow="İlham Veren Yaşamlar" title="Bilim İnsanları Galerisi" desc="Tarihin seyrini değiştiren dâhileri, buluşlarını ve insanlığa bıraktıkları mirası keşfedin." />

<div class="content-max" style="margin-bottom: 60px;">
    
    <!-- Filtreler ve Arama Alanı -->
    <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;">
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            {#each categories as cat}
                <button 
                    class="btn {selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}"
                    style="font-size: var(--fs-xs); padding: 8px 16px;"
                    on:click={() => { selectedCategory = cat; sfx.nav(); }}>
                    {cat}
                </button>
            {/each}
        </div>

        <div style="display: flex; align-items: center; background: var(--bg-alt); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 14px;">
            <span style="margin-right: 10px; color: var(--text-muted);">🔍</span>
            <input 
                type="text" 
                bind:value={searchQuery} 
                placeholder="İsim, alan veya anahtar kelime ara (örn: Tesla, Kuantum, Penisilin)..." 
                style="background: transparent; border: none; color: var(--text); width: 100%; outline: none; font-size: var(--fs-sm);"
            />
        </div>
    </div>

    <!-- Bilim İnsanları Kart Grid Yapısı -->
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        {#each filteredScientists as scientist (scientist.id)}
            <div
                class="bracket-card"
                style="cursor: pointer; display: flex; flex-direction: column;"
                role="button"
                tabindex="0"
                on:click={() => openModal(scientist)}
                on:keydown={(e) => e.key === 'Enter' && openModal(scientist)}
            >
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <span style="font-size: 2.2rem;">{scientist.rozet}</span>
                    <span class="badge dev">{scientist.donem}</span>
                </div>
                <h3 style="margin-bottom: 6px; font-size: var(--fs-lg);">{scientist.ad}</h3>
                <p style="font-size: var(--fs-xs); color: var(--accent); font-weight: 600; margin-bottom: 12px;">{scientist.alan}</p>
                <p style="font-size: var(--fs-sm); color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">{scientist.ozet}</p>

                <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 12px; margin-top: auto;">
                    <span style="font-size: var(--fs-xs); color: var(--text-muted);">Detayları İncele</span>
                    <span style="color: var(--accent);">→</span>
                </div>
            </div>
        {:else}
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                Aradığınız kriterlere uygun bilim insanı bulunamadı.
            </div>
        {/each}
    </div>

</div>

<!-- Detay Modalı -->
{#if activeModalScientist}
<div
    style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;"
    role="button"
    tabindex="0"
    on:click={closeModal}
    on:keydown={(e) => e.key === 'Escape' && closeModal()}
>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
        class="bracket-card"
        style="max-width: 520px; width: 100%; max-height: 85vh; overflow-y: auto;"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        on:click|stopPropagation
    >
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 2.5rem;">{activeModalScientist.rozet}</span>
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem;">{activeModalScientist.ad}</h2>
                    <span style="font-size: var(--fs-xs); color: var(--text-muted);">{activeModalScientist.donem} · {activeModalScientist.alan}</span>
                </div>
            </div>
            <button class="btn btn-ghost" style="padding: 6px 10px;" on:click={closeModal}>✕</button>
        </div>

        <p style="font-size: var(--fs-base); line-height: 1.6; color: var(--text); margin-bottom: 20px;">
            {activeModalScientist.detay}
        </p>

        <div style="background: var(--bg-alt); padding: 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--accent); margin-bottom: 25px;">
            <p style="margin: 0; font-style: italic; font-size: var(--fs-sm); color: var(--text);">
                "{activeModalScientist.soz}"
            </p>
        </div>

        <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-primary" on:click={closeModal}>Kapat</button>
        </div>
    </div>
</div>
{/if}