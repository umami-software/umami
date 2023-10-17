import { useState } from 'react';
import { Loading } from 'react-basics';
import { subDays } from 'date-fns';
import FieldSelectForm from './FieldSelectForm';
import FieldFilterForm from './FieldFilterForm';
import { useApi } from 'components/hooks';

function useValues(websiteId, type) {
  const now = Date.now();
  const { get, useQuery } = useApi();
  const { data, error, isLoading } = useQuery(
    ['websites:values', websiteId, type],
    () =>
      get(`/websites/${websiteId}/values`, {
        type,
        startAt: +subDays(now, 90),
        endAt: now,
      }),
    { enabled: !!(websiteId && type) },
  );

  return { data, error, isLoading };
}

export default function FilterSelectForm({ websiteId, items, onSelect, allowFilterSelect }) {
  const [field, setField] = useState();
  const { data, isLoading } = useValues(websiteId, field?.name);

  if (!field) {
    return <FieldSelectForm items={items} onSelect={setField} showType={false} />;
  }

  if (isLoading) {
    return <Loading position="center" icon="dots" />;
  }

  return (
    <FieldFilterForm
      name={field?.name}
      label={field?.label}
      type={field?.type}
      values={data}
      onSelect={onSelect}
      allowFilterSelect={allowFilterSelect}
    />
  );
}
