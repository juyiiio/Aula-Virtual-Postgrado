import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { FaUser, FaLock } from 'react-icons/fa';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2 className={styles.title}>Iniciar Sesión</h2>
        <p className={styles.subtitle}>
          Accede a tu aula virtual de postgrado
        </p>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          {error}
        </div>
      )}

      <div className={styles.formGroup}>
        <Input
          label="Usuario"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Ingresa tu usuario o email"
          icon={<FaUser />}
          error={errors.username}
          required
          fullWidth
        />
      </div>

      <div className={styles.formGroup}>
        <Input
          label="Contraseña"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Ingresa tu contraseña"
          icon={<FaLock />}
          error={errors.password}
          required
          fullWidth
        />
      </div>

      <div className={styles.formOptions}>
        <label className={styles.remember}>
          <input type="checkbox" />
          <span>Recordar sesión</span>
        </label>
        <a href="/forgot-password" className={styles.forgotPassword}>
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="large"
        loading={isLoading}
        fullWidth
      >
        Iniciar Sesión
      </Button>

      <div className={styles.footer}>
        <p>
          ¿No tienes cuenta?{' '}
          <a href="/register" className={styles.registerLink}>
            Regístrate aquí
          </a>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
