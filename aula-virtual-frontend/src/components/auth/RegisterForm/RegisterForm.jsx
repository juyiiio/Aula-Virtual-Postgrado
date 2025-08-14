import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import useNotification from '../../../hooks/useNotification';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordConfirmation,
  validateName,
  validateUsername,
  validatePhone
} from '../../../utils/validators';
import styles from './RegisterForm.module.css';

const RegisterForm = () => {
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
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

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

    if (!formData.userCode) {
      newErrors.userCode = 'El código de usuario es requerido';
    }

    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validatePasswordConfirmation(formData.password, formData.confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    const firstNameError = validateName(formData.firstName, 'nombre');
    if (firstNameError) newErrors.firstName = firstNameError;

    const lastNameError = validateName(formData.lastName, 'apellido paterno');
    if (lastNameError) newErrors.lastName = lastNameError;

    const maternalSurnameError = validateName(formData.maternalSurname, 'apellido materno');
    if (maternalSurnameError) newErrors.maternalSurname = maternalSurnameError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(formData);
      showSuccess('Registro exitoso. Puede iniciar sesión ahora.');
      navigate('/login');
    } catch (error) {
      const message = error?.response?.data?.message || 'Error en el registro';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Código de Usuario"
        name="userCode"
        value={formData.userCode}
        onChange={handleChange}
        error={errors.userCode}
        required
        placeholder="Ej: EST2024001"
      />

      <Input
        label="Nombre de Usuario"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        required
        placeholder="Nombre de usuario único"
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
        placeholder="correo@ejemplo.com"
      />

      <div className={styles.row}>
        <Input
          label="Contraseña"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
          placeholder="Contraseña segura"
        />

        <Input
          label="Confirmar Contraseña"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
          placeholder="Repetir contraseña"
        />
      </div>

      <div className={styles.row}>
        <Input
          label="Nombre"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          required
          placeholder="Nombre"
        />

        <Input
          label="Apellido Paterno"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          required
          placeholder="Apellido paterno"
        />
      </div>

      <Input
        label="Apellido Materno"
        name="maternalSurname"
        value={formData.maternalSurname}
        onChange={handleChange}
        error={errors.maternalSurname}
        placeholder="Apellido materno"
      />

      <Input
        label="Teléfono"
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        placeholder="Número de teléfono"
      />

      <Button
        type="submit"
        loading={loading}
        className={styles.submitButton}
      >
        Registrarse
      </Button>
    </form>
  );
};

export default RegisterForm;
