import Papa from 'papaparse';
import { Button, Icon, TooltipPopup } from 'react-basics';
import Icons from '@/components/icons';
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
    <TooltipPopup label={formatMessage(labels.download)} position="top">
      <Button variant="quiet" onClick={handleClick} disabled={!data}>
        <Icon>
          <Icons.Download />
        </Icon>
      </Button>
    </TooltipPopup>
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
