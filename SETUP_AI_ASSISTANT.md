# Setup AI Assistant - Panduan Lengkap

Fitur AI Assistant sudah berhasil dibuat! 🎉

## Yang Sudah Dibuat

✅ Halaman chat AI di `/dashboard/assistant`
✅ API endpoint untuk chat
✅ Menu navigasi di sidebar
✅ UI chat yang responsif
✅ Support Groq API (gratis) atau OpenAI API

---

## Cara Setup (5 Menit)

### Opsi 1: Groq API (GRATIS & CEPAT) ⭐ Recommended

#### 1. Daftar Groq (Gratis)

1. Buka: https://console.groq.com
2. Klik **"Sign Up"** atau **"Get Started"**
3. Login dengan Google/GitHub
4. Gratis, tidak perlu kartu kredit!

#### 2. Buat API Key

1. Setelah login, klik **"API Keys"** di sidebar
2. Klik **"Create API Key"**
3. Beri nama: "My App Assistant"
4. Klik **"Submit"**
5. **COPY** API key yang muncul (dimulai dengan `gsk_`)

#### 3. Update .env

Buka file `.env` dan ganti:

```env
GROQ_API_KEY="gsk_PASTE_API_KEY_ANDA_DISINI"
```

#### 4. Restart Server

```cmd
# Stop server (Ctrl + C)
npm run dev
```

#### 5. Test AI Assistant

1. Buka browser: http://localhost:3000/dashboard/assistant
2. Ketik pesan: "Halo, siapa kamu?"
3. AI akan menjawab!

---

### Opsi 2: OpenAI API (Berbayar)

#### 1. Daftar OpenAI

1. Buka: https://platform.openai.com
2. Sign up dan tambahkan payment method
3. Biaya: ~$0.002 per request (sangat murah)

#### 2. Buat API Key

1. Pergi ke: https://platform.openai.com/api-keys
2. Klik **"Create new secret key"**
3. Copy key (dimulai dengan `sk-`)

#### 3. Update .env

```env
# Comment Groq, uncomment OpenAI
# GROQ_API_KEY="gsk_..."
OPENAI_API_KEY="sk_PASTE_API_KEY_ANDA_DISINI"
```

#### 4. Restart & Test

```cmd
npm run dev
```

---

## Fitur AI Assistant

✅ **Chat Interface** - UI modern dengan bubble chat
✅ **Real-time Response** - Jawaban langsung dari AI
✅ **Context Aware** - AI ingat percakapan sebelumnya
✅ **Bahasa Indonesia** - AI menjawab dalam bahasa Indonesia
✅ **Protected** - Hanya user yang login bisa akses
✅ **Fast** - Menggunakan model yang cepat

---

## Model yang Digunakan

### Groq (Gratis)
- Model: `llama-3.3-70b-versatile`
- Kecepatan: Sangat cepat (100+ tokens/detik)
- Gratis: Unlimited (dengan rate limit wajar)

### OpenAI (Berbayar)
- Model: `gpt-3.5-turbo`
- Kecepatan: Cepat
- Biaya: ~$0.002 per request

---

## Cara Menggunakan

1. Login ke aplikasi
2. Klik **"AI Assistant"** di sidebar
3. Ketik pertanyaan atau pesan
4. Tekan Enter atau klik tombol Send
5. AI akan menjawab dalam beberapa detik

---

## Contoh Pertanyaan

- "Jelaskan apa itu Next.js"
- "Bagaimana cara membuat API di Next.js?"
- "Apa perbedaan React dan Vue?"
- "Buatkan contoh kode untuk fetch API"
- "Jelaskan tentang TypeScript"

---

## Troubleshooting

### Error: "AI API key not configured"

**Solusi**: 
1. Pastikan sudah tambahkan `GROQ_API_KEY` atau `OPENAI_API_KEY` di `.env`
2. Restart server

### Error: "Invalid API key"

**Solusi**:
1. Cek API key sudah benar
2. Pastikan tidak ada spasi di awal/akhir
3. Groq key dimulai dengan `gsk_`
4. OpenAI key dimulai dengan `sk-`

### Error: "Rate limit exceeded"

**Solusi**:
1. Tunggu beberapa menit
2. Groq free tier: 30 requests/menit
3. Upgrade ke paid jika perlu lebih banyak

### AI tidak menjawab / loading terus

**Solusi**:
1. Cek console browser (F12) untuk error
2. Cek terminal server untuk error log
3. Pastikan API key valid
4. Cek koneksi internet

---

## Customisasi

### Ubah System Prompt

Edit file `app/api/assistant/chat/route.ts`:

```typescript
{
  role: 'system',
  content: 'Kamu adalah asisten AI yang membantu dan ramah. Jawab dalam bahasa Indonesia dengan jelas dan informatif.',
}
```

Ganti dengan prompt sesuai kebutuhan, contoh:
- "Kamu adalah asisten coding yang ahli dalam JavaScript dan TypeScript"
- "Kamu adalah tutor yang sabar dan detail"
- "Kamu adalah asisten customer service yang ramah"

### Ubah Model

Edit file `app/api/assistant/chat/route.ts`:

```typescript
// Groq models:
// - llama-3.3-70b-versatile (default, paling pintar)
// - llama-3.1-8b-instant (lebih cepat, lebih murah)
// - mixtral-8x7b-32768 (context window besar)

// OpenAI models:
// - gpt-3.5-turbo (default, murah)
// - gpt-4 (lebih pintar, lebih mahal)
// - gpt-4-turbo (balance)
```

### Tambah Fitur

Anda bisa tambahkan:
- History chat (simpan ke database)
- Voice input/output
- File upload untuk analisis
- Multi-language support
- Streaming response

---

## Keamanan

⚠️ **JANGAN SHARE** API key ke siapapun!

- API key hanya untuk server-side
- Sudah ada di `.gitignore`
- Jangan commit ke Git
- Jangan expose di client-side

---

## Next Steps

1. ✅ Dapatkan Groq API key (gratis)
2. ✅ Update `.env` dengan API key
3. ✅ Restart server
4. ✅ Test di `/dashboard/assistant`
5. ✅ Customize sesuai kebutuhan

---

Selamat! Anda sekarang punya AI Assistant di aplikasi Anda! 🚀
