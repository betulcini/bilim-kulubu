import test from 'node:test';
import assert from 'node:assert/strict';
import { gomuluOynatmaListesiAdresi, youtubeId, youtubeMedia, youtubePlaylistId } from '../src/lib/video.js';

test('YouTube video kimliğini desteklenen URL biçimlerinden alır', () => {
	for (const address of [
		'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
		'https://youtu.be/dQw4w9WgXcQ',
		'https://youtube.com/shorts/dQw4w9WgXcQ',
		'dQw4w9WgXcQ'
	]) {
		assert.equal(youtubeId(address), 'dQw4w9WgXcQ');
	}
});

test('yalnızca YouTube alan adlarından geçerli oynatma listesi kimliği çıkarır', () => {
	const url = 'https://www.youtube.com/playlist?list=PL1234567890abcdefghijk';

	assert.equal(youtubePlaylistId(url), 'PL1234567890abcdefghijk');
	assert.equal(youtubePlaylistId('https://example.com/playlist?list=PL1234567890'), null);
	assert.equal(youtubePlaylistId('https://youtube.com/playlist?list=bad'), null);
});

test('video ve oynatma listesi girdilerini birbirinden ayırır', () => {
	assert.deepEqual(youtubeMedia('https://youtu.be/dQw4w9WgXcQ'), {
		videoId: 'dQw4w9WgXcQ',
		playlistId: null
	});
	assert.deepEqual(youtubeMedia('https://youtube.com/playlist?list=PL1234567890'), {
		videoId: null,
		playlistId: 'PL1234567890'
	});
	assert.equal(youtubeMedia('not a YouTube URL'), null);
	assert.equal(
		gomuluOynatmaListesiAdresi('PL abc'),
		'https://www.youtube-nocookie.com/embed/videoseries?list=PL%20abc&autoplay=1&rel=0'
	);
});
