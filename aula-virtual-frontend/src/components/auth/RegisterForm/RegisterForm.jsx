import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaIdCard } from 'react-icons/fa';
import styles from './RegisterForm.module.css';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    userCode: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    maternalSurname: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});

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
    
    if (!formData.userCode.trim()) {
      newErrors.userCode = 'El código de usuario es requerido';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido paterno es requerido';
    }
    
    if (formData.phone && !/^\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono debe tener 9 dígitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate('/login');
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2 className={styles.title}>Crear Cuenta</h2>
        <p className={styles.subtitle}>
          Regístrate para acceder al aula virtual
        </p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <Input
            label="Código de Usuario"
            type="text"
            name="userCode"
            value={formData.userCode}
            onChange={handleChange}
            placeholder="EST001, DOC001, etc."
            icon={<FaIdCard />}
            error={errors.userCode}
            required
            fullWidth
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Nombre de Usuario"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Nombre de usuario único"
            icon={<FaUser />}
            error={errors.username}
            required
            fullWidth
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            icon={<FaEnvelope />}
            error={errors.email}
            required
            fullWidth
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Nombres"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Tus nombres"
            error={errors.firstName}
            required
            fullWidth
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Apellido Paterno"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Apellido paterno"
            error={errors.lastName}
            required
            fullWidth
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Apellido Materno"
            type="text"
            name="maternalSurname"
            value={formData.maternalSurname}
            onChange={handleChange}
            placeholder="Apellido materno"
            fullWidth
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Teléfono"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="987654321"
            icon={<FaPhone />}
            error={errors.phone}
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
            placeholder="Mínimo 6 caracteres"
            icon={<FaLock />}
            error={errors.password}
            required
            fullWidth
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Confirmar Contraseña"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repite tu contraseña"
            icon={<FaLock />}
            error={errors.confirmPassword}
            required
            fullWidth
          />
        </div>
      </div>

      <div className={styles.terms}>
        <label className={styles.termsLabel}>
          <input type="checkbox" required />
          <span>
            Acepto los{' '}
            <a href="/terms" className={styles.termsLink}>
              términos y condiciones
            </a>
          </span>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="large"
        loading={isLoading}
        fullWidth
      >
        Crear Cuenta
      </Button>

      <div className={styles.footer}>
        <p>
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className={styles.loginLink}>
            Iniciar sesión
          </a>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
