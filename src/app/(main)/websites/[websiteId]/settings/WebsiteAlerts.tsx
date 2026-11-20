import {
  Badge,
  Button,
  Column,
  Dialog,
  Form,
  FormButtons,
  FormField,
  FormSubmitButton,
  Icon,
  ListItem,
  Modal,
  Row,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Text,
  TextField,
} from '@umami/react-zen';
import { Bell, Edit, Play, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { ControlledDialog } from '@/components/common/ControlledDialog';
import { useApi, useModified, useWebsiteAlertsQuery } from '@/components/hooks';

export function WebsiteAlerts({ websiteId }: { websiteId: string }) {
  const { post, del, put } = useApi();
  const { touch } = useModified();
  const { data: alerts = [], isLoading } = useWebsiteAlertsQuery(websiteId);

  const [activeDialog, setActiveDialog] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTest = async (alert: any) => {
    setIsTesting(alert.id);
    setTestResult(null);
    try {
      const res = await post(`/websites/${websiteId}/alerts/${alert.id}/test`);
      if (res.success) {
        setTestResult(`✓ Test alert dispatched to ${alert.channelType}`);
      } else {
        setTestResult(`✗ Failed: ${res.error || 'Check webhook URL'}`);
      }
    } catch (err: any) {
      setTestResult(`✗ Error: ${err.message || 'Request failed'}`);
    } finally {
      setIsTesting(null);
      setTimeout(() => setTestResult(null), 4000);
    }
  };

  const handleToggle = async (alert: any) => {
    await put(`/websites/${websiteId}/alerts/${alert.id}`, {
      isEnabled: !alert.isEnabled,
    });
    touch('alerts');
  };

  const handleDelete = async () => {
    if (!selectedAlert) return;
    await del(`/websites/${websiteId}/alerts/${selectedAlert.id}`);
    touch('alerts');
    setActiveDialog(null);
    setSelectedAlert(null);
  };

  const handleSave = async (formData: any) => {
    if (selectedAlert) {
      await put(`/websites/${websiteId}/alerts/${selectedAlert.id}`, {
        name: formData.name,
        type: formData.type,
        metric: formData.metric,
        threshold: Number(formData.threshold),
        windowMinutes: Number(formData.windowMinutes),
        channelType: formData.channelType,
        channelConfig: {
          url: formData.channelUrl,
          secret: formData.channelSecret || undefined,
        },
      });
    } else {
      await post(`/websites/${websiteId}/alerts`, {
        name: formData.name,
        type: formData.type,
        metric: formData.metric,
        threshold: Number(formData.threshold),
        windowMinutes: Number(formData.windowMinutes),
        channelType: formData.channelType,
        channelConfig: {
          url: formData.channelUrl,
          secret: formData.channelSecret || undefined,
        },
        isEnabled: true,
      });
    }

    touch('alerts');
    setActiveDialog(null);
    setSelectedAlert(null);
  };

  return (
    <Column gap="4">
      <Row justifyContent="space-between" alignItems="center">
        <Column gap="1">
          <Row gap="2" alignItems="center">
            <Icon>
              <Bell />
            </Icon>
            <Text weight="bold">Alerts & Notifications</Text>
          </Row>
          <Text color="muted" size="sm">
            Receive automated alerts via Webhook, Slack, or Discord when traffic or error thresholds
            are breached.
          </Text>
        </Column>
        <Button
          variant="primary"
          onPress={() => {
            setSelectedAlert(null);
            setActiveDialog('create');
          }}
        >
          <Icon>
            <Plus />
          </Icon>
          <Text>Add Alert</Text>
        </Button>
      </Row>

      {testResult && (
        <Row
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: testResult.startsWith('✓')
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            color: testResult.startsWith('✓') ? '#16a34a' : '#dc2626',
            fontSize: '13px',
          }}
        >
          {testResult}
        </Row>
      )}

      {alerts.length === 0 && !isLoading && (
        <Row
          justifyContent="center"
          style={{
            padding: '32px',
            backgroundColor: 'var(--base50)',
            borderRadius: '8px',
          }}
        >
          <Text color="muted">
            No alerts configured yet. Click "Add Alert" to set up your first notification.
          </Text>
        </Row>
      )}

      {alerts.length > 0 && (
        <Table>
          <TableHeader>
            <TableCell>Name</TableCell>
            <TableCell>Condition</TableCell>
            <TableCell>Channel</TableCell>
            <TableCell>Active</TableCell>
            <TableCell style={{ textAlign: 'right' }}>Actions</TableCell>
          </TableHeader>
          <TableBody>
            {alerts.map((alert: any) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <Text weight="bold">{alert.name}</Text>
                </TableCell>
                <TableCell>
                  <Badge variant="neutral">
                    {alert.metric} {alert.type === 'traffic_drop' ? '≤' : '≥'} {alert.threshold} /{' '}
                    {alert.windowMinutes}m
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      alert.channelType === 'slack'
                        ? 'primary'
                        : alert.channelType === 'discord'
                          ? 'gray'
                          : 'default'
                    }
                  >
                    {alert.channelType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch isSelected={alert.isEnabled} onChange={() => handleToggle(alert)} />
                </TableCell>
                <TableCell>
                  <Row gap="1" justifyContent="flex-end">
                    <Button
                      variant="quiet"
                      title="Test Alert"
                      isDisabled={isTesting === alert.id}
                      onPress={() => handleTest(alert)}
                    >
                      <Icon>
                        <Play />
                      </Icon>
                    </Button>
                    <Button
                      variant="quiet"
                      title="Edit Alert"
                      onPress={() => {
                        setSelectedAlert(alert);
                        setActiveDialog('edit');
                      }}
                    >
                      <Icon>
                        <Edit />
                      </Icon>
                    </Button>
                    <Button
                      variant="quiet"
                      title="Delete Alert"
                      onPress={() => {
                        setSelectedAlert(alert);
                        setActiveDialog('delete');
                      }}
                    >
                      <Icon>
                        <Trash />
                      </Icon>
                    </Button>
                  </Row>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal for Create/Edit */}
      <ControlledDialog>
        <Modal
          isOpen={activeDialog === 'create' || activeDialog === 'edit'}
          onOpenChange={open => !open && setActiveDialog(null)}
        >
          <Dialog
            title={selectedAlert ? 'Edit Alert Rule' : 'Create Alert Rule'}
            style={{ width: '500px', padding: '24px' }}
          >
            <AlertForm
              defaultValues={
                selectedAlert
                  ? {
                      name: selectedAlert.name,
                      type: selectedAlert.type,
                      metric: selectedAlert.metric,
                      threshold: selectedAlert.threshold,
                      windowMinutes: selectedAlert.windowMinutes,
                      channelType: selectedAlert.channelType,
                      channelUrl: selectedAlert.channelConfig?.url || '',
                      channelSecret: selectedAlert.channelConfig?.secret || '',
                    }
                  : {
                      name: '',
                      type: 'traffic_spike',
                      metric: 'pageviews',
                      threshold: 500,
                      windowMinutes: 15,
                      channelType: 'webhook',
                      channelUrl: '',
                      channelSecret: '',
                    }
              }
              onSave={handleSave}
              onClose={() => setActiveDialog(null)}
            />
          </Dialog>
        </Modal>
      </ControlledDialog>

      {/* Confirmation Modal for Delete */}
      <ControlledDialog>
        <Modal
          isOpen={activeDialog === 'delete'}
          onOpenChange={open => !open && setActiveDialog(null)}
        >
          <Dialog title="Delete Alert" style={{ width: '400px', padding: '24px' }}>
            <ConfirmationForm
              message={`Are you sure you want to delete alert "${selectedAlert?.name}"?`}
              onConfirm={handleDelete}
              onClose={() => setActiveDialog(null)}
            />
          </Dialog>
        </Modal>
      </ControlledDialog>
    </Column>
  );
}

function AlertForm({
  defaultValues,
  onSave,
  onClose,
}: {
  defaultValues: any;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [channelType, setChannelType] = useState(defaultValues.channelType || 'webhook');
  const [type, setType] = useState(defaultValues.type || 'traffic_spike');
  const [metric, setMetric] = useState(defaultValues.metric || 'pageviews');

  return (
    <Form onSubmit={onSave} values={defaultValues}>
      <Column gap="3">
        <FormField label="Alert Name" name="name" rules={{ required: 'Required' }}>
          <TextField placeholder="e.g. Traffic Spike Alert" />
        </FormField>

        <FormField label="Metric" name="metric">
          <Select value={metric} onChange={val => setMetric(String(val))}>
            <ListItem id="pageviews">Pageviews</ListItem>
            <ListItem id="visitors">Visitors</ListItem>
            <ListItem id="errors">Errors</ListItem>
          </Select>
        </FormField>

        <FormField label="Condition Type" name="type">
          <Select value={type} onChange={val => setType(String(val))}>
            <ListItem id="traffic_spike">Spike (Value ≥ Threshold)</ListItem>
            <ListItem id="traffic_drop">Drop (Value ≤ Threshold)</ListItem>
            <ListItem id="error_spike">Error Spike (Errors ≥ Threshold)</ListItem>
            <ListItem id="metric_threshold">Absolute Threshold</ListItem>
          </Select>
        </FormField>

        <Row gap="3">
          <Column style={{ flex: 1 }}>
            <FormField label="Threshold" name="threshold" rules={{ required: 'Required' }}>
              <TextField type="number" placeholder="1000" />
            </FormField>
          </Column>
          <Column style={{ flex: 1 }}>
            <FormField
              label="Time Window (Mins)"
              name="windowMinutes"
              rules={{ required: 'Required' }}
            >
              <TextField type="number" placeholder="15" />
            </FormField>
          </Column>
        </Row>

        <FormField label="Channel Type" name="channelType">
          <Select value={channelType} onChange={val => setChannelType(String(val))}>
            <ListItem id="webhook">Generic Webhook</ListItem>
            <ListItem id="slack">Slack Incoming Webhook</ListItem>
            <ListItem id="discord">Discord Webhook</ListItem>
          </Select>
        </FormField>

        <FormField label="Webhook URL" name="channelUrl" rules={{ required: 'Required' }}>
          <TextField
            placeholder={
              channelType === 'discord'
                ? 'https://discord.com/api/webhooks/...'
                : channelType === 'slack'
                  ? 'https://hooks.slack.com/services/...'
                  : 'https://example.com/api/webhook'
            }
          />
        </FormField>

        {channelType === 'webhook' && (
          <FormField label="Secret Key (Optional HMAC SHA256)" name="channelSecret">
            <TextField placeholder="Optional signing secret" />
          </FormField>
        )}

        <FormButtons>
          <Button variant="quiet" onPress={onClose}>
            Cancel
          </Button>
          <FormSubmitButton variant="primary">Save Alert</FormSubmitButton>
        </FormButtons>
      </Column>
    </Form>
  );
}
