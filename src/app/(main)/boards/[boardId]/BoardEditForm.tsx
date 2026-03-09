import { Box, Form, FormField, ListItem, Row, Select, TextField } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { useBoard, useMessages, useNavigation } from '@/components/hooks';
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

export function BoardEditForm() {
  const { board, updateBoard, saveBoard } = useBoard();
  const { t, labels } = useMessages();
  const { teamId } = useNavigation();
  const boardType = getBoardType(board, { coerceDashboard: true });
  const { entityId } = getBoardEntity(board);

  const handleNameChange = (name: string) => {
    updateBoard({ name });
  };

  const handleDescriptionChange = (description: string) => {
    updateBoard({ description });
  };

  const handleTypeChange = (type: string) => {
    updateBoard({
      type,
      parameters: setBoardEntity(board.parameters, type as BoardType),
    });
  };

  const handleEntityChange = (nextEntityId: string) => {
    updateBoard({
      parameters: setBoardEntity(board.parameters, boardType, nextEntityId),
    });
  };

  const renderEntitySelect = () => {
    if (boardType === BOARD_TYPES.website) {
      return (
        <WebsiteSelect
          websiteId={entityId}
          teamId={teamId}
          onChange={handleEntityChange}
          width="100%"
        />
      );
    }

    if (boardType === BOARD_TYPES.pixel) {
      return (
        <PixelSelect
          pixelId={entityId}
          teamId={teamId}
          placeholder={t(labels.selectPixel)}
          onChange={handleEntityChange}
          width="100%"
        />
      );
    }

    if (boardType === BOARD_TYPES.link) {
      return (
        <LinkSelect
          linkId={entityId}
          teamId={teamId}
          placeholder={t(labels.selectLink)}
          onChange={handleEntityChange}
          width="100%"
        />
      );
    }

    return null;
  };

  const entityLabel =
    boardType === BOARD_TYPES.pixel
      ? t(labels.pixel)
      : boardType === BOARD_TYPES.link
        ? t(labels.link)
        : t(labels.website);

  return (
    <Row width="100%" justifyContent="center">
      <Panel width="100%" maxWidth="600px" marginBottom="6">
        <Form
          onSubmit={saveBoard}
          values={{
            name: board?.name ?? '',
            description: board?.description ?? '',
            type: boardType,
            entityId: entityId ?? '',
          }}
        >
          <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
            <TextField
              autoComplete="off"
              autoFocus={!board?.id}
              value={board?.name ?? ''}
              placeholder={t(labels.untitled)}
              onChange={handleNameChange}
            />
          </FormField>
          <FormField name="description" label={t(labels.description)}>
            <TextField
              autoComplete="off"
              asTextArea
              resize="vertical"
              value={board?.description ?? ''}
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
              <Select value={boardType} onChange={handleTypeChange} width="100%">
                <ListItem id={BOARD_TYPES.mixed}>{t(labels.open)}</ListItem>
                <ListItem id={BOARD_TYPES.website}>{t(labels.website)}</ListItem>
                <ListItem id={BOARD_TYPES.pixel}>{t(labels.pixel)}</ListItem>
                <ListItem id={BOARD_TYPES.link}>{t(labels.link)}</ListItem>
              </Select>
            </Box>
          </FormField>
          {requiresBoardEntity(boardType) && (
            <FormField
              name="entityId"
              label={entityLabel}
              rules={{ required: t(labels.required) }}
            >
              <Box width="100%" maxWidth="360px">
                {renderEntitySelect()}
              </Box>
            </FormField>
          )}
        </Form>
      </Panel>
    </Row>
  );
}
