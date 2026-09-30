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
	{:else if name === 'atom'}
		<circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
		<ellipse cx="12" cy="12" rx="9" ry="3.6" />
		<ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
		<ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
	{:else if name === 'dna'}
		<path d="M7 3c0 5 10 5 10 9s-10 4-10 9" />
		<path d="M17 3c0 5-10 5-10 9s10 4 10 9" />
		<path d="M8.6 6.4h6.8M8.6 17.6h6.8" />
	{:else if name === 'telescope'}
		<path d="M3.8 12.8 16.6 6.6l2 4.1-12.8 6.2-2-4.1Z" />
		<path d="m16.6 6.6 2-1M10.5 15.2 8 21M11.5 14.8l3 6.2" />
	{:else if name === 'flask'}
		<path d="M9.5 3.5h5M10.5 3.5v6L5.4 18a2 2 0 0 0 1.8 3h9.6a2 2 0 0 0 1.8-3l-5.1-8.5v-6" />
		<path d="M7.6 15h8.8" />
	{:else if name === 'code'}
		<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5.5l-3 13" />
	{:else if name === 'ruler'}
		<path d="M4 17 17 4l3 3L7 20l-3-3Z" />
		<path d="m8 13 2 2M11 10l2 2M14 7l2 2" />
	{:else if name === 'microscope'}
		<path d="m9.6 3.6 3.2 1.3-2.1 5.4-3.2-1.3 2.1-5.4Z" />
		<path d="M9 13.2a5 5 0 0 0 7.8 1.8M5.5 20.5h13M12 20.5v-2" />
	{:else if name === 'user'}
		<circle cx="12" cy="8" r="3.6" />
		<path d="M5 20a7 7 0 0 1 14 0" />
	{:else if name === 'idcard'}
		<rect x="3" y="5.5" width="18" height="13" rx="2" />
		<circle cx="9" cy="11" r="2" />
		<path d="M6 16c.6-1.6 5.4-1.6 6 0M14.5 10h3.5M14.5 13.5h2.5" />
	{:else if name === 'target'}
		<circle cx="12" cy="12" r="8.5" />
		<circle cx="12" cy="12" r="4.8" />
		<circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
	{:else if name === 'quiz'}
		<path d="M6.5 4h11v16h-11V4Z" />
		<path d="M9.5 9h5M9.5 12.5h5M9.5 16h2.5" />
	{:else if name === 'medal'}
		<circle cx="12" cy="15" r="5" />
		<path d="m9 10.4-2.2-6.4h4l1.2 3.6M15 10.4l2.2-6.4h-4L12.2 7.6" />
	{:else if name === 'check-circle'}
		<circle cx="12" cy="12" r="8.7" />
		<path d="m8.3 12.3 2.6 2.6 4.9-5.3" />
	{:else if name === 'compass'}
		<circle cx="12" cy="12" r="8.7" />
		<path d="m15.6 8.4-2 5.2-5.2 2 2-5.2 5.2-2Z" />
	{:else if name === 'globe'}
		<circle cx="12" cy="12" r="8.7" />
		<path d="M3.3 12h17.4" />
		<path d="M12 3.3c2.5 2.4 3.6 5.3 3.6 8.7s-1.1 6.3-3.6 8.7c-2.5-2.4-3.6-5.3-3.6-8.7S9.5 5.7 12 3.3Z" />
	{:else if name === 'book'}
		<path d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5Z" />
		<path d="M5 17a3 3 0 0 1 3-3h11M9.5 8.5h5" />
	{:else if name === 'magnet'}
		<path d="M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4H6Z" />
		<path d="M6 8h4M14 8h4" />
	{:else if name === 'calendar'}
		<rect x="3.5" y="5.5" width="17" height="15" rx="2" />
		<path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
	{:else if name === 'news'}
		<rect x="4" y="4.5" width="16" height="15" rx="2" />
		<path d="M8 9h8M8 12.5h8M8 16h5" />
	{:else if name === 'clock'}
		<circle cx="12" cy="12" r="8.7" />
		<path d="M12 7.5V12l3 2" />
	{:else if name === 'bulb'}
		<path d="M9 18h6M10 21h4" />
		<path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
	{:else if name === 'warning'}
		<path d="M12 4 3.5 19h17L12 4Z" />
		<path d="M12 10v4M12 16.8h.01" />
	{:else if name === 'check'}
		<path d="m5 12.5 4.5 4.5L19 7.5" />
	{:else if name === 'bolt'}
		<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />
	{:else if name === 'sprout'}
		<path d="M12 21v-8" />
		<path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6Z" />
		<path d="M12 15.5c0-3-2-5-6-5 0 3 2 5 6 5Z" />
	{:else if name === 'pointer'}
		<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10.5M12 10.5a1.5 1.5 0 0 1 3 0V12M15 11.5a1.5 1.5 0 0 1 3 0V16a5 5 0 0 1-5 5h-1.5a5 5 0 0 1-4-2L5 14.5a1.5 1.5 0 0 1 2.3-1.9L9 14" />
	{:else if name === 'flag'}
		<path d="M5 21V4M5 4h11l-2 4 2 4H5" />
	{:else if name === 'reset'}
		<path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v4.5h4.5" />
	{:else if name === 'download'}
		<path d="M12 4v11M8 11l4 4 4-4M5 19h14" />
	{:else if name === 'share'}
		<path d="M12 15V4M8 8l4-4 4 4M6 12v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7" />
	{:else if name === 'add-square'}
		<rect x="4" y="4" width="16" height="16" rx="3" />
		<path d="M12 8.5v7M8.5 12h7" />
	{:else if name === 'phone'}
		<rect x="7" y="3" width="10" height="18" rx="2.2" />
		<path d="M10.5 18h3" />
	{:else if name === 'more'}
		<circle cx="12" cy="5.5" r="1.2" fill="currentColor" stroke="none" />
		<circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
		<circle cx="12" cy="18.5" r="1.2" fill="currentColor" stroke="none" />
	{/if}
</svg>