import React, { useState } from 'react';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useNotification from '../../../hooks/useNotification';
import calendarService from '../../../services/calendarService';
import { validateLength } from '../../../utils/validators';
import { toInputDateTime } from '../../../utils/dateUtils';
import styles from './EventForm.module.css';

const EventForm = ({ event, courseId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    eventType: event?.eventType || 'OTHER',
    startDatetime: event?.startDatetime ? toInputDateTime(event.startDatetime) : '',
    endDatetime: event?.endDatetime ? toInputDateTime(event.endDatetime) : '',
    location: event?.location || '',
    isVirtual: event?.isVirtual || false,
    meetingUrl: event?.meetingUrl || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useNotification();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.startDatetime) {
      newErrors.startDatetime = 'La fecha de inicio es requerida';
    }

    if (!formData.endDatetime) {
      newErrors.endDatetime = 'La fecha de fin es requerida';
    }

    if (formData.startDatetime && formData.endDatetime && 
        new Date(formData.startDatetime) >= new Date(formData.endDatetime)) {
      newErrors.endDatetime = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (formData.isVirtual && !formData.meetingUrl) {
      newErrors.meetingUrl = 'El enlace de reunión es requerido para eventos virtuales';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const eventData = {
        ...formData,
        courseId: courseId || event?.courseId
      };

      if (event?.id) {
        await calendarService.updateEvent(event.id, eventData);
        showSuccess('Evento actualizado exitosamente');
      } else {
        await calendarService.createEvent(eventData);
        showSuccess('Evento creado exitosamente');
      }
      
      if (onSubmit) {
        onSubmit(eventData);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al guardar el evento';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Título del Evento"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="Título del evento"
      />

      <div className={styles.row}>
        <Input
          label="Descripción"
          type="textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descripción del evento"
          rows="3"
        />

        <div className={styles.selectContainer}>
          <label className={styles.selectLabel}>Tipo de Evento:</label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="CLASS">Clase</option>
            <option value="EXAM">Examen</option>
            <option value="ASSIGNMENT_DUE">Entrega de Tarea</option>
            <option value="MEETING">Reunión</option>
            <option value="OTHER">Otro</option>
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <Input
          label="Fecha y Hora de Inicio"
          type="datetime-local"
          name="startDatetime"
          value={formData.startDatetime}
          onChange={handleChange}
          error={errors.startDatetime}
          required
        />

        <Input
          label="Fecha y Hora de Fin"
          type="datetime-local"
          name="endDatetime"
          value={formData.endDatetime}
          onChange={handleChange}
          error={errors.endDatetime}
          required
        />
      </div>

      <div className={styles.virtualSection}>
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="isVirtual"
            name="isVirtual"
            checked={formData.isVirtual}
            onChange={handleChange}
            className={styles.checkbox}
          />
          <label htmlFor="isVirtual" className={styles.checkboxLabel}>
            Evento Virtual
          </label>
        </div>
      </div>

      {formData.isVirtual ? (
        <Input
          label="Enlace de Reunión"
          name="meetingUrl"
          value={formData.meetingUrl}
          onChange={handleChange}
          error={errors.meetingUrl}
          placeholder="https://..."
          required
        />
      ) : (
        <Input
          label="Ubicación"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Ubicación del evento"
        />
      )}

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
          {event?.id ? 'Actualizar' : 'Crear'} Evento
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
