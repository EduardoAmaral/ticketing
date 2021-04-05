import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import {
  natsWrapper,
  OrderStatus,
  PaymentCreatedEvent,
} from '@eamaral/ticketing-common';
import { PaymentCreatedListener } from '../payment-created-listener';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';

describe('Payment Created Listener', () => {
  let listener: PaymentCreatedListener;
  let msg: Message;
  let orderId: string;

  beforeEach(async () => {
    listener = new PaymentCreatedListener(natsWrapper.client);

    const ticket = await Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'Dota 2 - The International',
      price: 9000,
      version: 0,
    }).save();

    const order = await Order.build({
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      expiresAt: new Date(),
      ticket: ticket,
    }).save();
    orderId = order.id;

    // @ts-ignore
    msg = {
      ack: jest.fn(),
    };
  });

  it('updates an order status as completed', async () => {
    const data: PaymentCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      orderId: orderId,
    };

    await listener.onMessage(data, msg);

    const order = await Order.findById(orderId);

    expect(order.id).toEqual(data.orderId);
    expect(order.status).toEqual(OrderStatus.Complete);
  });

  it('acks the message', async () => {
    const data: PaymentCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      orderId: orderId,
    };

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if data version is not ordered', async () => {
    const data: PaymentCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      orderId: new mongoose.Types.ObjectId().toHexString(),
    };

    try {
      await listener.onMessage(data, msg);
    } catch (err) {
      expect(err.message).toEqual('Order not found');
    }

    expect(msg.ack).not.toHaveBeenCalled();
  });
});
