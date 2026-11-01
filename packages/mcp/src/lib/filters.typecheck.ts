import type { Filters } from './filters';

// @ts-expect-error unknown filter keys are not part of Filters
const _unknownFilterKey: Filters = { notARealFilter: 'x' };

// @ts-expect-error match is only "all" or "any"
const _invalidMatch: Filters = { match: 'foo' };
