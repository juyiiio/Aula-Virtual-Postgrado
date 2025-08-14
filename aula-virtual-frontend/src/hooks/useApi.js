import { useState, useEffect } from 'react';
import { useNotification } from './useNotification';

const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const {
    immediate = true,
    onSuccess,
    onError,
    showSuccessMessage = false,
    showErrorMessage = true
  } = options;

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (showSuccessMessage) {
        showNotification('Operación exitosa', 'success');
      }
      
      return result;
    } catch (err) {
      setError(err);
      
      if (onError) {
        onError(err);
      }
      
      if (showErrorMessage) {
        const message = err?.response?.data?.message || err?.message || 'Error en la operación';
        showNotification(message, 'error');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    if (immediate && apiFunction) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

export { useApi };
export default useApi;
