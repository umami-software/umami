import Papa from 'papaparse';
import { Button, Icon, TooltipTrigger, Tooltip } from '@umami/react-zen';
import { Download } from '@/components/icons';
import { useMessages } from '@/components/hooks';

export function DownloadButton({
  filename = 'data',
  data,
}: {
  filename?: string;
  data?: any;
  onClick?: () => void;
}) {
  const { formatMessage, labels } = useMessages();

  const handleClick = async () => {
    downloadCsv(`${filename}.csv`, Papa.unparse(data));
  };

  return (
    <TooltipTrigger delay={0}>
      <Button variant="quiet" onClick={handleClick} isDisabled={!data || data.length === 0}>
        <Icon>
          <Download />
        </Icon>
      </Button>
      <Tooltip>{formatMessage(labels.download)}</Tooltip>
    </TooltipTrigger>
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
