import {
  Grid,
  Row,
  Column,
  TextField,
  Label,
  ListItem,
  Select,
  Icon,
  Icons,
  Button,
} from '@umami/react-zen';
import { useFilters } from '@/components/hooks';

export interface FilterRecordProps {
  name: string;
  operator: string;
  value: string;
  onSelect?: (name: string, value: any) => void;
  onRemove?: (name: string) => void;
  onChange?: (name: string, value: string) => void;
}

export function FilterRecord({
  name,
  operator,
  value,
  onSelect,
  onRemove,
  onChange,
}: FilterRecordProps) {
  const { fields, operators } = useFilters();

  return (
    <Grid columns="1fr auto">
      <Column>
        <Label>{fields.find(f => f.name === name)?.label}</Label>
        <Row gap alignItems="center">
          <Select
            items={operators.filter(({ type }) => type === 'string')}
            selectedKey={operator}
            onSelectionChange={value => onSelect?.(name, value)}
          >
            {({ name, label }: any) => {
              return (
                <ListItem key={name} id={name}>
                  {label}
                </ListItem>
              );
            }}
          </Select>
          <TextField value={value} onChange={e => onChange?.(name, e.target.value)} />
        </Row>
      </Column>
      <Column justifyContent="flex-end">
        <Button variant="quiet" onPress={() => onRemove?.(name)}>
          <Icon>
            <Icons.Close />
          </Icon>
        </Button>
      </Column>
    </Grid>
  );
}
