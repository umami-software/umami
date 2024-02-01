import { uuid } from 'lib/crypto';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok } from 'next-basics';
import { createReport, getReports } from 'queries';
import * as yup from 'yup';

export interface ReportRequestBody {
  websiteId: string;
  name: string;
  type: string;
  description: string;
  parameters: {
    [key: string]: any;
  };
}

const schema = {
  GET: yup.object().shape({
    ...pageInfo,
  }),
  POST: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    name: yup.string().max(200).required(),
    type: yup
      .string()
      .matches(/funnel|insights|retention/i)
      .required(),
    description: yup.string().max(500),
    parameters: yup
      .object()
      .test('len', 'Must not exceed 6000 characters.', val => JSON.stringify(val).length < 6000),
  }),
};

export default async (
  req: NextApiRequestQueryBody<any, ReportRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    const { page, query, pageSize, websiteId, teamId } = req.query;
    const filters = {
      page,
      pageSize: +pageSize || undefined,
      query,
    };

    const data = await getReports(
      {
        where: {
          website: {
            id: websiteId,
            userId: !websiteId && !teamId ? userId : undefined,
            teamId,
          },
        },
        include: {
          website: {
            select: {
              domain: true,
            },
          },
        },
      },
      filters,
    );

    return ok(res, data);
  }

  if (req.method === 'POST') {
    const { websiteId, type, name, description, parameters } = req.body;

    const result = await createReport({
      id: uuid(),
      userId,
      websiteId,
      type,
      name,
      description,
      parameters: JSON.stringify(parameters),
    } as any);

    return ok(res, result);
  }

  return methodNotAllowed(res);
};
