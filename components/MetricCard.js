import React from 'react';
import styles from './MetricCard.module.css';

const MetricCard = ({ value, label }) => (
  <div className={styles.card}>
    <div className={styles.value}>{value}</div>
    <div className={styles.label}>{label}</div>
  </div>
);

export default MetricCard;
