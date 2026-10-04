// Web Audio API ile üretilen kısa arayüz sesleri.
// Harici ses dosyası kullanılmaz; tüm sesler anlık olarak sentezlenir.
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { soundEnabled } from '$lib/stores/sound.js';

let ctx;
let lastToneAt = 0;

function getCtx() {
	if (!browser) return null;
	if (!ctx) {
		const AudioCtx = window.AudioContext || window['webkitAudioContext'];
		if (!AudioCtx) return null;
		ctx = new AudioCtx();
	}
	if (ctx.state === 'suspended') ctx.resume();
	return ctx;
}

function tone({ freq = 440, duration = 0.09, type = 'sine', gain = 0.05, glideTo = null }) {
	if (!browser || !get(soundEnabled)) return;
	const audio = getCtx();
	if (!audio) return;
	lastToneAt = performance.now();
	const osc = audio.createOscillator();
	const amp = audio.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, audio.currentTime);
	if (glideTo) {
		osc.frequency.exponentialRampToValueAtTime(glideTo, audio.currentTime + duration);
	}
	amp.gain.setValueAtTime(gain, audio.currentTime);
	amp.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
	osc.connect(amp).connect(audio.destination);
	osc.start();
	osc.stop(audio.currentTime + duration + 0.02);
}

export const sfx = {
	click: () => {
		if (performance.now() - lastToneAt < 90) return;
		tone({ freq: 720, duration: 0.06, type: 'triangle', gain: 0.04 });
	},
	nav: () => tone({ freq: 520, duration: 0.07, type: 'sine', gain: 0.035, glideTo: 640 }),
	toggle: () => tone({ freq: 600, duration: 0.08, type: 'square', gain: 0.025 }),
	success: () => {
		tone({ freq: 520, duration: 0.09, type: 'sine', gain: 0.05, glideTo: 780 });
		setTimeout(() => tone({ freq: 780, duration: 0.12, type: 'sine', gain: 0.045 }), 80);
	},
	error: () => tone({ freq: 220, duration: 0.16, type: 'sawtooth', gain: 0.04, glideTo: 140 })
};
