import { useMutation } from '@tanstack/react-query';
import DateFilter from 'components/input/DateFilter';
import WebsiteSelect from 'components/input/WebsiteSelect';
import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';
import useUser from 'hooks/useUser';
import { parseDateRange } from 'lib/date';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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
import { getNextInternalQuery } from 'next/dist/server/request-meta';

export function FunnelForm({ onSearch }) {
  const { formatMessage, labels, getMessage } = useMessages();
  const [dateRange, setDateRange] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [urls, setUrls] = useState(['']);
  const [websiteId, setWebsiteId] = useState('');

  const handleSubmit = async data => {
    onSearch(data);
  };

  const handleDateChange = value => {
    const { startDate, endDate } = parseDateRange(value);

    setDateRange(value);
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const handleAddUrl = () => setUrls([...urls, 'meow']);

  const handleRemoveUrl = i => setUrls(urls.splice(i, 1));

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
          startDate,
          endDate,
          urls,
        }}
        onSubmit={handleSubmit}
      >
        <FormRow label="website">
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
          />
          <FormInput
            name="startDate"
            className={styles.hiddenInput}
            rules={{ required: formatMessage(labels.required) }}
          >
            <TextField value={startDate} />
          </FormInput>
          <FormInput name="endDate" rules={{ required: formatMessage(labels.required) }}>
            <TextField value={endDate} className={styles.hiddenInput} />
          </FormInput>
        </FormRow>
        <Button onClick={handleAddUrl}>Add URL</Button>
        {urls.map((a, i) => (
          <FormRow key={`url${i}`} label={`URL ${i + 1}`}>
            <Button onClick={() => handleRemoveUrl(i)}>Remove URL</Button>
            <TextField value={urls[i]} onChange={value => handleUrlChange(value, i)} />
          </FormRow>
        ))}

        <FormButtons>
          <SubmitButton variant="primary">Search</SubmitButton>
        </FormButtons>
      </Form>
    </>
  );
}

export default FunnelForm;
