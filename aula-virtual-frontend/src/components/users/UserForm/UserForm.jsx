import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { 
  FaSave, 
  FaTimes, 
  FaUpload, 
  FaUser, 
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { userService } from '../../../services/userService';
import { toast } from 'react-toastify';
import styles from './UserForm.module.css';

const UserForm = ({ user, isProfile = false, onSuccess, onCancel }) => {
  const { user: currentUser, hasRole } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    userCode: '',
    bio: '',
    title: '',
    address: '',
    password: '',
    confirmPassword: '',
    roles: ['STUDENT'],
    status: 'ACTIVE',
    profilePicture: null
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const isEditing = !!user;
  const isOwnProfile = user?.id === currentUser?.id;
  const canEditRoles = hasRole(['ADMIN']) && !isOwnProfile;
  const canEditStatus = hasRole(['ADMIN']) && !isOwnProfile;

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        userCode: user.userCode || '',
        bio: user.bio || '',
        title: user.title || '',
        address: user.address || '',
        password: '',
        confirmPassword: '',
        roles: user.roles || ['STUDENT'],
        status: user.status || 'ACTIVE',
        profilePicture: null
      });
      setPreviewImage(user.profilePicture);
    }
  }, [user]);

  // Create user mutation
  const createUserMutation = useMutation(
    (userData) => userService.createUser(userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('Usuario creado exitosamente');
        onSuccess && onSuccess();
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Error al crear el usuario';
        toast.error(errorMessage);
      }
    }
  );

  // Update user mutation
  const updateUserMutation = useMutation(
    (userData) => {
      if (isProfile) {
        return userService.updateProfile(user.id, userData);
      } else {
        return userService.updateUser(user.id, userData);
      }
    },
    {
      onSuccess: () => {
        if (isProfile) {
          queryClient.invalidateQueries(['user-profile', user.id]);
        } else {
          queryClient.invalidateQueries(['users']);
        }
        toast.success('Usuario actualizado exitosamente');
        onSuccess && onSuccess();
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Error al actualizar el usuario';
        toast.error(errorMessage);
      }
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'roles') {
      setFormData(prev => ({
        ...prev,
        roles: checked 
          ? [...prev.roles, value]
          : prev.roles.filter(role => role !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede superar los 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateUserCode = () => {
    const code = 'USR' + Date.now().toString().slice(-6);
    setFormData(prev => ({
      ...prev,
      userCode: code
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!isEditing && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.userCode.trim()) {
      newErrors.userCode = 'El código de usuario es requerido';
    }
    
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono no es válido';
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
    
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key === 'profilePicture') return;
        if (key === 'roles') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add profile picture if selected
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture);
      }
      
      // Don't send empty password on update
      if (isEditing && !formData.password) {
        submitData.delete('password');
        submitData.delete('confirmPassword');
      }

      if (isEditing) {
        await updateUserMutation.mutateAsync(submitData);
      } else {
        await createUserMutation.mutateAsync(submitData);
      }
    } catch (error) {
      // Error handling is done in mutation onError
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: 'STUDENT', label: 'Estudiante' },
    { value: 'INSTRUCTOR', label: 'Instructor' },
    { value: 'ADMIN', label: 'Administrador' }
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'INACTIVE', label: 'Inactivo' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'SUSPENDED', label: 'Suspendido' }
  ];

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Profile Picture Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Foto de Perfil</h3>
          
          <div className={styles.profilePictureSection}>
            <div className={styles.currentAvatar}>
              {previewImage ? (
                <img src={previewImage} alt="Preview" />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <FaUser />
                </div>
              )}
            </div>
            
            <div className={styles.uploadSection}>
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.hiddenInput}
              />
              <label htmlFor="profilePicture" className={styles.uploadButton}>
                <FaUpload />
                <span>Seleccionar Imagen</span>
              </label>
              <p className={styles.uploadInfo}>
                JPG, PNG o GIF. Máximo 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Información Básica</h3>
          
          <div className={styles.formGrid}>
            <Input
              label="Nombre"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
              fullWidth
            />
            
            <Input
              label="Apellido"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
              fullWidth
            />
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              fullWidth
            />
            
            <div className={styles.formGroup}>
              <Input
                label="Código de Usuario"
                type="text"
                name="userCode"
                value={formData.userCode}
                onChange={handleChange}
                error={errors.userCode}
                required
                fullWidth
              />
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="small"
                  onClick={generateUserCode}
                >
                  Generar Código
                </Button>
              )}
            </div>
            
            <Input
              label="Teléfono"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              fullWidth
              placeholder="+1 234 567 8900"
            />
            
            <Input
              label="Título/Cargo"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              placeholder="ej: Profesor de Matemáticas"
            />
          </div>
        </div>

        {/* Password Section - Only for new users or password change */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {isEditing ? 'Cambiar Contraseña (opcional)' : 'Contraseña'}
          </h3>
          
          <div className={styles.formGrid}>
            <div className={styles.passwordGroup}>
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required={!isEditing}
                fullWidth
                placeholder={isEditing ? 'Dejar vacío para mantener actual' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="small"
                icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
              />
            </div>
            
            <div className={styles.passwordGroup}>
              <Input
                label="Confirmar Contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required={!isEditing && formData.password}
                fullWidth
              />
              <Button
                type="button"
                variant="ghost"
                size="small"
                icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.passwordToggle}
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Información Adicional</h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Biografía</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className={styles.textarea}
              rows="4"
              placeholder="Escribe una breve descripción sobre ti..."
            />
          </div>
          
          <Input
            label="Dirección"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            placeholder="Dirección completa"
          />
        </div>

        {/* Roles and Status - Admin only */}
        {(canEditRoles || canEditStatus) && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Configuración de Usuario</h3>
            
            {canEditRoles && (
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Roles <span className={styles.required}>*</span>
                </label>
                <div className={styles.rolesGrid}>
                  {roleOptions.map(role => (
                    <label key={role.value} className={styles.roleLabel}>
                      <input
                        type="checkbox"
                        name="roles"
                        value={role.value}
                        checked={formData.roles.includes(role.value)}
                        onChange={handleChange}
                        className={styles.roleCheckbox}
                      />
                      <span>{role.label}</span>
                    </label>
                  ))}
                </div>
                {errors.roles && (
                  <div className={styles.errorText}>{errors.roles}</div>
                )}
              </div>
            )}
            
            {canEditStatus && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Estado</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={styles.select}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            icon={<FaTimes />}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<FaSave />}
            loading={isSubmitting}
          >
            {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
