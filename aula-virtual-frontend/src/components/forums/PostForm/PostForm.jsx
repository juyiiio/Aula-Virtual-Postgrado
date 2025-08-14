import React, { useState } from 'react';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import { validateLength } from '../../../utils/validators';
import styles from './PostForm.module.css';

const PostForm = ({ post, onSubmit, onCancel, isReply = false }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    if (!isReply) {
      const titleError = validateLength(formData.title, 3, 150, 'título');
      if (titleError) newErrors.title = titleError;
    }

    const contentError = validateLength(formData.content, 10, 2000, 'contenido');
    if (contentError) newErrors.content = contentError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {!isReply && (
        <Input
          label="Título del Post"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
          placeholder="Título del post"
        />
      )}

      <Input
        label={isReply ? "Respuesta" : "Contenido"}
        type="textarea"
        name="content"
        value={formData.content}
        onChange={handleChange}
        error={errors.content}
        required
        placeholder={isReply ? "Escribe tu respuesta..." : "Contenido del post..."}
        rows={isReply ? "4" : "8"}
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
          {isReply ? 'Responder' : post?.id ? 'Actualizar' : 'Publicar'}
        </Button>
      </div>
    </form>
  );
};

export default PostForm;
