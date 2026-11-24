'use client';
import { Checkbox, Field, FieldLabel, Row } from '@umami/react-zen';
import { useId } from 'react';
import { useMessages } from '@/components/hooks/useMessages';
import { useNavigation } from '@/components/hooks/useNavigation';

export function BounceFilter() {
  const { router, query, updateParams } = useNavigation();
  const { t, labels } = useMessages();
  const id = useId();
  const isSelected = query.excludeBounce === 'true';

  const handleChange = (value: boolean) => {
    if (value) {
      router.push(updateParams({ excludeBounce: 'true' }));
    } else {
      router.push(updateParams({ excludeBounce: undefined }));
    }
  };

  return (
    <Row alignItems="center" gap>
      <Field orientation="horizontal">
        <Checkbox id={id} checked={isSelected} onCheckedChange={handleChange} />
        <FieldLabel htmlFor={id}>{t(labels.excludeBounce)}</FieldLabel>
      </Field>
    </Row>
  );
}
