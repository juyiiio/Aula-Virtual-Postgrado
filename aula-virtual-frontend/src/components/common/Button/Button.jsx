import React from 'react';
import classNames from 'classnames';
import styles from './Button.module.css';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  className,
  ...props
}) => {
  const buttonClasses = classNames(
    styles.button,
    styles[variant],
    styles[size],
    {
      [styles.disabled]: disabled,
      [styles.loading]: loading,
      [styles.fullWidth]: fullWidth,
      [styles.iconRight]: iconPosition === 'right'
    },
    className
  );

  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick && onClick(e);
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && <div className={styles.spinner} />}
      {icon && iconPosition === 'left' && <span className={styles.icon}>{icon}</span>}
      <span className={styles.content}>{children}</span>
      {icon && iconPosition === 'right' && <span className={styles.icon}>{icon}</span>}
    </button>
  );
};

export default Button;
