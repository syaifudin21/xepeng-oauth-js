import { OAuthTokens } from "./types";

export interface StorageAdapter {
  get(): OAuthTokens | null;
  set(tokens: OAuthTokens): void;
  clear(): void;
}

export class MemoryStorage implements StorageAdapter {
  private tokens: OAuthTokens | null = null;
  get() {
    return this.tokens;
  }
  set(tokens: OAuthTokens) {
    this.tokens = tokens;
  }
  clear() {
    this.tokens = null;
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  private key = "xepeng_oauth_tokens";
  get() {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
  set(tokens: OAuthTokens) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.key, JSON.stringify(tokens));
    } catch (e) {
      console.warn("Failed to store tokens in localStorage:", e);
    }
  }
  clear() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(this.key);
    } catch (e) {
      console.warn("Failed to clear tokens from localStorage:", e);
    }
  }
}

export class SessionStorageAdapter implements StorageAdapter {
  private key = "xepeng_oauth_tokens";
  get() {
    if (typeof window === "undefined") return null;
    try {
      const data = sessionStorage.getItem(this.key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
  set(tokens: OAuthTokens) {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(this.key, JSON.stringify(tokens));
    } catch (e) {
      console.warn("Failed to store tokens in sessionStorage:", e);
    }
  }
  clear() {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(this.key);
    } catch (e) {
      console.warn("Failed to clear tokens from sessionStorage:", e);
    }
  }
}

export function createStorage(type: string = "memory"): StorageAdapter {
  switch (type) {
    case "localStorage":
      return new LocalStorageAdapter();
    case "sessionStorage":
      return new SessionStorageAdapter();
    default:
      return new MemoryStorage();
  }
}
