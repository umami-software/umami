import { Button } from '@umami/react-zen';
import Papa from 'papaparse';
import { IconLabel } from '@/components/common/IconLabel';
import { useMessages } from '@/components/hooks';
import { Download } from '@/components/icons';

export function DownloadButton({
  filename = 'data',
  data,
}: {
  filename?: string;
  data?: any;
  onClick?: () => void;
}) {
  const { t, labels } = useMessages();

  const handleClick = async () => {
    downloadCsv(`${filename}.csv`, Papa.unparse(data));
  };

  return (
    <Button variant="outline" onClick={handleClick} disabled={!data || data.length === 0}>
      <IconLabel icon={<Download />} label={t(labels.download)} />
    </Button>
  );
}

function downloadCsv(filename: string, data: any) {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
