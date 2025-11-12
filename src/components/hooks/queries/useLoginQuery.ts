import { useEffect } from 'react';
import { useTheme } from '@umami/react-zen';
import { useApp, setUser } from '@/store/app';
import { useApi } from '../useApi';
import { setClientPreferences } from '@/lib/client';
import { DEFAULT_THEME } from '@/lib/constants';

const selector = (state: { user: any }) => state.user;

export function useLoginQuery() {
  const { post, useQuery } = useApi();
  const user = useApp(selector);
  const { setTheme } = useTheme();

  const query = useQuery({
    queryKey: ['login'],
    queryFn: async () => {
      const data = await post('/auth/verify');

      if (data.preferences) {
        setClientPreferences(data.preferences);
      }

      setUser(data);

      return data;
    },
    enabled: !user,
  });

  useEffect(() => {
    if (query.data?.preferences !== undefined) {
      const themeValue = query.data.preferences.theme || DEFAULT_THEME;
      setTheme(themeValue);
    }
  }, [query.data, setTheme]);

  return { user, setUser, ...query };
}
