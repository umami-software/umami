import { useState } from 'react';
import FieldSelectForm from './FieldSelectForm';
import FieldFilterForm from './FieldFilterForm';
import { useApi } from 'hooks';
import { Loading } from 'react-basics';

function useValues(websiteId, type) {
  const { get, useQuery } = useApi();
  const { data, error, isLoading } = useQuery(
    ['websites:values', websiteId, type],
    () =>
      get(`/websites/${websiteId}/values`, {
        type,
      }),
    { enabled: !!(websiteId && type) },
  );

  return { data, error, isLoading };
}

export default function FilterSelectForm({ websiteId, items, onSelect }) {
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
    />
  );
}
