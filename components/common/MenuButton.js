import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Menu from 'components/common/Menu';
import Button from 'components/common/Button';
import useDocumentClick from 'hooks/useDocumentClick';
import styles from './MenuButton.module.css';

function MenuButton({
  icon,
  value,
  options,
  buttonClassName,
  menuClassName,
  menuPosition = 'bottom',
  menuAlign = 'right',
  onSelect,
  renderValue,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef();
  const selectedOption = options.find(e => e.value === value);

  function handleSelect(value) {
    onSelect(value);
    setShowMenu(false);
  }

  function toggleMenu() {
    setShowMenu(state => !state);
  }

  useDocumentClick(e => {
    if (!ref.current?.contains(e.target)) {
      setShowMenu(false);
    }
  });

  return (
    <div className={styles.container} ref={ref}>
      <Button
        icon={icon}
        className={classNames(styles.button, buttonClassName, { [styles.open]: showMenu })}
        onClick={toggleMenu}
        variant="light"
      >
        <div className={styles.text}>{renderValue ? renderValue(selectedOption) : value}</div>
      </Button>
      {showMenu && (
        <Menu
          className={menuClassName}
          options={options}
          selectedOption={selectedOption}
          onSelect={handleSelect}
          float={menuPosition}
          align={menuAlign}
        />
      )}
    </div>
  );
}

MenuButton.propTypes = {
  icon: PropTypes.node,
  value: PropTypes.any,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node,
      value: PropTypes.any,
      className: PropTypes.string,
      render: PropTypes.func,
      divider: PropTypes.bool,
    }),
  ),
  buttonClassName: PropTypes.string,
  menuClassName: PropTypes.string,
  menuPosition: PropTypes.oneOf(['top', 'bottom']),
  menuAlign: PropTypes.oneOf(['left', 'right']),
  onSelect: PropTypes.func,
  renderValue: PropTypes.func,
};

export default MenuButton;
