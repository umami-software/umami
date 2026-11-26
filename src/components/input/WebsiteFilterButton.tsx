import { Checkbox, Field, FieldLabel, Row } from '@umami/react-zen';
import { useId, useState } from 'react';
import { useFilters, useMessages, useNavigation } from '@/components/hooks';
import { ListFilter } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { FilterEditForm } from '@/components/input/FilterEditForm';
import {
  filtersArrayToObject,
  serializeSessionPropertyFilters,
  serializeUniversalEventPropertyFilters,
} from '@/lib/params';
import { isEventsPagePath } from '@/lib/url';
import styles from './WebsiteFilterButton.module.css';

export function WebsiteFilterButton({
  websiteId,
  allowBounceFilter,
}: {
  websiteId?: string;
  allowBounceFilter?: boolean;
  position?: 'bottom' | 'top' | 'left' | 'right';
  alignment?: 'end' | 'center' | 'start';
}) {
  const { t, labels } = useMessages();
  const checkboxId = useId();
  const { updateParams, pathname, router, query } = useNavigation();
  const { filters: currentFilters } = useFilters();
  const isEventsPath = isEventsPagePath(pathname);
  const [excludeBounce, setExcludeBounce] = useState(!!query.excludeBounce);
  const isOverview =
    /^\/teams\/[^/]+\/websites\/[^/]+$/.test(pathname) || /^\/share\/[^/]+$/.test(pathname);

  const handleChange = ({
    filters,
    eventPropertyFilters = [],
    sessionPropertyFilters = [],
    segment,
    cohort,
    match,
  }: any) => {
    const params = filtersArrayToObject(filters);
    const cleared = Object.fromEntries(currentFilters.map(f => [f.name, undefined]));
    const clearedEventPropertyFilters = Object.fromEntries(
      Object.keys(query)
        .filter(key => /^epf\d+$/.test(key))
        .map(key => [key, undefined]),
    );
    const clearedSessionPropertyFilters = Object.fromEntries(
      Object.keys(query)
        .filter(key => /^spf\d+$/.test(key))
        .map(key => [key, undefined]),
    );
    const eventPropertyParams = isEventsPath
      ? serializeUniversalEventPropertyFilters(eventPropertyFilters)
      : {};
    const sessionPropertyParams = serializeSessionPropertyFilters(sessionPropertyFilters);

    const url = updateParams({
      ...cleared,
      ...clearedEventPropertyFilters,
      ...clearedSessionPropertyFilters,
      ...params,
      ...eventPropertyParams,
      ...sessionPropertyParams,
      segment,
      cohort,
      match,
      excludeBounce: excludeBounce ? 'true' : undefined,
    });

    router.push(url);
  };

  return (
    <DialogButton
      icon={<ListFilter />}
      label={t(labels.filter)}
      variant="outline"
      dialogClassName={styles.dialog}
    >
      {({ close }) => {
        return (
          <>
            {(isOverview || allowBounceFilter) && (
              <Row position="absolute" top="22px" right="24px">
                <Field orientation="horizontal" style={{ marginTop: '3px' }}>
                  <Checkbox
                    id={checkboxId}
                    value={excludeBounce ? 'true' : ''}
                    onCheckedChange={setExcludeBounce}
                  />
                  <FieldLabel htmlFor={checkboxId}>{t(labels.excludeBounce)}</FieldLabel>
                </Field>
              </Row>
            )}
            <FilterEditForm websiteId={websiteId} onChange={handleChange} onClose={close} />
          </>
        );
      }}
    </DialogButton>
  );
}
