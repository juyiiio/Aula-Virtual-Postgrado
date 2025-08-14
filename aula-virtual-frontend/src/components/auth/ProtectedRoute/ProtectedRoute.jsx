import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import Loading from '../../common/Loading/Loading';
import Layout from '../../common/Layout/Layout';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Verificando autenticación..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && user) {
    const hasRequiredRole = roles.some(role => 
      user.roles?.some(userRole => userRole.name === role)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;
