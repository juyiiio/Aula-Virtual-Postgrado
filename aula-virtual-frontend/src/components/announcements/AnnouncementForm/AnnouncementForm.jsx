import React, { useState } from 'react';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useNotification from '../../../hooks/useNotification';
import announcementService from '../../../services/announcementService';
import { validateLength } from '../../../utils/validators';
import { toInputDateTime } from '../../../utils/dateUtils';
import styles from './AnnouncementForm.module.css';

const AnnouncementForm = ({ announcement, courseId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    summary: announcement?.summary || '',
    priority: announcement?.priority || 'MEDIUM',
    status: announcement?.status || 'DRAFT',
    scheduledAt: announcement?.scheduledAt ? toInputDateTime(announcement.scheduledAt) : '',
    isPinned: announcement?.isPinned || false,
    notifyUsers: true
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

    const titleError = validateLength(formData.title, 5, 200, 'título');
    if (titleError) newErrors.title = titleError;

    const contentError = validateLength(formData.content, 20, 5000, 'contenido');
    if (contentError) newErrors.content = contentError;

    if (formData.summary) {
      const summaryError = validateLength(formData.summary, 10, 300, 'resumen');
      if (summaryError) newErrors.summary = summaryError;
    }

    if (formData.status === 'SCHEDULED' && !formData.scheduledAt) {
      newErrors.scheduledAt = 'La fecha de programación es requerida para anuncios programados';
    }

    if (formData.scheduledAt && new Date(formData.scheduledAt) <= new Date()) {
      newErrors.scheduledAt = 'La fecha de programación debe ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const announcementData = {
        ...formData,
        courseId: courseId || announcement?.courseId
      };

      if (announcement?.id) {
        await announcementService.updateAnnouncement(announcement.id, announcementData);
        showSuccess('Anuncio actualizado exitosamente');
      } else {
        await announcementService.createAnnouncement(announcementData);
        showSuccess('Anuncio creado exitosamente');
      }
      
      if (onSubmit) {
        onSubmit(announcementData);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al guardar el anuncio';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Título del Anuncio"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="Título del anuncio"
      />

      <Input
        label="Resumen (Opcional)"
        name="summary"
        value={formData.summary}
        onChange={handleChange}
        error={errors.summary}
        placeholder="Resumen breve del anuncio"
      />

      <Input
        label="Contenido"
        type="textarea"
        name="content"
        value={formData.content}
        onChange={handleChange}
        error={errors.content}
        required
        placeholder="Contenido del anuncio"
        rows="8"
      />

      <div className={styles.row}>
        <div className={styles.selectContainer}>
          <label className={styles.selectLabel}>Prioridad:</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
          </select>
        </div>

        <div className={styles.selectContainer}>
          <label className={styles.selectLabel}>Estado:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicar Ahora</option>
            <option value="SCHEDULED">Programar</option>
