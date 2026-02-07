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
  const { t, labels } = useMessages();
  const { updateParams, pathname, router, query } = useNavigation();
  const [excludeBounce, setExcludeBounce] = useState(!!query.excludeBounce);
  const isOverview =
    /^\/teams\/[^/]+\/websites\/[^/]+$/.test(pathname) || /^\/share\/[^/]+$/.test(pathname);

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
    <DialogButton icon={<ListFilter />} label={t(labels.filter)} variant="outline">
      {({ close }) => {
        return (
          <>
            {isOverview && (
              <Row position="absolute" top="30px" right="30px">
                <Checkbox
                  value={excludeBounce ? 'true' : ''}
                  onChange={setExcludeBounce}
                  style={{ marginTop: '3px' }}
                >
                  {t(labels.excludeBounce)}
                </Checkbox>
              </Row>
            )}
            <FilterEditForm websiteId={websiteId} onChange={handleChange} onClose={close} />
          </>
        );
      }}
    </DialogButton>
  );
}
