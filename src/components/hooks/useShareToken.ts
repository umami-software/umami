import useStore, { setShareToken } from 'store/app';
import useApi from './useApi';

const selector = (state: { shareToken: string }) => state.shareToken;

export function useShareToken(shareId: string) {
  const shareToken = useStore(selector);
  const { get, useQuery } = useApi();
  const { isLoading, error } = useQuery(['share', shareId], async () => {
    const data = await get(`/share/${shareId}`);

    setShareToken(data);

    return data;
  });

  return { shareToken, isLoading, error };
}

export default useShareToken;
