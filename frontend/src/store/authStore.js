import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants/config';
import { authApi } from '../api';

const useAuthStore = create((set, get) => ({
  user: null,
  account: null,
  isAuthenticated: false,
  isLoading: true,

  // Initialize auth state from storage
  initialize: async () => {
    try {
      const userJson = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
      const accountJson = await SecureStore.getItemAsync(STORAGE_KEYS.ACCOUNT);
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

      if (userJson && accessToken) {
        set({
          user: JSON.parse(userJson),
          account: accountJson ? JSON.parse(accountJson) : null,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },

  // Login
  login: async (email, password) => {
    try {
      // Clear any existing tokens before login
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCOUNT);

      console.log('Attempting login for:', email);
      const response = await authApi.login({ email, password });
      console.log('Login response:', JSON.stringify(response, null, 2));

      // authApi already returns response.data, so response = { success: true, data: { user, account, tokens } }
      const { user, account, tokens } = response.data;

      // Store tokens and user data
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCOUNT, JSON.stringify(account));

      set({
        user,
        account,
        isAuthenticated: true,
      });

      return response;
    } catch (error) {
      console.error('Login error:', error.message);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Register
  register: async (data) => {
    const response = await authApi.register(data);
    return response;
  },

  // Logout
  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    }

    // Clear storage
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCOUNT);

    set({
      user: null,
      account: null,
      isAuthenticated: false,
    });
  },

  // Update user profile
  updateUser: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData },
    }));

    // Update storage
    SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(get().user));
  },

  // Update account
  updateAccount: (accountData) => {
    set((state) => ({
      account: { ...state.account, ...accountData },
    }));

    // Update storage
    SecureStore.setItemAsync(STORAGE_KEYS.ACCOUNT, JSON.stringify(get().account));
  },

  // Check subscription status
  hasActiveSubscription: () => {
    const { account } = get();
    if (!account) return false;
    return ['active', 'trialing'].includes(account.subscriptionStatus);
  },

  // Check if user has permission
  hasPermission: (permission) => {
    const { user } = get();
    if (!user) return false;
    if (['owner', 'admin'].includes(user.role)) return true;
    return user.permissions?.[permission] === true;
  },
}));

export default useAuthStore;
