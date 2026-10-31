import { startRegistration } from '@simplewebauthn/browser';
import { getSecurityKeyError } from '@/lib/security-key';
import type { ApiError } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useSecurityKeyRegisterMutation() {
  const { post, useMutation } = useApi();
  const { touch } = useModified();

  return useMutation<any, ApiError, { name: string }>({
    mutationFn: async ({ name }) => {
      const optionsJSON = await post('/2fa/security-keys/register/options');

      const response = await startRegistration({ optionsJSON }).catch(err => {
        throw getSecurityKeyError(err);
      });

      return post('/2fa/security-keys/register/verify', { name, response });
    },
    onSuccess: () => touch('security-keys'),
  });
}
