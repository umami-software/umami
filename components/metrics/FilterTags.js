import React from 'react';
import classNames from 'classnames';
import Button from 'components/common/Button';
import Times from 'assets/times.svg';
import styles from './FilterTags.module.css';

export default function FilterTags({ params, onClick }) {
  if (Object.keys(params).filter(key => params[key]).length === 0) {
    return null;
  }
  return (
    <div className={classNames(styles.filters, 'col-12')}>
      {Object.keys(params).map(key => {
        if (!params[key]) {
          return null;
        }
        return (
          <div key={key} className={styles.tag}>
            <Button icon={<Times />} onClick={() => onClick(key)} variant="action" iconRight>
              {`${key}: ${params[key]}`}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
