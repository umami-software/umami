import { Checkbox, Row } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages, useNavigation } from '@/components/hooks';
import { ListFilter } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { FilterEditForm } from '@/components/input/FilterEditForm';
import { filtersArrayToObject } from '@/lib/params';

export function WebsiteFilterButton({
  websiteId,
}: {
  websiteId: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
  alignment?: 'end' | 'center' | 'start';
}) {
  const { formatMessage, labels } = useMessages();
  const { updateParams, router, query } = useNavigation();
  const [excludeBounce, setExcludeBounce] = useState(!!query.excludeBounce);

  const handleChange = ({ filters, segment, cohort }: any) => {
    const params = filtersArrayToObject(filters);

    const url = updateParams({
      ...params,
      segment,
      cohort,
      excludeBounce: excludeBounce ? 'true' : undefined,
    });

    router.push(url);
  };

  return (
    <DialogButton icon={<ListFilter />} label={formatMessage(labels.filter)} variant="outline">
      {({ close }) => {
        return (
          <>
            <Row position="absolute" top="30px" right="30px">
              <Row alignItems="center" gap>
                <Checkbox value={excludeBounce ? 'true' : ''} onChange={setExcludeBounce}>
                  {formatMessage(labels.excludeBounce)}
                </Checkbox>
              </Row>
            </Row>
            <FilterEditForm websiteId={websiteId} onChange={handleChange} onClose={close} />
          </>
        );
      }}
    </DialogButton>
  );
}
