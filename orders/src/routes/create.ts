import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { add } from 'date-fns';

import { Ticket } from '../model/ticket';
import {
  BusinessValidationError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@eamaral/ticketing-common';
import { Order, OrderStatus } from '../model/order';

const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .withMessage('TicketId must be provided')
      .custom((id: string) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('TicketId invalid'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError('TicketId provided does not exist');
    }

    const isTicketReserved = await ticket.isReserved();

    if (isTicketReserved) {
      throw new BusinessValidationError('Ticket is already reserved');
    }

    const expiration = add(new Date(), {
      minutes: Number(process.env.ORDER_EXPIRATION_IN_MINUTES),
    });

    const order = Order.build({
      status: OrderStatus.Created,
      userId: req.currentUser!.id,
      expiresAt: expiration,
      ticket: ticket,
    });

    await order.save();

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
