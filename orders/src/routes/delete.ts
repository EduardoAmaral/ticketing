import { requireAuth, validateRequest } from '@eamaral/ticketing-common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    res.status(201).send({});
  }
);

export { router as createOrderRouter };
