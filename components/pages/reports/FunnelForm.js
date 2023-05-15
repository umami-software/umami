import DateFilter from 'components/input/DateFilter';
import WebsiteSelect from 'components/input/WebsiteSelect';
import useMessages from 'hooks/useMessages';
import { parseDateRange } from 'lib/date';
import { useState } from 'react';
import {
  Button,
  Form,
  FormButtons,
  FormInput,
  FormRow,
  SubmitButton,
  TextField,
} from 'react-basics';
import styles from './FunnelForm.module.css';

export function FunnelForm({ onSearch }) {
  const { formatMessage, labels } = useMessages();
  const [dateRange, setDateRange] = useState('');
  const [startAt, setStartAt] = useState();
  const [endAt, setEndAt] = useState();
  const [urls, setUrls] = useState(['']);
  const [websiteId, setWebsiteId] = useState('');
  const [window, setWindow] = useState(60);

  const handleSubmit = async data => {
    onSearch(data);
  };

  const handleDateChange = value => {
    const { startDate, endDate } = parseDateRange(value);

    setDateRange(value);
    setStartAt(startDate.getTime());
    setEndAt(endDate.getTime());
  };

  const handleAddUrl = () => setUrls([...urls, '']);

  const handleRemoveUrl = i => setUrls(urls.splice(i, 1));

  const handleWindowChange = value => setWindow(value.target.value);

  const handleUrlChange = (value, i) => {
    const nextUrls = [...urls];

    nextUrls[i] = value.target.value;
    setUrls(nextUrls);
  };

  return (
    <>
      <Form
        values={{
          websiteId,
          startAt,
          endAt,
          urls,
          window,
        }}
        onSubmit={handleSubmit}
      >
        <FormRow label={formatMessage(labels.website)}>
          <WebsiteSelect websiteId={websiteId} onSelect={value => setWebsiteId(value)} />
          <FormInput name="websiteId" rules={{ required: formatMessage(labels.required) }}>
            <TextField value={websiteId} className={styles.hiddenInput} />
          </FormInput>
        </FormRow>
        <FormRow label="Date">
          <DateFilter
            className={styles.filter}
            value={dateRange}
            alignment="start"
            onChange={handleDateChange}
            isF
          />
          <FormInput
            name="startAt"
            className={styles.hiddenInput}
            rules={{ required: formatMessage(labels.required) }}
          >
            <TextField value={startAt} />
          </FormInput>
          <FormInput name="endAt" rules={{ required: formatMessage(labels.required) }}>
            <TextField value={endAt} className={styles.hiddenInput} />
          </FormInput>
        </FormRow>
        <FormRow label="Window (minutes)">
          <FormInput
            name="window"
            rules={{ required: formatMessage(labels.required), pattern: /[0-9]+/ }}
          >
            <TextField value={window} onChange={handleWindowChange} />
          </FormInput>
        </FormRow>
        <Button onClick={handleAddUrl}>Add URL</Button>
        {urls.map((a, i) => (
          <FormRow className={styles.urlFormRow} key={`url${i}`} label={`URL ${i + 1}`}>
            <TextField value={urls[i]} onChange={value => handleUrlChange(value, i)} />
            <Button onClick={() => handleRemoveUrl(i)}>Remove URL</Button>
          </FormRow>
        ))}

        <FormButtons>
          <SubmitButton variant="primary" disabled={false}>
            Search
          </SubmitButton>
        </FormButtons>
      </Form>
    </>
  );
}

export default FunnelForm;
