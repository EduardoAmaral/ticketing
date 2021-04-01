import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import {
  natsWrapper,
  OrderExpiredEvent,
  OrderStatus,
} from '@eamaral/ticketing-common';
import { OrderExpiredListener } from '../order-expired-listener';
import { Ticket } from '../../../model/ticket';
import { Order } from '../../../model/order';

describe('Ticket Updated Listener', () => {
  let listener: OrderExpiredListener;
  let msg: Message;
  let orderId: string;

  beforeEach(async () => {
    (natsWrapper.client.publish as jest.Mock).mockReset();
    listener = new OrderExpiredListener(natsWrapper.client);

    // @ts-ignore
    msg = {
      ack: jest.fn(),
    };

    const ticket = await Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 1000,
      title: 'Ragnarok The Animation',
      version: 0,
    }).save();

    const order = await Order.build({
      status: OrderStatus.Created,
      userId: new mongoose.Types.ObjectId().toHexString(),
      ticket: ticket,
    }).save();
    orderId = order.id;
  });

  it('cancels an order', async () => {
    const data: OrderExpiredEvent['data'] = {
      orderId,
    };

    await listener.onMessage(data, msg);

    const result = await Order.findById(orderId);

    expect(result.id).toEqual(orderId);
    expect(result.status).toEqual(OrderStatus.Cancelled);
  });

  it('acks the message', async () => {
    const data: OrderExpiredEvent['data'] = {
      orderId,
    };

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if order does not exist', async () => {
    const data: OrderExpiredEvent['data'] = {
      orderId: new mongoose.Types.ObjectId().toHexString(),
    };

    try {
      await listener.onMessage(data, msg);
    } catch (err) {
      expect(err.message).toEqual('Order not found');
    }

    expect(msg.ack).not.toHaveBeenCalled();
  });

  it('emits an OrderCancelled event', async () => {
    const data: OrderExpiredEvent['data'] = {
      orderId,
    };

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
  });

  it('does not cancel completed orders', async () => {
    const ticket = await Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 1000,
      title: 'Ragnarok The Animation',
      version: 0,
    }).save();

    const order = await Order.build({
      status: OrderStatus.Complete,
      userId: new mongoose.Types.ObjectId().toHexString(),
      ticket: ticket,
    }).save();

    const data: OrderExpiredEvent['data'] = {
      orderId: order.id,
    };

    await listener.onMessage(data, msg);

    const result = await Order.findById(order.id);

    expect(result.status).toEqual(OrderStatus.Complete);
    expect(msg.ack).toHaveBeenCalledTimes(1);
    expect(natsWrapper.client.publish).not.toHaveBeenCalled();
  });
});
