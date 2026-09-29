<div class="ambient" aria-hidden="true">
	<span class="glow glow-a"></span>
	<span class="glow glow-b"></span>
	<span class="dots"></span>
</div>

<style>
	.ambient {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
	}

	/* Köşelerde yumuşak renk geçişleri */
	.glow {
		position: absolute;
		border-radius: 50%;
		width: min(70vw, 900px);
		aspect-ratio: 1;
	}
	.glow-a {
		top: -28%;
		right: -14%;
		background: radial-gradient(closest-side, color-mix(in srgb, var(--accent-3) 20%, transparent), transparent);
	}
	.glow-b {
		bottom: -32%;
		left: -18%;
		background: radial-gradient(closest-side, color-mix(in srgb, var(--accent-2) 14%, transparent), transparent);
	}

	/* Çok silik nokta ızgarası, üstten aşağı solar */
	.dots {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle, color-mix(in srgb, var(--text) 22%, transparent) 1px, transparent 1.3px);
		background-size: 30px 30px;
		opacity: 0.35;
		-webkit-mask-image: radial-gradient(ellipse 90% 70% at 50% 0%, black, transparent 75%);
		mask-image: radial-gradient(ellipse 90% 70% at 50% 0%, black, transparent 75%);
	}

	:global([data-theme='light']) .glow-a {
		background: radial-gradient(closest-side, color-mix(in srgb, var(--accent-3) 15%, transparent), transparent);
	}
	:global([data-theme='light']) .glow-b {
		background: radial-gradient(closest-side, color-mix(in srgb, var(--accent-2) 12%, transparent), transparent);
	}
	:global([data-theme='light']) .dots { opacity: 0.28; }

	@media (max-width: 900px) {
		.glow { width: 110vw; }
		.dots { background-size: 24px 24px; opacity: 0.25; }
	}
</style>
