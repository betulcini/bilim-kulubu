import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// PERFORMANS: supabase-js sitenin en büyük paketidir. Eskiden her sayfada, açılışta
// indiriliyordu. Artık sadece gerçekten gerektiğinde (giriş yapmış kullanıcı, giriş/kayıt,
// quiz, skor tablosu, yönetim vb.) ayrı bir dosya olarak yüklenir. Giriş gerektirmeyen
// sayfalarda (anasayfa, duyurular, fırsatlar, galeri, geziler, videolar) hiç yüklenmez:
// o sayfalar herkese açık veriyi $lib/publicRest.js ile hafif bir fetch ile okur.
//
// NOT: anon key tarayıcıda açıkta durur ve bu normaldir — Supabase'in güvenlik
// modeli bu anahtara değil, veritabanındaki "Row Level Security" (RLS)
// kurallarına dayanır.

let istemci = null;
let yukleniyor = null;
const olusunca = [];

/** Gerçek supabase-js istemcisi (ilk çağrıda ayrı dosya olarak indirilir). */
export function getSupabase() {
	if (istemci) return Promise.resolve(istemci);
	if (!yukleniyor) {
		yukleniyor = import('@supabase/supabase-js')
			.then(({ createClient }) => {
				istemci = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
				for (const f of olusunca) f(istemci);
				return istemci;
			})
			.catch((e) => {
				yukleniyor = null; // bağlantı kopmuşsa bir sonraki denemede yeniden dene
				throw e;
			});
	}
	return yukleniyor;
}

/** İstemci oluşturulduğu anda (ya da zaten varsa hemen) çalışır. */
export function istemciOlusunca(fn) {
	if (istemci) fn(istemci);
	else olusunca.push(fn);
}

/** Bu tarayıcıda kayıtlı bir Supabase oturumu var mı? (kitaplığı yüklemeden bakılır) */
export function oturumKayitliMi() {
	try {
		for (let i = 0; i < localStorage.length; i++) {
			const k = localStorage.key(i);
			if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) return true;
		}
	} catch {
		/* depolama kapalı */
	}
	return false;
}

// `supabase.from('x').select()...` gibi mevcut kodun hiçbiri değişmeden çalışsın diye:
// zincirdeki adımlar kaydedilir, `await` edildiği anda kitaplık yüklenip adımlar uygulanır.
function zincir(adimlar) {
	return new Proxy(function () {}, {
		get(_h, ad) {
			if (ad === 'then') {
				return (ok, red) => calistir(adimlar).then(ok, red);
			}
			if (typeof ad === 'symbol') return undefined;
			return zincir([...adimlar, { ad }]);
		},
		apply(_h, _t, args) {
			return zincir([...adimlar, { args }]);
		}
	});
}

async function calistir(adimlar) {
	const c = await getSupabase();
	let nesne = c;
	let ebeveyn = c;
	for (const a of adimlar) {
		if (a.args) {
			nesne = nesne.apply(ebeveyn, a.args);
		} else {
			ebeveyn = nesne;
			nesne = nesne[a.ad];
		}
	}
	return nesne;
}

export const supabase = zincir([]);
