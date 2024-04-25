import * as yup from 'yup';

export const dateRange = {
  startAt: yup.number().integer().required(),
  endAt: yup.number().integer().min(yup.ref('startAt')).required(),
};

export const pageInfo = {
  query: yup.string(),
  page: yup.number().integer().positive(),
  pageSize: yup.number().integer().positive().min(1).max(200),
  orderBy: yup.string(),
};
