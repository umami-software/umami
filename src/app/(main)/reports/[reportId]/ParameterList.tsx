import { ReactNode } from 'react';
import { Icon } from 'react-basics';
import Icons from 'components/icons';
import Empty from 'components/common/Empty';
import { useMessages } from 'components/hooks';
import styles from './ParameterList.module.css';
import classNames from 'classnames';

export interface ParameterListProps {
  children?: ReactNode;
}

export function ParameterList({ children }: ParameterListProps) {
  const { formatMessage, labels } = useMessages();

  return (
    <div className={styles.list}>
      {!children && <Empty message={formatMessage(labels.none)} />}
      {children}
    </div>
  );
}

const Item = ({
  children,
  className,
  icon,
  onClick,
  onRemove,
}: {
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
  onClick?: () => void;
  onRemove?: () => void;
}) => {
  return (
    <div className={classNames(styles.item, className)} onClick={onClick}>
      {icon && <Icon className={styles.icon}>{icon}</Icon>}
      <div className={styles.value}>{children}</div>
      <Icon className={styles.close} onClick={onRemove}>
        <Icons.Close />
      </Icon>
    </div>
  );
};

ParameterList.Item = Item;

export default ParameterList;
