import React, { useState } from 'react';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useNotification from '../../../hooks/useNotification';
import assignmentService from '../../../services/assignmentService';
import { validateLength, validateNumber } from '../../../utils/validators';
import { toInputDateTime } from '../../../utils/dateUtils';
import styles from './AssignmentForm.module.css';

const AssignmentForm = ({ assignment, courseId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    instructions: assignment?.instructions || '',
    dueDate: assignment?.dueDate ? toInputDateTime(assignment.dueDate) : '',
    maxPoints: assignment?.maxPoints || 0,
    submissionType: assignment?.submissionType || 'FILE',
    maxFileSize: assignment?.maxFileSize || 10485760,
    allowedExtensions: assignment?.allowedExtensions || 'pdf,doc,docx,txt'
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

    const titleError = validateLength(formData.title, 3, 150, 'título');
    if (titleError) newErrors.title = titleError;

    const descriptionError = validateLength(formData.description, 10, 500, 'descripción');
    if (descriptionError) newErrors.description = descriptionError;

    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha límite es requerida';
    }

    const pointsError = validateNumber(formData.maxPoints, 0, 100, 'puntos máximos');
    if (pointsError) newErrors.maxPoints = pointsError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const assignmentData = {
        ...formData,
        courseId: courseId || assignment?.courseId
      };

      if (assignment?.id) {
        await assignmentService.updateAssignment(assignment.id, assignmentData);
        showSuccess('Tarea actualizada exitosamente');
      } else {
        await assignmentService.createAssignment(assignmentData);
        showSuccess('Tarea creada exitosamente');
      }
      
      if (onSubmit) {
        onSubmit(assignmentData);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al guardar la tarea';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Título de la Tarea"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="Título de la tarea"
      />

      <Input
        label="Descripción"
        type="textarea"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
        placeholder="Descripción de la tarea"
        rows="4"
      />

      <Input
        label="Instrucciones"
        type="textarea"
        name="instructions"
        value={formData.instructions}
        onChange={handleChange}
        placeholder="Instrucciones detalladas para la tarea"
        rows="6"
      />

      <div className={styles.row}>
        <Input
          label="Fecha Límite"
          type="datetime-local"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          error={errors.dueDate}
          required
        />

        <Input
          label="Puntos Máximos"
          type="number"
          name="maxPoints"
          value={formData.maxPoints}
          onChange={handleChange}
          error={errors.maxPoints}
          min="0"
          max="100"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.selectContainer}>
          <label className={styles.selectLabel}>Tipo de Entrega:</label>
          <select
            name="submissionType"
            value={formData.submissionType}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="FILE">Solo archivo</option>
            <option value="TEXT">Solo texto</option>
            <option value="BOTH">Archivo y texto</option>
          </select>
        </div>

        <Input
          label="Tamaño Máximo (bytes)"
          type="number"
          name="maxFileSize"
          value={formData.maxFileSize}
          onChange={handleChange}
          min="1048576"
          max="52428800"
        />
      </div>

      <Input
        label="Extensiones Permitidas"
        name="allowedExtensions"
        value={formData.allowedExtensions}
        onChange={handleChange}
        placeholder="pdf,doc,docx,txt"
      />

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
          {assignment?.id ? 'Actualizar' : 'Crear'} Tarea
        </Button>
      </div>
    </form>
  );
};

export default AssignmentForm;
