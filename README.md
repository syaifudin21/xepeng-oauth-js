# xepeng-oauth-js

Xepeng OAuth JS SDK adalah solusi lengkap dan aman untuk implementasi **OAuth 2.0 dengan PKCE** pada aplikasi React, Vue, dan Vanilla JS. Didesain untuk kemudahan pengembang (Developer Experience) dan keamanan tingkat tinggi.

## ✨ Fitur Unggulan

- 🔒 **PKCE Support**: Implementasi OAuth 2.0 yang aman untuk aplikasi berbasis browser (Public/Confidential Client).
- 🧬 **Smart Callback**: `handleCallback()` secara otomatis mendeteksi URL dan menukar kode tanpa perlu konfigurasi manual.
- 🔄 **Auto Refresh**: Secara otomatis memperbarui access token sebelum kadaluarsa untuk sesi yang tak terputus.
- 📦 **Multiple Storage**: Pilihan penyimpanan fleksibel: `localStorage`, `sessionStorage`, atau `memory`.
- 🧩 **Framework Ready**: Dukungan langsung berupa hooks untuk React dan composables untuk Vue 3.
- 🛡️ **TypeScript First**: Definisi tipe data yang lengkap dan dukungan _Generics_ untuk respons kustom.

## 🚀 Instalasi

```bash
npm install xepeng-oauth-js
# atau
yarn add xepeng-oauth-js
```

## 🛠️ Contoh Integrasi Cepat

### 1. Inisialisasi Client

```typescript
import { OAuthClient } from "xepeng-oauth-js";

const oauth = new OAuthClient({
  clientId: "YOUR_CLIENT_ID",
  clientSecret: "YOUR_CLIENT_SECRET", // Opsional jika menggunakan Confidential Client
  baseUrl: "https://staging-app.xepeng.com",
  redirectUri: "http://localhost:5173/auth/callback",
  storage: "localStorage",
});
```

### 2. Memulai Login

```typescript
// Arahkan user ke halaman otorisasi Xepeng
const login = async () => {
  const url = await oauth.getAuthorizationUrl();
  window.location.href = url;
};
```

### 3. Menangani Callback (DX Baru!)

Cukup panggil `handleCallback()` tanpa argumen di halaman redirect Anda. SDK akan otomatis mengambil `code` dan `state` dari URL.

```typescript
// Di halaman callback (e.g., /auth/callback)
const handleAuth = async () => {
  try {
    // Mendukung Generics untuk tipe data kustom (seperti client_id & client_secret tambahan)
    const response = await oauth.handleCallback<{
      client_id: string;
      client_secret: string;
    }>();

    console.log("Login Berhasil!", response);
    // Lakukan integrasi otomatis atau simpan ke store Anda
  } catch (error) {
    console.error("Auth Gagal:", error.message);
  }
};
```

## ⚛️ Penggunaan di Framework

### React Hook

```tsx
import { useOAuth } from "xepeng-oauth-js/react";

function LoginButton() {
  const { login, isAuthenticated, user, error } = useOAuth(config);

  return (
    <button onClick={login}>
      {isAuthenticated ? `Halo, ${user.name}` : "Login with Xepeng"}
    </button>
  );
}
```

### Vue 3 Composable

```vue
<script setup>
import { useOAuth } from "xepeng-oauth-js/vue";

const { login, user, isAuthenticated } = useOAuth(config);
</script>

<template>
  <button @click="login">Hubungkan Akun Xepeng</button>
</template>
```

## ⚙️ Opsi Konfigurasi

| Opsi           | Tipe      | Default                          | Deskripsi                                                         |
| :------------- | :-------- | :------------------------------- | :---------------------------------------------------------------- |
| `clientId`     | `string`  | **Wajib**                        | Client ID aplikasi Anda.                                          |
| `clientSecret` | `string`  | `undefined`                      | Client Secret (untuk Confidential Client).                        |
| `baseUrl`      | `string`  | `https://staging-app.xepeng.com` | URL Server Otorisasi.                                             |
| `redirectUri`  | `string`  | **Wajib**                        | URL balik setelah otorisasi sukses.                               |
| `storage`      | `string`  | `memory`                         | Strategi penyimpanan: `localStorage`, `sessionStorage`, `memory`. |
| `autoRefresh`  | `boolean` | `true`                           | Otomatis refresh token jika tersedia refresh_token.               |

## 🐞 Penanganan Masalah (Tips)

**OAuth State Mismatch?**
Pastikan Anda memulai dan mengakhiri alur OAuth pada domain dan **port** yang sama (misal: jangan pindah dari `localhost:5173` ke `localhost:5174` di tengah proses). SDK kami akan memberikan pesan error yang jelas jika terjadi ketidakcocokan state PKCE.

## 📄 Lisensi

MIT © Xepeng
