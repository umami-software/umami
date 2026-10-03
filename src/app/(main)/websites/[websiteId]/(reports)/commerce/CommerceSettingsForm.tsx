import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Column,
  Form,
  FormField,
  FormSubmitButton,
  Heading,
  Row,
  Text,
  TextField,
} from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useApi, useMessages, useUpdateQuery } from '@/components/hooks';
import type { CommerceSettings } from '@/lib/commerce-settings';

export function CommerceSettingsForm({
  websiteId,
  onClose,
}: {
  websiteId: string;
  onClose?: () => void;
}) {
  const { t } = useMessages();
  const { get, useQuery } = useApi();
  const client = useQueryClient();
  const { data, isLoading, error } = useQuery<CommerceSettings>({
    queryKey: ['commerce-settings', websiteId],
    queryFn: () => get(`/websites/${websiteId}/commerce/settings`),
  });
  const mutation = useUpdateQuery(`/websites/${websiteId}/commerce/settings`);
  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      {data && (
        <Form
          error={mutation.error?.message}
          defaultValues={{
            view: data.events.view.join(', '),
            cart: data.events.cart.join(', '),
            checkout: data.events.checkout.join(', '),
            windowHours: data.windowHours,
          }}
          onSubmit={async values => {
            await mutation.mutateAsync({
              events: Object.fromEntries(
                ['view', 'cart', 'checkout'].map(action => [
                  action,
                  String(values[action])
                    .split(',')
                    .map(name => name.trim())
                    .filter(Boolean),
                ]),
              ),
              windowHours: Number(values.windowHours),
            });
            await client.invalidateQueries({
              predicate: query => String(query.queryKey[0]).includes('commerce'),
            });
            onClose?.();
          }}
        >
          <Heading>{t('commerce.setup')}</Heading>
          <Text>{t('commerce.mappingHint')}</Text>
          {(['view', 'cart', 'checkout'] as const).map(action => (
            <FormField key={action} name={action} label={t(`commerce.action_${action}`)}>
              <TextField />
            </FormField>
          ))}
          <FormField
            name="windowHours"
            label={t('commerce.windowHours')}
            rules={{ required: true }}
          >
            <TextField type="number" min={1} max={720} />
          </FormField>
          <Text color="muted">{t('commerce.payloadHint')}</Text>
          <Column
            as="pre"
            style={{ whiteSpace: 'pre-wrap' }}
          >{`umami.track('view_item', { commerce: { currency: 'EUR', market: 'DE', items: [{ productId: 'shirt', price: 25, quantity: 1 }] } });`}</Column>
          <Row gap>
            <FormSubmitButton isDisabled={mutation.isPending}>{t('label.save')}</FormSubmitButton>
            {onClose && <Button onPress={onClose}>{t('label.cancel')}</Button>}
          </Row>
        </Form>
      )}
    </LoadingPanel>
  );
}
