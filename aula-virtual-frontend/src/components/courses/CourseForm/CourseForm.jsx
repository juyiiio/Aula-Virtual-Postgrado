import React, { useState } from 'react';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useNotification from '../../../hooks/useNotification';
import courseService from '../../../services/courseService';
import { validateLength, validateNumber } from '../../../utils/validators';
import styles from './CourseForm.module.css';

const CourseForm = ({ course, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    code: course?.code || '',
    description: course?.description || '',
    credits: course?.credits || 0,
    academicPeriod: course?.academicPeriod || '',
    groupNumber: course?.groupNumber || '',
    startDate: course?.startDate || '',
    endDate: course?.endDate || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useNotification();

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

    const nameError = validateLength(formData.name, 3, 150, 'nombre del curso');
    if (nameError) newErrors.name = nameError;

    const codeError = validateLength(formData.code, 3, 20, 'código del curso');
    if (codeError) newErrors.code = codeError;

    const descriptionError = validateLength(formData.description, 10, 500, 'descripción');
    if (descriptionError) newErrors.description = descriptionError;

    const creditsError = validateNumber(formData.credits, 0, 10, 'créditos');
    if (creditsError) newErrors.credits = creditsError;

    if (!formData.academicPeriod) {
      newErrors.academicPeriod = 'El período académico es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (course?.id) {
        await courseService.updateCourse(course.id, formData);
        showSuccess('Curso actualizado exitosamente');
      } else {
        await courseService.createCourse(formData);
        showSuccess('Curso creado exitosamente');
      }
      
      if (onSubmit) {
        onSubmit(formData);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al guardar el curso';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.row}>
        <Input
          label="Nombre del Curso"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="Nombre del curso"
        />

        <Input
          label="Código del Curso"
          name="code"
          value={formData.code}
          onChange={handleChange}
          error={errors.code}
          required
          placeholder="Ej: MAT101"
        />
      </div>

      <Input
        label="Descripción"
        type="textarea"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Descripción del curso"
        rows="4"
      />

      <div className={styles.row}>
        <Input
          label="Créditos"
          type="number"
          name="credits"
          value={formData.credits}
          onChange={handleChange}
          error={errors.credits}
          min="0"
          max="10"
        />

        <Input
          label="Período Académico"
          name="academicPeriod"
          value={formData.academicPeriod}
          onChange={handleChange}
          error={errors.academicPeriod}
          required
          placeholder="Ej: 2024-1"
        />
      </div>

      <div className={styles.row}>
        <Input
          label="Grupo"
          name="groupNumber"
          value={formData.groupNumber}
          onChange={handleChange}
          placeholder="Ej: A, B, 01"
        />

        <div></div>
      </div>

      <div className={styles.row}>
        <Input
          label="Fecha de Inicio"
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
        />

        <Input
          label="Fecha de Fin"
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
        />
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
          {course?.id ? 'Actualizar' : 'Crear'} Curso
        </Button>
      </div>
    </form>
  );
};

export default CourseForm;
