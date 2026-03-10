# Solusi Masalah Database Connection

## Masalah
Error: `Can't reach database server at db.anvbkbixhcnxuoazmrxs.supabase.co:5432`

**Penyebab**: Project Supabase tidak aktif (di-pause atau dihapus)

---

## Solusi A: Aktifkan Project Lama

1. Buka https://supabase.com/dashboard
2. Login dengan akun Anda
3. Cari project dengan ref: `anvbkbixhcnxuoazmrxs`
4. Jika ada tombol **"Restore"** atau **"Resume"**, klik
5. Tunggu 2-5 menit hingga database aktif
6. Lanjut ke **Step Update Connection String** di bawah

---

## Solusi B: Buat Project Supabase Baru (5 Menit)

### 1. Buat Project Baru

1. Buka https://supabase.com/dashboard
2. Klik **"New Project"**
3. Isi form:
   - **Name**: Bebas (contoh: "my-app")
   - **Database Password**: Buat password kuat (SIMPAN INI!)
   - **Region**: Southeast Asia (Singapore)
4. Klik **"Create new project"**
5. Tunggu 2-3 menit

### 2. Ambil Connection Strings

Setelah project selesai dibuat:

1. Klik **Settings** (ikon gear) di sidebar kiri
2. Klik **Database**
3. Scroll ke bagian **"Connection string"**
4. Pilih tab **"URI"**
5. Copy 2 connection string:

**Transaction pooling** (port 6543):
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Session mode** (port 5432):
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### 3. Update File .env

Ganti di file `.env`:

```env
DATABASE_URL='postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&prepared_statements=false'
DIRECT_URL='postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
```

**Ganti**:
- `[PROJECT-REF]` dengan project ref Anda
- `[PASSWORD]` dengan password database Anda

### 4. Ambil Supabase Keys

Masih di Settings:

1. Klik **API** di sidebar
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

Update di `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL='https://[PROJECT-REF].supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY='eyJhbGc...'
SUPABASE_SERVICE_ROLE_KEY='eyJhbGc...'
```

### 5. Setup Storage Bucket

1. Di Supabase Dashboard, klik **Storage** di sidebar
2. Klik **"Create a new bucket"**
3. Isi:
   - **Name**: `profile-photos`
   - **Public bucket**: ✅ Centang
4. Klik **"Create bucket"**

### 6. Setup Database & Run

Jalankan command ini:

```cmd
bunx prisma generate
bunx prisma db push
npm run dev
```

### 7. Buat Admin Pertama

1. Generate token:
   ```cmd
   openssl rand -hex 8
   ```

2. Update `.env`:
   ```env
   REGISTRATION_TOKEN="hasil-dari-step-1"
   SESSION_SECRET="hasil-dari-openssl-rand-hex-32"
   ```

3. Restart server (Ctrl+C, lalu `npm run dev`)

4. Buka browser:
   ```
   http://localhost:3000/[TOKEN-ANDA]/register
   ```

5. Register sebagai admin

---

## Solusi C: Gunakan Database Lokal (PostgreSQL)

Jika tidak ingin pakai Supabase:

### 1. Install PostgreSQL

Download dari: https://www.postgresql.org/download/windows/

### 2. Buat Database

```cmd
psql -U postgres
CREATE DATABASE myapp;
\q
```

### 3. Update .env

```env
DATABASE_URL='postgresql://postgres:password@localhost:5432/myapp'
DIRECT_URL='postgresql://postgres:password@localhost:5432/myapp'
```

### 4. Setup

```cmd
bunx prisma generate
bunx prisma db push
npm run dev
```

---

## Verifikasi Koneksi

Test koneksi dengan:

```cmd
bunx prisma db pull
```

Jika berhasil, Anda akan melihat:
```
✔ Introspected 2 models and wrote them into prisma\schema.prisma
```

---

## Troubleshooting

### Error: "Can't reach database server"
- ✅ Cek project Supabase aktif
- ✅ Cek password benar
- ✅ Cek connection string format benar

### Error: "Authentication failed"
- ✅ Password salah, ambil ulang dari dashboard
- ✅ Copy connection string dengan benar

### Error: "SSL required"
- ✅ Tambahkan `?sslmode=require` di akhir URL

---

## Bantuan Lebih Lanjut

Jika masih error, kirim screenshot dari:
1. Supabase Dashboard → Settings → Database
2. Error message lengkap
3. Isi file `.env` (sensor password)
