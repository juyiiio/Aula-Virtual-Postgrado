import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { 
  FaCloudUploadAlt, 
  FaFile, 
  FaTimes, 
  FaCheck,
  FaExclamationTriangle,
  FaImage,
  FaVideo,
  FaFileAudio,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileArchive
} from 'react-icons/fa';
import { resourceService } from '../../../services/resourceService';
import { toast } from 'react-toastify';
import styles from './ResourceUpload.module.css';

const ResourceUpload = ({ onSuccess, onCancel, categories = [] }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [uploadData, setUploadData] = useState({
    name: '',
    description: '',
    categoryId: '',
    tags: '',
    isPublic: true
  });
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  // Upload mutation
  const uploadMutation = useMutation(
    (formData) => resourceService.uploadResource(formData, {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(prev => ({
          ...prev,
          [formData.get('fileName')]: progress
        }));
      }
    }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['resources']);
        toast.success('Recurso subido exitosamente');
        onSuccess && onSuccess(data);
      },
      onError: (error) => {
        toast.error('Error al subir el recurso');
      }
    }
  );

  const allowedTypes = {
    'image/*': { icon: <FaImage />, label: 'Imágenes', maxSize: 10 * 1024 * 1024 }, // 10MB
    'video/*': { icon: <FaVideo />, label: 'Videos', maxSize: 100 * 1024 * 1024 }, // 100MB
    'audio/*': { icon: <FaFileAudio />, label: 'Audio', maxSize: 50 * 1024 * 1024 }, // 50MB
    'application/pdf': { icon: <FaFilePdf />, label: 'PDF', maxSize: 25 * 1024 * 1024 }, // 25MB
    'application/msword': { icon: <FaFileWord />, label: 'Word', maxSize: 25 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: <FaFileWord />, label: 'Word', maxSize: 25 * 1024 * 1024 },
    'application/vnd.ms-excel': { icon: <FaFileExcel />, label: 'Excel', maxSize: 25 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: <FaFileExcel />, label: 'Excel', maxSize: 25 * 1024 * 1024 },
    'application/vnd.ms-powerpoint': { icon: <FaFilePowerpoint />, label: 'PowerPoint', maxSize: 50 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: <FaFilePowerpoint />, label: 'PowerPoint', maxSize: 50 * 1024 * 1024 },
    'application/zip': { icon: <FaFileArchive />, label: 'ZIP', maxSize: 100 * 1024 * 1024 },
    'application/x-rar-compressed': { icon: <FaFileArchive />, label: 'RAR', maxSize: 100 * 1024 * 1024 }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUploadData(prev => ({
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

  const validateFile = (file) => {
    const errors = [];
    
    // Check file type
    const isAllowedType = Object.keys(allowedTypes).some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });
    
    if (!isAllowedType) {
      errors.push('Tipo de archivo no permitido');
    }
    
    // Check file size
    const typeConfig = Object.entries(allowedTypes).find(([type]) => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });
    
    if (typeConfig && file.size > typeConfig[1].maxSize) {
      const maxSizeMB = (typeConfig[1].maxSize / (1024 * 1024)).toFixed(1);
      errors.push(`El archivo excede el tamaño máximo de ${maxSizeMB} MB`);
    }
    
    return errors;
  };

  const handleFileSelect = (files) => {
    const validFiles = [];
    const fileErrors = {};
    
    Array.from(files).forEach(file => {
      const errors = validateFile(file);
      if (errors.length > 0) {
        fileErrors[file.name] = errors;
      } else {
        validFiles.push(file);
      }
    });
    
    if (Object.keys(fileErrors).length > 0) {
      const errorMessage = Object.entries(fileErrors)
        .map(([filename, errors]) => `${filename}: ${errors.join(', ')}`)
        .join('\n');
      toast.error(`Errores en archivos:\n${errorMessage}`);
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Auto-fill name if only one file and name is empty
    if (validFiles.length === 1 && !uploadData.name) {
      const fileName = validFiles[0].name.replace(/\.[^/.]+$/, '');
      setUploadData(prev => ({
        ...prev,
        name: fileName
      }));
    }
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    const typeConfig = Object.entries(allowedTypes).find(([type]) => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });
    
    return typeConfig ? typeConfig[1].icon : <FaFile />;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!uploadData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (selectedFiles.length === 0) {
      newErrors.files = 'Debe seleccionar al menos un archivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', uploadData.name || file.name.replace(/\.[^/.]+$/, ''));
        formData.append('description', uploadData.description);
        formData.append('categoryId', uploadData.categoryId);
        formData.append('tags', uploadData.tags);
        formData.append('isPublic', uploadData.isPublic);
        formData.append('fileName', file.name);
        
        await uploadMutation.mutateAsync(formData);
      }
    } catch (error) {
      // Error handling is done in mutation onError
    }
  };

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  };

  const isUploading = uploadMutation.isLoading;
  const totalProgress = Object.values(uploadProgress).reduce((sum, progress) => sum + progress, 0) / selectedFiles.length || 0;

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Información del Recurso</h3>
          
          <div className={styles.formGrid}>
            <Input
              label="Nombre del recurso"
              type="text"
              name="name"
              value={uploadData.name}
              onChange={handleInputChange}
              error={errors.name}
              required
              fullWidth
              placeholder="Nombre descriptivo del recurso"
            />
            
            {categories.length > 0 && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Categoría</label>
                <select
                  name="categoryId"
                  value={uploadData.categoryId}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">Seleccionar categoría...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Descripción</label>
            <textarea
              name="description"
              value={uploadData.description}
              onChange={handleInputChange}
              className={styles.textarea}
              rows="3"
              placeholder="Describe el contenido y propósito del recurso..."
            />
          </div>
          
          <div className={styles.formGroup}>
            <Input
              label="Etiquetas (separadas por comas)"
              type="text"
              name="tags"
              value={uploadData.tags}
              onChange={handleInputChange}
              fullWidth
              placeholder="etiqueta1, etiqueta2, etiqueta3"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isPublic"
                checked={uploadData.isPublic}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>Hacer público (visible para todos los usuarios)</span>
            </label>
          </div>
        </div>

        {/* File Upload */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Archivos</h3>
          
          <div
            className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className={styles.hiddenInput}
              accept={Object.keys(allowedTypes).join(',')}
            />
            
            <div className={styles.dropZoneContent}>
              <FaCloudUploadAlt className={styles.uploadIcon} />
              <h4>Arrastra archivos aquí o haz clic para seleccionar</h4>
              <p>Soporta múltiples archivos</p>
              
              <div className={styles.allowedTypes}>
                <h5>Tipos de archivo permitidos:</h5>
                <div className={styles.typesList}>
                  {Object.entries(allowedTypes).map(([type, config]) => (
                    <div key={type} className={styles.typeItem}>
                      {config.icon}
                      <span>{config.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {errors.files && (
            <div className={styles.errorText}>{errors.files}</div>
          )}
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Archivos Seleccionados ({selectedFiles.length})
            </h3>
            
            <div className={styles.filesInfo}>
              <span>Tamaño total: {formatFileSize(getTotalSize())}</span>
            </div>
            
            <div className={styles.filesList}>
              {selectedFiles.map((file, index) => (
                <div key={index} className={styles.fileItem}>
                  <div className={styles.fileIcon}>
                    {getFileIcon(file)}
                  </div>
                  
                  <div className={styles.fileInfo}>
                    <div className={styles.fileName}>{file.name}</div>
                    <div className={styles.fileSize}>{formatFileSize(file.size)}</div>
                    
                    {isUploading && uploadProgress[file.name] !== undefined && (
                      <div className={styles.progressContainer}>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill}
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          ></div>
                        </div>
                        <span className={styles.progressText}>
                          {uploadProgress[file.name]}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {!isUploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="small"
                      icon={<FaTimes />}
                      onClick={() => removeFile(index)}
                    />
                  )}
                  
                  {uploadProgress[file.name] === 100 && (
                    <div className={styles.uploadComplete}>
                      <FaCheck className={styles.checkIcon} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className={styles.uploadProgressSection}>
            <h3 className={styles.sectionTitle}>Progreso de Subida</h3>
            <div className={styles.totalProgress}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${totalProgress}%` }}
                ></div>
              </div>
              <span className={styles.progressText}>
                {Math.round(totalProgress)}% completado
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isUploading}
            disabled={selectedFiles.length === 0}
          >
            {isUploading ? 'Subiendo...' : 'Subir Archivos'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResourceUpload;
