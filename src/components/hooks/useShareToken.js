import { useEffect } from 'react';
import useStore, { setShareToken } from 'store/app';
import useApi from './useApi';

const selector = state => state.shareToken;

export function useShareToken(shareId) {
  const shareToken = useStore(selector);
  const { get } = useApi();

  async function loadToken(id) {
    const data = await get(`/share/${id}`);

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

export default useShareToken;
