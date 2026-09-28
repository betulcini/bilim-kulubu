<script>
	export let name = 'home';
	export let size = 20;
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'home'}
		<path d="M4 11.5 12 4l8 7.5" />
		<path d="M6 10v9h12v-9" />
		<path d="M10 19v-5h4v5" />
	{:else if name === 'series'}
		<rect x="3.5" y="5" width="17" height="13" rx="2" />
		<path d="m10.5 9 4 3-4 3z" />
	{:else if name === 'theater'}
		<path d="M8 4c-1.8 0-2.8 1.6-2.2 3.2L9 15.5a3.2 3.2 0 0 0 6 0l3.2-8.3C18.8 5.6 17.8 4 16 4" />
		<path d="M9 15.5 6.5 20h11L15 15.5" />
		<circle cx="10" cy="8.2" r=".6" fill="currentColor" stroke="none" />
		<circle cx="14" cy="8.2" r=".6" fill="currentColor" stroke="none" />
	{:else if name === 'trips'}
		<path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" />
		<circle cx="12" cy="9.5" r="2.4" />
	{:else if name === 'announce'}
		<path d="M4 10v4h3l5 4V6L7 10H4Z" />
		<path d="M15 9a4 4 0 0 1 0 6" />
		<path d="M17.5 6.5a8 8 0 0 1 0 11" />
	{:else if name === 'opportunity'}
		<path
			d="m12 3 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3Z"
		/>
	{:else if name === 'gallery'}
		<rect x="3.5" y="4.5" width="17" height="15" rx="2" />
		<circle cx="9" cy="10" r="1.6" />
		<path d="M4.5 17.5 9.5 13l3 2.8L16 12l4 5" />
	{:else if name === 'suggestion'}
		<path d="M4 17.5 15 6.5l2.5 2.5L6.5 20H4v-2.5Z" />
		<path d="m13.5 8 2.5 2.5" />
	{:else if name === 'trophy'}
		<path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
		<path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10" />
		<path d="M17 5h3v1.5A3.5 3.5 0 0 1 16.5 10" />
		<path d="M10 15.5v2.2M12 15.9v1.8M14 15.5v2.2" />
		<path d="M8.5 20.5h7" />
		<path d="M10 17.7v2.8M14 17.7v2.8" />
	{:else if name === 'games'}
		<rect x="3" y="8" width="18" height="9" rx="4.2" />
		<path d="M7.5 11v3.4M5.8 12.7h3.4" />
		<circle cx="16" cy="11.6" r=".9" fill="currentColor" stroke="none" />
		<circle cx="18" cy="13.6" r=".9" fill="currentColor" stroke="none" />
	{:else if name === 'settings'}
		<circle cx="12" cy="12" r="3.3" />
		<path
			d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6"
		/>
	{:else if name === 'info'}
		<circle cx="12" cy="12" r="8.7" />
		<path d="M12 10.8v5" />
		<path d="M12 8.1h.01" stroke-width="2.6" />
	{:else if name === 'mail'}
		<rect x="3.5" y="5.5" width="17" height="13" rx="2" />
		<path d="m4.5 7 7.5 6 7.5-6" />
	{:else if name === 'sun'}
		<circle cx="12" cy="12" r="4.2" />
		<path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
	{:else if name === 'moon'}
		<path d="M20 14.2A8.2 8.2 0 0 1 9.8 4 8.5 8.5 0 1 0 20 14.2Z" />
	{:else if name === 'system'}
		<rect x="3" y="4.5" width="18" height="12" rx="2" />
		<path d="M8.5 20h7M12 16.5V20" />
	{:else if name === 'sound-on'}
		<path d="M4 9.5v5h3.4L12 18.3V5.7L7.4 9.5H4Z" />
		<path d="M16 9a4 4 0 0 1 0 6" />
		<path d="M18.3 6.7a7.6 7.6 0 0 1 0 10.6" />
	{:else if name === 'sound-off'}
		<path d="M4 9.5v5h3.4L12 18.3V5.7L7.4 9.5H4Z" />
		<path d="m16 10 4.5 4.5M20.5 10 16 14.5" />
	{:else if name === 'menu'}
		<path d="M4 7h16M4 12h16M4 17h16" />
	{:else if name === 'close'}
		<path d="m5 5 14 14M19 5 5 19" />
	{:else if name === 'search'}
		<circle cx="10.8" cy="10.8" r="5.8" />
		<path d="m15.2 15.2 4.1 4.1" />
	{:else if name === 'chevron'}
		<path d="m9 6 6 6-6 6" />
	{:else if name === 'users'}
		<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
		<circle cx="9" cy="7" r="4" />
		<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
		<path d="M16 3.13a4 4 0 0 1 0 7.75" />
	{/if}
</svg>