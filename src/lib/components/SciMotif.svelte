<!-- Sayfa başlıklarının sağ altında duran sade, yumuşak halka motifi -->
<svg class="sci-motif" viewBox="0 0 900 340" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
	<g class="rings">
		<circle cx="790" cy="320" r="90" />
		<circle cx="790" cy="320" r="170" />
		<circle cx="790" cy="320" r="250" />
		<circle cx="790" cy="320" r="330" />
	</g>
	<circle class="dot" cx="790" cy="320" r="5" />
</svg>

<style>
	.sci-motif {
		position: absolute;
		inset: auto 0 0 0;
		width: 100%;
		height: 100%;
		fill: none;
		pointer-events: none;
		-webkit-mask-image: linear-gradient(to top, black, transparent 95%);
		mask-image: linear-gradient(to top, black, transparent 95%);
	}
	.rings circle {
		stroke: var(--accent-3);
		stroke-width: 1.2;
	}
	.rings circle:nth-child(1) { opacity: 0.5; }
	.rings circle:nth-child(2) { opacity: 0.36; }
	.rings circle:nth-child(3) { opacity: 0.24; }
	.rings circle:nth-child(4) { opacity: 0.14; }
	.dot { fill: var(--accent); opacity: 0.55; }

	:global([data-theme='light']) .rings circle { stroke: var(--accent); }
	:global([data-theme='light']) .sci-motif { opacity: 0.6; }

	@media (max-width: 640px) {
		.rings circle:nth-child(4) { display: none; }
	}
</style>
