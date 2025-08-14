import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Card from '../../common/Card/Card';
import Loading from '../../common/Loading/Loading';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { courseService } from '../../../services/courseService';
import { userService } from '../../../services/userService';
import { toast } from 'react-toastify';
import styles from './CourseForm.module.css';

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: '',
    academicPeriod: '',
    groupNumber: '',
    instructorId: '',
    postgraduateProgramId: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    syllabusUrl: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch course data if editing
  const { data: courseData, isLoading: courseLoading } = useQuery(
    ['course', id],
    () => courseService.getCourseById(id),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        setFormData({
          name: data.name || '',
          code: data.code || '',
          description: data.description || '',
          credits: data.credits || '',
          academicPeriod: data.academicPeriod || '',
          groupNumber: data.groupNumber || '',
          instructorId: data.instructorId || '',
          postgraduateProgramId: data.postgraduateProgramId || '',
          status: data.status || 'ACTIVE',
          startDate: data.startDate ? data.startDate.split('T')[0] : '',
          endDate: data.endDate ? data.endDate.split('T')[0] : '',
          syllabusUrl: data.syllabusUrl || ''
        });
      }
    }
  );

  // Fetch instructors for selection
  const { data: instructors, isLoading: instructorsLoading } = useQuery(
    'instructors',
    () => userService.getUsersByRole('INSTRUCTOR')
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del curso es requerido';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'El código del curso es requerido';
    }
    
    if (!formData.credits || isNaN(formData.credits) || formData.credits < 0) {
      newErrors.credits = 'Los créditos deben ser un número válido';
    }
    
    if (!formData.instructorId) {
      newErrors.instructorId = 'Debe seleccionar un instructor';
    }
    
    if (formData.startDate && formData.endDate && 
        new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const coursePayload = {
        ...formData,
        credits: parseInt(formData.credits),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
      };

      if (isEditing) {
        await courseService.updateCourse(id, coursePayload);
        toast.success('Curso actualizado exitosamente');
      } else {
        await courseService.createCourse(coursePayload);
        toast.success('Curso creado exitosamente');
      }
      
      navigate('/courses');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          (isEditing ? 'Error al actualizar curso' : 'Error al crear curso');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(isEditing ? `/courses/${id}` : '/courses');
  };

  if (courseLoading || instructorsLoading) {
    return <Loading text={isEditing ? "Cargando datos del curso..." : "Cargando formulario..."} />;
  }

  // Check permissions
  if (isEditing && courseData && !hasRole(['ADMIN']) && 
      !(hasRole(['INSTRUCTOR']) && courseData.instructorId === user?.id)) {
    return (
      <div className={styles.noPermission}>
        <h2>Sin permisos</h2>
        <p>No tienes permisos para editar este curso.</p>
        <Button variant="primary" onClick={() => navigate('/courses')}>
          Volver a Cursos
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          icon={<FaArrowLeft />}
          onClick={handleCancel}
        >
          Volver
        </Button>
        <h1 className={styles.title}>
          {isEditing ? 'Editar Curso' : 'Crear Nuevo Curso'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Card title="Información Básica">
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <Input
                label="Nombre del Curso"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                fullWidth
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Código del Curso"
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                error={errors.code}
                placeholder="ej: CS101"
                required
                fullWidth
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Créditos"
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                error={errors.credits}
                min="0"
                required
                fullWidth
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Instructor <span className={styles.required}>*</span>
              </label>
              <select
                name="instructorId"
                value={formData.instructorId}
                onChange={handleChange}
                className={`${styles.select} ${errors.instructorId ? styles.error : ''}`}
                required
              >
                <option value="">Seleccionar instructor...</option>
                {instructors?.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.firstName} {instructor.lastName}
                  </option>
                ))}
              </select>
              {errors.instructorId && (
                <div className={styles.errorText}>{errors.instructorId}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Período Académico"
                type="text"
                name="academicPeriod"
                value={formData.academicPeriod}
                onChange={handleChange}
                placeholder="ej: 2024-I"
                fullWidth
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Número de Grupo"
                type="text"
                name="groupNumber"
                value={formData.groupNumber}
                onChange={handleChange}
                placeholder="ej: A, B, 01"
                fullWidth
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="COMPLETED">Completado</option>
              </select>
            </div>
          </div>

          <div className={styles.fullWidthGroup}>
            <label className={styles.label}>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              rows="4"
              placeholder="Describe el contenido y objetivos del curso..."
            />
          </div>
        </Card>

        <Card title="Fechas y Recursos">
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <Input
                label="Fecha de Inicio"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
                fullWidth
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Fecha de Fin"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                error={errors.endDate}
                fullWidth
              />
            </div>
          </div>

          <div className={styles.fullWidthGroup}>
            <Input
              label="URL del Sílabo"
              type="url"
              name="syllabusUrl"
              value={formData.syllabusUrl}
              onChange={handleChange}
              placeholder="https://ejemplo.com/silabo.pdf"
              fullWidth
            />
          </div>
        </Card>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            icon={<FaTimes />}
            onClick={handleCancel}
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
            {isEditing ? 'Actualizar Curso' : 'Crear Curso'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
