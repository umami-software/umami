import { NextApiRequest } from 'next';
import { Auth } from './auth';

export interface NextApiRequestQueryBody<TQuery, TBody> extends NextApiRequest {
  auth: Auth;
  query: TQuery;
  body: TBody;
}

export interface NextApiRequestQuery<TQuery> extends NextApiRequest {
  auth: Auth;
  query: TQuery;
}

export interface NextApiRequestBody<TBody> extends NextApiRequest {
  auth: Auth;
  body: TBody;
}

export interface ObjectAny {
  [key: string]: any;
}
