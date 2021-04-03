import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import {
  natsWrapper,
  OrderCreatedEvent,
  OrderStatus,
} from '@eamaral/ticketing-common';
import { OrderCreatedListener } from '../order-created-listener';
import { Order } from '../../../models/order';

describe('Order Created Listener', () => {
  let listener: OrderCreatedListener;
  let msg: Message;

  beforeEach(async () => {
    listener = new OrderCreatedListener(natsWrapper.client);

    // @ts-ignore
    msg = {
      ack: jest.fn(),
    };
  });

  it('replicates an order', async () => {
    const data: OrderCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      userId: new mongoose.Types.ObjectId().toHexString(),
      expiresAt: '2020-01-01',
      status: OrderStatus.Created,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 1000,
      },
    };

    await listener.onMessage(data, msg);

    const result = await Order.findById(data.id);

    expect(result.id).toEqual(data.id);
    expect(result.version).toEqual(data.version);
    expect(result.userId).toEqual(data.userId);
    expect(result.status).toEqual(data.status);
    expect(result.price).toEqual(data.ticket.price);
  });

  it('acks the message', async () => {
    const data: OrderCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      userId: new mongoose.Types.ObjectId().toHexString(),
      expiresAt: '2020-01-01',
      status: OrderStatus.Created,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 1000,
      },
    };

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
  });
});
