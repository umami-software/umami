import { startAuthentication } from '@simplewebauthn/browser';
import { httpPost } from '@/lib/fetch';
import { getSecurityKeyError } from '@/lib/security-key';
import { useApi } from '../useApi';

async function post(url: string, data: object, partialToken: string) {
  const basePath = process.env.basePath || '';
  const res = await httpPost(`${basePath}/api${url}`, data, {
    Authorization: `Bearer ${partialToken}`,
  });

  if (!res.ok) {
    const { message, code, lockedUntil } = res?.data?.error || {};
    throw Object.assign(new Error(message), { code, status: res.status, lockedUntil });
  }

  return res.data;
}

export function useSecurityKeyLoginMutation() {
  const { useMutation } = useApi();

  return useMutation({
    mutationFn: async ({ partialToken }: { partialToken: string }) => {
      const optionsJSON = await post('/2fa/security-keys/login/options', {}, partialToken);

      const response = await startAuthentication({ optionsJSON }).catch(err => {
        throw getSecurityKeyError(err);
      });

      return (await post('/2fa/security-keys/login/verify', { response }, partialToken)) as {
        token: string;
        user: any;
      };
    },
  });
}
