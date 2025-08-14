import React from 'react';
import styles from './StatsCard.module.css';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary',
  trend,
  trendValue 
}) => {
  const cardClass = [
    styles.card,
    styles[color]
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      <div className={styles.content}>
        <div className={styles.icon}>
          {icon}
        </div>
        <div className={styles.info}>
          <h3 className={styles.value}>{value}</h3>
          <p className={styles.title}>{title}</p>
          {trend && (
            <div className={`${styles.trend} ${styles[trend]}`}>
              <span className={styles.trendIcon}>
                {trend === 'up' ? '↗' : '↘'}
              </span>
              <span className={styles.trendValue}>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
