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
  onClick,
  onRemove,
}: {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  onRemove?: () => void;
}) => {
  return (
    <div className={classNames(styles.item, className)} onClick={onClick}>
      {children}
      <Icon onClick={onRemove}>
        <Icons.Close />
      </Icon>
    </div>
  );
};

ParameterList.Item = Item;

export default ParameterList;
