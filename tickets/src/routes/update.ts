import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  ForbiddenError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@eamaral/ticketing-common';
import { Ticket } from '../model/ticket';

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

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await ticket.save();
    res.send(ticket);
  }
);

export { router as updateTicketRouter };
