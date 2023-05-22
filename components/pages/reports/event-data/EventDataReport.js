import { useState } from 'react';
import { Form, FormRow, FormInput, TextField } from 'react-basics';
import Report from '../Report';
import ReportHeader from '../ReportHeader';
import useMessages from 'hooks/useMessages';
import Nodes from 'assets/nodes.svg';
import styles from '../reports.module.css';

export default function EventDataReport({ websiteId, data }) {
  const [values, setValues] = useState({ query: '' });
  const { formatMessage, labels } = useMessages();

  return (
    <Report>
      <ReportHeader title={formatMessage(labels.eventData)} icon={<Nodes />} />
      <div className={styles.container}>
        <div className={styles.menu}>
          <Form>
            <FormRow label="Properties">
              <FormInput name="query">
                <TextField value={values.query} />
              </FormInput>
            </FormRow>
          </Form>
        </div>
        <div className={styles.content}></div>
      </div>
    </Report>
  );
}
