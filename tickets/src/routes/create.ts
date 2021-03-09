import { requireAuth, validateRequest } from '@eamaral/ticketing-common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../model/ticket';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title must be provided'),
    body('price')
      .isInt({ gt: 0 })
      .withMessage('Price should be numeric and greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });

    await ticket.save();

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
