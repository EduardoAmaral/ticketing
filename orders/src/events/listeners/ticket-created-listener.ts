import {
  Listener,
  Subjects,
  TicketCreatedEvent,
} from '@eamaral/ticketing-common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { orderServiceQueueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = orderServiceQueueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const ticket = Ticket.build({
      id: data.id,
      title: data.title,
      price: data.price,
      version: data.version,
    });

    await ticket.save();

    msg.ack();
  }
}
