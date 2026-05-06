# Xepeng JS SDK 🚀

[![Version](https://img.shields.io/badge/version-1.1.1-blue.svg)](https://www.npmjs.com/package/xepeng-oauth-js)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

The Xepeng JS SDK is a powerful, type-safe library for implementing **OAuth 2.0 with PKCE** and **Payment Integration** in your applications. Optimized for React, Vue, and Node.js.

## ✨ Key Features

- 🔒 **OAuth 2.0 + PKCE**: Secure authentication for SPAs (React, Vue, Svelte) and mobile apps.
- 🧬 **Smart Callback**: `handleCallback()` automatically detects context and exchanges codes.
- 🔄 **Auto Token Refresh**: Background token renewal for seamless user sessions.
- 💳 **Payment Integration**: Manage orders and payment links with automatic HMAC-SHA256 signing.
- 🛡️ **Isomorphic Design**: Separate modules for Browser (OAuth) and Node.js (Integration) to ensure maximum security and minimum bundle size.
- ⚛️ **Framework First**: Native hooks for React and composables for Vue 3.

---

## 🚀 Installation

```bash
npm install xepeng-oauth-js
# or
yarn add xepeng-oauth-js
# or
bun add xepeng-oauth-js
```

---

## 🔐 OAuth 2.0 (Browser / Frontend)

Gunakan modul ini untuk login pengguna di aplikasi frontend.

### 1. Inisialisasi Client
```typescript
import { OAuthClient } from "xepeng-oauth-js";

const oauth = new OAuthClient({
  clientId: "YOUR_CLIENT_ID",
  baseUrl: "https://staging-app.xepeng.com", // Opsional
  redirectUri: "http://localhost:5173/auth/callback",
  storage: "localStorage", // 'localStorage', 'sessionStorage', atau 'memory'
});
```

### 2. Alur Login & Callback
```typescript
// Langkah 1: Redirect ke halaman login
const login = async () => {
  const url = await oauth.getAuthorizationUrl();
  window.location.href = url;
};

// Langkah 2: Tangani callback (di halaman redirect)
const handleAuth = async () => {
  try {
    const response = await oauth.handleCallback();
    console.log("Login Berhasil!", response);
  } catch (error) {
    console.error("Gagal Login:", error.message);
  }
};
```

---

## 💳 Payment Integration (Server-Side / Node.js)

Gunakan modul ini di backend atau SvelteKit/Next.js server-side. Modul ini terpisah untuk menjaga keamanan `clientSecret`.

### 1. Inisialisasi Integration Client
```typescript
import { XepengIntegrationClient } from "xepeng-oauth-js/integration";

const client = new XepengIntegrationClient({
  clientId: "YOUR_CLIENT_ID",
  clientSecret: "YOUR_CLIENT_SECRET", // WAJIB di server-side
  isProduction: false,
});
```

### 2. Manajemen Order & Pembayaran
```typescript
// Membuat Order
const orderResponse = await client.orders().create([
  {
    amount: 50000,
    product_name: "Kemeja Flanel",
    product_description: "Size L, Merah",
  }
]);

// Membuat Link Pembayaran
const payment = await client.paymentLinks().generate(orderResponse.data.uid, {
  success_url: "https://toko.com/success",
  callback_url: "https://api.toko.com/v1/callback"
});

console.log("URL Pembayaran:", payment.data.payment_url);
```

---

## ⚛️ Framework Support

### React
```tsx
import { useOAuth } from "xepeng-oauth-js/react";

function App() {
  const { login, user, isAuthenticated } = useOAuth(config);
  return <button onClick={login}>{isAuthenticated ? user.name : "Login"}</button>;
}
```

### Vue 3
```vue
<script setup>
import { useOAuth } from "xepeng-oauth-js/vue";
const { login, user, isAuthenticated } = useOAuth(config);
</script>

<template>
  <button @click="login">{{ isAuthenticated ? user.name : 'Connect Xepeng' }}</button>
</template>
```

---

## 🛡️ Keamanan & Bundle Size

### Browser vs Node.js
SDK ini menggunakan sistem **Conditional Exports**. Fitur integrasi (`/integration`) menggunakan modul Node.js `crypto` untuk tanda tangan HMAC. Dengan memisahkan impor, aplikasi frontend Anda tidak akan membengkak atau mengalami error karena dependensi Node.js.

| Modul | Penggunaan | Lingkungan |
| :--- | :--- | :--- |
| `xepeng-oauth-js` | OAuth & SSO | Browser (Vite, Webpack, dll) |
| `xepeng-oauth-js/integration` | Payment & Orders | Node.js / Server-side |
| `xepeng-oauth-js/react` | React Hook | Browser |
| `xepeng-oauth-js/vue` | Vue Composable | Browser |

---

## 📄 License
MIT © Xepeng
