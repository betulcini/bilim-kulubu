// Sitenin yayındaki tam adresi (sonunda / olmadan), ör. https://bilim-kulubu.ornek.workers.dev
// WhatsApp, Instagram, Telegram gibi uygulamalar önizleme görselini ancak TAM adresle bulabilir.
// Adresi iki yoldan biriyle ver:
//   1) Build ortamına VITE_SITE_URL değişkeni ekle (Cloudflare: Settings → Variables and Secrets)
//   2) Ya da aşağıdaki boş metnin içine yaz
export const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');
