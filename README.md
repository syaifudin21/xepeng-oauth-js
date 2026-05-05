# Xepeng JS SDK

The Xepeng JS SDK is a comprehensive and secure solution for implementing **OAuth 2.0 with PKCE** and **Payment Integration** in your web applications. Designed for React, Vue, and Vanilla JS, it prioritizes Developer Experience (DX) and high security.

## ✨ Key Features

- 🔒 **OAuth 2.0 with PKCE**: Secure implementation for browser-based applications (Public/Confidential Clients).
- 🧬 **Smart Callback**: `handleCallback()` automatically detects URLs and exchanges codes without manual configuration.
- 🔄 **Auto Refresh**: Automatically renews access tokens before expiration for uninterrupted sessions.
- 💳 **Payment Integration**: Manage orders and payment links with automatic HMAC-SHA256 signature handling.
- 🛡️ **TypeScript First**: Full type definitions and Generics support for custom responses.
- 🌐 **Framework Ready**: Direct support with hooks for React and composables for Vue 3.

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

## 🔐 OAuth 2.0 Implementation

### 1. Initialize OAuth Client

```typescript
import { OAuthClient } from "xepeng-oauth-js";

const oauth = new OAuthClient({
  clientId: "YOUR_CLIENT_ID",
  clientSecret: "YOUR_CLIENT_SECRET", // Optional for Public Clients
  baseUrl: "https://staging-app.xepeng.com",
  redirectUri: "http://localhost:5173/auth/callback",
  storage: "localStorage", // 'localStorage', 'sessionStorage', or 'memory'
});
```

### 2. Start Login Flow

```typescript
const login = async () => {
  const url = await oauth.getAuthorizationUrl();
  window.location.href = url;
};
```

### 3. Handle Callback (New DX!)

The SDK automatically extracts `code` and `state` from the URL.

```typescript
// On your redirect page (e.g., /auth/callback)
const handleAuth = async () => {
  try {
    const response = await oauth.handleCallback();
    console.log("Login Successful!", response);
  } catch (error) {
    console.error("Auth Failed:", error.message);
  }
};
```

---

## 💳 Payment Integration

### 1. Initialize Integration Client

```typescript
import { XepengIntegrationClient } from "xepeng-oauth-js/integration";

const client = new XepengIntegrationClient({
  clientId: "YOUR_CLIENT_ID",
  clientSecret: "YOUR_CLIENT_SECRET",
  isProduction: false,
});
```

### 2. Create an Order

```typescript
const items = [
  {
    amount: 50000,
    notes: "Purchase Shirt",
    product_description: "Flannel Shirt Size L",
    product_name: "Flannel Shirt",
  },
];

const orderResponse = await client.orders().create(items);
const orderUid = orderResponse.data.uid;
```

### 3. Generate Payment Link

```typescript
const options = {
  expired_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
  callback_url: "https://yourwebsite.com/api/notification",
  success_url: "https://yourwebsite.com/payment/success",
  cancel_url: "https://yourwebsite.com/payment/cancel",
};

const paymentResponse = await client.paymentLinks().generate(orderUid, options);
window.location.href = paymentResponse.data.payment_url;
```

---

## ⚛️ Framework Usage

### React

```tsx
import { useOAuth } from "xepeng-oauth-js/react";

function LoginButton() {
  const { login, isAuthenticated, user } = useOAuth(config);

  return (
    <button onClick={login}>
      {isAuthenticated ? `Welcome, ${user.name}` : "Login with Xepeng"}
    </button>
  );
}
```

### Vue 3

```vue
<script setup>
import { useOAuth } from "xepeng-oauth-js/vue";

const { login, user, isAuthenticated } = useOAuth(config);
</script>

<template>
  <button @click="login">
    {{ isAuthenticated ? `Hello ${user.name}` : 'Connect Xepeng Account' }}
  </button>
</template>
```

---

## ⚙️ Configuration Options

### OAuth Client Options
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `clientId` | `string` | **Required** | Your application Client ID. |
| `clientSecret` | `string` | `undefined` | Client Secret (for Confidential Clients). |
| `baseUrl` | `string` | `...staging-app...` | Authorization Server URL. |
| `redirectUri` | `string` | **Required** | Callback URL after successful auth. |
| `storage` | `string` | `memory` | Storage: `localStorage`, `sessionStorage`, `memory`. |
| `autoRefresh` | `boolean` | `true` | Auto refresh token if available. |

### Integration Client Options
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `clientId` | `string` | **Required** | Xepeng Dashboard Client ID. |
| `clientSecret` | `string` | **Required** | Xepeng Dashboard Client Secret. |
| `isProduction` | `boolean` | `false` | Use production environment. |
| `baseUrl` | `string` | `...staging-api...` | Override base API URL. |

---

## 🛡️ Security Note

### Signature Mechanism
For Payment Integration, every request is secured using **HMAC-SHA256**. The SDK handles this automatically using the format:
`METHOD + PATH + TIMESTAMP + BODY`

### PKCE State Mismatch
Ensure you start and end the OAuth flow on the same domain and **port**. The SDK will throw a clear error if the PKCE state doesn't match.

## 📄 License

MIT © Xepeng
