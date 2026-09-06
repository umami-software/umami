'use client';
import { Button, Column, Heading, Icon, Loading, Row, Text } from '@umami/react-zen';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { LoginForm } from '@/app/login/LoginForm';
import { useApi, useLoginQuery, useMessages } from '@/components/hooks';
import { Logo } from '@/components/svg';
import { setReturnUrl } from '@/lib/return-url';

interface AuthorizationDetails {
  client: { id: string; name: string; uri?: string; logoUri?: string; source: string };
  scopes: { scope: string; description: string }[];
  redirectUri: string;
  resource: string;
}

const SCOPE_MESSAGE_KEYS: Record<string, string> = {
  'websites:read': 'oauthScopeWebsitesRead',
  'analytics:read': 'oauthScopeAnalyticsRead',
};

function getOAuthErrorMessage(error: unknown) {
  const record = error as { error_description?: string; message?: string; code?: string } | null;

  return record?.error_description || record?.message || null;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Column
      alignItems="center"
      justifyContent="flex-start"
      height="100vh"
      backgroundColor="surface-raised"
      style={{ paddingTop: '10vh' }}
    >
      <Column alignItems="center" gap="6" style={{ width: '100%', maxWidth: 420 }}>
        <Icon size="lg">
          <Logo />
        </Icon>
        <Heading>umami</Heading>
        {children}
      </Column>
    </Column>
  );
}

export function OAuthAuthorizePage() {
  const { t, labels, messages } = useMessages();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const { user, isLoading } = useLoginQuery();
  const { get, post, useQuery, useMutation } = useApi();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      setReturnUrl(`${pathname}?${searchParams.toString()}`);
    }
  }, [isLoading, user, pathname, searchParams]);

  const details = useQuery<AuthorizationDetails>({
    queryKey: ['oauth-authorize', params],
    queryFn: () => get('/oauth/authorize', params),
    enabled: !!user,
    retry: false,
  });

  const decide = useMutation({
    mutationFn: (decision: 'approve' | 'deny') =>
      post('/oauth/authorize', { ...params, decision }) as Promise<{ redirectUrl: string }>,
    onSuccess: ({ redirectUrl }) => {
      setRedirecting(true);
      window.location.assign(redirectUrl);
    },
  });

  if (isLoading) {
    return <Loading placement="absolute" />;
  }

  if (!user) {
    return (
      <Frame>
        <Text>{t(messages.oauthLoginPrompt)}</Text>
        <LoginForm />
      </Frame>
    );
  }

  if (details.isLoading) {
    return <Loading placement="absolute" />;
  }

  if (details.error || !details.data) {
    return (
      <Frame>
        <Text weight="bold">{t(messages.oauthInvalidRequest)}</Text>
        {getOAuthErrorMessage(details.error) && (
          <Text color="muted">{getOAuthErrorMessage(details.error)}</Text>
        )}
      </Frame>
    );
  }

  const { client, scopes, redirectUri } = details.data;
  const redirectHost = (() => {
    try {
      return new URL(redirectUri).host || redirectUri;
    } catch {
      return redirectUri;
    }
  })();
  const decisionError = getOAuthErrorMessage(decide.error);

  return (
    <Frame>
      <Column gap="4" style={{ width: '100%' }}>
        <Text size="lg" weight="bold" align="center">
          {t(messages.oauthConsent, { name: client.name })}
        </Text>
        {client.uri && (
          <Text color="muted" align="center">
            {client.uri}
          </Text>
        )}
        <Text>{t(messages.oauthPermissions)}</Text>
        <ul style={{ margin: 0, paddingInlineStart: 20 }}>
          {scopes.map(({ scope, description }) => (
            <li key={scope}>
              <Text>
                {SCOPE_MESSAGE_KEYS[scope] ? t(messages[SCOPE_MESSAGE_KEYS[scope]]) : description}
              </Text>
            </li>
          ))}
        </ul>
        <Text color="muted" size="sm">
          {t(messages.oauthRedirectNotice, { url: redirectHost })}
        </Text>
        <Text color="muted" size="sm">
          {t(messages.oauthSignedInAs, { username: user.username })}
        </Text>
        {decisionError && <Text style={{ color: 'var(--zen-status-error)' }}>{decisionError}</Text>}
        <Row gap="3" justifyContent="flex-end">
          <Button
            data-test="button-oauth-deny"
            onPress={() => decide.mutate('deny')}
            isDisabled={decide.isPending || redirecting}
          >
            {t(labels.deny)}
          </Button>
          <Button
            data-test="button-oauth-approve"
            variant="primary"
            onPress={() => decide.mutate('approve')}
            isDisabled={decide.isPending || redirecting}
          >
            {t(labels.authorize)}
          </Button>
        </Row>
        {redirecting && <Text color="muted">{t(messages.oauthRedirecting)}</Text>}
      </Column>
    </Frame>
  );
}
