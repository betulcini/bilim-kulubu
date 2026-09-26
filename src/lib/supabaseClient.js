import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// NOT: anon key tarayıcıda açıkta durur ve bu normaldir — Supabase'in güvenlik
// modeli bu anahtara değil, veritabanındaki "Row Level Security" (RLS)
// kurallarına dayanır. RLS kurallarını kurmadan tabloları herkese açık
// bırakmayalım (bunu tablo oluştururken birlikte ayarlayacağız).
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
