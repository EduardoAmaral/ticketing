import {
  BadRequestError,
  ForbiddenError,
  natsWrapper,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from '@eamaral/ticketing-common';
import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { Order } from '../model/order';
import { OrderCancelledPublisher } from '../events/order-cancelled-publisher';

const router = express.Router();

router.patch(
  '/api/orders/:orderId/cancel',
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

    if (order.userId != req.currentUser!.id) {
      throw new ForbiddenError(
        'User does not have permission to perform this action'
      );
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(200).send(order);
  }
);

export { router as cancelOrderRouter };
