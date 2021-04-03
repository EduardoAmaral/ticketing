import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import {
  natsWrapper,
  OrderCancelledEvent,
  OrderStatus,
} from '@eamaral/ticketing-common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';

describe('Order Created Listener', () => {
  let listener: OrderCancelledListener;
  let msg: Message;

  beforeEach(async () => {
    listener = new OrderCancelledListener(natsWrapper.client);

    // @ts-ignore
    msg = {
      ack: jest.fn(),
    };
  });

  it('cancels an order', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    await Order.build({
      id: orderId,
      version: 0,
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      price: 1000,
    }).save();

    const data: OrderCancelledEvent['data'] = {
      id: orderId,
      version: 1,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
      },
    };

    await listener.onMessage(data, msg);

    const result = await Order.findById(data.id);

    expect(result.id).toEqual(data.id);
    expect(result.version).toEqual(data.version);
    expect(result.status).toEqual(OrderStatus.Cancelled);
  });

  it('acks the message', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    await Order.build({
      id: orderId,
      version: 0,
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      price: 1000,
    }).save();

    const data: OrderCancelledEvent['data'] = {
      id: orderId,
      version: 1,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
      },
    };

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
  });

  it('throws an error if order is not found', async () => {
    const data: OrderCancelledEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 1,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
      },
    };

    try {
      await listener.onMessage(data, msg);
    } catch (err) {
      expect(err.message).toEqual('Order not found');
    }

    expect(msg.ack).not.toHaveBeenCalled();
  });

  it('throws an error if data is not sorted by version', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    await Order.build({
      id: orderId,
      version: 0,
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      price: 1000,
    }).save();

    const data: OrderCancelledEvent['data'] = {
      id: orderId,
      version: 2,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
      },
    };

    try {
      await listener.onMessage(data, msg);
    } catch (err) {
      expect(err.message).toEqual('Order not found');
    }

    expect(msg.ack).not.toHaveBeenCalled();
  });
});
