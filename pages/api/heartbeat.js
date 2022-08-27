import { redis } from 'lib/redis';
import { ok } from 'lib/response';

export default async (req, res) => {
  console.log('------------------------------------------------------------------------------');
  // const redis = new createClient({
  //   url: process.env.REDIS_URL,
  // });

  //console.log(redis.get);

  const value = await redis.get('session:77c0b9de-677a-5268-8543-6018f0776a81');
  console.log('complete');

  return ok(res, value);
};
