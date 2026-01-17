import { Column, Grid, Heading, LoadingButton, Row, TextField, useToast } from '@umami/react-zen';
import { useState } from 'react';
import { useApi, useBoard, useMessages, useModified, useNavigation } from '@/components/hooks';

export function BoardHeader() {
  const board = useBoard();
  const { formatMessage, labels, messages } = useMessages();
  const { post, useMutation } = useApi();
  const { touch } = useModified();
  const { router, renderUrl } = useNavigation();
  const { toast } = useToast();
  const defaultName = formatMessage(labels.untitled);

  const [name, setName] = useState(board?.name ?? '');
  const [description, setDescription] = useState(board?.description ?? '');

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: { name: string; description: string }) => {
      if (board) {
        return post(`/boards/${board.id}`, data);
      }
      return post('/boards', { ...data, type: 'dashboard', slug: '' });
    },
  });

  const handleNameChange = (value: string) => {
    setName(value);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
  };

  const handleSave = async () => {
    const result = await mutateAsync({ name: name || defaultName, description });

    toast(formatMessage(messages.saved));
    touch('boards');

    if (board) {
      touch(`board:${board.id}`);
    } else if (result?.id) {
      router.push(renderUrl(`/boards/${result.id}`));
    }
  };

  return (
    <Grid
      columns={{ xs: '1fr', md: '1fr 1fr' }}
      paddingY="4"
      marginBottom="6"
      border="bottom"
      gapX="6"
    >
      <Column>
        <Row>
          <TextField
            variant="quiet"
            name="name"
            value={name}
            placeholder={defaultName}
            onChange={handleNameChange}
            autoComplete="off"
            style={{ fontSize: '2rem', fontWeight: 700, width: '100%' }}
          >
            <Heading size="4">{name}</Heading>
          </TextField>
        </Row>
        <Row>
          <TextField
            variant="quiet"
            name="description"
            value={description}
            placeholder={`+ ${formatMessage(labels.addDescription)}`}
            autoComplete="off"
            onChange={handleDescriptionChange}
            style={{ width: '100%' }}
          >
            {description}
          </TextField>
        </Row>
      </Column>
      <Column justifyContent="center" alignItems="flex-end">
        <LoadingButton variant="primary" onPress={handleSave} isLoading={isPending}>
          {formatMessage(labels.save)}
        </LoadingButton>
      </Column>
    </Grid>
  );
}
