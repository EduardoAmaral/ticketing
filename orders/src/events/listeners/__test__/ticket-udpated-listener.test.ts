import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { natsWrapper, TicketUpdatedEvent } from '@eamaral/ticketing-common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { Ticket } from '../../../model/ticket';

describe('Ticket Updated Listener', () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  let listener: TicketUpdatedListener;
  let msg: Message;

  beforeEach(async () => {
    await Ticket.build({
      id: ticketId,
      title: 'BotherSu Concert',
      price: 9000,
      version: 0,
    }).save();

    listener = new TicketUpdatedListener(natsWrapper.client);

    // @ts-ignore
    msg = {
      ack: jest.fn(),
    };
  });

  it('updates a ticket', async () => {
    const data: TicketUpdatedEvent['data'] = {
      id: ticketId,
      title: 'Roy Kim Concert',
      price: 12000,
      userId: new mongoose.Types.ObjectId().toHexString(),
      version: 1,
    };

    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(data.id);

    expect(ticket.id).toEqual(data.id);
    expect(ticket.title).toEqual(data.title);
    expect(ticket.price).toEqual(data.price);
    expect(ticket.version).toEqual(data.version);
  });

  it('acks the message', async () => {
    const data: TicketUpdatedEvent['data'] = {
      id: ticketId,
      title: 'Roy Kim Concert',
      price: 7000,
      userId: new mongoose.Types.ObjectId().toHexString(),
      version: 1,
    };

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if data version is not ordered', async () => {
    const data: TicketUpdatedEvent['data'] = {
      id: ticketId,
      title: 'Roy Kim Concert',
      price: 7000,
      userId: new mongoose.Types.ObjectId().toHexString(),
      version: 9999,
    };

    try {
      await listener.onMessage(data, msg);
    } catch (err) {
      expect(err.message).toEqual('Ticket not found');
    }

    expect(msg.ack).not.toHaveBeenCalled();
  });
});
