import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Card from '../../common/Card/Card';
import Loading from '../../common/Loading/Loading';
import { FaArrowLeft, FaSave, FaTimes, FaPlus, FaTrash, FaQuestionCircle } from 'react-icons/fa';
import { examService } from '../../../services/examService';
import { courseService } from '../../../services/courseService';
import { toast } from 'react-toastify';
import styles from './ExamForm.module.css';

const ExamForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    examType: 'PARCIAL',
    startTime: '',
    endTime: '',
    duration: 120, // minutes
    totalPoints: 100,
    passingScore: 60,
    allowMultipleAttempts: false,
    maxAttempts: 1,
    shuffleQuestions: true,
    shuffleAnswers: true,
    showResultsImmediately: false,
    allowReviewAfterSubmit: true,
    status: 'DRAFT'
  });

  const [questions, setQuestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');

  // Fetch exam data if editing
  const { data: examData, isLoading: examLoading } = useQuery(
    ['exam', id],
    () => examService.getExamById(id),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          courseId: data.courseId || '',
          examType: data.examType || 'PARCIAL',
          startTime: data.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : '',
          endTime: data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : '',
          duration: data.duration || 120,
          totalPoints: data.totalPoints || 100,
          passingScore: data.passingScore || 60,
          allowMultipleAttempts: data.allowMultipleAttempts || false,
          maxAttempts: data.maxAttempts || 1,
          shuffleQuestions: data.shuffleQuestions || true,
          shuffleAnswers: data.shuffleAnswers || true,
          showResultsImmediately: data.showResultsImmediately || false,
          allowReviewAfterSubmit: data.allowReviewAfterSubmit || true,
          status: data.status || 'DRAFT'
        });
        setQuestions(data.questions || []);
      }
    }
  );

  // Fetch user's courses
  const { data: courses, isLoading: coursesLoading } = useQuery(
    ['instructor-courses', user?.id],
    () => {
      if (hasRole(['ADMIN'])) {
        return courseService.getAllCourses();
      } else {
        return courseService.getCoursesByInstructor(user?.id);
      }
    }
  );

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

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'MULTIPLE_CHOICE',
      question: '',
      points: 5,
      options: ['', '', '', ''],
      correctAnswers: [],
      explanation: ''
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    );
  };

  const addOption = (questionId) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId 
          ? { ...q, options: [...q.options, ''] }
          : q
      )
    );
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId 
          ? {
              ...q,
              options: q.options.map((opt, idx) => 
                idx === optionIndex ? value : opt
              )
            }
          : q
      )
    );
  };

  const removeOption = (questionId, optionIndex) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId 
          ? {
              ...q,
              options: q.options.filter((_, idx) => idx !== optionIndex),
              correctAnswers: q.correctAnswers.filter(ans => ans !== optionIndex)
            }
          : q
      )
    );
  };

  const toggleCorrectAnswer = (questionId, optionIndex) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId 
          ? {
              ...q,
              correctAnswers: q.correctAnswers.includes(optionIndex)
                ? q.correctAnswers.filter(ans => ans !== optionIndex)
                : [...q.correctAnswers, optionIndex]
            }
          : q
      )
    );
  };

  const removeQuestion = (questionId) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!formData.courseId) {
      newErrors.courseId = 'Debe seleccionar un curso';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'La fecha de inicio es requerida';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'La fecha de fin es requerida';
    }
    
    if (formData.startTime && formData.endTime) {
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);
      
      if (endTime <= startTime) {
        newErrors.endTime = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    if (!formData.duration || formData.duration < 1) {
      newErrors.duration = 'La duración debe ser mayor a 0 minutos';
    }
    
    if (!formData.totalPoints || formData.totalPoints < 1) {
      newErrors.totalPoints = 'Los puntos totales deben ser mayores a 0';
    }
    
    if (formData.passingScore < 0 || formData.passingScore > formData.totalPoints) {
      newErrors.passingScore = `La nota mínima debe estar entre 0 y ${formData.totalPoints}`;
    }
    
    if (formData.allowMultipleAttempts && (!formData.maxAttempts || formData.maxAttempts < 1)) {
      newErrors.maxAttempts = 'El número máximo de intentos debe ser mayor a 0';
    }

    // Validate questions
    if (questions.length === 0) {
      newErrors.questions = 'Debe agregar al menos una pregunta';
    } else {
      const invalidQuestions = questions.filter(q => 
        !q.question.trim() || 
        q.options.some(opt => !opt.trim()) ||
        q.correctAnswers.length === 0
      );
      
      if (invalidQuestions.length > 0) {
        newErrors.questions = 'Todas las preguntas deben tener texto, opciones válidas y al menos una respuesta correcta';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const examPayload = {
        ...formData,
        duration: parseInt(formData.duration),
        totalPoints: parseFloat(formData.totalPoints),
        passingScore: parseFloat(formData.passingScore),
        maxAttempts: formData.allowMultipleAttempts ? parseInt(formData.maxAttempts) : 1,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        questions: questions.map((q, index) => ({
          ...q,
          order: index + 1,
          points: parseFloat(q.points)
        }))
      };

      if (isEditing) {
        await examService.updateExam(id, examPayload);
        toast.success('Examen actualizado exitosamente');
      } else {
        await examService.createExam(examPayload);
        toast.success('Examen creado exitosamente');
      }
      
      navigate('/exams');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          (isEditing ? 'Error al actualizar examen' : 'Error al crear examen');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(isEditing ? `/exams/${id}` : '/exams');
  };

  if (examLoading || coursesLoading) {
    return <Loading text={isEditing ? "Cargando datos del examen..." : "Cargando formulario..."} />;
  }

  const tabs = [
    { id: 'basic', label: 'Información Básica' },
    { id: 'questions', label: `Preguntas (${questions.length})` },
    { id: 'settings', label: 'Configuración' }
  ];

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
          {isEditing ? 'Editar Examen' : 'Crear Nuevo Examen'}
        </h1>
      </div>

      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${currentTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setCurrentTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {currentTab === 'basic' && (
          <Card title="Información Básica del Examen">
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <Input
                  label="Título del Examen"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                  required
                  fullWidth
                  placeholder="ej: Examen Parcial I - Algoritmos"
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
                <label className={styles.label}>Tipo de Examen</label>
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

              <div className={styles.formGroup}>
                <Input
                  label="Fecha y Hora de Inicio"
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  error={errors.startTime}
                  required
                  fullWidth
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label="Fecha y Hora de Fin"
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  error={errors.endTime}
                  required
                  fullWidth
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label="Duración (minutos)"
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  error={errors.duration}
                  min="1"
                  required
                  fullWidth
                  placeholder="120"
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label="Puntos Totales"
                  type="number"
                  name="totalPoints"
                  value={formData.totalPoints}
                  onChange={handleChange}
                  error={errors.totalPoints}
                  min="1"
                  step="0.1"
                  required
                  fullWidth
                  placeholder="100"
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label="Nota Mínima para Aprobar"
                  type="number"
                  name="passingScore"
                  value={formData.passingScore}
                  onChange={handleChange}
                  error={errors.passingScore}
                  min="0"
                  max={formData.totalPoints}
                  step="0.1"
                  required
                  fullWidth
                  placeholder="60"
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
                  <option value="DRAFT">Borrador</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="ACTIVE">Activo</option>
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
                placeholder="Describe el contenido y objetivos del examen..."
              />
            </div>
          </Card>
        )}

        {currentTab === 'questions' && (
          <Card title="Preguntas del Examen">
            {errors.questions && (
              <div className={styles.errorAlert}>
                {errors.questions}
              </div>
            )}

            <div className={styles.questionsSection}>
              {questions.map((question, questionIndex) => (
                <div key={question.id} className={styles.questionCard}>
                  <div className={styles.questionHeader}>
                    <h4>Pregunta {questionIndex + 1}</h4>
                    <div className={styles.questionActions}>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(question.id, 'points', e.target.value)}
                        placeholder="Puntos"
                        style={{ width: '80px' }}
                        min="0.1"
                        step="0.1"
                      />
                      <Button
                        type="button"
                        variant="danger"
                        size="small"
                        icon={<FaTrash />}
                        onClick={() => removeQuestion(question.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>

                  <div className={styles.questionContent}>
                    <Input
                      label="Enunciado de la pregunta"
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                      placeholder="Escribe aquí la pregunta..."
                      fullWidth
                      required
                    />

                    <div className={styles.optionsSection}>
                      <label className={styles.label}>Opciones de respuesta:</label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className={styles.optionItem}>
                          <input
                            type="checkbox"
                            checked={question.correctAnswers.includes(optionIndex)}
                            onChange={() => toggleCorrectAnswer(question.id, optionIndex)}
                            className={styles.correctCheckbox}
                          />
                          <Input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                            placeholder={`Opción ${optionIndex + 1}`}
                            fullWidth
                          />
                          {question.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="small"
                              icon={<FaTimes />}
                              onClick={() => removeOption(question.id, optionIndex)}
                            />
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="small"
                        icon={<FaPlus />}
                        onClick={() => addOption(question.id)}
                      >
                        Agregar Opción
                      </Button>
                    </div>

                    <Input
                      label="Explicación (opcional)"
                      type="text"
                      value={question.explanation}
                      onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                      placeholder="Explica por qué es correcta la respuesta..."
                      fullWidth
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="primary"
                icon={<FaPlus />}
                onClick={addQuestion}
                className={styles.addQuestionButton}
              >
                Agregar Pregunta
              </Button>
            </div>
          </Card>
        )}

        {currentTab === 'settings' && (
          <Card title="Configuración Avanzada">
            <div className={styles.settingsGrid}>
              <div className={styles.settingGroup}>
                <h4>Intentos</h4>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="allowMultipleAttempts"
                      checked={formData.allowMultipleAttempts}
                      onChange={handleChange}
                    />
                    Permitir múltiples intentos
                  </label>
                </div>
                {formData.allowMultipleAttempts && (
                  <Input
                    label="Número máximo de intentos"
                    type="number"
                    name="maxAttempts"
                    value={formData.maxAttempts}
                    onChange={handleChange}
                    error={errors.maxAttempts}
                    min="1"
                    fullWidth
                  />
                )}
              </div>

              <div className={styles.settingGroup}>
                <h4>Randomización</h4>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="shuffleQuestions"
                      checked={formData.shuffleQuestions}
                      onChange={handleChange}
                    />
                    Mezclar preguntas
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="shuffleAnswers"
                      checked={formData.shuffleAnswers}
                      onChange={handleChange}
                    />
                    Mezclar opciones de respuesta
                  </label>
                </div>
              </div>

              <div className={styles.settingGroup}>
                <h4>Resultados</h4>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="showResultsImmediately"
                      checked={formData.showResultsImmediately}
                      onChange={handleChange}
                    />
                    Mostrar resultados inmediatamente
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="allowReviewAfterSubmit"
                      checked={formData.allowReviewAfterSubmit}
                      onChange={handleChange}
                    />
                    Permitir revisión después de entregar
                  </label>
                </div>
              </div>
            </div>
          </Card>
        )}

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
            {isEditing ? 'Actualizar Examen' : 'Crear Examen'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExamForm;
