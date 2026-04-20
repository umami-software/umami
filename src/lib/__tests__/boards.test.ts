import {
  BOARD_ENTITY_TYPES,
  isBoardComponentSupported,
} from '../boards';
import {
  BOARD_COMPONENT_COMPATIBILITY_MATRIX,
  getSupportedBoardComponentEntityTypes,
} from '../boardComponentCompatibility';

test('isBoardComponentSupported allows events chart on website boards', () => {
  expect(isBoardComponentSupported('EventsChart', BOARD_ENTITY_TYPES.website)).toBe(true);
});

test('isBoardComponentSupported rejects events chart on pixel and link boards', () => {
  expect(isBoardComponentSupported('EventsChart', BOARD_ENTITY_TYPES.pixel)).toBe(false);
  expect(isBoardComponentSupported('EventsChart', BOARD_ENTITY_TYPES.link)).toBe(false);
});

test('board component compatibility matrix defines website-only components explicitly', () => {
  expect(BOARD_COMPONENT_COMPATIBILITY_MATRIX.EventsChart).toEqual([BOARD_ENTITY_TYPES.website]);
  expect(getSupportedBoardComponentEntityTypes('EventsChart')).toEqual([
    BOARD_ENTITY_TYPES.website,
  ]);
});

test('isBoardComponentSupported leaves other components available for all board entities', () => {
  expect(isBoardComponentSupported('WebsiteChart', BOARD_ENTITY_TYPES.pixel)).toBe(true);
  expect(isBoardComponentSupported('TextBlock', BOARD_ENTITY_TYPES.link)).toBe(true);
});
