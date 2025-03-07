import { useFields, useMessages } from '@/components/hooks';
import { Icons } from '@/components/icons';
import { useContext } from 'react';
import { Button, Row, Label, Icon, Popover, MenuTrigger } from '@umami/react-zen';
import { FieldSelectForm } from '../[reportId]/FieldSelectForm';
import { ParameterList } from '../[reportId]/ParameterList';
import { PopupForm } from '../[reportId]/PopupForm';
import { ReportContext } from './Report';

export function FieldParameters() {
  const { report, updateReport } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { parameters } = report || {};
  const { fields } = parameters || {};
  const { fields: fieldOptions } = useFields();

  const handleAdd = (value: { name: any }) => {
    if (!fields.find(({ name }) => name === value.name)) {
      updateReport({ parameters: { fields: fields.concat(value) } });
    }
  };

  const handleRemove = (name: string) => {
    updateReport({ parameters: { fields: fields.filter(f => f.name !== name) } });
  };

  const AddButton = () => {
    return (
      <MenuTrigger>
        <Button size="sm">
          <Icon>
            <Icons.Plus />
          </Icon>
        </Button>
        <Popover placement="start">
          <FieldSelectForm
            fields={fieldOptions.filter(({ name }) => !fields.find(f => f.name === name))}
            onSelect={handleAdd}
            showType={false}
          />
        </Popover>
      </MenuTrigger>
    );
  };

  return (
    <Row>
      <Label>{formatMessage(labels.fields)}</Label>
      <ParameterList>
        {fields.map(({ name }) => {
          return (
            <ParameterList.Item key={name} onRemove={() => handleRemove(name)}>
              {fieldOptions.find(f => f.name === name)?.label}
            </ParameterList.Item>
          );
        })}
      </ParameterList>
      <AddButton />
    </Row>
  );
}
