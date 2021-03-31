import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import {
  natsWrapper,
  OrderCreatedEvent,
  OrderStatus,
} from '@eamaral/ticketing-common';
import { OrderCreatedListener } from '../order-created-listener';
import { Ticket } from '../../../model/ticket';

describe('Order Created Listener', () => {
  let listener: OrderCreatedListener;
  let msg: Message;
  let ticketId: string;

  beforeEach(async () => {
    listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = await Ticket.build({
      title: 'Eddy Kim Concert',
      price: 1000,
      userId: new mongoose.Types.ObjectId().toHexString(),
    }).save();

    ticketId = ticket.id;

    // @ts-ignore
    msg = {
      ack: jest.fn(),
    };
  });

  it('updates a ticket with an orderId', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const data: OrderCreatedEvent['data'] = {
      id: orderId,
      version: 0,
      userId: new mongoose.Types.ObjectId().toHexString(),
      expiresAt: '2020-01-01',
      status: OrderStatus.Created,
      ticket: {
        id: ticketId,
        price: 1000,
      },
    };

    await listener.onMessage(data, msg);

    const result = await Ticket.findById(ticketId);

    expect(result.id).toEqual(ticketId);
    expect(result.orderId).toEqual(orderId);
  });

  it('acks the message', async () => {
    const data: OrderCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      userId: new mongoose.Types.ObjectId().toHexString(),
      expiresAt: '2020-01-01',
      status: OrderStatus.Created,
      ticket: {
        id: ticketId,
        price: 1000,
      },
    };

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
  });

  it('throws an error if ticket does not exist', async () => {
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

    try {
      await listener.onMessage(data, msg);
    } catch (err) {
      expect(err.message).toEqual('Ticket not found');
    }

    expect(msg.ack).not.toHaveBeenCalled();
  });
});
