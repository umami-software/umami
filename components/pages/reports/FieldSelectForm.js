import { Menu, Item, Form, FormRow } from 'react-basics';
import { useMessages } from 'hooks';
import styles from './FieldSelectForm.module.css';

export default function FieldSelectForm({ fields, onSelect }) {
  const { formatMessage, labels } = useMessages();

  return (
    <Form>
      <FormRow label={formatMessage(labels.fields)}>
        <Menu className={styles.menu} onSelect={key => onSelect(fields[key])}>
          {fields.map(({ name, type }, index) => {
            return (
              <Item key={index} className={styles.item}>
                <div>{name}</div>
                <div className={styles.type}>{type}</div>
              </Item>
            );
          })}
        </Menu>
      </FormRow>
    </Form>
  );
}
