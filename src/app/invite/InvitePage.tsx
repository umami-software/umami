'use client';

import {
  Column,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Heading,
  Icon,
  Loading,
  PasswordField,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  TextField,
} from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { type ComponentType, type Key, type ReactNode, useEffect, useRef, useState } from 'react';
import { useApi, useLoginQuery, useMessages } from '@/components/hooks';
import { Logo } from '@/components/svg';
import { getClientAuthToken, setClientAuthToken } from '@/lib/client';
import { setUser } from '@/store/app';

type Invite = {
  id: string;
  teamId: string;
  teamName: string;
  role: string;
  expiresAt: string;
};

type AuthResponse = {
  token: string;
  user: Parameters<typeof setUser>[0];
  team?: { id: string; name: string };
};

type AcceptResponse = {
  team: { id: string; name: string };
  user: Parameters<typeof setUser>[0];
};

type InviteState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'available'; invite: Invite };
const InviteTabPanel = TabPanel as ComponentType<{ id: string; children: ReactNode }>;

function isInvalidInviteError(error: unknown) {
  return (error as Error & { code?: string })?.code === 'INVALID_TEAM_INVITE';
}

export function InvitePage({ passwordAuthDisabled = false }: { passwordAuthDisabled?: boolean }) {
  const { post } = useApi();
  const { t, labels, messages, getErrorMessage } = useMessages();
  const router = useRouter();
  const { user, isLoading: isLoginLoading } = useLoginQuery();
  const tokenRef = useRef<string | null>(null);
  const inspectionRef = useRef<Promise<Invite | null> | null>(null);
  const [state, setState] = useState<InviteState>({ status: 'loading' });
  const [tab, setTab] = useState('login');
  const [error, setError] = useState<string | Error>();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!inspectionRef.current) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const token = params.get('invite');

      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}`,
      );

      if (token) {
        tokenRef.current = token;
        inspectionRef.current = post('/teams/invites/inspect', { token }).catch(() => null);
      } else {
        inspectionRef.current = Promise.resolve(null);
      }
    }

    let active = true;

    inspectionRef.current.then(invite => {
      if (active) {
        if (!invite) {
          tokenRef.current = null;
        }

        setState(invite ? { status: 'available', invite } : { status: 'unavailable' });
      }
    });

    return () => {
      active = false;
    };
  }, [post]);

  const completeAuthentication = (auth: AuthResponse, teamId: string) => {
    tokenRef.current = null;
    setClientAuthToken(auth.token);
    setUser(auth.user);
    router.push(`/teams/${teamId}`);
  };

  const handleRegister = async (data: Record<string, string>) => {
    const token = tokenRef.current;

    if (!token || state.status !== 'available') {
      setState({ status: 'unavailable' });
      return;
    }

    setError(undefined);
    setIsPending(true);

    try {
      const auth: AuthResponse = await post('/teams/invites/register', {
        token,
        username: data.username,
        password: data.password,
      });
      completeAuthentication(auth, auth.team?.id || state.invite.teamId);
    } catch (error) {
      if (isInvalidInviteError(error)) {
        tokenRef.current = null;
        setState({ status: 'unavailable' });
      } else {
        setError(error instanceof Error ? error : t(messages.error));
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleLogin = async (data: Record<string, string>) => {
    const token = tokenRef.current;

    if (!token || state.status !== 'available') {
      setState({ status: 'unavailable' });
      return;
    }

    setError(undefined);
    setIsPending(true);

    try {
      const auth: AuthResponse = await post('/auth/login', {
        username: data.username,
        password: data.password,
      });
      const result: AcceptResponse = await post(
        '/teams/invites/accept',
        { token },
        { authorization: `Bearer ${auth.token}` },
      );
      completeAuthentication({ ...auth, user: result.user }, result.team.id);
    } catch (error) {
      if (isInvalidInviteError(error)) {
        tokenRef.current = null;
        setState({ status: 'unavailable' });
      } else {
        setError(error instanceof Error ? error : t(messages.error));
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleAccept = async () => {
    const token = tokenRef.current;
    const authToken = getClientAuthToken();

    if (!token || !authToken || state.status !== 'available') {
      setState({ status: 'unavailable' });
      return;
    }

    setError(undefined);
    setIsPending(true);

    try {
      const result: AcceptResponse = await post(
        '/teams/invites/accept',
        { token },
        { authorization: `Bearer ${authToken}` },
      );
      tokenRef.current = null;
      setUser(result.user);
      router.push(`/teams/${result.team.id}`);
    } catch (error) {
      if (isInvalidInviteError(error)) {
        tokenRef.current = null;
        setState({ status: 'unavailable' });
      } else {
        setError(error instanceof Error ? error : t(messages.error));
      }
    } finally {
      setIsPending(false);
    }
  };

  if (state.status === 'loading' || isLoginLoading) {
    return <Loading placement="absolute" />;
  }

  if (state.status === 'unavailable') {
    return (
      <InviteShell>
        <Heading>{t(labels.invitationUnavailable)}</Heading>
        <Text color="muted">{t(messages.invitationUnavailable)}</Text>
      </InviteShell>
    );
  }

  return (
    <InviteShell>
      <Column alignItems="center" gap="2">
        <Text color="muted">{t(messages.invitedToJoin)}</Text>
        <Heading>{state.invite.teamName}</Heading>
      </Column>

      {user ? (
        <Form onSubmit={handleAccept} error={getErrorMessage(error)} style={{ minWidth: 300 }}>
          <FormButtons>
            <FormSubmitButton variant="primary" isDisabled={isPending} isLoading={isPending}>
              {t(labels.joinTeam)}
            </FormSubmitButton>
          </FormButtons>
        </Form>
      ) : passwordAuthDisabled ? (
        <Text color="muted" style={{ maxWidth: 420, textAlign: 'center' }}>
          {t(messages.invitationAuthenticationRequired)}
        </Text>
      ) : (
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key: Key) => {
            setTab(String(key));
            setError(undefined);
          }}
          style={{ minWidth: 300 }}
        >
          <TabList>
            <Tab id="login">{t(labels.signIn)}</Tab>
            <Tab id="register">{t(labels.createAccount)}</Tab>
          </TabList>
          <InviteTabPanel id="login">
            <CredentialsForm
              mode="login"
              isPending={isPending}
              error={getErrorMessage(error)}
              onSubmit={handleLogin}
            />
          </InviteTabPanel>
          <InviteTabPanel id="register">
            <CredentialsForm
              mode="register"
              isPending={isPending}
              error={getErrorMessage(error)}
              onSubmit={handleRegister}
            />
          </InviteTabPanel>
        </Tabs>
      )}
    </InviteShell>
  );
}

function InviteShell({ children }: { children: ReactNode }) {
  return (
    <Column
      alignItems="center"
      justifyContent="flex-start"
      gap="6"
      minHeight="100vh"
      backgroundColor="surface-raised"
      style={{ padding: '15vh 20px 40px' }}
    >
      <Icon size="lg">
        <Logo />
      </Icon>
      <Column alignItems="center" gap="6">
        {children}
      </Column>
    </Column>
  );
}

function CredentialsForm({
  mode,
  isPending,
  error,
  onSubmit,
}: {
  mode: 'login' | 'register';
  isPending: boolean;
  error?: string;
  onSubmit: (data: Record<string, string>) => Promise<void>;
}) {
  const { t, labels } = useMessages();

  return (
    <Form onSubmit={onSubmit} error={error}>
      <FormField
        label={t(labels.username)}
        name="username"
        rules={{ required: t(labels.required) }}
      >
        <TextField autoComplete="username" isDisabled={isPending} />
      </FormField>
      <FormField
        label={t(labels.password)}
        name="password"
        rules={{ required: t(labels.required) }}
      >
        <PasswordField
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          isDisabled={isPending}
        />
      </FormField>
      <FormButtons>
        <FormSubmitButton variant="primary" isDisabled={isPending} isLoading={isPending}>
          {t(mode === 'register' ? labels.createAccountAndJoinTeam : labels.signInAndJoinTeam)}
        </FormSubmitButton>
      </FormButtons>
    </Form>
  );
}
