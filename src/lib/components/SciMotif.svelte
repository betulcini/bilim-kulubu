<svg class="sci-motif" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
	<g class="helix">
		<path d="M40,380 C100,340 100,300 40,260 C-20,220 -20,180 40,140 C100,100 100,60 40,20" />
		<path d="M112,380 C172,340 172,300 112,260 C52,220 52,180 112,140 C172,100 172,60 112,20" />
		<line x1="40" y1="380" x2="112" y2="380" />
		<line x1="40" y1="300" x2="112" y2="300" />
		<line x1="40" y1="220" x2="112" y2="220" />
		<line x1="40" y1="140" x2="112" y2="140" />
		<line x1="40" y1="60" x2="112" y2="60" />
	</g>

	<g class="atom" transform="translate(1050,100)">
		<circle r="5" class="nucleus" />
		<ellipse rx="76" ry="28" />
		<ellipse rx="76" ry="28" transform="rotate(60)" />
		<ellipse rx="76" ry="28" transform="rotate(120)" />
	</g>

	<g class="nodes">
		<circle cx="640" cy="56" r="3" />
		<circle cx="726" cy="112" r="2.4" />
		<circle cx="566" cy="128" r="2" />
		<circle cx="832" cy="64" r="2.6" />
		<circle cx="900" cy="150" r="2" />
		<line x1="640" y1="56" x2="726" y2="112" />
		<line x1="640" y1="56" x2="566" y2="128" />
		<line x1="726" y1="112" x2="832" y2="64" />
		<line x1="832" y1="64" x2="900" y2="150" />
	</g>

	<g class="flask" transform="translate(900,320)">
		<path d="M-10,-30 h20 M-6,-30 v22 l-16,30 a6 6 0 0 0 6 9 h32 a6 6 0 0 0 6 -9 l-16,-30 v-22" />
		<line x1="-14" y1="2" x2="14" y2="2" />
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

	.atom .nucleus {
		fill: var(--accent);
		opacity: 0.75;
	}
	.atom ellipse {
		stroke: var(--accent);
		stroke-width: 1.6;
		opacity: 0.45;
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

	.flask path,
	.flask line {
		stroke: var(--accent);
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.4;
	}
</style>
