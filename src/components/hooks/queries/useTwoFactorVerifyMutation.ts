import { httpPost } from '@/lib/fetch';
import { useApi } from '../useApi';

interface TwoFactorVerifyParams {
  partialToken: string;
  token?: string;
  backupCode?: string;
}

export function useTwoFactorVerifyMutation() {
  const { useMutation } = useApi();
  const basePath = process.env.basePath || '';

  return useMutation({
    mutationFn: async ({ partialToken, token, backupCode }: TwoFactorVerifyParams) => {
      const body = backupCode ? { backupCode } : { token };
      const res = await httpPost(`${basePath}/api/2fa/verify`, body, {
        Authorization: `Bearer ${partialToken}`,
      });

      if (!res.ok) {
        const { message, code, lockedUntil } = res?.data?.error || {};
        throw Object.assign(new Error(message), { code, status: res.status, lockedUntil });
      }

      return res.data as { token: string; user: any };
    },
  });
}
