import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';

const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, setUser, loading, setLoading } = context;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = authService.getToken();
    setIsAuthenticated(!!token);
  }, [user]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      setUser(response);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      const response = await authService.changePassword(passwordData);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.some(userRole => userRole.name === role);
  };

  const hasAnyRole = (roles) => {
    if (!user || !user.roles) return false;
    return roles.some(role => hasRole(role));
  };

  const isAdmin = () => hasRole('ADMIN');
  const isInstructor = () => hasRole('INSTRUCTOR');
  const isStudent = () => hasRole('STUDENT');
  const isCoordinator = () => hasRole('COORDINATOR');

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    hasRole,
    hasAnyRole,
    isAdmin,
    isInstructor,
    isStudent,
    isCoordinator
  };
};

export default useAuth;
