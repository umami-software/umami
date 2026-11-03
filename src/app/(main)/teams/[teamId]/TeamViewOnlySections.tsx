import { Button, Checkbox, Column, Grid, Row, Switch, Text } from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { SHARE_NAV_ITEMS } from '@/app/(main)/websites/[websiteId]/settings/constants';
import { useMessages, useTeam, useUpdateQuery } from '@/components/hooks';

export function TeamViewOnlySections({ teamId }: { teamId: string }) {
  const team: any = useTeam();
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(`/teams/${teamId}`);
  const saved: string[] | null = Array.isArray(team?.viewOnlySections)
    ? team.viewOnlySections
    : null;
  const [isLimited, setIsLimited] = useState(!!saved);
  const [selected, setSelected] = useState<string[]>(saved ?? ['overview']);

  useEffect(() => {
    setIsLimited(!!saved);
    setSelected(saved ?? ['overview']);
  }, [team?.viewOnlySections]);

  const toggle = (id: string, value: boolean) => {
    // Overview is the website's landing page, so it stays on.
    if (id === 'overview') {
      return;
    }

    setSelected(state => (value ? [...state, id] : state.filter(key => key !== id)));
  };

  const handleSave = async () => {
    await mutateAsync(
      { viewOnlySections: isLimited ? Array.from(new Set(['overview', ...selected])) : null },
      {
        onSuccess: async () => {
          toast(t(messages.saved));
          touch(`teams:${teamId}`);
        },
      },
    );
  };

  return (
    <Column gap="4">
      <Text weight="bold">{t(labels.viewOnlySections)}</Text>
      <Switch isSelected={isLimited} onChange={setIsLimited}>
        {t(labels.viewOnlySectionsLimit)}
      </Switch>
      <Text size="sm" color="muted">
        {t(messages.viewOnlySectionsDescription)}
      </Text>
      {isLimited && (
        <Grid columns={{ base: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap="3">
          {SHARE_NAV_ITEMS.map(section => (
            <Column key={section.section} gap="3">
              <Text weight="bold">{t((labels as any)[section.section])}</Text>
              <Column gap="1">
                {section.items.map(item => (
                  <Checkbox
                    key={item.id}
                    isSelected={item.id === 'overview' || selected.includes(item.id)}
                    onChange={value => toggle(item.id, value)}
                  >
                    {t((labels as any)[item.label])}
                  </Checkbox>
                ))}
              </Column>
            </Column>
          ))}
        </Grid>
      )}
      {error && (
        <Text size="sm" color="red">
          {getErrorMessage(error)}
        </Text>
      )}
      <Row justifyContent="flex-end">
        <Button variant="primary" isDisabled={isPending} onPress={handleSave}>
          {t(labels.save)}
        </Button>
      </Row>
    </Column>
  );
}
