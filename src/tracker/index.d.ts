import type { UmamiTracker } from '../../packages/tracker/src/types';

export type {
  TrackedProperties,
  WithRequired,
  EventData,
  EventProperties,
  PageViewProperties,
  CustomEventFunction,
  TrackerConfig,
  UmamiTracker,
} from '../../packages/tracker/src/types';

declare global {
  interface Window {
    umami: {
      track: UmamiTracker['track'];
      identify: UmamiTracker['identify'];
    };
  }
}
