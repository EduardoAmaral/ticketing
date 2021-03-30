import { requireAuth, validateRequest } from '@eamaral/ticketing-common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { TicketCreatedPublisher } from '../events/ticket-created-publisher';
import { Ticket } from '../model/ticket';
import { natsWrapper } from '@eamaral/ticketing-common';

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
    new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
