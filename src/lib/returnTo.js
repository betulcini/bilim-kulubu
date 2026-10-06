export function safeReturnPath(value, fallback = '/') {
	if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
		return fallback;
	}
	const target = new URL(value, 'https://local.invalid');
	if (target.origin !== 'https://local.invalid') return fallback;
	return `${target.pathname}${target.search}${target.hash}`;
}
