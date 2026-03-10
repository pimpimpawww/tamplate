# ✅ Upload Foto Sekarang Pakai File System Lokal

Karena Supabase Storage tidak bisa digunakan, saya sudah ubah sistem upload menggunakan **file system lokal**.

## Perubahan

✅ Foto disimpan di folder: `public/uploads/avatars/`
✅ Tidak perlu Supabase Storage lagi
✅ Tidak perlu setup bucket atau RLS policy
✅ Lebih simple dan langsung bisa dipakai

---

## Cara Test Upload

1. **Refresh halaman** (F5)
2. **Pilih foto** (max 2MB)
3. **Upload**
4. **Foto akan tersimpan di**: `public/uploads/avatars/avatar-[userId]-[timestamp].jpg`

---

## Troubleshooting

### Error: "Foreign key constraint violated"

**Penyebab**: User di session tidak ada di database

**Solusi**: Logout dan login ulang, atau buat user baru

```cmd
# Cek user di database
bunx prisma studio
```

1. Buka Prisma Studio
2. Klik tabel **User**
3. Cek apakah user Anda ada
4. Jika tidak ada, buat user baru dari User Management

### Upload berhasil tapi foto tidak muncul?

**Solusi**: Refresh halaman (F5)

---

## File yang Diubah

1. `app/api/profile/upload/route.ts` - Pakai file system, bukan Supabase
2. `public/uploads/avatars/` - Folder untuk simpan foto
3. `.gitignore` - Ignore uploaded files

---

## Keuntungan Upload Lokal

✅ Tidak perlu setup Supabase Storage
✅ Tidak perlu API key tambahan
✅ Lebih cepat (tidak ada network latency)
✅ Gratis unlimited storage
✅ Simple dan mudah di-debug

---

Sekarang coba upload foto lagi! Seharusnya langsung bisa. 🎉
