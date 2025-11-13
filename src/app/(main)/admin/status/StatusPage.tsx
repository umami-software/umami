'use client';
import { Column, Grid, Text, StatusLight, Heading, Row, ProgressBar } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useApi } from '@/components/hooks/useApi';
import { Database, HardDrive, Download, AlertCircle } from '@/components/icons';

interface DatabaseStatus {
  connected: boolean;
  type: string;
  error?: string;
}

interface StorageStatus {
  available: boolean;
  total: number;
  free: number;
  used: number;
  percentage: number;
  path: string;
  error?: string;
}

interface UpdateStatus {
  current: string;
  latest?: string;
  updateAvailable: boolean;
  error?: string;
}

interface SystemStatus {
  database: DatabaseStatus;
  storage: StorageStatus;
  updates: UpdateStatus;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function StatusCard({
  title,
  icon,
  status,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  status: 'success' | 'error' | 'warning';
  children: React.ReactNode;
}) {
  return (
    <Panel>
      <Column gap="4">
        <Row alignItems="center" gap="3">
          {icon}
          <Heading size="3">{title}</Heading>
        </Row>
        <StatusLight variant={status === 'success' ? 'success' : status === 'error' ? 'error' : 'warning'}>
          <Text size="2" weight="medium">
            {status === 'success' ? 'Operational' : status === 'error' ? 'Error' : 'Warning'}
          </Text>
        </StatusLight>
        {children}
      </Column>
    </Panel>
  );
}

function DatabaseStatusCard({ database }: { database: DatabaseStatus }) {
  const { formatMessage, labels } = useMessages();
  
  return (
    <StatusCard
      title={formatMessage(labels.database) || 'Database'}
      icon={<Database size={24} />}
      status={database.connected ? 'success' : 'error'}
    >
      <Column gap="2">
        <Row justifyContent="space-between">
          <Text color="muted">Type:</Text>
          <Text weight="medium">{database.type}</Text>
        </Row>
        <Row justifyContent="space-between">
          <Text color="muted">Status:</Text>
          <Text weight="medium" color={database.connected ? 'success' : 'error'}>
            {database.connected ? 'Connected' : 'Disconnected'}
          </Text>
        </Row>
        {database.error && (
          <Text size="2" color="error">
            {database.error}
          </Text>
        )}
      </Column>
    </StatusCard>
  );
}

function StorageStatusCard({ storage }: { storage: StorageStatus }) {
  const { formatMessage, labels } = useMessages();
  
  if (!storage.available) {
    return (
      <StatusCard
        title={formatMessage(labels.storage) || 'Storage'}
        icon={<HardDrive size={24} />}
        status="warning"
      >
        <Column gap="2">
          <Text size="2" color="error">
            {storage.error || 'Unable to determine storage usage'}
          </Text>
          <Text size="2" color="muted">
            Path: {storage.path}
          </Text>
        </Column>
      </StatusCard>
    );
  }

  const status = storage.percentage >= 90 ? 'error' : storage.percentage >= 75 ? 'warning' : 'success';

  return (
    <StatusCard
      title={formatMessage(labels.storage) || 'Storage'}
      icon={<HardDrive size={24} />}
      status={status}
    >
      <Column gap="3">
        <Column gap="2">
          <Row justifyContent="space-between">
            <Text color="muted">Total:</Text>
            <Text weight="medium">{formatBytes(storage.total)}</Text>
          </Row>
          <Row justifyContent="space-between">
            <Text color="muted">Used:</Text>
            <Text weight="medium">{formatBytes(storage.used)}</Text>
          </Row>
          <Row justifyContent="space-between">
            <Text color="muted">Free:</Text>
            <Text weight="medium">{formatBytes(storage.free)}</Text>
          </Row>
          <Row justifyContent="space-between">
            <Text color="muted">Usage:</Text>
            <Text weight="medium">{storage.percentage}%</Text>
          </Row>
        </Column>
        <ProgressBar value={storage.percentage} max={100} />
        <Text size="2" color="muted">
          Path: {storage.path}
        </Text>
      </Column>
    </StatusCard>
  );
}

function UpdateStatusCard({ updates }: { updates: UpdateStatus }) {
  const { formatMessage, labels } = useMessages();
  
  // Only show error status if there's an actual error message
  // If latest is just not available, show success (current version is fine)
  const status = updates.updateAvailable ? 'warning' : updates.error ? 'error' : 'success';

  return (
    <StatusCard
      title={formatMessage(labels.updates) || 'Updates'}
      icon={<Download size={24} />}
      status={status}
    >
      <Column gap="2">
        <Row justifyContent="space-between">
          <Text color="muted">Current Version:</Text>
          <Text weight="medium">{updates.current}</Text>
        </Row>
        {updates.latest ? (
          <>
            <Row justifyContent="space-between">
              <Text color="muted">Latest Version:</Text>
              <Text weight="medium">{updates.latest}</Text>
            </Row>
            {updates.updateAvailable && (
              <Row alignItems="center" gap="2" marginTop="2">
                <AlertCircle size={16} />
                <Text size="2" color="warning">
                  Update available
                </Text>
              </Row>
            )}
            {!updates.updateAvailable && (
              <Text size="2" color="muted" marginTop="2">
                You are running the latest version
              </Text>
            )}
          </>
        ) : (
          <Text size="2" color="muted" marginTop="2">
            {updates.error || 'Unable to check for updates'}
          </Text>
        )}
      </Column>
    </StatusCard>
  );
}

export function StatusPage() {
  const { formatMessage, labels } = useMessages();
  const { get, useQuery: useApiQuery } = useApi();

  const { data, isLoading, error } = useApiQuery<SystemStatus>({
    queryKey: ['admin', 'status'],
    queryFn: () => get('/admin/status'),
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <Column gap="6" margin="2">
        <PageHeader title={formatMessage(labels.systemStatus) || 'System Status'} />
        <Text>Loading...</Text>
      </Column>
    );
  }

  if (error || !data) {
    return (
      <Column gap="6" margin="2">
        <PageHeader title={formatMessage(labels.systemStatus) || 'System Status'} />
        <Text color="error">Failed to load system status</Text>
      </Column>
    );
  }

  return (
    <Column gap="6" margin="2">
      <PageHeader title={formatMessage(labels.systemStatus) || 'System Status'} />
      <Grid columns={{ xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap="3">
        <DatabaseStatusCard database={data.database} />
        <StorageStatusCard storage={data.storage} />
        <UpdateStatusCard updates={data.updates} />
      </Grid>
    </Column>
  );
}

