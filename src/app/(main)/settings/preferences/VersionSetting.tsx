'use client';

import { Text } from '@umami/react-zen';
import { CURRENT_VERSION } from '@/lib/constants';

export function VersionSetting() {
  return <Text>{CURRENT_VERSION}</Text>;
}
