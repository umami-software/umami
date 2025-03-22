import { Key, useContext, useState } from 'react';
import thenby from 'thenby';
import { percentFilter } from '@/lib/filters';
import { ListTable } from '@/components/metrics/ListTable';
import { FILTER_PAGES, FILTER_REFERRERS } from '@/lib/constants';
import { useMessages } from '@/components/hooks';
import { RealtimeData } from '@/lib/types';
import { WebsiteContext } from '../WebsiteProvider';
import { FilterButtons } from '@/components/common/FilterButtons';

export function RealtimeUrls({ data }: { data: RealtimeData }) {
  const website = useContext(WebsiteContext);
  const { formatMessage, labels } = useMessages();
  const { referrers, urls } = data || {};
  const [filter, setFilter] = useState<Key>(FILTER_REFERRERS);
  const limit = 15;

  const buttons = [
    {
      id: 1,
      label: formatMessage(labels.referrers),
      key: FILTER_REFERRERS,
    },
    {
      id: 2,
      label: formatMessage(labels.pages),
      key: FILTER_PAGES,
    },
  ];

  const renderLink = ({ x }) => {
    const domain = x.startsWith('/') ? website?.domain : '';
    return (
      <a href={`//${domain}${x}`} target="_blank" rel="noreferrer noopener">
        {x}
      </a>
    );
  };

  const domains = percentFilter(
    Object.keys(referrers)
      .map(key => {
        return {
          x: key,
          y: referrers[key],
        };
      })
      .sort(thenby.firstBy('y', -1))
      .slice(0, limit),
  );

  const pages = percentFilter(
    Object.keys(urls)
      .map(key => {
        return {
          x: key,
          y: urls[key],
        };
      })
      .sort(thenby.firstBy('y', -1))
      .slice(0, limit),
  );

  return (
    <>
      <FilterButtons items={buttons} onSelect={setFilter} />
      {filter === FILTER_REFERRERS && (
        <ListTable
          title={formatMessage(labels.referrers)}
          metric={formatMessage(labels.views)}
          renderLabel={renderLink}
          data={domains}
        />
      )}
      {filter === FILTER_PAGES && (
        <ListTable
          title={formatMessage(labels.pages)}
          metric={formatMessage(labels.views)}
          renderLabel={renderLink}
          data={pages}
        />
      )}
    </>
  );
}
