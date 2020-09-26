import React from 'react';
import ReactTooltip from 'react-tooltip';
import classNames from 'classnames';
import Icon from './Icon';
import styles from './Button.module.css';

export default function Button({
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
