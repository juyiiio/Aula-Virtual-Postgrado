import React, { useState } from 'react';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useNotification from '../../../hooks/useNotification';
import userService from '../../../services/userService';
import { 
  validateEmail, 
  validateName, 
  validateUsername, 
  validatePhone,
  validatePassword 
} from '../../../utils/validators';
import styles from './UserForm.module.css';

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    userCode: user?.userCode || '',
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    maternalSurname: user?.maternalSurname || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: '',
    roles: user?.roles?.map(role => role.id) || []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useNotification();

  const availableRoles = [
    { id: 1, name: 'ADMIN', displayName: 'Administrador' },
    { id: 2, name: 'INSTRUCTOR', displayName: 'Instructor' },
    { id: 3, name: 'STUDENT', displayName: 'Estudiante' },
    { id: 4, name: 'COORDINATOR', displayName: 'Coordinador' }
  ];

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

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    const roleId = parseInt(value);
    
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleId]
        : prev.roles.filter(id => id !== roleId)
    }));
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

    const firstNameError = validateName(formData.firstName, 'nombre');
    if (firstNameError) newErrors.firstName = firstNameError;

    const lastNameError = validateName(formData.lastName, 'apellido paterno');
    if (lastNameError) newErrors.lastName = lastNameError;

    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    // Validar contraseña solo para usuarios nuevos o si se está cambiando
    if (!user?.id || formData.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'Debe seleccionar al menos un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        ...formData,
        roles: formData.roles
      };

      // Remover campos de contraseña vacíos para actualizaciones
      if (user?.id && !formData.password) {
        delete userData.password;
        delete userData.confirmPassword;
      }

      if (user?.id) {
        await userService.updateUser(user.id, userData);
        showSuccess('Usuario actualizado exitosamente');
      } else {
        await userService.createUser(userData);
        showSuccess('Usuario creado exitosamente');
      }
      
      if (onSubmit) {
        onSubmit(userData);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al guardar el usuario';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.row}>
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
      </div>

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

      <div className={styles.row}>
        <Input
          label="Apellido Materno"
          name="maternalSurname"
          value={formData.maternalSurname}
          onChange={handleChange}
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
      </div>

      <div className={styles.passwordSection}>
        <h4 className={styles.sectionTitle}>
          {user?.id ? 'Cambiar Contraseña (opcional)' : 'Contraseña'}
        </h4>
        
        <div className={styles.row}>
          <Input
            label="Contraseña"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required={!user?.id}
            placeholder="Contraseña"
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required={!user?.id}
            placeholder="Repetir contraseña"
          />
        </div>
      </div>

      <div className={styles.rolesSection}>
        <h4 className={styles.sectionTitle}>Roles</h4>
        <div className={styles.rolesList}>
          {availableRoles.map(role => (
            <div key={role.id} className={styles.roleItem}>
              <input
                type="checkbox"
                id={`role-${role.id}`}
                value={role.id}
                checked={formData.roles.includes(role.id)}
                onChange={handleRoleChange}
                className={styles.roleCheckbox}
              />
              <label htmlFor={`role-${role.id}`} className={styles.roleLabel}>
                {role.displayName}
              </label>
            </div>
          ))}
        </div>
        {errors.roles && (
          <span className={styles.errorMessage}>{errors.roles}</span>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {user?.id ? 'Actualizar' : 'Crear'} Usuario
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
