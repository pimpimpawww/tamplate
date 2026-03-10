# Cara Mengambil Service Role Key dari Supabase

## Error yang Terjadi
```
Upload error: [Error [StorageApiError]: Invalid Compact JWS]
```

**Penyebab**: `SUPABASE_SERVICE_ROLE_KEY` tidak valid atau salah format.

---

## Langkah-langkah Mengambil Service Role Key

### 1. Buka Supabase Dashboard
- Pergi ke: https://supabase.com/dashboard
- Login dengan akun Anda
- Pilih project: **pmfbhswmklakhtsopyzr**

### 2. Pergi ke Settings → API
1. Klik **Settings** (ikon gear) di sidebar kiri bawah
2. Klik **API** di menu settings

### 3. Copy Service Role Key
Scroll ke bagian **Project API keys**, Anda akan melihat:

- ✅ **anon public** - Key untuk client-side (sudah benar di .env)
- ✅ **service_role** - Key untuk server-side (INI YANG PERLU DICOPY)

**Service Role Key** formatnya seperti ini:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZmJoc3dta2xha2h0c29weXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5Njc4NywiZXhwIjoyMDg4MDcyNzg3fQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

⚠️ **PENTING**: 
- Key ini PANJANG (200+ karakter)
- Dimulai dengan `eyJ`
- Berisi 2 titik (`.`)
- Ini adalah JWT token

### 4. Update File .env

Buka file `.env` dan ganti baris ini:

**SEBELUM** (SALAH):
```env
SUPABASE_SERVICE_ROLE_KEY='db6ad36d8d3cce502937c0b1f62e55e6'
```

**SESUDAH** (BENAR):
```env
SUPABASE_SERVICE_ROLE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZmJoc3dta2xha2h0c29weXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5Njc4NywiZXhwIjoyMDg4MDcyNzg3fQ.PASTE-SERVICE-ROLE-KEY-DISINI'
```

### 5. Restart Development Server

Setelah update `.env`:

```cmd
# Stop server (Ctrl + C)
# Start lagi
npm run dev
```

### 6. Test Upload Lagi

Coba upload foto profil lagi. Seharusnya berhasil!

---

## Verifikasi Key Sudah Benar

Cek format key Anda:

✅ **BENAR** - Service Role Key:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZmJoc3dta2xha2h0c29weXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5Njc4NywiZXhwIjoyMDg4MDcyNzg3fQ.xxxxxxxxxx
```
- Panjang: 200+ karakter
- Format: JWT token
- Role: `service_role`

❌ **SALAH** - Bukan Service Role Key:
```
db6ad36d8d3cce502937c0b1f62e55e6
```
- Terlalu pendek
- Bukan JWT format
- Ini sepertinya random hex string

---

## Troubleshooting

### Error masih muncul setelah update?

1. **Pastikan tidak ada spasi** di awal/akhir key
2. **Restart server** dengan benar (Ctrl+C, lalu npm run dev)
3. **Clear browser cache** (Ctrl+Shift+R)
4. **Cek console log** untuk error detail

### Tidak bisa menemukan Service Role Key?

1. Pastikan Anda sudah login ke Supabase
2. Pastikan project sudah aktif (tidak di-pause)
3. Cek di: Settings → API → Project API keys → service_role

### Storage bucket belum dibuat?

Jika error "Bucket not found":

1. Pergi ke **Storage** di Supabase Dashboard
2. Klik **"Create a new bucket"**
3. Name: `avatars`
4. Public bucket: ✅ **Centang**
5. Klik **"Create bucket"**

---

## Screenshot Lokasi Key

Lokasi Service Role Key di dashboard:

```
Supabase Dashboard
└── Settings (⚙️)
    └── API
        └── Project API keys
            ├── anon public (untuk client)
            └── service_role (untuk server) ← COPY INI
```

---

## Keamanan

⚠️ **JANGAN SHARE** Service Role Key ke siapapun!

Service Role Key:
- Bypass semua Row Level Security (RLS)
- Akses penuh ke database
- Hanya untuk server-side code
- Jangan commit ke Git (sudah ada di .gitignore)

---

Setelah update key, upload foto seharusnya berhasil! 🎉
