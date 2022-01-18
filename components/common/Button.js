import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import classNames from 'classnames';
import Icon from './Icon';
import styles from './Button.module.css';

function Button({
  type = 'button',
  icon,
  size,
  variant,
  children,
  className,
  tooltip,
  tooltipId,
  disabled,
  iconRight,
  onClick = () => {},
  ...props
}) {
  return (
    <button
      data-tip={tooltip}
      data-effect="solid"
      data-for={tooltipId}
      data-offset={JSON.stringify({ left: 10 })}
      type={type}
      className={classNames(styles.button, className, {
        [styles.large]: size === 'large',
        [styles.small]: size === 'small',
        [styles.xsmall]: size === 'xsmall',
        [styles.action]: variant === 'action',
        [styles.danger]: variant === 'danger',
        [styles.light]: variant === 'light',
        [styles.iconRight]: iconRight,
      })}
      disabled={disabled}
      onClick={!disabled ? onClick : null}
      {...props}
    >
      {icon && <Icon className={styles.icon} icon={icon} size={size} />}
      {children && <div className={styles.label}>{children}</div>}
      {tooltip && <ReactTooltip id={tooltipId}>{tooltip}</ReactTooltip>}
    </button>
  );
}

Button.propTypes = {
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  icon: PropTypes.node,
  size: PropTypes.oneOf(['xlarge', 'large', 'medium', 'small', 'xsmall']),
  variant: PropTypes.oneOf(['action', 'danger', 'light']),
  children: PropTypes.node,
  className: PropTypes.string,
  tooltip: PropTypes.node,
  tooltipId: PropTypes.string,
  disabled: PropTypes.bool,
  iconRight: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Button;
