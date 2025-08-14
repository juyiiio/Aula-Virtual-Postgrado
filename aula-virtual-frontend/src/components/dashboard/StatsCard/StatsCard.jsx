import React from 'react';
import classNames from 'classnames';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import styles from './StatsCard.module.css';

const StatsCard = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  subtitle,
  onClick,
  className,
  ...props
}) => {
  const cardClasses = classNames(
    styles.card,
    styles[color],
    {
      [styles.clickable]: onClick
    },
    className
  );

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    return trend.type === 'increase' ? (
      <FaArrowUp className={styles.trendIconUp} />
    ) : (
      <FaArrowDown className={styles.trendIconDown} />
    );
  };

  const getTrendColor = () => {
    if (!trend) return '';
    return trend.type === 'increase' ? styles.trendUp : styles.trendDown;
  };

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>{title}</h3>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <div className={styles.iconSection}>
            <div className={styles.iconWrapper}>
              {icon}
            </div>
          </div>
        </div>
        
        <div className={styles.body}>
          <div className={styles.valueSection}>
            <span className={styles.value}>{formatValue(value)}</span>
            {trend && (
              <div className={`${styles.trend} ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className={styles.trendValue}>
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.decoration}></div>
    </div>
  );
};

export default StatsCard;
