export function buildLearningRoute({ interests, scores, quizTopics, scientists, dailyCompleted }) {
	if (!interests.length) return [];

	const bestScores = new Map();
	for (const score of scores) {
		const value = Number(score.score);
		if (!Number.isFinite(value)) continue;
		bestScores.set(score.subject, Math.max(bestScores.get(score.subject) ?? -Infinity, value));
	}

	const subjects = [
		...new Map(
			interests
				.filter((interest) => quizTopics[interest.quiz])
				.map((interest) => [
					interest.quiz,
					{
						id: interest.quiz,
						title: quizTopics[interest.quiz].title,
						label: interest.label,
						bestScore: bestScores.get(interest.quiz) ?? null
					}
				])
		).values()
	].sort((a, b) => (a.bestScore ?? -1) - (b.bestScore ?? -1));

	const route = [
		{
			id: 'daily',
			title: 'Günlük Mini Quiz',
			description: dailyCompleted
				? 'Bugünkü 5 soruyu tamamladın. Serini korumak için yarın tekrar gel.'
				: 'Farklı bilim alanlarından 5 soruyla bugün öğrenmeye başla.',
			href: '/gunluk-quiz',
			done: dailyCompleted
		}
	];

	const subject = subjects[0];
	if (subject) {
		route.push({
			id: `quiz-${subject.id}`,
			title: subject.title,
			description:
				subject.bestScore === null
					? `${subject.label} alanında ilk quizini çöz.`
					: `${subject.label} alanındaki en iyi skorun ${subject.bestScore}/200. Bir tur daha deneyip geliştirebilirsin.`,
			href: `/yarismalar/quiz?konu=${encodeURIComponent(subject.id)}`,
			done: false
		});
	}

	const scientistCategory = interests.find((interest) =>
		scientists.some((scientist) => scientist.kategori === interest.sciKategori)
	)?.sciKategori;
	const scientist = scientists.find((candidate) => candidate.kategori === scientistCategory);
	if (scientist) {
		route.push({
			id: `scientist-${scientist.id}`,
			title: `${scientist.ad} ile tanış`,
			description: `${interests.find((interest) => interest.sciKategori === scientistCategory)?.label} alanından kısa bir keşif.`,
			href: `/bilim-insanlari?ara=${encodeURIComponent(scientist.ad)}`,
			done: false
		});
	}

	return route;
}
