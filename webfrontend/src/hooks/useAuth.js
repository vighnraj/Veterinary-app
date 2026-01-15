import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    account,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateUser,
    updateAccount,
    hasActiveSubscription,
    hasPermission,
    hasRole,
  } = useAuthStore();

  return {
    user,
    account,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateUser,
    updateAccount,
    hasActiveSubscription,
    hasPermission,
    hasRole,
  };
};

export default useAuth;
