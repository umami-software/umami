import { User } from '@/generated/prisma/client';
import { useApi } from './useApi';
import { useApp } from '@/store/app';

const userSelector = (state: { user: User }) => state.user;

export function usePreferences() {
  const { post } = useApi();
  const user = useApp(userSelector);

  const updatePreferences = async (preferences: {
    dateRange?: string | null;
    timezone?: string | null;
    language?: string | null;
    theme?: string | null;
  }) => {
    if (!user?.id) {
      return;
    }

    try {
      await post(`/users/${user.id}/preferences`, preferences);
    } catch {
      // Silent fail: sync next login
    }
  };

  return { updatePreferences };
}
