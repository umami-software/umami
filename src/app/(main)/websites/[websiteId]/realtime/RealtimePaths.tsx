import thenby from 'thenby';
import { percentFilter } from '@/lib/filters';
import { ListTable } from '@/components/metrics/ListTable';
import { useMessages, useWebsite } from '@/components/hooks';

export function RealtimePaths({ data }: { data: any }) {
  const website = useWebsite();
  const { formatMessage, labels } = useMessages();
  const { urls } = data || {};
  const limit = 15;

  const renderLink = ({ label: x }) => {
    const domain = x.startsWith('/') ? website?.domain : '';
    return (
      <a href={`//${domain}${x}`} target="_blank" rel="noreferrer noopener">
        {x}
      </a>
    );
  };

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
    <ListTable
      title={formatMessage(labels.pages)}
      metric={formatMessage(labels.views)}
      renderLabel={renderLink}
      data={pages.map(({ x, y, z }: { x: string; y: number; z: number }) => ({
        label: x,
        count: y,
        percent: z,
      }))}
    />
  );
}
