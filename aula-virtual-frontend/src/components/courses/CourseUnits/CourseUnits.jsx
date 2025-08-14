import React, { useState, useEffect } from 'react';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Loading from '../../common/Loading/Loading';
import Modal from '../../common/Modal/Modal';
import Input from '../../common/Input/Input';
import useAuth from '../../../hooks/useAuth';
import courseService from '../../../services/courseService';
import useNotification from '../../../hooks/useNotification';
import styles from './CourseUnits.module.css';

const CourseUnits = ({ courseId }) => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    unitOrder: 1
  });
  const [formLoading, setFormLoading] = useState(false);
  const { hasRole } = useAuth();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    fetchUnits();
  }, [courseId]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const unitsData = await courseService.getCourseUnits(courseId);
      setUnits(unitsData);
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnit = () => {
    setEditingUnit(null);
    setFormData({
      title: '',
      description: '',
      unitOrder: units.length + 1
    });
    setShowModal(true);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setFormData({
      title: unit.title,
      description: unit.description,
      unitOrder: unit.unitOrder
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setFormLoading(true);
    try {
      if (editingUnit) {
        await courseService.updateCourseUnit(courseId, editingUnit.id, formData);
        showSuccess('Unidad actualizada exitosamente');
      } else {
        await courseService.createCourseUnit(courseId, formData);
        showSuccess('Unidad creada exitosamente');
      }
      
      setShowModal(false);
      fetchUnits();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al guardar la unidad';
      showError(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta unidad?')) {
      return;
    }

    try {
      await courseService.deleteCourseUnit(courseId, unitId);
      showSuccess('Unidad eliminada exitosamente');
      fetchUnits();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al eliminar la unidad';
      showError(message);
    }
  };

  if (loading) {
    return <Loading message="Cargando unidades..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Unidades del Curso</h3>
        {hasRole('INSTRUCTOR') && (
          <Button onClick={handleAddUnit} variant="primary" size="small">
            Nueva Unidad
          </Button>
        )}
      </div>

      {units.length > 0 ? (
        <div className={styles.units}>
          {units.map(unit => (
            <Card key={unit.id} className={styles.unit}>
              <div className={styles.unitHeader}>
                <div className={styles.unitInfo}>
                  <h4 className={styles.unitTitle}>
                    Unidad {unit.unitOrder}: {unit.title}
                  </h4>
                  {unit.description && (
                    <p className={styles.unitDescription}>{unit.description}</p>
                  )}
                </div>
                {hasRole('INSTRUCTOR') && (
                  <div className={styles.unitActions}>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleEditUnit(unit)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="error"
                      size="small"
                      onClick={() => handleDeleteUnit(unit.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>No hay unidades disponibles</p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUnit ? 'Editar Unidad' : 'Nueva Unidad'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Título de la Unidad"
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            required
            placeholder="Título de la unidad"
          />

          <Input
            label="Descripción"
            type="textarea"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Descripción de la unidad"
            rows="4"
          />

          <Input
            label="Orden"
            type="number"
            name="unitOrder"
            value={formData.unitOrder}
            onChange={handleFormChange}
            min="1"
            required
          />

          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={formLoading}
            >
              {editingUnit ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CourseUnits;
