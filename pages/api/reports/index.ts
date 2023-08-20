import { uuid } from 'lib/crypto';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, ReportSearchFilterType, SearchFilter } from 'lib/types';
import { getFilterValidation } from 'lib/yup';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok } from 'next-basics';
import { createReport, getReportsByUserId } from 'queries';
import * as yup from 'yup';

export interface ReportsRequestQuery extends SearchFilter<ReportSearchFilterType> {}

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
    ...getFilterValidation(/All|Name|Description|Type|Username|Website Name|Website Domain/i),
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

  req.yup = schema;
  await useValidate(req, res);

  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    const { page, filter, pageSize } = req.query;

    const data = await getReportsByUserId(userId, {
      page,
      filter,
      pageSize: +pageSize || null,
      includeTeams: true,
    });

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
