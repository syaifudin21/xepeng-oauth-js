# xepeng-oauth-js

Xepeng OAuth JS SDK for React, Vue, and Vanilla JS. This package provides a simple and secure way to implement OAuth with PKCE in your web applications.

## Installation

```bash
npm install xepeng-oauth-js
# or
yarn add xepeng-oauth-js
```

## Features

- **PKCE Support**: Secure OAuth 2.0 implementation for browser-based apps.
- **Auto Refresh**: Automatically refreshes access tokens before they expire.
- **Multiple Storage Options**: Supports `localStorage`, `sessionStorage`, and `memory` storage.
- **Framework Support**: Built-in hooks for React and composables for Vue 3.
- **TypeScript**: First-class TypeScript support.

## Integration with Environment Variables

You can configure the SDK using your application's environment variables.

### React (using Vite)

```typescript
// .env
VITE_XEPENG_CLIENT_ID=your-client-id
VITE_XEPENG_BASE_URL=https://staging-app.xepeng.com
VITE_XEPENG_REDIRECT_URI=http://localhost:3000/callback
```

```typescript
import { useOAuth } from "xepeng-oauth-js/react";

const config = {
  clientId: import.meta.env.VITE_XEPENG_CLIENT_ID,
  baseUrl: import.meta.env.VITE_XEPENG_BASE_URL,
  redirectUri: import.meta.env.VITE_XEPENG_REDIRECT_URI,
  scopes: ["profile", "email"],
  storage: "localStorage",
};

function App() {
  const { login, isAuthenticated, user } = useOAuth(config);
  // ...
}
```

### Vue 3 (using Vite)

```typescript
import { useOAuth } from "xepeng-oauth-js/vue";

const config = {
  clientId: import.meta.env.VITE_XEPENG_CLIENT_ID,
  baseUrl: import.meta.env.VITE_XEPENG_BASE_URL,
  redirectUri: import.meta.env.VITE_XEPENG_REDIRECT_URI,
  scopes: ["profile", "email"],
  storage: "localStorage",
};

export default {
  setup() {
    const { login, isAuthenticated, user } = useOAuth(config);
    return { login, isAuthenticated, user };
  },
};
```

### Vanilla JS

```typescript
import { OAuthClient } from "xepeng-oauth-js";

const client = new OAuthClient({
  clientId: "your-client-id",
  baseUrl: "https://staging-app.xepeng.com",
  redirectUri: "http://localhost:3000/callback",
  scopes: ["profile", "email"],
});

async function login() {
  const url = await client.getAuthorizationUrl();
  window.location.href = url;
}
```

## Configuration Options

| Option          | Type       | Default                          | Description                                               |
| --------------- | ---------- | -------------------------------- | --------------------------------------------------------- |
| `clientId`      | `string`   | **Required**                     | Your OAuth client ID                                      |
| `clientSecret`  | `string`   | `undefined`                      | Your OAuth client secret (only if needed)                 |
| `baseUrl`       | `string`   | `https://staging-app.xepeng.com` | Base URL of the OAuth server                              |
| `apiBaseUrl`    | `string`   | `undefined`                      | Base URL for API calls (defaults to baseUrl)              |
| `redirectUri`   | `string`   | **Required**                     | Redirect URI registered for the client                    |
| `scopes`        | `string[]` | `['profile', 'email']`           | Requested OAuth scopes                                    |
| `storage`       | `string`   | `memory`                         | Token storage: `localStorage`, `sessionStorage`, `memory` |
| `autoRefresh`   | `boolean`  | `true`                           | Whether to automatically refresh tokens                   |
| `refreshBuffer` | `number`   | `300`                            | Refresh buffer in seconds before token expiry             |

## License

MIT
