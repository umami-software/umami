import {
  Box,
  Button,
  Form,
  FormField,
  FormSubmitButton,
  Loading,
  Row,
  Text,
  TextField,
} from '@umami/react-zen';
import { useBoardQuery, useMessages, useUpdateQuery } from '@/components/hooks';
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

interface BoardCloneFormValues {
  name: string;
  description: string;
  type: BoardType;
  entityId: string;
}

function getDefaultValues(board?: Partial<Board>): BoardCloneFormValues {
  const boardType = getBoardType(board, { coerceDashboard: true });
  const { entityId } = getBoardEntity(board);

  return {
    name: board?.name ? `${board.name} copy` : '',
    description: board?.description ?? '',
    type: boardType,
    entityId: entityId ?? '',
  };
}

export function BoardCloneForm({
  boardId,
  onSave,
  onClose,
}: {
  boardId: string;
  onSave?: (board: Board) => void | Promise<void>;
  onClose?: () => void;
}) {
  const { t, labels, messages, getErrorMessage } = useMessages();
  const { data: board, isLoading } = useBoardQuery(boardId);
  const { mutateAsync, error, isPending, touch, toast } = useUpdateQuery(`/boards/${boardId}/clone`);
  const values = getDefaultValues(board);
  const boardType = getBoardType(board, { coerceDashboard: true });
  const resolvedTeamId = board?.teamId;

  const handleSubmit = async (data: BoardCloneFormValues) => {
    const result = await mutateAsync({
      name: data.name,
      description: data.description,
      parameters: setBoardEntity(board?.parameters, boardType, data.entityId || undefined),
    });

    toast(t(messages.saved));
    touch('boards');
    touch(`board:${result.id}`);
    await onSave?.(result);
    onClose?.();
  };

  if (isLoading) {
    return <Loading placement="absolute" />;
  }

  return (
    <Form onSubmit={handleSubmit} error={getErrorMessage(error)} values={values}>
      {({ watch, setValue }) => {
        const entityId = watch('entityId') as string;
        const entityLabel =
          boardType === BOARD_TYPES.pixel
            ? t(labels.pixel)
            : boardType === BOARD_TYPES.link
              ? t(labels.link)
              : t(labels.website);
        const boardTypeLabel =
          boardType === BOARD_TYPES.mixed
            ? t(labels.open)
            : boardType === BOARD_TYPES.pixel
              ? t(labels.pixel)
              : boardType === BOARD_TYPES.link
                ? t(labels.link)
                : t(labels.website);

        const handleEntityChange = (value: string) => {
          setValue('entityId', value, { shouldDirty: true });
        };

        return (
          <>
            <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
              <TextField autoComplete="off" autoFocus placeholder={t(labels.untitled)} />
            </FormField>
            <FormField name="description" label={t(labels.description)}>
              <TextField
                autoComplete="off"
                asTextArea
                resize="vertical"
                placeholder={t(labels.addDescription)}
              />
            </FormField>
            <FormField name="type" label={t(labels.boardType)}>
              <Box width="100%" maxWidth="360px">
                <Text>{boardTypeLabel}</Text>
              </Box>
            </FormField>
            {requiresBoardEntity(boardType) && (
              <FormField
                name="entityId"
                label={entityLabel}
                rules={{ required: t(labels.required) }}
              >
                <Box width="100%" maxWidth="360px">
                  {boardType === BOARD_TYPES.website ? (
                    <WebsiteSelect
                      websiteId={entityId}
                      teamId={resolvedTeamId}
                      onChange={handleEntityChange}
                    />
                  ) : boardType === BOARD_TYPES.pixel ? (
                    <PixelSelect
                      pixelId={entityId}
                      teamId={resolvedTeamId}
                      placeholder={t(labels.selectPixel)}
                      onChange={handleEntityChange}
                    />
                  ) : (
                    <LinkSelect
                      linkId={entityId}
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
              <FormSubmitButton isDisabled={isPending}>Clone</FormSubmitButton>
            </Row>
          </>
        );
      }}
    </Form>
  );
}
