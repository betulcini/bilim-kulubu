import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDaily } from '../src/lib/dailyQuiz.js';
import { quizData } from '../src/lib/data/bilim-quizleri.js';

test('aynı gün aynı günlük quiz sorularını ve seçenek sırasını üretir', () => {
	const first = buildDaily('2026-10-04', quizData);
	const second = buildDaily('2026-10-04', quizData);

	assert.deepEqual(first, second);
});

test('günlük quiz beş ayrı konudan doğru biçimli sorular seçer', () => {
	const sorular = buildDaily('2026-10-04', quizData);

	assert.equal(sorular.length, 5);
	assert.equal(new Set(sorular.map((soru) => soru.konu)).size, 5);
	for (const soru of sorular) {
		assert.ok(soru.soru);
		assert.ok(soru.dogru);
		assert.equal(soru.secenekler.length, 4);
		assert.ok(soru.secenekler.includes(soru.dogru));
	}
});

test('gün değişince seçilen quiz havuzu da değişir', () => {
	const today = buildDaily('2026-10-04', quizData);
	const tomorrow = buildDaily('2026-10-05', quizData);

	assert.notDeepEqual(today, tomorrow);
});
