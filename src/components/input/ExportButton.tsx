import { useState } from 'react';
import { Icon, TooltipPopup, LoadingButton } from 'react-basics';
import Icons from '@/components/icons';
import { useMessages, useApi } from '@/components/hooks';
import { useFilterParams } from '@/components/hooks/useFilterParams';
import { useSearchParams } from 'next/navigation';

export function ExportButton({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const [isLoading, setIsLoading] = useState(false);
  const params = useFilterParams(websiteId);
  const searchParams = useSearchParams();
  const { get } = useApi();

  const handleClick = async () => {
    setIsLoading(true);

    const { zip } = await get(`/websites/${websiteId}/export`, { ...params, ...searchParams });

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

    setIsLoading(false);
  };

  return (
    <TooltipPopup label={formatMessage(labels.download)} position="top">
      <LoadingButton variant="quiet" isLoading={isLoading} onClick={handleClick}>
        <Icon>
          <Icons.Download />
        </Icon>
      </LoadingButton>
    </TooltipPopup>
  );
}
