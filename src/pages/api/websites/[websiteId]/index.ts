import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, serverError, unauthorized } from 'next-basics';
import { Website, NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite, canUpdateWebsite, canDeleteWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { deleteWebsite, getWebsite, updateWebsite } from 'queries';
import { SHARE_ID_REGEX } from 'lib/constants';

export interface WebsiteRequestQuery {
  websiteId: string;
}

export interface WebsiteRequestBody {
  name: string;
  domain: string;
  shareId: string;
}

import * as yup from 'yup';

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
  }),
  POST: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    name: yup.string(),
    domain: yup.string(),
    shareId: yup.string().matches(SHARE_ID_REGEX, { excludeEmptyString: true }).nullable(),
  }),
  DELETE: yup.object().shape({
    websiteId: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WebsiteRequestQuery, WebsiteRequestBody>,
  res: NextApiResponse<Website>,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { websiteId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const website = await getWebsite(websiteId);

    return ok(res, website);
  }

  if (req.method === 'POST') {
    if (!(await canUpdateWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const { name, domain, shareId } = req.body;

    try {
      const website = await updateWebsite(websiteId, { name, domain, shareId });

      return ok(res, website);
    } catch (e: any) {
      if (e.message.includes('Unique constraint') && e.message.includes('share_id')) {
        return serverError(res, 'That share ID is already taken.');
      }

      return serverError(res, e);
    }
  }

  if (req.method === 'DELETE') {
    if (!(await canDeleteWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    await deleteWebsite(websiteId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
