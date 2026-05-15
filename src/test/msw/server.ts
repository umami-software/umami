import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
export { HttpResponse, http } from 'msw';
