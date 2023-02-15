import { useMemo, useState, useCallback } from 'react';
import { ButtonGroup, Button } from 'react-basics';
import { useIntl } from 'react-intl';
import firstBy from 'thenby';
import { percentFilter } from 'lib/filters';
import DataTable from 'components/metrics/DataTable';
import { FILTER_PAGES, FILTER_REFERRERS } from 'lib/constants';
import { labels } from 'components/messages';

export default function RealtimeViews({ websiteId, data = {}, websites }) {
  const { formatMessage } = useIntl();
  const { pageviews } = data;
  const [filter, setFilter] = useState(FILTER_REFERRERS);
  const domains = useMemo(() => websites.map(({ domain }) => domain), [websites]);
  const getDomain = useCallback(
    id =>
      websites.length === 1
        ? websites[0]?.domain
        : websites.find(({ websiteId }) => websiteId === id)?.domain,
    [websites],
  );

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
    const domain = x.startsWith('/') ? getDomain(websiteId) : '';
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

              if (hostname && !domains.includes(hostname)) {
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
          .reduce((arr, { url, websiteId }) => {
            if (url?.startsWith('/')) {
              if (!websiteId && websites.length > 1) {
                url = `${getDomain(websiteId)}${url}`;
              }
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
      <ButtonGroup items={buttons} selectedKey={filter} onSelect={setFilter}>
        {({ key, label }) => <Button key={key}>{label}</Button>}
      </ButtonGroup>
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
