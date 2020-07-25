import cors from 'cors';

export function use(middleware) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, result => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}

export const useCors = use(cors());
