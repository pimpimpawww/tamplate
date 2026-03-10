# ✅ AI Assistant Widget - Floating Button

Fitur AI Assistant sekarang muncul sebagai **floating button** di pojok kanan bawah!

## Fitur

✅ **Floating Button** - Button bulat di pojok kanan bawah
✅ **Popup Chat** - Chat window muncul saat button diklik
✅ **Responsive** - Ukuran 400x600px, pas untuk chat
✅ **Modern UI** - Seperti live chat support
✅ **Always Available** - Muncul di semua halaman dashboard
✅ **Easy Close** - Klik X untuk tutup

---

## Cara Menggunakan

1. **Dapatkan Groq API Key** (5 menit):
   - Buka: https://console.groq.com
   - Sign up (gratis)
   - Buat API key
   - Copy key (dimulai dengan `gsk_`)

2. **Update .env**:
   ```env
   GROQ_API_KEY="gsk_PASTE_KEY_ANDA_DISINI"
   ```

3. **Start Server**:
   ```cmd
   npm run dev
   ```

4. **Test**:
   - Buka: http://localhost:3000/dashboard
   - Lihat button bulat biru di pojok kanan bawah
   - Klik button untuk buka chat
   - Ketik pesan dan chat dengan AI!

---

## Tampilan

### Button (Closed)
- Posisi: Pojok kanan bawah
- Warna: Biru
- Icon: Chat bubble
- Indicator: Dot hijau (online)

### Chat Window (Open)
- Ukuran: 400px x 600px
- Header: Biru dengan info AI
- Body: Chat messages
- Footer: Input field + send button

---

## File yang Dibuat/Diubah

1. ✅ `components/AIAssistantWidget.tsx` - Widget component
2. ✅ `app/dashboard/layout.tsx` - Ditambahkan widget
3. ✅ `app/api/assistant/chat/route.ts` - API endpoint (sudah ada)

---

## Customisasi

### Ubah Posisi Button

Edit `components/AIAssistantWidget.tsx`:

```tsx
// Pojok kanan bawah (default)
className="fixed bottom-6 right-6 ..."

// Pojok kiri bawah
className="fixed bottom-6 left-6 ..."

// Pojok kanan atas
className="fixed top-6 right-6 ..."
```

### Ubah Ukuran Chat Window

```tsx
// Default: 400px x 600px
className="... w-96 h-[600px] ..."

// Lebih besar: 500px x 700px
className="... w-[500px] h-[700px] ..."

// Lebih kecil: 350px x 500px
className="... w-[350px] h-[500px] ..."
```

### Ubah Warna

```tsx
// Button color
className="... bg-blue-600 hover:bg-blue-700 ..."

// Ganti dengan warna lain:
// bg-green-600 hover:bg-green-700
// bg-purple-600 hover:bg-purple-700
// bg-red-600 hover:bg-red-700
```

---

## Keunggulan Floating Widget

✅ Tidak mengganggu navigasi
✅ Selalu accessible dari halaman manapun
✅ User bisa buka/tutup kapan saja
✅ Tidak perlu pindah halaman
✅ Seperti live chat modern

---

## Selesai! 🎉

AI Assistant sekarang muncul sebagai floating button di pojok kanan bawah.

**Langkah terakhir:**
1. Dapatkan Groq API key (gratis)
2. Update `.env`
3. Restart server
4. Klik button biru di pojok kanan bawah!

Enjoy your AI Assistant! 🤖
