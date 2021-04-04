import {
  BusinessValidationError,
  ForbiddenError,
  natsWrapper,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@eamaral/ticketing-common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { stripe } from '../stripe';

const router = express.Router();

router.post(
  '/api/payments',
  [
    body('token').not().isEmpty().withMessage('Token must be provided'),
    body('orderId').not().isEmpty().withMessage('Order must be provided'),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.userId != req.currentUser!.id) {
      throw new ForbiddenError('Order must be from the same user');
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BusinessValidationError('Cannot purchase a cancelled order');
    }

    const charge = await stripe.charges.create({
      amount: order.price,
      currency: 'usd',
      source: token,
    });

    const payment = await Payment.build({
      orderId: order.id,
      stripeId: charge.id,
    });

    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
    });

    res.status(201).send({});
  }
);

export { router as createPaymentRouter };
