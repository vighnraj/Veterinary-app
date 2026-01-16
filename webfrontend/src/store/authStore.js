import { create } from 'zustand';
import { STORAGE_KEYS } from '../constants/config';
import { authApi } from '../api';

const useAuthStore = create((set, get) => ({
  user: null,
  account: null,
  isAuthenticated: false,
  isLoading: true,

  // Initialize auth state from localStorage
  initialize: () => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      const accountStr = localStorage.getItem(STORAGE_KEYS.ACCOUNT);

      if (accessToken && userStr) {
        const user = JSON.parse(userStr);
        const account = accountStr ? JSON.parse(accountStr) : null;

        set({
          user,
          account,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      get().clearAuth();
    }
  },

  // Login
  login: async (email, password) => {
    // Clear any existing tokens before login to prevent race conditions
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT);

    const response = await authApi.login({ email, password });
    // Backend returns tokens inside a 'tokens' object
    const { user, account, tokens } = response.data.data;
    const { accessToken, refreshToken } = tokens;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.ACCOUNT, JSON.stringify(account));

    set({
      user,
      account,
      isAuthenticated: true,
    });

    return response.data;
  },

  // Register
  register: async (data) => {
    const response = await authApi.register(data);
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      get().clearAuth();
    }
  },

  // Clear auth data
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT);

    set({
      user: null,
      account: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  // Update user
  updateUser: (userData) => {
    const updatedUser = { ...get().user, ...userData };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  // Update account
  updateAccount: (accountData) => {
    const updatedAccount = { ...get().account, ...accountData };
    localStorage.setItem(STORAGE_KEYS.ACCOUNT, JSON.stringify(updatedAccount));
    set({ account: updatedAccount });
  },

  // Check subscription status
  hasActiveSubscription: () => {
    const { account } = get();
    if (!account) return false;
    return ['active', 'trialing'].includes(account.subscriptionStatus);
  },

  // Check permission
  hasPermission: (permission) => {
    const { user } = get();
    if (!user) return false;

    // Owners and admins have all permissions
    if (['owner', 'admin'].includes(user.role)) return true;

    // Check specific permission
    return user.permissions?.[permission] === true;
  },

  // Check role
  hasRole: (...roles) => {
    const { user } = get();
    if (!user) return false;
    return roles.includes(user.role);
  },
}));

export default useAuthStore;
