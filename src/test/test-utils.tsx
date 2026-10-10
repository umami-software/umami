import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  return render(ui, options);
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { customRender as render };
