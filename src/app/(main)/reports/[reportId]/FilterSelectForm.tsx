import { useState } from 'react';
import { Loading } from 'react-basics';
import { subDays } from 'date-fns';
import FieldSelectForm from './FieldSelectForm';
import FieldFilterForm from './FieldFilterForm';
import { useApi } from 'components/hooks';

function useValues(websiteId: string, type: string) {
  const now = Date.now();
  const { get, useQuery } = useApi();
  const { data, error, isLoading } = useQuery({
    queryKey: ['websites:values', websiteId, type],
    queryFn: () =>
      get(`/websites/${websiteId}/values`, {
        type,
        startAt: +subDays(now, 90),
        endAt: now,
      }),
    enabled: !!(websiteId && type),
  });

  return { data, error, isLoading };
}

export interface FilterSelectFormProps {
  websiteId: string;
  items: any[];
  onSelect?: (key: any) => void;
  allowFilterSelect?: boolean;
}

export default function FilterSelectForm({
  websiteId,
  items,
  onSelect,
  allowFilterSelect,
}: FilterSelectFormProps) {
  const [field, setField] = useState<{ name: string; label: string; type: string }>();
  const { data, isLoading } = useValues(websiteId, field?.name);

  if (!field) {
    return <FieldSelectForm fields={items} onSelect={setField} showType={false} />;
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
