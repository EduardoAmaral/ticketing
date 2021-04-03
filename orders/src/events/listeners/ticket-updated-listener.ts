import {
  Listener,
  Subjects,
  TicketUpdatedEvent,
} from '@eamaral/ticketing-common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { orderServiceQueueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = orderServiceQueueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findPreviousVersion({
      id: data.id,
      version: data.version,
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({
      title: data.title,
      price: data.price,
      version: data.version,
    });
    await ticket.save();

    msg.ack();
  }
}
