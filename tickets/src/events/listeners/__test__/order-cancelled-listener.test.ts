import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import {
  natsWrapper,
  OrderCancelledEvent,
  OrderStatus,
} from '@eamaral/ticketing-common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Ticket } from '../../../model/ticket';

describe('Order Cancelled Listener', () => {
  let listener: OrderCancelledListener;
  let msg: Message;
  let ticketId: string;

  beforeEach(async () => {
    listener = new OrderCancelledListener(natsWrapper.client);

    const ticket = await Ticket.build({
      title: 'Eddy Kim Concert',
      price: 1000,
      userId: new mongoose.Types.ObjectId().toHexString(),
      orderId: new mongoose.Types.ObjectId().toHexString(),
    }).save();

    ticketId = ticket.id;

    // @ts-ignore
    msg = {
      ack: jest.fn(),
    };
  });

  it('cleans orderId from a ticket', async () => {
    const data: OrderCancelledEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      ticket: {
        id: ticketId,
      },
    };

    await listener.onMessage(data, msg);

    const result = await Ticket.findById(ticketId);

    expect(result.id).toEqual(ticketId);
    expect(result.orderId).toBeUndefined;
  });

  it('acks the message', async () => {
    const data: OrderCancelledEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      ticket: {
        id: ticketId,
      },
    };

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
  });

  it('throws an error if ticket does not exist', async () => {
    const data: OrderCancelledEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
      },
    };

    try {
      await listener.onMessage(data, msg);
    } catch (err) {
      expect(err.message).toEqual('Ticket not found');
    }

    expect(msg.ack).not.toHaveBeenCalled();
  });

  it('emits a ticket updated event', async () => {
    const data: OrderCancelledEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      ticket: {
        id: ticketId,
      },
    };

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
