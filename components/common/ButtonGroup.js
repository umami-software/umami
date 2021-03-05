import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from './Button';
import styles from './ButtonGroup.module.css';

function ButtonGroup({ items = [], selectedItem, className, size, icon, onClick = () => {} }) {
  return (
    <div className={classNames(styles.group, className)}>
      {items.map(item => {
        const { label, value } = item;
        return (
          <Button
            key={value}
            className={classNames(styles.button, { [styles.selected]: selectedItem === value })}
            size={size}
            icon={icon}
            onClick={() => onClick(value)}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}

ButtonGroup.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node,
      value: PropTypes.any.isRequired,
    }),
  ),
  selectedItem: PropTypes.any,
  className: PropTypes.string,
  size: PropTypes.oneOf(['xlarge', 'large', 'medium', 'small', 'xsmall']),
  icon: PropTypes.node,
  onClick: PropTypes.func,
};

export default ButtonGroup;
