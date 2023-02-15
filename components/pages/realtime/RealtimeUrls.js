import { useMemo, useState } from 'react';
import { ButtonGroup, Button, Flexbox } from 'react-basics';
import { useIntl } from 'react-intl';
import firstBy from 'thenby';
import { percentFilter } from 'lib/filters';
import DataTable from 'components/metrics/DataTable';
import { FILTER_PAGES, FILTER_REFERRERS } from 'lib/constants';
import { labels } from 'components/messages';

export default function RealtimeUrls({ websiteDomain, data = {} }) {
  const { formatMessage } = useIntl();
  const { pageviews } = data;
  const [filter, setFilter] = useState(FILTER_REFERRERS);

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
          .reduce((arr, { referrer }) => {
            if (referrer?.startsWith('http')) {
              const hostname = new URL(referrer).hostname.replace(/^www\./, '');

              if (hostname) {
                const row = arr.find(({ x }) => x === hostname);

                if (!row) {
                  arr.push({ x: hostname, y: 1 });
                } else {
                  row.y += 1;
                }
              }
            }
            return arr;
          }, [])
          .sort(firstBy('y', -1)),
      );

      const pages = percentFilter(
        pageviews
          .reduce((arr, { url }) => {
            if (url?.startsWith('/')) {
              const row = arr.find(({ x }) => x === url);

              if (!row) {
                arr.push({ x: url, y: 1 });
              } else {
                row.y += 1;
              }
            }
            return arr;
          }, [])
          .sort(firstBy('y', -1)),
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
        <DataTable
          title={formatMessage(labels.referrers)}
          metric={formatMessage(labels.views)}
          renderLabel={renderLink}
          data={referrers}
        />
      )}
      {filter === FILTER_PAGES && (
        <DataTable
          title={formatMessage(labels.pages)}
          metric={formatMessage(labels.views)}
          renderLabel={renderLink}
          data={pages}
        />
      )}
    </>
  );
}
