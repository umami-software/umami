/** Maps an error thrown by the browser during a security key ceremony to an API error code. */
export function getSecurityKeyError(error: any) {
  let code = 'security-key-error-verification-failed';

  if (error?.code === 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED') {
    code = 'security-key-error-already-registered';
  } else if (
    error?.code === 'ERROR_CEREMONY_ABORTED' ||
    error?.name === 'NotAllowedError' ||
    error?.name === 'AbortError'
  ) {
    code = 'security-key-error-cancelled';
  }

  return Object.assign(new Error(error?.message), { code });
}
