import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  requireAuth,
} from '@eamaral/ticketing-common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import mongoose from 'mongoose';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new BadRequestError('Invalid OrderId');
    }

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError('Order does not exist');
    }

    if (req.currentUser!.id != order.userId) {
      throw new ForbiddenError("You don't have access to this order");
    }

    res.status(200).send(order);
  }
);

export { router as showOrderRouter };
