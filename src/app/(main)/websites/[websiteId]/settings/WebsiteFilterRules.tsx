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
import { Edit, Filter, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { ConfirmationForm } from '@/components/common/ConfirmationForm';
import { ControlledDialog } from '@/components/common/ControlledDialog';
import { useApi, useModified, useWebsiteFiltersQuery } from '@/components/hooks';

export function WebsiteFilterRules({ websiteId }: { websiteId: string }) {
  const { post, del, put } = useApi();
  const { touch } = useModified();
  const { data: filters = [], isLoading } = useWebsiteFiltersQuery(websiteId);

  const [activeDialog, setActiveDialog] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<any>(null);

  const handleToggle = async (filter: any) => {
    await put(`/websites/${websiteId}/filters/${filter.id}`, {
      isEnabled: !filter.isEnabled,
    });
    touch('filterRules');
  };

  const handleDelete = async () => {
    if (!selectedFilter) return;
    await del(`/websites/${websiteId}/filters/${selectedFilter.id}`);
    touch('filterRules');
    setActiveDialog(null);
    setSelectedFilter(null);
  };

  const handleSave = async (formData: any) => {
    if (selectedFilter) {
      await put(`/websites/${websiteId}/filters/${selectedFilter.id}`, {
        name: formData.name,
        type: formData.type,
        value: formData.value,
      });
    } else {
      await post(`/websites/${websiteId}/filters`, {
        name: formData.name,
        type: formData.type,
        value: formData.value,
        isEnabled: true,
      });
    }

    touch('filterRules');
    setActiveDialog(null);
    setSelectedFilter(null);
  };

  return (
    <Column gap="4">
      <Row justifyContent="space-between" alignItems="center">
        <Column gap="1">
          <Row gap="2" alignItems="center">
            <Icon>
              <Filter />
            </Icon>
            <Text weight="bold">Traffic & Bot Filters</Text>
          </Row>
          <Text color="muted" size="sm">
            Exclude internal IPs, CIDR ranges, scrapers, query parameters, or countries from website
            analytics.
          </Text>
        </Column>
        <Button
          variant="primary"
          onPress={() => {
            setSelectedFilter(null);
            setActiveDialog('create');
          }}
        >
          <Icon>
            <Plus />
          </Icon>
          <Text>Add Filter</Text>
        </Button>
      </Row>

      {filters.length === 0 && !isLoading && (
        <Row
          justifyContent="center"
          style={{
            padding: '32px',
            backgroundColor: 'var(--base50)',
            borderRadius: '8px',
          }}
        >
          <Text color="muted">
            No exclusion rules configured. Click "Add Filter" to exclude specific traffic.
          </Text>
        </Row>
      )}

      {filters.length > 0 && (
        <Table>
          <TableHeader>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Active</TableCell>
            <TableCell style={{ textAlign: 'right' }}>Actions</TableCell>
          </TableHeader>
          <TableBody>
            {filters.map((filter: any) => (
              <TableRow key={filter.id}>
                <TableCell>
                  <Text weight="bold">{filter.name}</Text>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      filter.type === 'ip' || filter.type === 'cidr'
                        ? 'primary'
                        : filter.type === 'user_agent'
                          ? 'gray'
                          : 'default'
                    }
                  >
                    {filter.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <code
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      padding: '2px 6px',
                      backgroundColor: 'var(--base100)',
                      borderRadius: '4px',
                    }}
                  >
                    {filter.value}
                  </code>
                </TableCell>
                <TableCell>
                  <Switch isSelected={filter.isEnabled} onChange={() => handleToggle(filter)} />
                </TableCell>
                <TableCell>
                  <Row gap="1" justifyContent="flex-end">
                    <Button
                      variant="quiet"
                      title="Edit Filter"
                      onPress={() => {
                        setSelectedFilter(filter);
                        setActiveDialog('edit');
                      }}
                    >
                      <Icon>
                        <Edit />
                      </Icon>
                    </Button>
                    <Button
                      variant="quiet"
                      title="Delete Filter"
                      onPress={() => {
                        setSelectedFilter(filter);
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
            title={selectedFilter ? 'Edit Filter Rule' : 'Create Filter Rule'}
            style={{ width: '480px', padding: '24px' }}
          >
            <FilterForm
              defaultValues={
                selectedFilter
                  ? {
                      name: selectedFilter.name,
                      type: selectedFilter.type,
                      value: selectedFilter.value,
                    }
                  : {
                      name: '',
                      type: 'ip',
                      value: '',
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
          <Dialog title="Delete Filter" style={{ width: '400px', padding: '24px' }}>
            <ConfirmationForm
              message={`Are you sure you want to delete filter rule "${selectedFilter?.name}"?`}
              onConfirm={handleDelete}
              onClose={() => setActiveDialog(null)}
            />
          </Dialog>
        </Modal>
      </ControlledDialog>
    </Column>
  );
}

function FilterForm({
  defaultValues,
  onSave,
  onClose,
}: {
  defaultValues: any;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState(defaultValues.type || 'ip');

  const getPlaceholder = () => {
    switch (type) {
      case 'cidr':
        return 'e.g. 192.168.1.0/24 or 10.0.0.0/8';
      case 'user_agent':
        return 'e.g. AhrefsBot, ClaudeBot, or /bot.*crawler/i';
      case 'query_param':
        return 'e.g. preview=true or env=staging';
      case 'country':
        return 'e.g. US, DE, CN (2-letter ISO code)';
      default:
        return 'e.g. 203.0.113.195';
    }
  };

  return (
    <Form onSubmit={onSave} values={defaultValues}>
      <Column gap="3">
        <FormField label="Filter Name" name="name" rules={{ required: 'Required' }}>
          <TextField placeholder="e.g. Office VPN, Scraper Bot" />
        </FormField>

        <FormField label="Filter Type" name="type">
          <Select value={type} onChange={val => setType(String(val))}>
            <ListItem id="ip">IP Address (Exact)</ListItem>
            <ListItem id="cidr">IP Subnet (CIDR)</ListItem>
            <ListItem id="user_agent">User-Agent (Bot/Crawler)</ListItem>
            <ListItem id="query_param">Query Parameter</ListItem>
            <ListItem id="country">Country Code (ISO 3166-1)</ListItem>
          </Select>
        </FormField>

        <FormField label="Filter Value" name="value" rules={{ required: 'Required' }}>
          <TextField placeholder={getPlaceholder()} />
        </FormField>

        <FormButtons>
          <Button variant="quiet" onPress={onClose}>
            Cancel
          </Button>
          <FormSubmitButton variant="primary">Save Filter</FormSubmitButton>
        </FormButtons>
      </Column>
    </Form>
  );
}
