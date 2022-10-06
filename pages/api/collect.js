import { forbidden } from 'next-basics';

export default async (req, res) => {
  return forbidden(res);
};
