import { ListItem, Select } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { useMessages } from '@/components/hooks';
import {
  type EventDataProperty,
  getEventNames,
  getPropertyDataType,
  getPropertyNames,
  withSavedOption,
} from './eventPropertyConfig';

const selectValueStyle = {
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
};

export function BoardEventPropertyField({
  fieldType,
  data,
  values,
  onChange,
}: {
  fieldType: 'event' | 'eventProperty';
  data?: EventDataProperty[];
  values: Record<string, any>;
  onChange: (patch: Record<string, any>) => void;
}) {
  const { t, labels } = useMessages();
  const [search, setSearch] = useState('');
  const { eventName, propertyName } = values;

  const options = useMemo(() => {
    if (fieldType === 'event') {
      return withSavedOption(getEventNames(data), eventName);
    }

    return withSavedOption(getPropertyNames(data, eventName), propertyName);
  }, [fieldType, data, eventName, propertyName]);

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return search ? options.filter(name => name.toLowerCase().includes(normalizedSearch)) : options;
  }, [options, search]);

  const handleChange = (value: string) => {
    if (fieldType === 'event') {
      const keepProperty = getPropertyNames(data, value).includes(propertyName);

      onChange({
        eventName: value,
        propertyName: keepProperty ? propertyName : '',
        dataType: keepProperty ? getPropertyDataType(data, value, propertyName) : undefined,
      });
    } else {
      onChange({
        propertyName: value,
        dataType: getPropertyDataType(data, eventName, value),
      });
    }
  };

  return (
    <Select
      value={(fieldType === 'event' ? eventName : propertyName) ?? ''}
      onChange={value => handleChange(value as string)}
      isDisabled={fieldType === 'eventProperty' && !eventName}
      allowSearch
      searchValue={search}
      onSearch={setSearch}
      onOpenChange={() => setSearch('')}
      placeholder={fieldType === 'event' ? t(labels.selectEvent) : t(labels.selectProperty)}
      maxHeight={300}
      popoverProps={{ style: { width: 220 } }}
      buttonProps={{ style: { minWidth: 0, maxWidth: '100%', overflow: 'hidden' } }}
      renderValue={({ defaultChildren }) => <span style={selectValueStyle}>{defaultChildren}</span>}
    >
      {filteredOptions.map(name => (
        <ListItem key={name} id={name}>
          {name}
        </ListItem>
      ))}
    </Select>
  );
}
