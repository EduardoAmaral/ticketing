import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { natsWrapper, TicketCreatedEvent } from '@eamaral/ticketing-common';
import { TicketCreatedListener } from '../ticket-created-listener';
import { Ticket } from '../../../model/ticket';

describe('Ticket Created Listener', () => {
  let listener: TicketCreatedListener;
  let msg: Message;

  beforeEach(async () => {
    listener = new TicketCreatedListener(natsWrapper.client);

    // @ts-ignore
    msg = {
      ack: jest.fn(),
    };
  });

  it('creates a ticket', async () => {
    const data: TicketCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'Roy Kim Concert',
      price: 9900,
      userId: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
    };

    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(data.id);

    expect(ticket.id).toEqual(data.id);
    expect(ticket.title).toEqual(data.title);
    expect(ticket.price).toEqual(data.price);
    expect(ticket.version).toEqual(data.version);
  });

  it('acks the message', async () => {
    const data: TicketCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'Roy Kim Concert',
      price: 9900,
      userId: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
    };

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
  });
});
