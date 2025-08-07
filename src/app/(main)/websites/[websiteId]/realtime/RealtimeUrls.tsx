import { useContext, useState } from 'react';
import { Row } from '@umami/react-zen';
import thenby from 'thenby';
import { percentFilter } from '@/lib/filters';
import { ListTable } from '@/components/metrics/ListTable';
import { useMessages } from '@/components/hooks';
import { RealtimeData } from '@/lib/types';
import { WebsiteContext } from '../WebsiteProvider';
import { FilterButtons } from '@/components/input/FilterButtons';

const FILTER_REFERRERS = 'filter-referrers';
const FILTER_PAGES = 'filter-pages';

export function RealtimeUrls({ data }: { data: RealtimeData }) {
  const website = useContext(WebsiteContext);
  const { formatMessage, labels } = useMessages();
  const { referrers, urls } = data || {};
  const [filter, setFilter] = useState(FILTER_REFERRERS);
  const limit = 15;

  const buttons = [
    {
      id: FILTER_REFERRERS,
      label: formatMessage(labels.referrers),
    },
    {
      id: FILTER_PAGES,
      label: formatMessage(labels.pages),
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
      <Row justifyContent="center">
        <FilterButtons items={buttons} value={filter} onChange={setFilter} />
      </Row>
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
