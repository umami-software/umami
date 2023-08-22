import { Menu, Item, Form, FormRow } from 'react-basics';
import { useMessages } from 'hooks';
import styles from './FieldSelectForm.module.css';

export default function FieldSelectForm({ items, onSelect, showType = true }) {
  const { formatMessage, labels } = useMessages();

  return (
    <Form>
      <FormRow label={formatMessage(labels.fields)}>
        <Menu className={styles.menu} onSelect={key => onSelect(items[key])}>
          {items.map(({ name, label, type }, index) => {
            return (
              <Item key={index} className={styles.item}>
                <div>{label || name}</div>
                {showType && type && <div className={styles.type}>{type}</div>}
              </Item>
            );
          })}
        </Menu>
      </FormRow>
    </Form>
  );
}
