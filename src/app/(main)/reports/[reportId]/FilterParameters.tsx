import { useMessages, useFormat, useFilters, useFields, useReport } from '@/components/hooks';
import { Icons } from '@/components/icons';
import {
  Button,
  Row,
  Column,
  Label,
  Icon,
  Popover,
  MenuTrigger,
  Focusable,
  Text,
} from '@umami/react-zen';
import { FilterSelectForm } from '../[reportId]/FilterSelectForm';
import { ParameterList } from '../[reportId]/ParameterList';
import { FieldFilterEditForm } from '../[reportId]/FieldFilterEditForm';
import { isSearchOperator } from '@/lib/params';

export function FilterParameters() {
  const { report, updateReport } = useReport();
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const { parameters } = report || {};
  const { websiteId, filters, dateRange } = parameters || {};
  const { fields } = useFields();

  const handleAdd = (value: { name: any }) => {
    if (!filters.find(({ name }) => name === value.name)) {
      updateReport({ parameters: { filters: filters.concat(value) } });
    }
  };

  const handleRemove = (name: string) => {
    updateReport({ parameters: { filters: filters.filter(f => f.name !== name) } });
  };

  const handleChange = (close: () => void, filter: { name: any }) => {
    updateReport({
      parameters: {
        filters: filters.map(f => {
          if (filter.name === f.name) {
            return filter;
          }
          return f;
        }),
      },
    });
    close();
  };

  const AddButton = () => {
    return (
      <MenuTrigger>
        <Button variant="quiet">
          <Icon size="sm">
            <Icons.Plus />
          </Icon>
        </Button>
        <Popover placement="right top">
          <FilterSelectForm
            websiteId={websiteId}
            fields={fields.filter(({ name }) => !filters.find(f => f.name === name))}
            startDate={dateRange?.startDate}
            endDate={dateRange?.endDate}
            onChange={handleAdd}
          />
        </Popover>
      </MenuTrigger>
    );
  };

  return (
    <Column gap="3">
      <Row justifyContent="space-between">
        <Label>{formatMessage(labels.filters)}</Label>
        <AddButton />
      </Row>
      <ParameterList>
        {filters.map(
          ({ name, operator, value }: { name: string; operator: string; value: string }) => {
            const label = fields.find(f => f.name === name)?.label;
            const isSearch = isSearchOperator(operator);

            return (
              <ParameterList.Item key={name} onRemove={() => handleRemove(name)}>
                <FilterParameter
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  websiteId={websiteId}
                  name={name}
                  label={label}
                  operator={operator}
                  value={isSearch ? value : formatValue(value, name)}
                  onChange={handleChange}
                />
              </ParameterList.Item>
            );
          },
        )}
      </ParameterList>
    </Column>
  );
}

const FilterParameter = ({
  websiteId,
  name,
  label,
  operator,
  value,
  type = 'string',
  startDate,
  endDate,
  onChange,
}) => {
  const { operatorLabels } = useFilters();

  return (
    <MenuTrigger>
      <Focusable>
        <Row gap="3" alignItems="center">
          <Text>{label}</Text>
          <Text size="2" transform="uppercase">
            {operatorLabels[operator]}
          </Text>
          <Text weight="bold">{value}</Text>
        </Row>
      </Focusable>
      <Popover placement="right top">
        {(close: any) => (
          <FieldFilterEditForm
            websiteId={websiteId}
            name={name}
            label={label}
            type={type}
            startDate={startDate}
            endDate={endDate}
            operator={operator}
            defaultValue={value}
            onChange={onChange.bind(null, close)}
          />
        )}
      </Popover>
    </MenuTrigger>
  );
};
