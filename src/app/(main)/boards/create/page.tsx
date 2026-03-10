'use client';
import { useEffect } from 'react';
import { useNavigation } from '@/components/hooks';

export default function CreateBoardPage() {
  const { router, renderUrl } = useNavigation();

  useEffect(() => {
    router.replace(renderUrl('/boards', false));
  }, [router, renderUrl]);

  return null;
}
