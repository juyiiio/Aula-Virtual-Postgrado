import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Button from '../../common/Button/Button';
import Card from '../../common/Card/Card';
import Input from '../../common/Input/Input';
import Modal from '../../common/Modal/Modal';
import Loading from '../../common/Loading/Loading';
import { FaPlus, FaEdit, FaTrash, FaBook, FaDragIndicator } from 'react-icons/fa';
import { courseService } from '../../../services/courseService';
import { toast } from 'react-toastify';
import styles from './CourseUnits.module.css';

const CourseUnits = ({ courseId, canEdit }) => {
  const queryClient = useQueryClient();
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUnit, setDeletingUnit] = useState(null);
  
  const [unitForm, setUnitForm] = useState({
    title: '',
    description: '',
    unitOrder: 1
  });
  const [unitErrors, setUnitErrors] = useState({});

  const { data: units, isLoading } = useQuery(
    ['course-units', courseId],
    () => courseService.getCourseUnits(courseId),
    {
      enabled: !!courseId
    }
  );

  const createUnitMutation = useMutation(
    (unitData) => courseService.createCourseUnit(courseId, unitData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course-units', courseId]);
        toast.success('Unidad creada exitosamente');
        handleCloseUnitModal();
      },
      onError: (error) => {
        toast.error('Error al crear la unidad');
      }
    }
  );

  const updateUnitMutation = useMutation(
    ({ unitId, unitData }) => courseService.updateCourseUnit(courseId, unitId, unitData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course-units', courseId]);
        toast.success('Unidad actualizada exitosamente');
        handleCloseUnitModal();
      },
      onError: (error) => {
        toast.error('Error al actualizar la unidad');
      }
    }
  );

  const deleteUnitMutation = useMutation(
    (unitId) => courseService.deleteCourseUnit(courseId, unitId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course-units', courseId]);
        toast.success('Unidad eliminada exitosamente');
        setShowDeleteModal(false);
        setDeletingUnit(null);
      },
      onError: (error) => {
        toast.error('Error al eliminar la unidad');
      }
    }
  );

  const handleOpenCreateModal = () => {
    const maxOrder = units?.length ? Math.max(...units.map(u => u.unitOrder)) : 0;
    setUnitForm({
      title: '',
      description: '',
      unitOrder: maxOrder + 1
    });
    setEditingUnit(null);
    setUnitErrors({});
    setShowUnitModal(true);
  };

  const handleOpenEditModal = (unit) => {
    setUnitForm({
      title: unit.title,
      description: unit.description,
      unitOrder: unit.unitOrder
    });
    setEditingUnit(unit);
    setUnitErrors({});
    setShowUnitModal(true);
  };

  const handleCloseUnitModal = () => {
    setShowUnitModal(false);
    setEditingUnit(null);
    setUnitForm({
      title: '',
      description: '',
      unitOrder: 1
    });
    setUnitErrors({});
  };

  const handleUnitFormChange = (e) => {
    const { name, value } = e.target;
    setUnitForm(prev => ({
      ...prev,
      [name]: name === 'unitOrder' ? parseInt(value) || 1 : value
    }));
    
    if (unitErrors[name]) {
      setUnitErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateUnitForm = () => {
    const errors = {};
    
    if (!unitForm.title.trim()) {
      errors.title = 'El título de la unidad es requerido';
    }
    
    if (!unitForm.unitOrder || unitForm.unitOrder < 1) {
      errors.unitOrder = 'El orden debe ser un número mayor a 0';
    }
    
    setUnitErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitUnit = (e) => {
    e.preventDefault();
    
    if (!validateUnitForm()) return;
    
    if (editingUnit) {
      updateUnitMutation.mutate({
        unitId: editingUnit.id,
        unitData: unitForm
      });
    } else {
      createUnitMutation.mutate(unitForm);
    }
  };

  const handleDeleteUnit = (unit) => {
    setDeletingUnit(unit);
    setShowDeleteModal(true);
  };

  const confirmDeleteUnit = () => {
    if (deletingUnit) {
      deleteUnitMutation.mutate(deletingUnit.id);
    }
  };

  if (isLoading) {
    return <Loading text="Cargando unidades..." />;
  }

  const sortedUnits = units?.sort((a, b) => a.unitOrder - b.unitOrder) || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Unidades del Curso</h3>
        {canEdit && (
          <Button
            variant="primary"
            icon={<FaPlus />}
            onClick={handleOpenCreateModal}
          >
            Nueva Unidad
          </Button>
        )}
      </div>

      {sortedUnits.length === 0 ? (
        <div className={styles.emptyState}>
          <FaBook className={styles.emptyIcon} />
          <h4>No hay unidades creadas</h4>
          <p>Las unidades te ayudan a organizar el contenido del curso de manera estructurada.</p>
          {canEdit && (
            <Button
              variant="primary"
              icon={<FaPlus />}
              onClick={handleOpenCreateModal}
            >
              Crear Primera Unidad
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.unitsList}>
          {sortedUnits.map((unit) => (
            <Card key={unit.id} className={styles.unitCard}>
              <div className={styles.unitHeader}>
                <div className={styles.unitInfo}>
                  <div className={styles.unitOrder}>
                    <FaDragIndicator className={styles.dragIcon} />
                    <span>Unidad {unit.unitOrder}</span>
                  </div>
                  <h4 className={styles.unitTitle}>{unit.title}</h4>
                </div>
                {canEdit && (
                  <div className={styles.unitActions}>
                    <Button
                      variant="ghost"
                      size="small"
                      icon={<FaEdit />}
                      onClick={() => handleOpenEditModal(unit)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="small"
                      icon={<FaTrash />}
                      onClick={() => handleDeleteUnit(unit)}
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
              
              {unit.description && (
                <div className={styles.unitContent}>
                  <p className={styles.unitDescription}>{unit.description}</p>
                </div>
              )}
              
              <div className={styles.unitFooter}>
                <div className={styles.unitStats}>
                  <span className={styles.statItem}>
                    {unit.resources?.length || 0} recursos
                  </span>
                  <span className={styles.statItem}>
                    {unit.assignments?.length || 0} tareas
                  </span>
                </div>
                <div className={styles.unitStatus}>
                  <span className={`${styles.statusBadge} ${unit.status === 'ACTIVE' ? styles.active : styles.inactive}`}>
                    {unit.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Unit Form Modal */}
      <Modal
        isOpen={showUnitModal}
        onClose={handleCloseUnitModal}
        title={editingUnit ? 'Editar Unidad' : 'Nueva Unidad'}
        size="medium"
      >
        <form onSubmit={handleSubmitUnit} className={styles.unitForm}>
          <div className={styles.formGroup}>
            <Input
              label="Título de la Unidad"
              type="text"
              name="title"
              value={unitForm.title}
              onChange={handleUnitFormChange}
              error={unitErrors.title}
              required
              fullWidth
              placeholder="ej: Introducción a los Conceptos Básicos"
            />
          </div>

          <div className={styles.formGroup}>
            <Input
              label="Orden"
              type="number"
              name="unitOrder"
              value={unitForm.unitOrder}
              onChange={handleUnitFormChange}
              error={unitErrors.unitOrder}
              required
              min="1"
              fullWidth
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descripción</label>
            <textarea
              name="description"
              value={unitForm.description}
              onChange={handleUnitFormChange}
              className={styles.textarea}
              rows="4"
              placeholder="Describe el contenido y objetivos de esta unidad..."
            />
          </div>

          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseUnitModal}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createUnitMutation.isLoading || updateUnitMutation.isLoading}
            >
              {editingUnit ? 'Actualizar' : 'Crear'} Unidad
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
        size="small"
      >
        <div className={styles.deleteConfirmation}>
          <p>¿Estás seguro de que deseas eliminar la unidad "{deletingUnit?.title}"?</p>
          <p className={styles.deleteWarning}>
            Esta acción eliminará todo el contenido asociado a la unidad y no se puede deshacer.
          </p>
          <div className={styles.modalActions}>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteUnit}
              loading={deleteUnitMutation.isLoading}
            >
              Eliminar Unidad
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseUnits;
