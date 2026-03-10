# ⚠️ URGENT: Service Role Key Salah!

## Masalah Terdeteksi

Error: `signature verification failed`

**Penyebab**: Anda menggunakan Service Role Key dari project LAIN!

### Analisis:
```
✅ Project Anda:        pmfbhswmklakhtsopyzr
❌ Service Role Key:    nbsxmwbgtmorlioxmgsm (project lain!)
```

Service Role Key harus dari project yang SAMA!

---

## Solusi: Ambil Key yang Benar

### Langkah 1: Buka Dashboard Project yang Benar

1. Pergi ke: https://supabase.com/dashboard/project/pmfbhswmklakhtsopyzr
2. Atau buka dashboard → pilih project dengan ref: **pmfbhswmklakhtsopyzr**

### Langkah 2: Pergi ke Settings → API

1. Klik **Settings** (⚙️) di sidebar kiri bawah
2. Klik **API**

### Langkah 3: Copy Service Role Key yang BENAR

Di bagian **Project API keys**, Anda akan melihat 2 keys:

**1. anon public** (sudah benar ✅):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZmJoc3dta2xha2h0c29weXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTY3ODcsImV4cCI6MjA4ODA3Mjc4N30.E1hnN4KyNIjOLGPpdILAFLsuumh8bQo55jvfCCRATyQ
```
👆 Perhatikan: `"ref":"pmfbhswmklakhtsopyzr"` ✅

**2. service_role** (PERLU DICOPY):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZmJoc3dta2xha2h0c29weXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5Njc4NywiZXhwIjoyMDg4MDcyNzg3fQ.XXXXXXXX
```
👆 Harus ada: `"ref":"pmfbhswmklakhtsopyzr"` ✅

### Langkah 4: Update .env

Buka file `.env` dan ganti baris ini:

```env
SUPABASE_SERVICE_ROLE_KEY='PASTE_SERVICE_ROLE_KEY_DISINI'
```

**PENTING**: 
- Key harus dari project **pmfbhswmklakhtsopyzr**
- Key dimulai dengan `eyJ`
- Key panjangnya 200+ karakter
- Jika di-decode, harus ada `"ref":"pmfbhswmklakhtsopyzr"`

### Langkah 5: Restart Server

```cmd
# Stop server (Ctrl + C di terminal)
npm run dev
```

### Langkah 6: Test Upload

Coba upload foto profil lagi. Seharusnya berhasil!

---

## Cara Verifikasi Key Sudah Benar

Anda bisa decode JWT token untuk cek ref:

1. Buka: https://jwt.io
2. Paste Service Role Key Anda
3. Lihat di bagian **Payload**:
   ```json
   {
     "iss": "supabase",
     "ref": "pmfbhswmklakhtsopyzr",  ← HARUS INI!
     "role": "service_role",
     "iat": 1772496787,
     "exp": 2088072787
   }
   ```

Jika `"ref"` bukan `pmfbhswmklakhtsopyzr`, berarti key salah!

---

## Troubleshooting

### Tidak bisa menemukan Service Role Key?

Pastikan:
1. ✅ Anda login ke Supabase
2. ✅ Project **pmfbhswmklakhtsopyzr** aktif (tidak di-pause)
3. ✅ Anda membuka project yang benar
4. ✅ Pergi ke Settings → API → Project API keys

### Masih error setelah update?

1. **Pastikan tidak ada spasi** di awal/akhir key
2. **Restart server** dengan benar
3. **Clear browser cache** (Ctrl+Shift+R)
4. **Cek key di jwt.io** untuk verifikasi ref

### Storage bucket belum dibuat?

Jika error "Bucket not found":

1. Pergi ke **Storage** di Supabase Dashboard
2. Klik **"Create a new bucket"**
3. Name: `avatars`
4. Public bucket: ✅ Centang
5. Klik **"Create bucket"**

---

## Quick Check

Sebelum update `.env`, cek dulu:

```
✅ SUPABASE_URL:     https://pmfbhswmklakhtsopyzr.supabase.co
✅ ANON_KEY ref:     pmfbhswmklakhtsopyzr
❓ SERVICE_ROLE ref: pmfbhswmklakhtsopyzr (HARUS SAMA!)
```

Semua harus dari project yang SAMA!

---

Setelah update dengan key yang benar, upload foto akan berhasil! 🎉
