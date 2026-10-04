import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLearningRoute } from '../src/lib/learningRoute.js';

const interests = [
	{ id: 'fizik', quiz: 'physics', label: 'Fizik', sciKategori: 'Fizik' },
	{ id: 'kimya', quiz: 'chemistry', label: 'Kimya', sciKategori: 'Kimya' }
];
const quizTopics = {
	physics: { title: 'Fizik Quiz' },
	chemistry: { title: 'Kimya Quiz' }
};
const scientists = [
	{ id: 'scientist-physics', ad: 'Bilim İnsanı', kategori: 'Fizik' },
	{ id: 'scientist-chemistry', ad: 'Bilim İnsanı 2', kategori: 'Kimya' }
];

test('ilgi alanı yoksa öğrenme rotası önermez', () => {
	assert.deepEqual(
		buildLearningRoute({
			interests: [],
			scores: [],
			quizTopics,
			scientists,
			dailyCompleted: false
		}),
		[]
	);
});

test('rotayı tamamlanmış günlük quiz, en düşük konu skoru ve ilgili bilim insanına göre kurar', () => {
	const route = buildLearningRoute({
		interests,
		scores: [
			{ subject: 'physics', score: 150 },
			{ subject: 'chemistry', score: 75 }
		],
		quizTopics,
		scientists,
		dailyCompleted: true
	});

	assert.equal(route.length, 3);
	assert.equal(route[0].done, true);
	assert.equal(route[1].id, 'quiz-chemistry');
	assert.match(route[1].description, /75\/200/);
	assert.equal(route[2].id, 'scientist-scientist-physics');
	assert.match(route[2].href, /ara=/);
});

test('önce hiç çözülmemiş ilgi alanı quizini önerir', () => {
	const route = buildLearningRoute({
		interests,
		scores: [{ subject: 'physics', score: 20 }],
		quizTopics,
		scientists,
		dailyCompleted: false
	});

	assert.equal(route[1].id, 'quiz-chemistry');
	assert.match(route[1].description, /ilk quizini çöz/);
});
