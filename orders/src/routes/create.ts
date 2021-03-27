import { requireAuth, validateRequest } from '@eamaral/ticketing-common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { natsWrapper } from '@eamaral/ticketing-common';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [body('ticketId').not().isEmpty().withMessage('Ticket must be provided')],
  validateRequest,
  async (req: Request, res: Response) => {
    res.status(201).send({});
  }
);

export { router as createTicketRouter };
