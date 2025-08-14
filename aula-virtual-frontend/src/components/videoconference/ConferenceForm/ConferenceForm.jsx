import React, { useState } from 'react';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useNotification from '../../../hooks/useNotification';
import { validateLength } from '../../../utils/validators';
import { toInputDateTime } from '../../../utils/dateUtils';
import styles from './ConferenceForm.module.css';

const ConferenceForm = ({ conference, courseId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: conference?.title || '',
    description: conference?.description || '',
    scheduledTime: conference?.scheduledTime ? toInputDateTime(conference.scheduledTime) : '',
    duration: conference?.duration || 60,
    platform: conference?.platform || 'ZOOM',
    meetingUrl: conference?.meetingUrl || '',
    meetingId: conference?.meetingId || '',
    meetingPassword: conference?.meetingPassword || '',
    recordingEnabled: conference?.recordingEnabled || false,
    waitingRoom: conference?.waitingRoom || true,
    maxParticipants: conference?.maxParticipants || 100
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

    const descriptionError = validateLength(formData.description, 10, 500, 'descripción');
    if (descriptionError) newErrors.description = descriptionError;

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'La fecha y hora son requeridas';
    }

    if (!formData.duration || formData.duration < 15 || formData.duration > 480) {
      newErrors.duration = 'La duración debe estar entre 15 y 480 minutos';
    }

    if (!formData.meetingUrl) {
      newErrors.meetingUrl = 'El enlace de la reunión es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const conferenceData = {
        ...formData,
        courseId: courseId || conference?.courseId
      };

      if (conference?.id) {
        showSuccess('Conferencia actualizada exitosamente');
      } else {
        showSuccess('Conferencia creada exitosamente');
      }
      
      if (onSubmit) {
        onSubmit(conferenceData);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al guardar la conferencia';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Título de la Conferencia"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="Título de la conferencia"
      />

      <Input
        label="Descripción"
        type="textarea"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
        placeholder="Descripción de la conferencia"
        rows="4"
      />

      <div className={styles.row}>
        <Input
          label="Fecha y Hora"
          type="datetime-local"
          name="scheduledTime"
          value={formData.scheduledTime}
          onChange={handleChange}
          error={errors.scheduledTime}
          required
        />

        <Input
          label="Duración (minutos)"
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          error={errors.duration}
          min="15"
          max="480"
          required
        />
      </div>

      <div className={styles.row}>
        <div className={styles.selectContainer}>
          <label className={styles.selectLabel}>Plataforma:</label>
          <select
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="ZOOM">Zoom</option>
            <option value="MEET">Google Meet</option>
            <option value="TEAMS">Microsoft Teams</option>
            <option value="CUSTOM">Personalizada</option>
          </select>
        </div>

        <Input
          label="Máximo de Participantes"
          type="number"
          name="maxParticipants"
          value={formData.maxParticipants}
          onChange={handleChange}
          min="1"
          max="500"
        />
      </div>

      <Input
        label="Enlace de la Reunión"
        name="meetingUrl"
        value={formData.meetingUrl}
        onChange={handleChange}
        error={errors.meetingUrl}
        required
        placeholder="https://..."
      />

      <div className={styles.row}>
        <Input
          label="ID de la Reunión"
          name="meetingId"
          value={formData.meetingId}
          onChange={handleChange}
          placeholder="ID de la reunión (opcional)"
        />

        <Input
          label="Contraseña"
          type="password"
          name="meetingPassword"
          value={formData.meetingPassword}
          onChange={handleChange}
          placeholder="Contraseña de la reunión (opcional)"
        />
      </div>

      <div className={styles.optionsSection}>
        <h4 className={styles.optionsTitle}>Opciones de la Conferencia</h4>
        
        <div className={styles.checkboxGroup}>
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="recordingEnabled"
              name="recordingEnabled"
              checked={formData.recordingEnabled}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <label htmlFor="recordingEnabled" className={styles.checkboxLabel}>
              Habilitar Grabación
            </label>
          </div>

          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="waitingRoom"
              name="waitingRoom"
              checked={formData.waitingRoom}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <label htmlFor="waitingRoom" className={styles.checkboxLabel}>
              Sala de Espera
            </label>
          </div>
        </div>
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
          {conference?.id ? 'Actualizar' : 'Crear'} Conferencia
        </Button>
      </div>
    </form>
  );
};

export default ConferenceForm;
