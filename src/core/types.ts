export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  baseUrl: string;
  apiBaseUrl?: string;
  scopes: string[];
  storage?: "localStorage" | "sessionStorage" | "memory";
  autoRefresh?: boolean;
  refreshBuffer?: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface UserInfo {
  sub: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

export interface OAuthState {
  state: string;
  codeVerifier: string;
  codeChallenge: string;
  redirectUri: string;
}
