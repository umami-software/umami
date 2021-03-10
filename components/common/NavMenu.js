import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import styles from './NavMenu.module.css';

function NavMenu({ options = [], className, onSelect = () => {} }) {
  const router = useRouter();

  return (
    <div className={classNames(styles.menu, className)}>
      {options
        .filter(({ hidden }) => !hidden)
        .map(option => {
          const { label, value, className: customClassName, render } = option;

          return render ? (
            render(option)
          ) : (
            <div
              key={value}
              className={classNames(styles.option, customClassName, {
                [styles.selected]: router.asPath === value,
              })}
              onClick={e => onSelect(value, e)}
            >
              {label}
            </div>
          );
        })}
    </div>
  );
}

NavMenu.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node,
      value: PropTypes.any,
      className: PropTypes.string,
      render: PropTypes.func,
    }),
  ),
  className: PropTypes.string,
  onSelect: PropTypes.func,
};
export default NavMenu;
