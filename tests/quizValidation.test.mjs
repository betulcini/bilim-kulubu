import test from 'node:test';
import assert from 'node:assert/strict';
import { soruDogrula } from '../src/lib/quizValidation.js';

const valid = {
	soru: 'Işığın hızı yaklaşık kaçtır?',
	secenekler: ['300.000 km/sn', '150.000 km/sn', '30.000 km/sn', '1.080 km/sn'],
	dogru: 'A',
	aciklama: 'Işık boşlukta yaklaşık 300.000 km/sn hızla ilerler.',
	zorluk: 'Kolay'
};

test('doğru cevabı harf ile tanımlanmış soruyu temizleyip doğrular', () => {
	const result = soruDogrula(valid);

	assert.equal(result.soru.dogru, '300.000 km/sn');
	assert.equal(result.soru.zorluk, 'Kolay');
	assert.equal(result.soru.secenekler.length, 4);
});

test('aynı veya fazla sayıda şıkkı reddeder', () => {
	assert.match(
		soruDogrula({ ...valid, secenekler: ['Aynı', ' aynı ', 'C'] }).hata,
		/Aynı şık/
	);
	assert.match(
		soruDogrula({ ...valid, secenekler: ['1', '2', '3', '4', '5', '6', '7'] }).hata,
		/En fazla 6/
	);
});

test('boş doğru cevabı, metne uymayan doğruyu ve açıklama sınırını reddeder', () => {
	assert.match(soruDogrula({ ...valid, dogru: '' }).hata, /belirtilmemiş/);
	assert.match(soruDogrula({ ...valid, dogru: 'Başka cevap' }).hata, /eşleşmiyor/);
	assert.match(soruDogrula({ ...valid, aciklama: 'a'.repeat(801) }).hata, /800 karakter/);
});

test('geçersiz zorluk seviyesini reddeder', () => {
	assert.match(soruDogrula({ ...valid, zorluk: 'Uzman' }).hata, /Zorluk/);
});
