import { ReactNode } from 'react';
import { Icon, TooltipPopup } from 'react-basics';
import Icons from 'components/icons';
import Empty from 'components/common/Empty';
import { useMessages } from 'components/hooks';
import styles from './ParameterList.module.css';

export interface ParameterListProps {
  items: any[];
  children?: ReactNode | ((item: any) => ReactNode);
  onRemove: (index: number, e: any) => void;
}

export function ParameterList({ items = [], children, onRemove }: ParameterListProps) {
  const { formatMessage, labels } = useMessages();

  return (
    <div className={styles.list}>
      {!items.length && <Empty message={formatMessage(labels.none)} />}
      {items.map((item, index) => {
        return (
          <div key={index} className={styles.item}>
            {typeof children === 'function' ? children(item) : item}
            <TooltipPopup
              className={styles.icon}
              label={formatMessage(labels.remove)}
              position="right"
            >
              <Icon onClick={onRemove.bind(null, index)}>
                <Icons.Close />
              </Icon>
            </TooltipPopup>
          </div>
        );
      })}
    </div>
  );
}

export default ParameterList;
