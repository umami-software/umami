import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { get } from 'lib/web';
import useStore, { setShareToken } from 'store/app';

const selector = state => state.shareToken;

export default function useShareToken(shareId) {
  const { basePath } = useRouter();
  const shareToken = useStore(selector);

  async function loadToken(id) {
    const { data } = await get(`${basePath}/api/share/${id}`);

    if (data) {
      setShareToken(data);
    }
  }

  useEffect(() => {
    if (shareId) {
      loadToken(shareId);
    }
  }, [shareId]);

  return shareToken;
}
