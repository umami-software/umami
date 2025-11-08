import { useState } from 'react';
import { Icon, Tooltip, TooltipTrigger, LoadingButton, useToast } from '@umami/react-zen';
import { Download } from '@/components/icons';
import { useMessages, useApi } from '@/components/hooks';
import { useSearchParams } from 'next/navigation';
import { useDateParameters } from '@/components/hooks/useDateParameters';
import { useFilterParameters } from '@/components/hooks/useFilterParameters';

export function ExportButton({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels, messages } = useMessages();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const date = useDateParameters();
  const filters = useFilterParameters();
  const searchParams = useSearchParams();
  const { get } = useApi();

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const response = await get(`/websites/${websiteId}/export`, {
        ...date,
        ...filters,
        ...searchParams,
        format: 'json',
      });

      // Check if there's an error indicating no data
      if (response.error === 'no_data') {
        toast(formatMessage(messages.noDataAvailable));
        setIsLoading(false);
        return;
      }

      // Proceed with export if there's data
      await loadZip(response.zip);
    } catch (error) {
      // Handle any other errors
      toast(formatMessage(messages.error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipTrigger delay={0}>
      <LoadingButton
        variant="quiet"
        showText={!isLoading}
        isLoading={isLoading}
        onClick={handleClick}
      >
        <Icon>
          <Download />
        </Icon>
      </LoadingButton>
      <Tooltip>{formatMessage(labels.download)}</Tooltip>
    </TooltipTrigger>
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
