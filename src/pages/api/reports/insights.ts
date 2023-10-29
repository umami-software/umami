import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getInsights } from 'queries';
import * as yup from 'yup';

export interface InsightsRequestBody {
  websiteId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  fields: { name: string; type: string; label: string }[];
  filters: { name: string; type: string; filter: string; value: string }[];
  groups: { name: string; type: string }[];
}

const schema = {
  POST: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    dateRange: yup
      .object()
      .shape({
        startDate: yup.date().required(),
        endDate: yup.date().required(),
      })
      .required(),
    fields: yup
      .array()
      .of(
        yup.object().shape({
          name: yup.string().required(),
          type: yup.string().required(),
          label: yup.string().required(),
        }),
      )
      .min(1)
      .required(),
    filters: yup.array().of(
      yup.object().shape({
        name: yup.string().required(),
        type: yup.string().required(),
        filter: yup.string().required(),
        value: yup.string().required(),
      }),
    ),
    groups: yup.array().of(
      yup.object().shape({
        name: yup.string().required(),
        type: yup.string().required(),
      }),
    ),
  }),
};

function convertFilters(filters) {
  return filters.reduce((obj, { name, ...value }) => {
    obj[name] = value;

    return obj;
  }, {});
}

export default async (
  req: NextApiRequestQueryBody<any, InsightsRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'POST') {
    const {
      websiteId,
      dateRange: { startDate, endDate },
      fields,
      filters,
    } = req.body;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getInsights(websiteId, fields, {
      ...convertFilters(filters),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
