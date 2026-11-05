'use client';
import {
  Button,
  Column,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Heading,
  Icon,
  Text,
  TextField,
} from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { OtpInput } from '@/components/common/OtpInput';
import {
  useMessages,
  useSecurityKeyLoginMutation,
  useTwoFactorVerifyMutation,
} from '@/components/hooks';
import { KeyRound } from '@/components/icons';
import { Logo } from '@/components/svg';
import { setClientAuthToken } from '@/lib/client';
import { consumeReturnUrl } from '@/lib/return-url';
import { setUser } from '@/store/app';

export function LoginTwoFactorPage() {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const router = useRouter();
  const { mutateAsync, isPending } = useTwoFactorVerifyMutation();
  const { mutateAsync: loginWithSecurityKey, isPending: isSecurityKeyPending } =
    useSecurityKeyLoginMutation();
  const partialTokenRef = useRef<string | null>(null);
  const [methods, setMethods] = useState<string[] | null>(null);
  const [useBackup, setUseBackup] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [lockUntil, setLockUntil] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect to the login page when no token
  useEffect(() => {
    const token = sessionStorage.getItem('umami.partial-token');
    if (!token) {
      router.replace('/login');
      return;
    }
    sessionStorage.removeItem('umami.partial-token');
    partialTokenRef.current = token;
    setMethods(getTwoFactorMethods());
  }, [router]);

  // Keep the locked state until the time is up
  useEffect(() => {
    if (!lockUntil) return;
    const interval = setInterval(() => {
      if (new Date() >= lockUntil) {
        setLockUntil(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockUntil]);

  const completeLogin = (data: { token: string; user: any }) => {
    setClientAuthToken(data.token);
    setUser(data.user);
    router.push(consumeReturnUrl() ?? '/');
  };

  const handleError = (err: any) => {
    if (err.lockedUntil) {
      setLockUntil(new Date(err.lockedUntil));
    }
    setError(getErrorMessage(err));
  };

  const submitVerification = async (token?: string, backupCode?: string) => {
    const partialToken = partialTokenRef.current;
    if (!partialToken) {
      router.replace('/login');
      return;
    }

    setError(null);

    try {
      completeLogin(await mutateAsync({ partialToken, token, backupCode }));
    } catch (err: any) {
      setOtpValue('');
      handleError(err);
    }
  };

  const handleSecurityKey = async () => {
    const partialToken = partialTokenRef.current;
    if (!partialToken) {
      router.replace('/login');
      return;
    }

    setError(null);

    try {
      completeLogin(await loginWithSecurityKey({ partialToken }));
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleSubmit = async (data: any) => {
    await submitVerification(
      useBackup ? undefined : otpValue,
      useBackup ? data.backupCode : undefined,
    );
  };

  const hasTotp = !!methods?.includes('totp');
  const hasSecurityKey = !!methods?.includes('security-key');

  const lockMessage = lockUntil
    ? t(messages.twoFactorLockedMessage, {
        time: lockUntil.toLocaleTimeString(),
      })
    : null;

  return (
    <Column justifyContent="center" alignItems="center" gap="6">
      <Icon size="lg">
        <Logo />
      </Icon>
      <Heading>umami</Heading>
      <Column gap="4" style={{ minWidth: 300 }}>
        <Heading size="xl">{t(labels.twoFactorLogin)}</Heading>

        {!!lockUntil && lockMessage && (
          <Text style={{ color: 'var(--zen-status-error)' }}>{lockMessage}</Text>
        )}

        {hasSecurityKey && (
          <Column gap="4">
            <Text>{t(messages.securityKeyLoginDescription)}</Text>
            {!hasTotp && error && <Text style={{ color: 'var(--zen-status-error)' }}>{error}</Text>}
            <Button
              variant={hasTotp ? 'outline' : 'primary'}
              onPress={handleSecurityKey}
              isDisabled={!!lockUntil || isSecurityKeyPending}
              autoFocus={!hasTotp}
            >
              <Icon>
                <KeyRound />
              </Icon>
              <Text>{t(labels.useSecurityKey)}</Text>
            </Button>
          </Column>
        )}

        {hasTotp && <Text>{t(messages.twoFactorLoginDescription)}</Text>}

        {hasTotp && (
          <>
            <Form
              onSubmit={handleSubmit}
              error={error ?? undefined}
              defaultValues={{ backupCode: '' }}
              style={{ minWidth: 300 }}
            >
              {!useBackup ? (
                <Column gap="2">
                  <Text weight="bold">{t(labels.twoFactorEnterCode)}</Text>
                  <OtpInput
                    value={otpValue}
                    onChange={val => {
                      setOtpValue(val);
                      if (error) setError(null);
                    }}
                    onComplete={val => submitVerification(val)}
                    disabled={!!lockUntil}
                    readOnly={isPending}
                    autoFocus
                  />
                </Column>
              ) : (
                <FormField label={t(labels.twoFactorBackupCode)} name="backupCode">
                  <TextField autoComplete="off" autoFocus />
                </FormField>
              )}

              <FormButtons>
                <FormSubmitButton
                  variant="primary"
                  style={{ flex: 1 }}
                  isDisabled={
                    !!lockUntil || isPending || (!useBackup && (otpValue.length !== 6 || !!error))
                  }
                >
                  {t(labels.twoFactorVerify)}
                </FormSubmitButton>
              </FormButtons>
            </Form>

            <Button variant="quiet" onPress={() => setUseBackup(v => !v)}>
              {useBackup ? t(labels.twoFactorLogin) : t(labels.twoFactorUseBackup)}
            </Button>
          </>
        )}
      </Column>
    </Column>
  );
}

function getTwoFactorMethods(): string[] {
  const value = sessionStorage.getItem('umami.two-factor-methods');
  sessionStorage.removeItem('umami.two-factor-methods');

  try {
    const methods = JSON.parse(value);

    if (Array.isArray(methods) && methods.length) {
      return methods;
    }
  } catch {
    // Fall back to the authenticator app
  }

  return ['totp'];
}
