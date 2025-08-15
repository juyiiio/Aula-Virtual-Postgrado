import React, { useState } from 'react';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useNotification from '../../../hooks/useNotification';
import fileService from '../../../services/fileService';
import { validateLength } from '../../../utils/validators';
import { formatFileSize } from '../../../utils/formatters';
import styles from './ResourceUpload.module.css';

const ResourceUpload = ({ courseId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'DOCUMENT',
    tags: '',
    isPublic: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showError, showSuccess } = useNotification();

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const allowedTypes = {
    DOCUMENT: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    VIDEO: ['.mp4', '.avi', '.mov', '.wmv', '.flv'],
    AUDIO: ['.mp3', '.wav', '.ogg', '.m4a'],
    IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'],
    PRESENTATION: ['.ppt', '.pptx', '.key'],
    SPREADSHEET: ['.xls', '.xlsx', '.csv', '.numbers'],
    OTHER: []
  };

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño
    if (file.size > maxFileSize) {
      showError(`El archivo es muy grande. Tamaño máximo: ${formatFileSize(maxFileSize)}`);
      return;
    }

    // Validar tipo si hay restricciones
    const selectedCategory = formData.category;
    const allowedExtensions = allowedTypes[selectedCategory];
    
    if (allowedExtensions.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        showError(`Tipo de archivo no permitido para la categoría ${selectedCategory}. Extensiones válidas: ${allowedExtensions.join(', ')}`);
        return;
      }
    }

    setSelectedFile(file);
    
    // Auto-completar nombre si está vacío
    if (!formData.name) {
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remover extensión
      setFormData(prev => ({
        ...prev,
        name: fileName
      }));
    }

    // Auto-detectar categoría basada en tipo MIME
    if (formData.category === 'DOCUMENT') {
      if (file.type.startsWith('video/')) {
        setFormData(prev => ({ ...prev, category: 'VIDEO' }));
      } else if (file.type.startsWith('audio/')) {
        setFormData(prev => ({ ...prev, category: 'AUDIO' }));
      } else if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, category: 'IMAGE' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedFile) {
      newErrors.file = 'Debe seleccionar un archivo';
    }

    const nameError = validateLength(formData.name, 1, 200, 'nombre');
    if (nameError) newErrors.name = nameError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);
      uploadData.append('name', formData.name);
      uploadData.append('description', formData.description);
      uploadData.append('category', formData.category);
      uploadData.append('tags', formData.tags);
      uploadData.append('isPublic', formData.isPublic);
      if (courseId) {
        uploadData.append('courseId', courseId);
      }

      await fileService.uploadResource(uploadData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      showSuccess('Recurso subido exitosamente');
      if (onSuccess) onSuccess();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al subir el archivo';
      showError(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getCategoryName = (category) => {
    const categories = {
      DOCUMENT: 'Documento',
      VIDEO: 'Video',
      AUDIO: 'Audio',
      IMAGE: 'Imagen',
      PRESENTATION: 'Presentación',
      SPREADSHEET: 'Hoja de cálculo',
      OTHER: 'Otro'
    };
    return categories[category] || category;
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fileSection}>
        <label className={styles.fileLabel}>Seleccionar Archivo *</label>
        
        <div className={styles.fileInputContainer}>
          <input
            type="file"
            onChange={handleFileChange}
            className={styles.fileInput}
            accept="*/*"
            required
          />
          
          {selectedFile && (
            <div className={styles.selectedFile}>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{selectedFile.name}</span>
                <span className={styles.fileSize}>{formatFileSize(selectedFile.size)}</span>
              </div>
              
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className={styles.removeFile}
              >
                ✕
              </button>
            </div>
          )}
        </div>
        
        {errors.file && (
          <span className={styles.errorMessage}>{errors.file}</span>
        )}
        
        <p className={styles.fileHint}>
          Tamaño máximo: {formatFileSize(maxFileSize)}
        </p>
      </div>

      <Input
        label="Nombre del Recurso"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder="Nombre descriptivo del recurso"
      />

      <Input
        label="Descripción"
        type="textarea"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Descripción del recurso (opcional)"
        rows="3"
      />

      <div className={styles.row}>
        <div className={styles.selectContainer}>
          <label className={styles.selectLabel}>Categoría *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="DOCUMENT">Documento</option>
            <option value="VIDEO">Video</option>
            <option value="AUDIO">Audio</option>
            <option value="IMAGE">Imagen</option>
            <option value="PRESENTATION">Presentación</option>
            <option value="SPREADSHEET">Hoja de cálculo</option>
            <option value="OTHER">Otro</option>
          </select>
          
          {allowedTypes[formData.category].length > 0 && (
            <p className={styles.categoryHint}>
              Extensiones permitidas: {allowedTypes[formData.category].join(', ')}
            </p>
          )}
        </div>

        <Input
          label="Etiquetas"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Separadas por comas"
        />
      </div>

      <div className={styles.optionsSection}>
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className={styles.checkbox}
          />
          <label htmlFor="isPublic" className={styles.checkboxLabel}>
            Hacer público (visible para todos los usuarios)
          </label>
        </div>
      </div>

      {uploading && (
        <div className={styles.uploadProgress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className={styles.progressText}>{uploadProgress}%</span>
        </div>
      )}

      <div className={styles.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={uploading}
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          loading={uploading}
        >
          {uploading ? `Subiendo... ${uploadProgress}%` : 'Subir Recurso'}
        </Button>
      </div>
    </form>
  );
};

export default ResourceUpload;
