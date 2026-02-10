import { ref, computed, readonly, onMounted } from "vue";
import { OAuthClient } from "../core/client";
import {
  OAuthConfig,
  UserInfo,
  OAuthTokens,
  TokenResponse,
} from "../core/types";

export function useOAuth(config: OAuthConfig) {
  const client = new OAuthClient(config);
  const isLoading = ref(false);
  const user = ref<UserInfo | null>(null);
  const error = ref<any>(null);
  const tokens = ref<OAuthTokens | null>(client.getTokens());

  const isAuthenticated = computed(() => {
    return !!tokens.value && Date.now() < tokens.value.expiresAt;
  });

  async function login() {
    isLoading.value = true;
    error.value = null;
    try {
      const url = await client.getAuthorizationUrl();
      window.location.href = url;
    } catch (e) {
      error.value = e;
      isLoading.value = false;
    }
  }

  async function handleCallback<T = TokenResponse>(url?: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await client.handleCallback<T>(url);
      tokens.value = client.getTokens();
      return result;
    } catch (e) {
      error.value = e;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    error.value = null;
    try {
      client.logout();
      tokens.value = null;
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  async function getUserInfo() {
    isLoading.value = true;
    error.value = null;
    try {
      const userInfo = await client.getUserInfo();
      user.value = userInfo;
      return userInfo;
    } catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isAuthenticated,
    isLoading: readonly(isLoading),
    user: readonly(user),
    error: readonly(error),
    login,
    handleCallback,
    logout,
    getUserInfo,
    getAccessToken: () => client.getAccessToken(),
    client,
  };
}
