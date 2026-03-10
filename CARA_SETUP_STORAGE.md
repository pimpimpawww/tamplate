# Cara Setup Storage untuk Upload Foto

## Langkah 1: Buat Bucket (Anda sedang di sini)

✅ Anda sudah di halaman yang benar!

**Setting yang benar:**
- ✅ Public bucket: **ON** (sudah dicentang)
- ✅ Restrict file size: OFF (biarkan off)
- ✅ Restrict MIME types: OFF (biarkan off)

**Klik tombol "Create"** untuk membuat bucket!

---

## Langkah 2: Setup RLS Policy (PENTING!)

Setelah bucket dibuat, Anda perlu setup RLS policy agar user bisa upload.

### Cara 1: Via UI (Mudah)

1. Setelah bucket `avatars` dibuat, klik bucket tersebut
2. Klik tab **"Policies"**
3. Klik **"New policy"**
4. Pilih **"For full customization"**
5. Isi form:
   - **Policy name**: Allow authenticated upload
   - **Allowed operation**: INSERT
   - **Target roles**: authenticated
   - **USING expression**: (kosongkan)
   - **WITH CHECK expression**: `bucket_id = 'avatars'`
6. Klik **"Review"** → **"Save policy"**

Ulangi untuk operation: UPDATE, DELETE, SELECT

### Cara 2: Via SQL (Cepat)

1. Pergi ke **SQL Editor** di Supabase Dashboard
2. Klik **"New query"**
3. Copy-paste isi file `setup-storage-rls.sql`
4. Klik **"Run"** atau tekan Ctrl+Enter

File SQL sudah saya buatkan: `setup-storage-rls.sql`

---

## Langkah 3: Test Upload

1. Refresh halaman profile (F5)
2. Pilih foto
3. Upload
4. Seharusnya berhasil!

---

## Troubleshooting

### Error: "new row violates row-level security policy"

**Penyebab**: RLS policy belum dibuat

**Solusi**: 
1. Jalankan SQL di `setup-storage-rls.sql`
2. Atau buat policy manual via UI (lihat Cara 1)

### Error: "Bucket not found"

**Penyebab**: Bucket belum dibuat atau nama salah

**Solusi**:
1. Pastikan bucket name: `avatars` (lowercase, plural)
2. Cek di Storage → Buckets

### Upload berhasil tapi foto tidak muncul?

**Penyebab**: Bucket tidak public atau policy SELECT belum ada

**Solusi**:
1. Pastikan bucket adalah **Public**
2. Tambahkan policy SELECT (lihat SQL)

---

## Verifikasi Setup Sudah Benar

Cek di Supabase Dashboard:

```
Storage
└── avatars (bucket)
    ├── Public: ✅ Yes
    └── Policies:
        ├── ✅ Allow authenticated upload (INSERT)
        ├── ✅ Allow authenticated update (UPDATE)
        ├── ✅ Allow authenticated delete (DELETE)
        └── ✅ Allow public read (SELECT)
```

---

## Quick Setup (Copy-Paste)

1. **Buat bucket** (Anda sedang di sini - klik "Create")
2. **Jalankan SQL**:
   - Pergi ke SQL Editor
   - Copy-paste dari `setup-storage-rls.sql`
   - Run
3. **Test upload**

---

Setelah setup, upload foto akan berhasil! 🎉
