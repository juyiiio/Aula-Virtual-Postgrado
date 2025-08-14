import React, { useState } from 'react';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useNotification from '../../../hooks/useNotification';
import examService from '../../../services/examService';
import { validateLength, validateNumber } from '../../../utils/validators';
import { toInputDateTime } from '../../../utils/dateUtils';
import styles from './ExamForm.module.css';

const ExamForm = ({ exam, courseId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: exam?.title || '',
    description: exam?.description || '',
    examType: exam?.examType || 'PARCIAL',
    startTime: exam?.startTime ? toInputDateTime(exam.startTime) : '',
    endTime: exam?.endTime ? toInputDateTime(exam.endTime) : '',
    durationMinutes: exam?.durationMinutes || 60,
    maxPoints: exam?.maxPoints || 20,
    passingGrade: exam?.passingGrade || 11,
    instructions: exam?.instructions || ''
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

    if (!formData.startTime) {
      newErrors.startTime = 'La fecha de inicio es requerida';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'La fecha de fin es requerida';
    }

    if (formData.startTime && formData.endTime && new Date(formData.startTime) >= new Date(formData.endTime)) {
      newErrors.endTime = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    const durationError = validateNumber(formData.durationMinutes, 5, 480, 'duración en minutos');
    if (durationError) newErrors.durationMinutes = durationError;

    const pointsError = validateNumber(formData.maxPoints, 1, 100, 'puntos máximos');
    if (pointsError) newErrors.maxPoints = pointsError;

    const passingError = validateNumber(formData.passingGrade, 0, formData.maxPoints, 'nota de aprobación');
    if (passingError) newErrors.passingGrade = passingError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const examData = {
        ...formData,
        courseId: courseId || exam?.courseId
      };

      if (exam?.id) {
        await examService.updateExam(exam.id, examData);
        showSuccess('Examen actualizado exitosamente');
      } else {
        await examService.createExam(examData);
        showSuccess('Examen creado exitosamente');
      }
      
      if (onSubmit) {
        onSubmit(examData);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al guardar el examen';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Título del Examen"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="Título del examen"
      />

      <div className={styles.row}>
        <Input
          label="Descripción"
          type="textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Descripción del examen"
          rows="3"
        />

        <div className={styles.selectContainer}>
          <label className={styles.selectLabel}>Tipo de Examen:</label>
          <select
            name="examType"
            value={formData.examType}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="PARCIAL">Parcial</option>
            <option value="FINAL">Final</option>
            <option value="SUSTITUTORIO">Sustitutorio</option>
            <option value="EXTRAORDINARIO">Extraordinario</option>
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <Input
          label="Fecha y Hora de Inicio"
          type="datetime-local"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          error={errors.startTime}
          required
        />

        <Input
          label="Fecha y Hora de Fin"
          type="datetime-local"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          error={errors.endTime}
          required
        />
      </div>

      <div className={styles.row}>
        <Input
          label="Duración (minutos)"
          type="number"
          name="durationMinutes"
          value={formData.durationMinutes}
          onChange={handleChange}
          error={errors.durationMinutes}
          min="5"
          max="480"
        />

        <Input
          label="Puntos Máximos"
          type="number"
          name="maxPoints"
          value={formData.maxPoints}
          onChange={handleChange}
          error={errors.maxPoints}
          min="1"
          max="100"
        />
      </div>

      <Input
        label="Nota de Aprobación"
        type="number"
        name="passingGrade"
        value={formData.passingGrade}
        onChange={handleChange}
        error={errors.passingGrade}
        min="0"
        max={formData.maxPoints}
        step="0.1"
      />

      <Input
        label="Instrucciones"
        type="textarea"
        name="instructions"
        value={formData.instructions}
        onChange={handleChange}
        placeholder="Instrucciones para el examen"
        rows="4"
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
          {exam?.id ? 'Actualizar' : 'Crear'} Examen
        </Button>
      </div>
    </form>
  );
};

export default ExamForm;
