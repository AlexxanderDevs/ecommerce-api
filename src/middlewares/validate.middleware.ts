import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

type ValidatedRequestData = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      res.status(400).json({
        ok: false,
        message: 'Datos inválidos.',
        errors: result.error.flatten()
      });
      return;
    }

    const data = result.data as ValidatedRequestData;

    if (data.body) {
      req.body = data.body;
    }

    if (data.params) {
      req.params = data.params as Request['params'];
    }

    if (data.query) {
      req.query = data.query as Request['query'];
    }

    next();
  };
}