import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import { FaSave, FaTimes, FaBold, FaItalic, FaUnderline, FaLink, FaImage, FaQuoteLeft } from 'react-icons/fa';
import { forumService } from '../../../services/forumService';
import { toast } from 'react-toastify';
import styles from './PostForm.module.css';

const PostForm = ({ topicId, parentPostId, quotedPost, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    content: quotedPost ? `> ${quotedPost.content}\n\n` : ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create post mutation
  const createPostMutation = useMutation(
    (postData) => forumService.createPost(topicId, postData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['topic-posts', topicId]);
        queryClient.invalidateQueries(['forum-topics']);
        toast.success('Respuesta publicada exitosamente');
        onSubmit && onSubmit();
      },
      onError: (error) => {
        toast.error('Error al publicar la respuesta');
      }
    }
  );

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
    
    if (!formData.content.trim()) {
      newErrors.content = 'El contenido es requerido';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'El contenido debe tener al menos 10 caracteres';
    } else if (formData.content.length > 10000) {
      newErrors.content = 'El contenido no puede exceder 10,000 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const postData = {
        content: formData.content.trim(),
        parentPostId: parentPostId || null
      };

      await createPostMutation.mutateAsync(postData);
    } catch (error) {
      // Error handling is done in mutation onError
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertTextAtCursor = (textarea, text) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    
    const newValue = value.substring(0, start) + text + value.substring(end);
    textarea.value = newValue;
    
    setFormData(prev => ({
      ...prev,
      content: newValue
    }));
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const handleFormatText = (format) => {
    const textarea = document.getElementById('post-content-textarea');
    if (!textarea) return;

    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    
    let formatText = '';
    switch (format) {
      case 'bold':
        formatText = selectedText ? `**${selectedText}**` : '**texto en negrita**';
        break;
      case 'italic':
        formatText = selectedText ? `*${selectedText}*` : '*texto en cursiva*';
        break;
      case 'underline':
        formatText = selectedText ? `__${selectedText}__` : '__texto subrayado__';
        break;
      case 'link':
        formatText = selectedText ? `[${selectedText}](URL)` : '[texto del enlace](URL)';
        break;
      case 'image':
        formatText = '![descripción de la imagen](URL de la imagen)';
        break;
      case 'quote':
        formatText = selectedText ? `> ${selectedText}` : '> texto citado';
        break;
      default:
        return;
    }
    
    insertTextAtCursor(textarea, formatText);
  };

  const getCharacterCount = () => {
    return formData.content.length;
  };

  const getCharacterCountClass = () => {
    const count = getCharacterCount();
    if (count > 9000) return styles.charCountDanger;
    if (count > 8000) return styles.charCountWarning;
    return styles.charCountNormal;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {parentPostId ? 'Responder al comentario' : 'Responder al tema'}
        </h3>
        {quotedPost && (
          <div className={styles.quotedPostInfo}>
            <span>Respondiendo a {quotedPost.author.firstName} {quotedPost.author.lastName}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Tu respuesta <span className={styles.required}>*</span>
          </label>
          
          <div className={styles.editorToolbar}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormatText('bold')}
              title="Negrita"
            >
              <FaBold />
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormatText('italic')}
              title="Cursiva"
            >
              <FaItalic />
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormatText('underline')}
              title="Subrayado"
            >
              <FaUnderline />
            </button>
            <div className={styles.toolbarSeparator}></div>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormatText('quote')}
              title="Cita"
            >
              <FaQuoteLeft />
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormatText('link')}
              title="Enlace"
            >
              <FaLink />
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => handleFormatText('image')}
              title="Imagen"
            >
              <FaImage />
            </button>
          </div>
          
          <textarea
            id="post-content-textarea"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className={`${styles.textarea} ${errors.content ? styles.error : ''}`}
            rows="8"
            placeholder="Escribe tu respuesta aquí. Puedes usar Markdown para dar formato al texto..."
            required
          />
          
          {errors.content && (
            <div className={styles.errorText}>{errors.content}</div>
          )}
          
          <div className={styles.textareaFooter}>
            <div className={styles.editorHelp}>
              <small>
                Puedes usar <strong>Markdown</strong> para dar formato: **negrita**, *cursiva*, > citas, etc.
              </small>
            </div>
            <div className={`${styles.charCount} ${getCharacterCountClass()}`}>
              {getCharacterCount()}/10,000 caracteres
            </div>
          </div>
        </div>

        <div className={styles.previewSection}>
          <h4 className={styles.previewTitle}>Vista Previa</h4>
          <div className={styles.previewContent}>
            {formData.content ? (
              <div 
                className={styles.previewText}
                dangerouslySetInnerHTML={{ 
                  __html: formData.content
                    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/__(.*?)__/g, '<u>$1</u>')
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
                    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">')
                    .replace(/\n/g, '<br>')
                }} 
              />
            ) : (
              <em className={styles.previewPlaceholder}>
                La vista previa de tu respuesta aparecerá aquí...
              </em>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            icon={<FaTimes />}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<FaSave />}
            loading={isSubmitting}
            disabled={!formData.content.trim()}
          >
            Publicar Respuesta
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
