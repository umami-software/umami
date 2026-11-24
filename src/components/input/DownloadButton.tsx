import { Button, Icon, Text, Tooltip, TooltipContent, TooltipTrigger } from '@umami/react-zen';
import Papa from 'papaparse';
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
    <Tooltip>
      <TooltipTrigger
        delay={0}
        render={
          <Button variant="ghost" onClick={handleClick} disabled={!data || data.length === 0} />
        }
      >
        <Icon>
          <Download />
        </Icon>
      </TooltipTrigger>
      <TooltipContent>
        <Text size="sm">{t(labels.download)}</Text>
      </TooltipContent>
    </Tooltip>
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
