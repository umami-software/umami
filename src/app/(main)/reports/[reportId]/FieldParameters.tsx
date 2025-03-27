import { useFields, useMessages, useReport } from '@/components/hooks';
import { Icons } from '@/components/icons';
import { Button, Row, Label, Icon, Popover, MenuTrigger, Column } from '@umami/react-zen';
import { FieldSelectForm } from '../[reportId]/FieldSelectForm';
import { ParameterList } from '../[reportId]/ParameterList';

export function FieldParameters() {
  const { report, updateReport } = useReport();
  const { formatMessage, labels } = useMessages();
  const { parameters } = report || {};
  const { fields } = parameters || {};
  const { fields: fieldOptions } = useFields();

  const handleAdd = (value: string) => {
    if (!fields.find(({ name }) => name === value)) {
      const field = fieldOptions.find(({ name }) => name === value);
      updateReport({ parameters: { fields: fields.concat(field) } });
    }
  };

  const handleRemove = (name: string) => {
    updateReport({ parameters: { fields: fields.filter(f => f.name !== name) } });
  };

  return (
    <Column gap="3">
      <Row justifyContent="space-between">
        <Label>{formatMessage(labels.fields)}</Label>
        <MenuTrigger>
          <Button variant="quiet">
            <Icon size="sm">
              <Icons.Plus />
            </Icon>
          </Button>
          <Popover placement="right top">
            <FieldSelectForm
              fields={fieldOptions.filter(({ name }) => !fields.find(f => f.name === name))}
              onSelect={handleAdd}
              showType={false}
            />
          </Popover>
        </MenuTrigger>
      </Row>
      <ParameterList>
        {fields.map(({ name }) => {
          return (
            <ParameterList.Item key={name} onRemove={() => handleRemove(name)}>
              {fieldOptions.find(f => f.name === name)?.label}
            </ParameterList.Item>
          );
        })}
      </ParameterList>
    </Column>
  );
}
