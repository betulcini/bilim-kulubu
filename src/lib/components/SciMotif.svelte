<svg class="sci-motif" viewBox="0 0 900 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
	<!-- DNA sarmalı -->
	<g class="helix">
		<path d="M90,320 C145,280 145,240 90,200 C35,160 35,120 90,80 C145,40 145,10 90,-20" />
		<path d="M158,320 C213,280 213,240 158,200 C103,160 103,120 158,80 C213,40 213,10 158,-20" />
		<line x1="90" y1="300" x2="158" y2="300" />
		<line x1="90" y1="240" x2="158" y2="240" />
		<line x1="90" y1="180" x2="158" y2="180" />
		<line x1="90" y1="120" x2="158" y2="120" />
		<line x1="90" y1="60" x2="158" y2="60" />
		<circle cx="90" cy="300" r="3" />
		<circle cx="158" cy="300" r="3" />
		<circle cx="90" cy="240" r="3" />
		<circle cx="158" cy="240" r="3" />
		<circle cx="90" cy="180" r="3" />
		<circle cx="158" cy="180" r="3" />
		<circle cx="90" cy="120" r="3" />
		<circle cx="158" cy="120" r="3" />
		<circle cx="90" cy="60" r="3" />
		<circle cx="158" cy="60" r="3" />
	</g>

	<!-- Atom -->
	<g class="atom" transform="translate(770,95)">
		<circle r="6" class="nucleus" />
		<ellipse rx="70" ry="26" />
		<ellipse rx="70" ry="26" transform="rotate(60)" />
		<ellipse rx="70" ry="26" transform="rotate(120)" />
		<circle class="electron" cx="70" cy="0" r="3.6" />
		<circle class="electron" cx="-35" cy="60.6" r="3.6" transform="rotate(60)" />
		<circle class="electron" cx="-35" cy="-60.6" r="3.6" transform="rotate(120)" />
	</g>

	<!-- Molekül / bağ grafiği -->
	<g class="nodes">
		<circle cx="420" cy="60" r="3.4" />
		<circle cx="490" cy="105" r="2.6" />
		<circle cx="365" cy="118" r="2.2" />
		<circle cx="555" cy="70" r="2.8" />
		<line x1="420" y1="60" x2="490" y2="105" />
		<line x1="420" y1="60" x2="365" y2="118" />
		<line x1="490" y1="105" x2="555" y2="70" />
	</g>

	<!-- Erlenmeyer (deney tüpü) -->
	<g class="flask" transform="translate(650,260)">
		<path class="flask-outline" d="M-9,-46 h18 M-6,-46 v26 l-26,44 a9 9 0 0 0 8 13.5 h48 a9 9 0 0 0 8 -13.5 l-26,-44 v-26" />
		<path class="flask-liquid" d="M-20,-6 l-9.5,16 a9 9 0 0 0 8 13.5 h48 a9 9 0 0 0 8 -13.5 l-9.5,-16 z" />
		<circle class="bubble" cx="-6" cy="6" r="2.4" />
		<circle class="bubble" cx="8" cy="16" r="1.8" />
		<circle class="bubble" cx="2" cy="-2" r="1.4" />
	</g>
</svg>

<style>
	.sci-motif {
		position: absolute;
		inset: 0;
		width: 100%;
		top: auto;
		bottom: 0;
		height: 72%;
		fill: none;
		pointer-events: none;
		opacity: 0.55;
		-webkit-mask-image: linear-gradient(to top, black, transparent 90%);
		mask-image: linear-gradient(to top, black, transparent 90%);
	}
	:global([data-theme='light']) .sci-motif {
		opacity: 0.3;
	}

	.helix path {
		stroke: var(--accent-3);
		stroke-width: 2;
		opacity: 0.55;
	}
	.helix line {
		stroke: var(--accent-3);
		stroke-width: 1.3;
		opacity: 0.35;
	}
	.helix circle {
		fill: var(--accent-3);
		opacity: 0.55;
	}

	.atom .nucleus {
		fill: var(--accent);
		opacity: 0.8;
	}
	.atom ellipse {
		stroke: var(--accent);
		stroke-width: 1.6;
		opacity: 0.45;
	}
	.atom .electron {
		fill: var(--accent);
		opacity: 0.75;
	}

	.nodes circle {
		fill: var(--accent-2);
		opacity: 0.65;
	}
	.nodes line {
		stroke: var(--accent-2);
		stroke-width: 1;
		opacity: 0.3;
	}

	.flask-outline {
		stroke: var(--accent);
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.5;
	}
	.flask-liquid {
		fill: var(--accent);
		stroke: none;
		opacity: 0.16;
	}
	.flask .bubble {
		fill: var(--accent);
		opacity: 0.4;
	}

	/* Küçük ekranlarda görsel karmaşayı azalt: sadece sarmal ve atom kalsın */
	@media (max-width: 640px) {
		.nodes {
			display: none;
		}
	}
</style>
