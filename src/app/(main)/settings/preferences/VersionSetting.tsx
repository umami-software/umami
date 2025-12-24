'use client';

import { Text } from '@umami/react-zen';
import { useEffect, useState } from 'react';

export function VersionSetting() {
  const [version, setVersion] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch('/api/version');
        const data = await response.json();
        setVersion(data.version || 'unknown');
      } catch (error) {
        setVersion('unknown');
      } finally {
        setLoading(false);
      }
    };

    fetchVersion();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return <Text>{version}</Text>;
}
