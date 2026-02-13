import {
  Button,
  Column,
  Focusable,
  ListItem,
  Row,
  Select,
  Text,
  TextField,
} from '@umami/react-zen';
import { useEffect, useMemo, useState } from 'react';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';
import type { BoardComponentConfig } from '@/lib/types';
import {
  CATEGORIES,
  type ComponentDefinition,
  type ConfigField,
  getComponentsByCategory,
} from '../boardComponentRegistry';
import { BoardComponentRenderer } from './BoardComponentRenderer';

export function BoardComponentSelect({
  teamId,
  websiteId,
  defaultWebsiteId,
  initialConfig,
  onSelect,
  onClose,
}: {
  teamId?: string;
  websiteId?: string;
  defaultWebsiteId?: string;
  initialConfig?: BoardComponentConfig;
  onSelect: (config: BoardComponentConfig) => void;
  onClose: () => void;
}) {
  const { t, labels, messages } = useMessages();
  const [selectedDef, setSelectedDef] = useState<ComponentDefinition | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(
    initialConfig?.websiteId || websiteId || defaultWebsiteId,
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const allDefinitions = useMemo(
    () => CATEGORIES.flatMap(category => getComponentsByCategory(category.key)),
    [],
  );

  const getDefaultConfigValues = (def: ComponentDefinition, config?: BoardComponentConfig) => {
    const defaults: Record<string, any> = {};

    for (const field of def.configFields ?? []) {
      defaults[field.name] = field.defaultValue;
    }

    if (def.defaultProps) {
      Object.assign(defaults, def.defaultProps);
    }

    if (config?.props) {
      Object.assign(defaults, config.props);
    }

    return defaults;
  };

  useEffect(() => {
    if (!initialConfig) {
      return;
    }

    const definition = allDefinitions.find(def => def.type === initialConfig.type);

    if (!definition) {
      return;
    }

    setSelectedDef(definition);
    setConfigValues(getDefaultConfigValues(definition, initialConfig));
    setSelectedWebsiteId(initialConfig.websiteId || websiteId || defaultWebsiteId);
    setTitle(initialConfig.title ?? '');
    setDescription(initialConfig.description || '');
  }, [initialConfig, allDefinitions, websiteId, defaultWebsiteId]);

  const handleSelectComponent = (def: ComponentDefinition) => {
    setSelectedDef(def);
    setConfigValues(getDefaultConfigValues(def));
    setTitle('');
    setDescription('');
  };

  const handleConfigChange = (name: string, value: any) => {
    setConfigValues(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!selectedDef) return;

    const props: Record<string, any> = {};

    if (selectedDef.defaultProps) {
      Object.assign(props, selectedDef.defaultProps);
    }

    Object.assign(props, configValues);

    for (const field of selectedDef.configFields ?? []) {
      if (field.type === 'number' && props[field.name] != null && props[field.name] !== '') {
        props[field.name] = Number(props[field.name]);
      }
    }

    const config: BoardComponentConfig = {
      type: selectedDef.type,
      websiteId: selectedWebsiteId,
      title,
      description,
    };

    if (Object.keys(props).length > 0) {
      config.props = props;
    }

    onSelect(config);
  };

  const previewConfig: BoardComponentConfig | null = selectedDef
    ? {
        type: selectedDef.type,
        title,
        description,
        props: { ...selectedDef.defaultProps, ...configValues },
      }
    : null;

  return (
    <Column gap="4">
      <Row gap="4" style={{ height: 600 }}>
        <Column gap="1" style={{ width: 280, flexShrink: 0, overflowY: 'auto' }}>
          {CATEGORIES.map(category => {
            const components = getComponentsByCategory(category.key);

            return (
              <Column key={category.key} gap="1" marginBottom="2">
                <Text weight="bold">{category.name}</Text>
                {components.map(def => (
                  <Focusable key={def.type}>
                    <Row
                      alignItems="center"
                      paddingX="3"
                      paddingY="2"
                      borderRadius
                      backgroundColor={
                        selectedDef?.type === def.type ? 'surface-sunken' : undefined
                      }
                      hover={{ backgroundColor: 'surface-sunken' }}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSelectComponent(def)}
                    >
                      <Column>
                        <Text
                          size="sm"
                          weight={selectedDef?.type === def.type ? 'bold' : undefined}
                        >
                          {def.name}
                        </Text>
                        <Text size="xs" color="muted">
                          {def.description}
                        </Text>
                      </Column>
                    </Row>
                  </Focusable>
                ))}
              </Column>
            );
          })}
        </Column>

        <Column gap="3" flexGrow={1} style={{ minWidth: 0 }}>
          <Panel maxHeight="100%">
            {previewConfig && selectedWebsiteId ? (
              <BoardComponentRenderer config={previewConfig} websiteId={selectedWebsiteId} />
            ) : (
              <Column alignItems="center" justifyContent="center" height="100%">
                <Text color="muted">
                  {selectedWebsiteId
                    ? t(messages.selectComponentPreview)
                    : t(messages.selectWebsiteFirst)}
                </Text>
              </Column>
            )}
          </Panel>
        </Column>

        <Column gap="3" style={{ width: 320, flexShrink: 0, overflowY: 'auto' }}>
          <Text weight="bold">{t(labels.properties)}</Text>

          <Column gap="2">
            <Text size="sm" color="muted">
              {t(labels.website)}
            </Text>
            <WebsiteSelect
              websiteId={selectedWebsiteId}
              teamId={teamId}
              placeholder={t(labels.selectWebsite)}
              onChange={setSelectedWebsiteId}
            />
          </Column>

          <Column gap="2">
            <Text size="sm" color="muted">
              {t(labels.title)}
            </Text>
            <TextField value={title} onChange={setTitle} autoComplete="off" />
          </Column>

          <Column gap="2">
            <Text size="sm" color="muted">
              {t(labels.description)}
            </Text>
            <TextField value={description} onChange={setDescription} autoComplete="off" />
          </Column>

          {selectedDef?.configFields && selectedDef.configFields.length > 0 && (
            <Column gap="3">
              {selectedDef.configFields.map((field: ConfigField) => (
                <Column key={field.name} gap="2">
                  <Text size="sm" color="muted">
                    {field.label}
                  </Text>

                  {field.type === 'select' && (
                    <Select
                      value={String(configValues[field.name] ?? field.defaultValue ?? '')}
                      onChange={(value: string) => handleConfigChange(field.name, value)}
                    >
                      {field.options?.map(option => (
                        <ListItem key={option.value} id={option.value}>
                          {option.label}
                        </ListItem>
                      ))}
                    </Select>
                  )}

                  {field.type === 'text' && (
                    <TextField
                      value={String(configValues[field.name] ?? field.defaultValue ?? '')}
                      onChange={(value: string) => handleConfigChange(field.name, value)}
                    />
                  )}

                  {field.type === 'number' && (
                    <TextField
                      type="number"
                      value={String(configValues[field.name] ?? field.defaultValue ?? '')}
                      onChange={(value: string) => handleConfigChange(field.name, value)}
                    />
                  )}
                </Column>
              ))}
            </Column>
          )}
        </Column>
      </Row>

      <Row justifyContent="flex-end" gap="2" paddingTop="4">
        <Button variant="quiet" onPress={onClose}>
          {t(labels.cancel)}
        </Button>
        <Button variant="primary" onPress={handleAdd} isDisabled={!selectedDef}>
          {t(labels.save)}
        </Button>
      </Row>
    </Column>
  );
}
