import { NextApiRequest } from 'next';
import { Auth } from './auth';

export interface NextApiRequestQueryBody<TQuery = any, TBody = any> extends NextApiRequest {
  auth?: Auth;
  query: TQuery & { [key: string]: string | string[] };
  body: TBody;
  headers: any;
}

export interface NextApiRequestAuth extends NextApiRequest {
  auth?: Auth;
  headers: any;
}
