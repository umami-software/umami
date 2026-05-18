# Test Convention

Use Vitest for unit and component tests. Cypress remains the end-to-end test runner.

- Place tests next to the code they cover as `*.test.ts` or `*.test.tsx`.
- Import Vitest APIs explicitly: `import { describe, expect, test, vi } from 'vitest';`.
- Use `test`, not `it`.
- React component tests should import from `@/test/render`.
- Prefer accessible Testing Library queries such as `getByRole`, `getByLabelText`, and `getByText`.
- Use `getByTestId` only when there is no useful accessible query. The test id attribute is `data-test`.
- Keep test doubles in the test file unless they are shared framework concerns, such as Next navigation.
