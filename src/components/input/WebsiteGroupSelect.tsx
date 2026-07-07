import { FormField, ListItem, Select } from '@umami/react-zen';
import { useMessages, useWebsiteGroupsQuery } from '@/components/hooks';
import { flattenGroupsForSelect } from '@/lib/websiteTree';

export function WebsiteGroupSelectField({
  teamId,
  excludeGroupId,
}: {
  teamId?: string;
  excludeGroupId?: string;
}) {
  const { t, labels } = useMessages();
  const { data, isLoading } = useWebsiteGroupsQuery({ teamId }, { pageSize: 1000 });
  const groups = data?.data ?? [];
  const options = flattenGroupsForSelect(groups, excludeGroupId);

  return (
    <FormField name="groupId" label={t(labels.group)}>
      <Select isLoading={isLoading} placeholder={t(labels.none)}>
        <ListItem id="">{t(labels.none)}</ListItem>
        {options.map(option => (
          <ListItem key={option.id} id={option.id}>
            <span style={{ paddingLeft: option.depth * 16 }}>{option.label}</span>
          </ListItem>
        ))}
      </Select>
    </FormField>
  );
}

export function WebsiteGroupParentSelectField({
  teamId,
  excludeGroupId,
}: {
  teamId?: string;
  excludeGroupId?: string;
}) {
  const { t, labels } = useMessages();
  const { data, isLoading } = useWebsiteGroupsQuery({ teamId }, { pageSize: 1000 });
  const groups = data?.data ?? [];
  const options = flattenGroupsForSelect(groups, excludeGroupId);

  return (
    <FormField name="parentId" label={t(labels.parentGroup)}>
      <Select isLoading={isLoading} placeholder={t(labels.none)}>
        <ListItem id="">{t(labels.none)}</ListItem>
        {options.map(option => (
          <ListItem key={option.id} id={option.id}>
            <span style={{ paddingLeft: option.depth * 16 }}>{option.label}</span>
          </ListItem>
        ))}
      </Select>
    </FormField>
  );
}
