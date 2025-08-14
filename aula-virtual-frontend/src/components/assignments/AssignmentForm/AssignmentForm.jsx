import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Card from '../../common/Card/Card';
import Loading from '../../common/Loading/Loading';
import { FaArrowLeft, FaSave, FaTimes, FaUpload } from 'react-icons/fa';
import { assignmentService } from '../../../services/assignmentService';
import { courseService } from '../../../services/courseService';
import { toast } from 'react-toastify';
import styles from './AssignmentForm.module.css';

const AssignmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    courseId: '',
    unitId: '',
    dueDate: '',
    maxPoints: '',
    submissionType: 'FILE',
    maxFileSize: '10485760', // 10MB
    allowedExtensions: 'pdf,doc,docx,txt',
    status: 'ACTIVE'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assignment data if editing
  const { data: assignmentData, isLoading: assignmentLoading } = useQuery(
    ['assignment', id],
    () => assignmentService.getAssignmentById(id),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          instructions: data.instructions || '',
          courseId: data.courseId || '',
          unitId: data.unitId || '',
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString().slice(0, 16) : '',
          maxPoints: data.maxPoints || '',
          submissionType: data.submissionType || 'FILE',
          maxFileSize: data.maxFileSize || '10485760',
          allowedExtensions: data.allowedExtensions || 'pdf,doc,docx,txt',
          status: data.status || 'ACTIVE'
        });
      }
    }
  );

  // Fetch user's courses
  const { data: courses, isLoading: coursesLoading } = useQuery(
    'instructor-courses',
    () => hasRole(['ADMIN']) 
      ? courseService.getAllCourses()
      : courseService.getCoursesByInstructor(user?.id),
    {
      enabled: !!user?.id
    }
  );

  // Fetch course units when course is selected
  const { data: units, isLoading: unitsLoading } = useQuery(
    ['course-units', formData.courseId],
    () => courseService.getCourseUnits(formData.courseId),
    {
      enabled: !!formData.courseId
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear course units when course changes
    if (name === 'courseId') {
      setFormData(prev => ({
        ...prev,
        unitId: ''
      }));
    }
    
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
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!formData.courseId) {
      newErrors.courseId = 'Debe seleccionar un curso';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha de entrega es requerida';
    } else {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      if (dueDate <= now) {
        newErrors.dueDate = 'La fecha de entrega debe ser futura';
      }
    }
    
    if (!formData.maxPoints || isNaN(formData.maxPoints) || formData.maxPoints <= 0) {
      newErrors.maxPoints = 'Los puntos deben ser un número mayor a 0';
    }
    
    if (!formData.maxFileSize || isNaN(formData.maxFileSize) || formData.maxFileSize <= 0) {
      newErrors.maxFileSize = 'El tamaño máximo debe ser un número mayor a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const assignmentPayload = {
        ...formData,
        maxPoints: parseFloat(formData.maxPoints),
        maxFileSize: parseInt(formData.maxFileSize),
        dueDate: new Date(formData.dueDate).toISOString(),
        unitId: formData.unitId || null
      };

      if (isEditing) {
        await assignmentService.updateAssignment(id, assignmentPayload);
        toast.success('Tarea actualizada exitosamente');
      } else {
        await assignmentService.createAssignment(assignmentPayload);
        toast.success('Tarea creada exitosamente');
      }
      
      navigate('/assignments');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          (isEditing ? 'Error al actualizar tarea' : 'Error al crear tarea');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(isEditing ? `/assignments/${id}` : '/assignments');
  };

  const getFileSizeInMB = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(1);
  };

  const handleFileSizeChange = (e) => {
    const sizeInMB = parseFloat(e.target.value);
    const sizeInBytes = Math.round(sizeInMB * 1024 * 1024);
    setFormData(prev => ({
      ...prev,
      maxFileSize: sizeInBytes.toString()
    }));
  };

  if (assignmentLoading || coursesLoading) {
    return <Loading text={isEditing ? "Cargando datos de la tarea..." : "Cargando formulario..."} />;
  }

  // Check permissions
  if (isEditing && assignmentData && !hasRole(['ADMIN']) && 
      !(hasRole(['INSTRUCTOR']) && assignmentData.course?.instructorId === user?.id)) {
    return (
      <div className={styles.noPermission}>
        <h2>Sin permisos</h2>
        <p>No tienes permisos para editar esta tarea.</p>
        <Button variant="primary" onClick={() => navigate('/assignments')}>
          Volver a Tareas
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
          {isEditing ? 'Editar Tarea' : 'Crear Nueva Tarea'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Card title="Información Básica">
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <Input
                label="Título de la Tarea"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                required
                fullWidth
                placeholder="ej: Ensayo sobre Machine Learning"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Curso <span className={styles.required}>*</span>
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className={`${styles.select} ${errors.courseId ? styles.error : ''}`}
                required
              >
                <option value="">Seleccionar curso...</option>
                {courses?.data?.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
              {errors.courseId && (
                <div className={styles.errorText}>{errors.courseId}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Unidad (opcional)</label>
              <select
                name="unitId"
                value={formData.unitId}
                onChange={handleChange}
                className={styles.select}
                disabled={!formData.courseId || unitsLoading}
              >
                <option value="">Sin unidad específica</option>
                {units?.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    Unidad {unit.unitOrder}: {unit.title}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Fecha y Hora de Entrega"
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                error={errors.dueDate}
                required
                fullWidth
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Puntos Máximos"
                type="number"
                name="maxPoints"
                value={formData.maxPoints}
                onChange={handleChange}
                error={errors.maxPoints}
                min="0"
                step="0.1"
                required
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
                <option value="ACTIVE">Activa</option>
                <option value="INACTIVE">Inactiva</option>
                <option value="CLOSED">Cerrada</option>
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
              placeholder="Describe brevemente la tarea..."
            />
          </div>

          <div className={styles.fullWidthGroup}>
            <label className={styles.label}>Instrucciones Detalladas</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              className={styles.textarea}
              rows="6"
              placeholder="Proporciona instrucciones detalladas para completar la tarea..."
            />
          </div>
        </Card>

        <Card title="Configuración de Entrega">
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de Entrega</label>
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

            {(formData.submissionType === 'FILE' || formData.submissionType === 'BOTH') && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Tamaño Máximo de Archivo (MB)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={getFileSizeInMB(formData.maxFileSize)}
                    onChange={handleFileSizeChange}
                    className={`${styles.input} ${errors.maxFileSize ? styles.error : ''}`}
                  />
                  {errors.maxFileSize && (
                    <div className={styles.errorText}>{errors.maxFileSize}</div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <Input
                    label="Extensiones Permitidas"
                    type="text"
                    name="allowedExtensions"
                    value={formData.allowedExtensions}
                    onChange={handleChange}
                    fullWidth
                    placeholder="pdf,doc,docx,txt"
                    helperText="Separar extensiones con comas"
                  />
                </div>
              </>
            )}
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
            {isEditing ? 'Actualizar Tarea' : 'Crear Tarea'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentForm;
