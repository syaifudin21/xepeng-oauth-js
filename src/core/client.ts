import {
  OAuthConfig,
  OAuthTokens,
  TokenResponse,
  UserInfo,
  OAuthState,
} from "./types";
import { OAuthError } from "./errors";
import { createStorage, StorageAdapter } from "./storage";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from "./pkce";

const DEFAULT_CONFIG: Partial<OAuthConfig> = {
  baseUrl: "https://staging-app.xepeng.com",
  apiBaseUrl: "https://staging-api.xepeng.com",
  scopes: ["profile", "email"],
  storage: "memory",
  autoRefresh: true,
  refreshBuffer: 300,
};

export class OAuthClient {
  private config: OAuthConfig;
  private storage: StorageAdapter;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: OAuthConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.storage = createStorage(this.config.storage);
  }

  async getAuthorizationUrl(): Promise<string> {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    this.storeOAuthState(state, codeVerifier, codeChallenge);

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: this.config.scopes.join(" "),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return `${this.config.baseUrl}/oauth/authorize?${params.toString()}`;
  }

  async handleCallback<T = TokenResponse>(callbackUrl?: string): Promise<T> {
    const url = callbackUrl
      ? new URL(callbackUrl)
      : typeof window !== "undefined"
        ? new URL(window.location.href)
        : null;

    if (!url) {
      throw new OAuthError(
        "No callback URL provided and window.location is undefined",
        "missing_url",
      );
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      throw new OAuthError(
        url.searchParams.get("error_description") || error,
        error,
      );
    }

    if (!code || !state) {
      throw new OAuthError(
        "Missing code or state in callback",
        "invalid_callback",
      );
    }

    const storedState = this.retrieveOAuthState();
    if (!storedState || storedState.state !== state) {
      throw new OAuthError("PKCE state mismatch or expired", "invalid_state");
    }

    const result = await this.exchangeCodeForToken<T>(
      code,
      storedState.codeVerifier,
    );
    return result;
  }

  async exchangeCodeForToken<T = TokenResponse>(
    code: string,
    codeVerifier: string,
  ): Promise<T> {
    const response = await this.fetchToken<T>({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code_verifier: codeVerifier,
    });
    await this.storeTokens(response as unknown as TokenResponse);
    return response;
  }

  async refreshAccessToken<T = TokenResponse>(): Promise<T> {
    const tokens = this.storage.get();
    if (!tokens?.refreshToken) {
      throw new OAuthError("No refresh token available", "no_refresh_token");
    }
    const response = await this.fetchToken<T>({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });
    await this.storeTokens(response as unknown as TokenResponse);
    return response;
  }

  async getUserInfo(): Promise<UserInfo> {
    const tokens = this.getTokens();
    if (!tokens) {
      throw new OAuthError("Not authenticated", "not_authenticated");
    }
    const baseUrl = this.config.apiBaseUrl || this.config.baseUrl;
    const response = await fetch(`${baseUrl}/oauth/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    if (!response.ok) {
      throw new OAuthError(
        "Failed to fetch user info",
        "userinfo_failed",
        response.status,
      );
    }
    return response.json();
  }

  async revokeTokens(): Promise<void> {
    const tokens = this.getTokens();
    if (!tokens) return;
    const baseUrl = this.config.apiBaseUrl || this.config.baseUrl;
    await fetch(`${baseUrl}/oauth/revoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify({ client_id: this.config.clientId }),
    });
    this.logout();
  }

  isAuthenticated(): boolean {
    const tokens = this.storage.get();
    if (!tokens) return false;
    return Date.now() < tokens.expiresAt;
  }

  getTokens(): OAuthTokens | null {
    return this.storage.get();
  }

  async getAccessToken(): Promise<string> {
    const tokens = this.getTokens();
    if (!tokens) {
      throw new OAuthError("Not authenticated", "not_authenticated");
    }
    if (this.shouldRefreshToken(tokens)) {
      await this.refreshAccessToken();
      return (this.getTokens() as OAuthTokens).accessToken;
    }
    return tokens.accessToken;
  }

  logout(): void {
    this.storage.clear();
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.clearOAuthState();
  }

  private async fetchToken<T = TokenResponse>(
    params: Record<string, string | undefined>,
  ): Promise<T> {
    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) body.append(key, value);
    }
    const baseUrl = this.config.apiBaseUrl || this.config.baseUrl;
    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new OAuthError(
        error.message || "Token request failed",
        error.error || "token_error",
        response.status,
      );
    }
    return response.json();
  }

  private async storeTokens(response: TokenResponse): Promise<void> {
    const expiresAt = Date.now() + response.expires_in * 1000;
    const tokens: OAuthTokens = {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt,
    };
    this.storage.set(tokens);
    if (this.config.autoRefresh && response.refresh_token) {
      this.setupAutoRefresh(tokens);
    }
  }

  private setupAutoRefresh(tokens: OAuthTokens): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    const refreshTime =
      tokens.expiresAt - Date.now() - (this.config.refreshBuffer || 300) * 1000;
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshAccessToken().catch(console.error);
      }, refreshTime);
    }
  }

  private shouldRefreshToken(tokens: OAuthTokens): boolean {
    const bufferTime = (this.config.refreshBuffer || 300) * 1000;
    return Date.now() >= tokens.expiresAt - bufferTime;
  }

  private storeOAuthState(
    state: string,
    codeVerifier: string,
    codeChallenge: string,
  ): void {
    if (typeof window === "undefined") return;
    const key = "xepeng_oauth_state";
    const data: OAuthState = {
      state,
      codeVerifier,
      codeChallenge,
      redirectUri: this.config.redirectUri,
    };
    localStorage.setItem(key, JSON.stringify(data));
  }

  private retrieveOAuthState(): OAuthState | null {
    if (typeof window === "undefined") return null;
    const key = "xepeng_oauth_state";
    const data = localStorage.getItem(key);
    localStorage.removeItem(key);
    return data ? JSON.parse(data) : null;
  }

  private clearOAuthState(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("xepeng_oauth_state");
  }
}
