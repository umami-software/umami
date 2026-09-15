import { Button, Column, Icon, Row } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Plus, Trash } from '@/components/icons';
import { FieldFilters } from '@/components/input/FieldFilters';
import type { FilterGroup } from '@/lib/types';

type SegmentGroupFieldsProps = {
  websiteId: string;
  value?: Partial<FilterGroup>;
  onChange?: (value: FilterGroup) => void;
  onRemove?: () => void;
};

export function SegmentGroupFields({
  websiteId,
  value = {},
  onChange,
  onRemove,
}: SegmentGroupFieldsProps) {
  const { t, labels } = useMessages();
  const filters = value.filters || [];
  const groups = value.groups || [];
  const match = value.match || 'all';
  const update = (props: Partial<FilterGroup>) => {
    onChange?.({ match, filters, groups, ...props });
  };

  const addGroup = () => {
    update({ groups: [...groups, { match: 'all', filters: [] }] });
  };

  const updateGroup = (index: number, group: FilterGroup) => {
    update({ groups: groups.map((item, i) => (i === index ? group : item)) });
  };

  const removeGroup = (index: number) => {
    update({ groups: groups.filter((_, i) => i !== index) });
  };

  return (
    <Column gap="4">
      <FieldFilters
        websiteId={websiteId}
        value={filters}
        match={match}
        onChange={next => update({ filters: next })}
        onMatchChange={next => update({ match: next as 'all' | 'any' })}
      />
      <Row gap="2">
        <Button variant="quiet" onPress={addGroup}>
          <Icon>
            <Plus />
          </Icon>
          {t(labels.addGroup)}
        </Button>
        {onRemove && (
          <Button variant="quiet" onPress={onRemove}>
            <Icon>
              <Trash />
            </Icon>
            {t(labels.deleteGroup)}
          </Button>
        )}
      </Row>
      {groups.map((group, index) => (
        <Column key={index} border="left" paddingLeft="4">
          <SegmentGroupFields
            websiteId={websiteId}
            value={group}
            onChange={next => updateGroup(index, next)}
            onRemove={() => removeGroup(index)}
          />
        </Column>
      ))}
    </Column>
  );
}
