import { useMemo, useState } from 'react';
import { ButtonGroup, Button, Flexbox } from 'react-basics';
import firstBy from 'thenby';
import { percentFilter } from 'lib/filters';
import ListTable from 'components/metrics/ListTable';
import { FILTER_PAGES, FILTER_REFERRERS } from 'lib/constants';
import useMessages from 'components/hooks/useMessages';

export function RealtimeUrls({ websiteDomain, data = {} }) {
  const { formatMessage, labels } = useMessages();
  const { pageviews } = data;
  const [filter, setFilter] = useState(FILTER_REFERRERS);
  const limit = 15;

  const buttons = [
    {
      label: formatMessage(labels.referrers),
      key: FILTER_REFERRERS,
    },
    {
      label: formatMessage(labels.pages),
      key: FILTER_PAGES,
    },
  ];

  const renderLink = ({ x }) => {
    const domain = x.startsWith('/') ? websiteDomain : '';
    return (
      <a href={`//${domain}${x}`} target="_blank" rel="noreferrer noopener">
        {x}
      </a>
    );
  };

  const [referrers = [], pages = []] = useMemo(() => {
    if (pageviews) {
      const referrers = percentFilter(
        pageviews
          .reduce((arr, { referrerDomain }) => {
            if (referrerDomain) {
              const row = arr.find(({ x }) => x === referrerDomain);

              if (!row) {
                arr.push({ x: referrerDomain, y: 1 });
              } else {
                row.y += 1;
              }
            }
            return arr;
          }, [])
          .sort(firstBy('y', -1))
          .slice(0, limit),
      );

      const pages = percentFilter(
        pageviews
          .reduce((arr, { urlPath }) => {
            const row = arr.find(({ x }) => x === urlPath);

            if (!row) {
              arr.push({ x: urlPath, y: 1 });
            } else {
              row.y += 1;
            }
            return arr;
          }, [])
          .sort(firstBy('y', -1))
          .slice(0, limit),
      );

      return [referrers, pages];
    }

    return [];
  }, [pageviews]);

  return (
    <>
      <Flexbox justifyContent="center">
        <ButtonGroup items={buttons} selectedKey={filter} onSelect={setFilter}>
          {({ key, label }) => <Button key={key}>{label}</Button>}
        </ButtonGroup>
      </Flexbox>
      {filter === FILTER_REFERRERS && (
        <ListTable
          title={formatMessage(labels.referrers)}
          metric={formatMessage(labels.views)}
          renderLabel={renderLink}
          data={referrers}
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

export default RealtimeUrls;
