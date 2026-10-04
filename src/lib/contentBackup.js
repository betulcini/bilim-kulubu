import { supabase } from '$lib/supabaseClient.js';

export const CONTENT_BACKUP_FORMAT = 'bilim-teknoloji-kulubu-content';
export const CONTENT_BACKUP_VERSION = 1;

const TABLES = {
	quiz_konulari: {
		key: 'slug',
		fields: ['slug', 'baslik', 'aciklama', 'aktif'],
		draft: true
	},
	duyurular: {
		key: 'id',
		fields: ['baslik', 'etiket', 'tarih', 'ozet', 'link', 'kaynak_ad', 'yayina_basla', 'yayindan_kaldir', 'aktif'],
		draft: true
	},
	firsatlar: {
		key: 'id',
		fields: ['baslik', 'kurum', 'tur', 'durum', 'son', 'son_tarih', 'ozet', 'link', 'link_ad', 'kaynak', 'kaynak_ad', 'yayina_basla', 'yayindan_kaldir', 'aktif'],
		draft: true
	},
	geziler: {
		key: 'id',
		fields: ['yer', 'durum', 'gun', 'tarih_metni', 'ozet', 'link', 'link_ad', 'aktif'],
		draft: true
	},
	videolar: {
		key: 'id',
		fields: ['bolum', 'sira', 'baslik', 'aciklama', 'grup', 'youtube_id', 'playlist_id', 'aktif'],
		draft: true
	},
	video_kartlari: {
		key: 'id',
		fields: ['bolum', 'sira', 'baslik', 'aciklama', 'durum', 'alt_bilgi', 'rozet', 'aktif'],
		draft: true
	},
	quiz_sorulari: {
		key: 'id',
		fields: ['konu', 'soru', 'secenekler', 'dogru', 'aciklama', 'zorluk', 'aktif'],
		draft: true
	}
};

const PAGE_SIZE = 500;
const REQUIRED_FIELDS = {
	quiz_konulari: ['slug', 'baslik'],
	duyurular: ['baslik', 'etiket', 'tarih', 'ozet'],
	firsatlar: ['baslik', 'durum', 'ozet'],
	geziler: ['yer', 'durum', 'ozet'],
	videolar: ['bolum', 'baslik'],
	video_kartlari: ['bolum', 'baslik', 'aciklama'],
	quiz_sorulari: ['konu', 'soru', 'secenekler', 'dogru']
};

function errorText(error) {
	if (error?.code === '42P01' || error?.code === 'PGRST205') {
		return 'İçerik yedekleme tabloları bulunamadı. İlgili Supabase migration’larını önce uygulayın.';
	}
	return error?.message || 'İşlem tamamlanamadı.';
}

function normalize(row) {
	const normalized = {};
	for (const key of Object.keys(row).sort()) {
		if (['id', 'created_at', 'updated_at', 'aktif'].includes(key)) continue;
		normalized[key] = row[key];
	}
	return JSON.stringify(normalized);
}

function fingerprint(table, row) {
	if (table === 'quiz_sorulari') {
		const question = row.soru.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR');
		return JSON.stringify([row.konu, question]);
	}
	return normalize(row);
}

async function selectAll(table, key) {
	const rows = [];
	for (let start = 0; ; start += PAGE_SIZE) {
		const { data, error } = await supabase
			.from(table)
			.select('*')
			.order(key, { ascending: true })
			.range(start, start + PAGE_SIZE - 1);
		if (error) throw error;
		rows.push(...(data || []));
		if (!data || data.length < PAGE_SIZE) return rows;
	}
}

export async function exportContentBackup() {
	try {
		const tables = {};
		for (const [table, config] of Object.entries(TABLES)) {
			tables[table] = await selectAll(table, config.key);
		}
		return {
			backup: {
				format: CONTENT_BACKUP_FORMAT,
				version: CONTENT_BACKUP_VERSION,
				exported_at: new Date().toISOString(),
				tables
			},
			error: ''
		};
	} catch (error) {
		return { backup: null, error: errorText(error) };
	}
}

function prepareRows(table, rows) {
	const config = TABLES[table];
	if (!Array.isArray(rows)) throw new Error(`${table} içeriği liste biçiminde değil.`);
	return rows.map((source) => {
		if (!source || typeof source !== 'object' || Array.isArray(source)) {
			throw new Error(`${table} içinde geçersiz kayıt var.`);
		}
		const row = {};
		for (const field of config.fields) {
			if (Object.hasOwn(source, field)) row[field] = source[field];
		}
		for (const field of REQUIRED_FIELDS[table]) {
			if (row[field] === null || row[field] === undefined || row[field] === '') {
				throw new Error(`${table} içinde zorunlu "${field}" alanı eksik.`);
			}
		}
		if (config.draft) row.aktif = false;
		if (table === 'videolar' && Boolean(row.youtube_id) === Boolean(row.playlist_id)) {
			throw new Error('Yedekteki her video yalnızca bir video veya oynatma listesi kimliği içermeli.');
		}
		if (table === 'quiz_sorulari' && (
			!Array.isArray(row.secenekler) ||
			row.secenekler.length < 2 ||
			row.secenekler.some((option) => typeof option !== 'string') ||
			!row.secenekler.includes(row.dogru)
		)) {
			throw new Error('Yedekte geçersiz quiz sorusu var.');
		}
		return row;
	});
}

export async function restoreContentBackup(backup) {
	if (!backup || backup.format !== CONTENT_BACKUP_FORMAT || backup.version !== CONTENT_BACKUP_VERSION || !backup.tables || typeof backup.tables !== 'object') {
		return { restored: 0, skipped: 0, error: 'Bu dosya tanınan bir içerik yedeği değil veya sürümü desteklenmiyor.' };
	}
	let restored = 0;
	let skipped = 0;
	try {
		const preparedTables = {};
		for (const [table] of Object.entries(TABLES)) {
			if (!Object.hasOwn(backup.tables, table)) throw new Error(`Yedekte ${table} tablosu eksik.`);
			preparedTables[table] = prepareRows(table, backup.tables[table]);
		}
		for (const [table, config] of Object.entries(TABLES)) {
			const rows = preparedTables[table];
			if (table === 'quiz_konulari') {
				if (rows.length) {
					const current = await selectAll(table, config.key);
					const existingSlugs = new Set(current.map((row) => row.slug));
					const fresh = rows.filter((row) => {
						if (existingSlugs.has(row.slug)) {
							skipped += 1;
							return false;
						}
						existingSlugs.add(row.slug);
						return true;
					});
					if (fresh.length) {
						const { error } = await supabase.from(table).upsert(fresh, { onConflict: 'slug', ignoreDuplicates: true });
						if (error) throw error;
					}
					restored += fresh.length;
				}
				continue;
			}
			if (!rows.length) continue;
			const current = await selectAll(table, config.key);
			const known = new Set(current.map((row) => fingerprint(table, row)));
			const fresh = rows.filter((row) => {
				const signature = fingerprint(table, row);
				if (known.has(signature)) {
					skipped += 1;
					return false;
				}
				known.add(signature);
				return true;
			});
			for (let start = 0; start < fresh.length; start += 100) {
				const { error } = await supabase.from(table).insert(fresh.slice(start, start + 100));
				if (error) throw error;
				restored += Math.min(100, fresh.length - start);
			}
		}
		return { restored, skipped, error: '' };
	} catch (error) {
		return { restored, skipped, error: errorText(error) };
	}
}
