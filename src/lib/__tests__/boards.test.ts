import {
  BOARD_ENTITY_TYPES,
  isBoardComponentSupported,
} from '../boards';

test('isBoardComponentSupported allows events chart on website boards', () => {
  expect(isBoardComponentSupported('EventsChart', BOARD_ENTITY_TYPES.website)).toBe(true);
});

test('isBoardComponentSupported rejects events chart on pixel and link boards', () => {
  expect(isBoardComponentSupported('EventsChart', BOARD_ENTITY_TYPES.pixel)).toBe(false);
  expect(isBoardComponentSupported('EventsChart', BOARD_ENTITY_TYPES.link)).toBe(false);
});

test('isBoardComponentSupported leaves other components available for all board entities', () => {
  expect(isBoardComponentSupported('WebsiteChart', BOARD_ENTITY_TYPES.pixel)).toBe(true);
  expect(isBoardComponentSupported('TextBlock', BOARD_ENTITY_TYPES.link)).toBe(true);
});
