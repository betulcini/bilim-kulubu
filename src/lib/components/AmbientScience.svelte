<div class="ambient-science" aria-hidden="true">
	<svg class="desktop-art" viewBox="0 0 1440 900" preserveAspectRatio="none">
		<g class="dna" transform="translate(1160 120)">
			<path d="M0 0c-54 42-54 84 0 126s54 84 0 126-54 84 0 126" />
			<path d="M72 0c54 42 54 84 0 126s-54 84 0 126 54 84 0 126" />
			<path d="M5 42h62M12 126h48M12 210h48M5 294h62" />
		</g>
		<g class="atom" transform="translate(180 680)">
			<circle r="7" />
			<ellipse rx="82" ry="29" /><ellipse rx="82" ry="29" transform="rotate(60)" /><ellipse rx="82" ry="29" transform="rotate(120)" />
		</g>
		<g class="nodes"><circle cx="700" cy="740" r="3" /><circle cx="770" cy="690" r="2" /><circle cx="835" cy="755" r="3" /><path d="M700 740 770 690l65 65" /></g>
	</svg>
	<svg class="mobile-art" viewBox="0 0 390 844" preserveAspectRatio="none">
		<g class="dna" transform="translate(285 115)">
			<path d="M0 0c-36 30-36 60 0 90s36 60 0 90-36 60 0 90" />
			<path d="M48 0c36 30 36 60 0 90s-36 60 0 90 36 60 0 90" />
			<path d="M4 30h40M8 90h32M8 150h32M4 210h40" />
		</g>
		<g class="atom" transform="translate(72 620)"><circle r="5" /><ellipse rx="54" ry="19" /><ellipse rx="54" ry="19" transform="rotate(60)" /><ellipse rx="54" ry="19" transform="rotate(120)" /></g>
		<g class="nodes"><circle cx="218" cy="710" r="2" /><circle cx="266" cy="680" r="2.5" /><circle cx="310" cy="722" r="2" /><path d="M218 710 266 680l44 42" /></g>
	</svg>
</div>

<style>
	.ambient-science { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
	.ambient-science svg { width: 100%; height: 100%; fill: none; opacity: 0.16; }
	.mobile-art { display: none; }
	.dna { stroke: var(--accent-3); stroke-width: 2; stroke-linecap: round; }
	.atom { stroke: var(--accent-2); stroke-width: 1.6; }
	.atom circle { fill: var(--accent-2); stroke: none; }
	.nodes { stroke: var(--accent); stroke-width: 1.4; }
	.nodes circle { fill: var(--accent); stroke: none; }
	:global([data-theme='dark']) .ambient-science svg { opacity: 0.12; }
	@media (max-width: 900px) {
		.desktop-art { display: none; }
		.mobile-art { display: block; opacity: 0.13 !important; }
	}
</style>
