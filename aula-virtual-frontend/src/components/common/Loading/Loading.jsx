import React from 'react';
import classNames from 'classnames';
import styles from './Loading.module.css';

const Loading = ({
  size = 'medium',
  text,
  overlay = false,
  variant = 'spinner',
  className,
  ...props
}) => {
  const loadingClasses = classNames(
    styles.loading,
    {
      [styles.overlay]: overlay
    },
    className
  );

  const spinnerClasses = classNames(
    styles.spinner,
    styles[variant],
    styles[size]
  );

  if (overlay) {
    return (
      <div className={loadingClasses} {...props}>
        <div className={styles.overlayContent}>
          <div className={spinnerClasses} />
          {text && <p className={styles.text}>{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={loadingClasses} {...props}>
      <div className={spinnerClasses} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default Loading;
