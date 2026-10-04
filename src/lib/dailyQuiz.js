const SORU_SAYISI = 5;

function mulberry32(a) {
	return function () {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function seededShuffle(arr, rnd) {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rnd() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function seedOf(key) {
	return Number(key.replaceAll('-', ''));
}

export function buildDaily(key, havuz) {
	const rnd = mulberry32(seedOf(key));
	const konular = seededShuffle(Object.keys(havuz), rnd).slice(0, SORU_SAYISI);
	return konular.map((k) => {
		const q = seededShuffle(havuz[k].questions, rnd)[0];
		return {
			...q,
			konu: havuz[k].title.replace(' Quiz', ''),
			secenekler: seededShuffle(q.secenekler, rnd)
		};
	});
}
