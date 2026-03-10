import {
  Box,
  Button,
  Form,
  FormField,
  FormSubmitButton,
  ListItem,
  Loading,
  Row,
  Select,
  TextField,
} from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { useBoardQuery, useMessages, useNavigation, useUpdateQuery } from '@/components/hooks';
import { LinkSelect } from '@/components/input/LinkSelect';
import { PixelSelect } from '@/components/input/PixelSelect';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';
import {
  BOARD_TYPES,
  type BoardType,
  getBoardEntity,
  getBoardType,
  requiresBoardEntity,
  setBoardEntity,
} from '@/lib/boards';
import type { Board } from '@/lib/types';

interface BoardFormValues {
  name: string;
  description: string;
  type: BoardType;
  entityId: string;
}

function getDefaultValues(board?: Partial<Board>): BoardFormValues {
  const boardType = getBoardType(board, { coerceDashboard: true });
  const { entityId } = getBoardEntity(board);

  return {
    name: board?.name ?? '',
    description: board?.description ?? '',
    type: boardType,
    entityId: entityId ?? '',
  };
}

export function BoardEditForm({
  boardId,
  teamId,
  onSave,
  onClose,
}: {
  boardId?: string;
  teamId?: string;
  onSave?: (board: Board) => void | Promise<void>;
  onClose?: () => void;
}) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { teamId: navigationTeamId } = useNavigation();
  const resolvedTeamId = teamId ?? navigationTeamId;
  const { data, isLoading } = useBoardQuery(boardId || '');
  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(
    boardId ? `/boards/${boardId}` : '/boards',
    {
      id: boardId,
      teamId: resolvedTeamId,
    },
  );
  const [values, setValues] = useState<BoardFormValues>(getDefaultValues());

  useEffect(() => {
    if (data) {
      setValues(getDefaultValues(data));
    }
  }, [data]);

  const handleSubmit = async () => {
    const result = await mutateAsync({
      name: values.name,
      description: values.description,
      type: values.type,
      parameters: setBoardEntity({}, values.type, values.entityId || undefined),
    });

    toast(t(messages.saved));
    touch('boards');
    touch(`board:${result.id}`);
    await onSave?.(result);
    onClose?.();
  };

  const handleNameChange = (name: string) => {
    setValues(current => ({ ...current, name }));
  };

  const handleDescriptionChange = (description: string) => {
    setValues(current => ({ ...current, description }));
  };

  const handleTypeChange = (type: string) => {
    setValues(current => ({
      ...current,
      type: type as BoardType,
      entityId: '',
    }));
  };

  const handleEntityChange = (entityId: string) => {
    setValues(current => ({ ...current, entityId }));
  };

  if (boardId && isLoading) {
    return <Loading placement="absolute" />;
  }

  const entityLabel =
    values.type === BOARD_TYPES.pixel
      ? t(labels.pixel)
      : values.type === BOARD_TYPES.link
        ? t(labels.link)
        : t(labels.website);

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} values={values}>
      <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
        <TextField
          autoComplete="off"
          autoFocus={!boardId}
          value={values.name}
          placeholder={t(labels.untitled)}
          onChange={handleNameChange}
        />
      </FormField>
      <FormField name="description" label={t(labels.description)}>
        <TextField
          autoComplete="off"
          asTextArea
          resize="vertical"
          value={values.description}
          placeholder={t(labels.addDescription)}
          onChange={handleDescriptionChange}
        />
      </FormField>
      <FormField
        name="type"
        label={t(labels.boardType)}
        rules={{ required: t(labels.required) }}
      >
        <Box width="100%" maxWidth="360px">
          <Select value={values.type} onChange={handleTypeChange}>
            <ListItem id={BOARD_TYPES.mixed}>{t(labels.open)}</ListItem>
            <ListItem id={BOARD_TYPES.website}>{t(labels.website)}</ListItem>
            <ListItem id={BOARD_TYPES.pixel}>{t(labels.pixel)}</ListItem>
            <ListItem id={BOARD_TYPES.link}>{t(labels.link)}</ListItem>
          </Select>
        </Box>
      </FormField>
      {requiresBoardEntity(values.type) && (
        <FormField
          name="entityId"
          label={entityLabel}
          rules={{ required: t(labels.required) }}
        >
          <Box width="100%" maxWidth="360px">
            {values.type === BOARD_TYPES.website ? (
              <WebsiteSelect
                websiteId={values.entityId}
                teamId={resolvedTeamId}
                onChange={handleEntityChange}
              />
            ) : values.type === BOARD_TYPES.pixel ? (
              <PixelSelect
                pixelId={values.entityId}
                teamId={resolvedTeamId}
                placeholder={t(labels.selectPixel)}
                onChange={handleEntityChange}
              />
            ) : (
              <LinkSelect
                linkId={values.entityId}
                teamId={resolvedTeamId}
                placeholder={t(labels.selectLink)}
                onChange={handleEntityChange}
              />
            )}
          </Box>
        </FormField>
      )}
      <Row justifyContent="flex-end" paddingTop="3" gap="3">
        {onClose && (
          <Button isDisabled={isPending} onPress={onClose}>
            {t(labels.cancel)}
          </Button>
        )}
        <FormSubmitButton isDisabled={isPending}>{t(labels.save)}</FormSubmitButton>
      </Row>
    </Form>
  );
}
