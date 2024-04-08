import { Request, Response } from 'express';

export default (fn: any) => {
  return (req: Request, res: Response, next: any) => {
    fn(req, res, next).catch(next);
  };
};
