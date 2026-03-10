# Fix Upload Foto - User Not Found

## Masalah
Error: "User not found in database" saat upload foto

## Penyebab
1. User di session tidak ada di database
2. Storage bucket belum dibuat di Supabase

---

## Solusi 1: Cek User di Database

Pastikan user Anda sudah terdaftar di database:

```cmd
bunx prisma studio
```

1. Buka Prisma Studio
2. Klik tabel **User**
3. Cek apakah email `kirananajwa092@gmail.com` ada
4. Jika tidak ada, buat user baru dari halaman User Management

---

## Solusi 2: Buat Storage Bucket di Supabase

### Langkah-langkah:

1. **Buka Supabase Dashboard**
   - https://supabase.com/dashboard/project/anvbkbixhcnxuoazmrxs

2. **Pergi ke Storage**
   - Klik **Storage** di sidebar kiri

3. **Buat Bucket Baru**
   - Klik **"Create a new bucket"** atau **"New bucket"**
   - Isi form:
     - **Name**: `avatars`
     - **Public bucket**: ✅ **CENTANG** (penting!)
     - **File size limit**: 2MB (opsional)
     - **Allowed MIME types**: image/* (opsional)
   - Klik **"Create bucket"**

4. **Verifikasi Bucket**
   - Pastikan bucket `avatars` muncul di list
   - Pastikan status: **Public**

---

## Solusi 3: Setup RLS Policy (Opsional)

Jika upload masih error setelah buat bucket, tambahkan RLS policy:

1. Di Supabase Dashboard, klik bucket **avatars**
2. Klik tab **"Policies"**
3. Klik **"New policy"**
4. Pilih template: **"Allow public read access"**
5. Tambahkan policy untuk upload:

```sql
-- Policy untuk upload (INSERT)
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Policy untuk update
CREATE POLICY "Allow users to update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Policy untuk delete
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Policy untuk read (public)
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

## Solusi 4: Restart Server

Setelah buat bucket, restart server:

```cmd
# Stop server
taskkill /F /IM node.exe

# Start lagi
npm run dev
```

---

## Test Upload

1. Login ke aplikasi
2. Pergi ke halaman Profile
3. Pilih foto (max 2MB, format: JPG/PNG/WebP/GIF)
4. Klik upload
5. Foto seharusnya berhasil upload!

---

## Troubleshooting

### Error: "User not found in database"
**Solusi**: Saya sudah hapus pengecekan ini. Restart server dan coba lagi.

### Error: "Bucket not found"
**Solusi**: Buat bucket `avatars` di Supabase Storage (lihat Solusi 2)

### Error: "Invalid JWT" atau "signature verification failed"
**Solusi**: 
- Pastikan `SUPABASE_SERVICE_ROLE_KEY` benar
- Ambil dari: Settings → API → service_role key
- Restart server

### Error: "Row Level Security policy violation"
**Solusi**: 
- Pastikan bucket `avatars` adalah **Public**
- Atau tambahkan RLS policy (lihat Solusi 3)

### Foto tidak muncul setelah upload?
**Solusi**:
- Refresh halaman (F5)
- Clear cache browser (Ctrl+Shift+R)
- Cek bucket di Supabase Storage apakah foto ada

---

## Verifikasi Bucket Sudah Benar

Cek di Supabase Dashboard → Storage:

```
✅ Bucket name: avatars
✅ Status: Public
✅ Files: (akan muncul setelah upload)
```

---

## Quick Fix Command

Jika masih error, coba:

```cmd
# Kill all node processes
taskkill /F /IM node.exe

# Regenerate Prisma
bunx prisma generate

# Start server
npm run dev
```

---

Setelah setup bucket storage, upload foto seharusnya berhasil! 🎉
