# ⚠️ Database Tidak Bisa Diakses

## Masalah

Server database Supabase Anda tidak bisa dijangkau:
- Host: `aws-1-ap-northeast-2.pooler.supabase.com`
- Region: Northeast Asia (Korea)
- Status: **100% packet loss** (tidak bisa ping)

**Penyebab**: 
- Project di-pause
- Region terlalu jauh/bermasalah
- Network issue

---

## Solusi: Buat Project Supabase Baru (10 Menit)

### 1. Buat Project Baru

1. Buka: https://supabase.com/dashboard
2. Klik **"New Project"**
3. Isi form:
   - **Name**: my-app (bebas)
   - **Database Password**: Buat password kuat (SIMPAN!)
   - **Region**: **Southeast Asia (Singapore)** ← PILIH INI (lebih dekat!)
4. Klik **"Create new project"**
5. Tunggu 2-3 menit

### 2. Ambil Connection Strings

Setelah project selesai:

1. Klik **Settings** → **Database**
2. Scroll ke **"Connection string"**
3. Pilih tab **"URI"**
4. Copy 2 connection string:

**Transaction pooling** (port 6543):
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Session mode** (port 5432):
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### 3. Update .env

```env
DATABASE_URL='postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=0'
DIRECT_URL='postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
```

Ganti:
- `[PROJECT-REF]` dengan project ref baru
- `[PASSWORD]` dengan password database

### 4. Ambil Supabase Keys

Di Settings → API:

```env
NEXT_PUBLIC_SUPABASE_URL='https://[PROJECT-REF].supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY='eyJhbGc...'
SUPABASE_SERVICE_ROLE_KEY='eyJhbGc...'
```

### 5. Setup Database

```cmd
bunx prisma generate
bunx prisma db push
```

### 6. Restart Server

```cmd
taskkill /F /IM node.exe
npm run dev
```

### 7. Register Admin Baru

1. Buka: http://localhost:3000/db6ad36d8d3cce502937c0b1f62e55e6/register
2. Register dengan email baru
3. Login
4. Upload foto (sekarang pakai local storage, tidak perlu Supabase Storage)

---

## Kenapa Harus Ganti?

❌ **Region Korea (Northeast-2)**:
- Jauh dari Indonesia
- Koneksi tidak stabil
- Packet loss 100%

✅ **Region Singapore (Southeast-1)**:
- Dekat dengan Indonesia
- Koneksi lebih cepat dan stabil
- Latency rendah

---

## Alternatif: Pakai Database Lokal

Jika tidak mau pakai Supabase, bisa pakai PostgreSQL lokal:

### 1. Install PostgreSQL

Download: https://www.postgresql.org/download/windows/

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

## Rekomendasi

**Pilih Supabase Singapore** karena:
- ✅ Gratis
- ✅ Dekat dengan Indonesia
- ✅ Koneksi stabil
- ✅ Tidak perlu install PostgreSQL
- ✅ Sudah include authentication & storage

---

## Quick Check

Test koneksi ke region Singapore:

```cmd
ping aws-0-ap-southeast-1.pooler.supabase.com
```

Seharusnya bisa ping dengan latency ~30-50ms (jauh lebih baik dari Korea yang timeout).

---

Setelah ganti database, semua fitur akan berjalan lancar! 🚀
