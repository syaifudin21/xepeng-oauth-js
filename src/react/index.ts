import { useState, useCallback, useMemo, useEffect } from "react";
import { OAuthClient } from "../core/client";
import {
  OAuthConfig,
  UserInfo,
  OAuthTokens,
  TokenResponse,
} from "../core/types";

export function useOAuth(config: OAuthConfig) {
  const client = useMemo(() => new OAuthClient(config), [config]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState<any>(null);
  const [tokens, setTokens] = useState<OAuthTokens | null>(() =>
    client.getTokens(),
  );

  const isAuthenticated = useMemo(() => {
    return !!tokens && Date.now() < tokens.expiresAt;
  }, [tokens]);

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = await client.getAuthorizationUrl();
      window.location.href = url;
    } catch (e) {
      setError(e);
      setIsLoading(false);
    }
  }, [client]);

  const handleCallback = useCallback(
    async <T = TokenResponse>(url?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await client.handleCallback<T>(url);
        setTokens(client.getTokens());
        return result;
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      client.logout();
      setTokens(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getUserInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userInfo = await client.getUserInfo();
      setUser(userInfo);
      return userInfo;
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    login,
    handleCallback,
    logout,
    getUserInfo,
    getAccessToken: () => client.getAccessToken(),
    client,
  };
}
