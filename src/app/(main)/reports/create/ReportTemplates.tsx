import { Icon, Text, Row, Column, Grid } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { Icons } from '@/components/icons';
import { PageHeader } from '@/components/layout/PageHeader';
import { LinkButton } from '@/components/common/LinkButton';

export function ReportTemplates({ showHeader = true }: { showHeader?: boolean }) {
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl } = useNavigation();

  const reports = [
    {
      title: formatMessage(labels.insights),
      description: formatMessage(labels.insightsDescription),
      url: renderTeamUrl('/reports/insights'),
      icon: <Icons.Lightbulb />,
    },
    {
      title: formatMessage(labels.funnel),
      description: formatMessage(labels.funnelDescription),
      url: renderTeamUrl('/reports/funnel'),
      icon: <Icons.Funnel />,
    },
    {
      title: formatMessage(labels.retention),
      description: formatMessage(labels.retentionDescription),
      url: renderTeamUrl('/reports/retention'),
      icon: <Icons.Magnet />,
    },
    {
      title: formatMessage(labels.utm),
      description: formatMessage(labels.utmDescription),
      url: renderTeamUrl('/reports/utm'),
      icon: <Icons.Tag />,
    },
    {
      title: formatMessage(labels.goals),
      description: formatMessage(labels.goalsDescription),
      url: renderTeamUrl('/reports/goals'),
      icon: <Icons.Target />,
    },
    {
      title: formatMessage(labels.journey),
      description: formatMessage(labels.journeyDescription),
      url: renderTeamUrl('/reports/journey'),
      icon: <Icons.Path />,
    },
    {
      title: formatMessage(labels.revenue),
      description: formatMessage(labels.revenueDescription),
      url: renderTeamUrl('/reports/revenue'),
      icon: <Icons.Money />,
    },
  ];

  return (
    <>
      {showHeader && <PageHeader title={formatMessage(labels.reports)} />}
      <Grid columns="repeat(3, minmax(200px, 1fr))" gap="3">
        {reports.map(({ title, description, url, icon }) => {
          return (
            <ReportItem key={title} icon={icon} title={title} description={description} url={url} />
          );
        })}
      </Grid>
    </>
  );
}

function ReportItem({ title, description, url, icon }) {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap="6" padding="6" borderSize="1" borderRadius="3" justifyContent="space-between">
      <Row gap="3" alignItems="center">
        <Icon size="md">{icon}</Icon>
        <Text size="5" weight="bold">
          {title}
        </Text>
      </Row>
      <Text>{description}</Text>
      <Row justifyContent="flex-end">
        <LinkButton href={url} variant="primary">
          <Icon fillColor="currentColor">
            <Icons.Plus />
          </Icon>
          <Text>{formatMessage(labels.create)}</Text>
        </LinkButton>
      </Row>
    </Column>
  );
}
