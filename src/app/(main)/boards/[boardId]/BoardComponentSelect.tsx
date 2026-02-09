import {
  Box,
  Button,
  Column,
  Focusable,
  Heading,
  ListItem,
  Row,
  Select,
  Text,
} from '@umami/react-zen';
import { useState } from 'react';
import type { BoardComponentConfig } from '@/lib/types';
import {
  CATEGORIES,
  type ComponentDefinition,
  type ConfigField,
  getComponentsByCategory,
} from '../boardComponentRegistry';
import { BoardComponentRenderer } from './BoardComponentRenderer';

export function BoardComponentSelect({
  websiteId,
  onSelect,
  onClose,
}: {
  websiteId: string;
  onSelect: (config: BoardComponentConfig) => void;
  onClose: () => void;
}) {
  const [selectedDef, setSelectedDef] = useState<ComponentDefinition | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});

  const handleSelectComponent = (def: ComponentDefinition) => {
    setSelectedDef(def);
    const defaults: Record<string, any> = {};
    if (def.configFields) {
      for (const field of def.configFields) {
        defaults[field.name] = field.defaultValue;
      }
    }
    if (def.defaultProps) {
      Object.assign(defaults, def.defaultProps);
    }
    setConfigValues(defaults);
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

    if (props.limit) {
      props.limit = Number(props.limit);
    }

    const config: BoardComponentConfig = { type: selectedDef.type };
    if (Object.keys(props).length > 0) {
      config.props = props;
    }

    onSelect(config);
  };

  const previewConfig: BoardComponentConfig | null = selectedDef
    ? {
        type: selectedDef.type,
        props: { ...selectedDef.defaultProps, ...configValues },
      }
    : null;

  return (
    <Column gap="4">
      <Row gap="4" style={{ height: 500 }}>
        <Column gap="1" style={{ width: 200, flexShrink: 0, overflowY: 'auto' }}>
          {CATEGORIES.map(cat => {
            const components = getComponentsByCategory(cat.key);
            return (
              <Column key={cat.key} gap="1" marginBottom="2">
                <Heading size="md">{cat.name}</Heading>
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
          {selectedDef?.configFields && selectedDef.configFields.length > 0 && (
            <Row gap="3" alignItems="center" flexWrap="wrap">
              {selectedDef.configFields.map((field: ConfigField) => (
                <Row key={field.name} gap="2" alignItems="center">
                  <Text size="sm" color="muted">
                    {field.label}
                  </Text>
                  {field.type === 'select' && (
                    <Select
                      value={String(configValues[field.name] ?? field.defaultValue ?? '')}
                      onChange={(value: string) => handleConfigChange(field.name, value)}
                    >
                      {field.options?.map(opt => (
                        <ListItem key={opt.value} id={opt.value}>
                          {opt.label}
                        </ListItem>
                      ))}
                    </Select>
                  )}
                </Row>
              ))}
            </Row>
          )}
          <Box
            flexGrow={1}
            border
            borderRadius
            overflow="auto"
            position="relative"
            style={{ minHeight: 0 }}
          >
            {previewConfig && websiteId ? (
              <BoardComponentRenderer config={previewConfig} websiteId={websiteId} />
            ) : (
              <Column alignItems="center" justifyContent="center" height="100%">
                <Text color="muted">
                  {websiteId ? 'Select a component to preview' : 'Select a website first'}
                </Text>
              </Column>
            )}
          </Box>
        </Column>
      </Row>
      <Row justifyContent="flex-end" gap="2" paddingTop="4" border="top">
        <Button variant="quiet" onPress={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onPress={handleAdd} isDisabled={!selectedDef}>
          Add
        </Button>
      </Row>
    </Column>
  );
}
