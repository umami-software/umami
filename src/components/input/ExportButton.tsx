import { Icon, LoadingButton, Tooltip, TooltipContent, TooltipTrigger } from '@umami/react-zen';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useApi, useMessages } from '@/components/hooks';
import { useDateParameters } from '@/components/hooks/useDateParameters';
import { useFilterParameters } from '@/components/hooks/useFilterParameters';
import { Download } from '@/components/icons';

export function ExportButton({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const [isLoading, setIsLoading] = useState(false);
  const date = useDateParameters();
  const filters = useFilterParameters();
  const searchParams = useSearchParams();
  const { get } = useApi();

  const handleClick = async () => {
    setIsLoading(true);

    const { zip } = await get(`/websites/${websiteId}/export`, {
      ...date,
      ...filters,
      ...searchParams,
      format: 'json',
    });

    await loadZip(zip);

    setIsLoading(false);
  };

  return (
    <Tooltip>
      <TooltipTrigger
        delay={0}
        render={<LoadingButton variant="ghost" loading={isLoading} onClick={handleClick} />}
      >
        {!isLoading && (
          <Icon>
            <Download />
          </Icon>
        )}
      </TooltipTrigger>
      <TooltipContent>{t(labels.download)}</TooltipContent>
    </Tooltip>
  );
}

async function loadZip(zip: string) {
  const binary = atob(zip);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'download.zip';
  a.click();
  URL.revokeObjectURL(url);
}
