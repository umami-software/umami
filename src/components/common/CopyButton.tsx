import { Button, Icon } from '@umami/react-zen';
import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from '@/components/icons';

export function CopyButton({
  value,
  label = 'Copy',
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!navigator?.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <Button variant="quiet" onPress={handleCopy} title={label} aria-label={label}>
      <Icon size="sm">{copied ? <Check /> : <Copy />}</Icon>
    </Button>
  );
}
