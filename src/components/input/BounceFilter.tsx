'use client';
import { Checkbox, Row } from '@umami/react-zen';
import { useMessages } from '@/components/hooks/useMessages';
import { useNavigation } from '@/components/hooks/useNavigation';

export function BounceFilter() {
  const { router, query, updateParams } = useNavigation();
  const { t, labels } = useMessages();
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
      <Checkbox isSelected={isSelected} onChange={handleChange}>
        {t(labels.excludeBounce)}
      </Checkbox>
    </Row>
  );
}
