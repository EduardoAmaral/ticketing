import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  BusinessValidationError,
  ForbiddenError,
  natsWrapper,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@eamaral/ticketing-common';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title must be provided'),
    body('price')
      .isInt({ gt: 0 })
      .withMessage('Price should be numeric and greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new ForbiddenError();
    }

    if (ticket.orderId) {
      throw new BusinessValidationError('Cannot update a reserved ticket');
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
