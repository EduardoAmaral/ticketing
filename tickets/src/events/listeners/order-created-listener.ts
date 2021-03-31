import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@eamaral/ticketing-common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../model/ticket';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = 'tickets-service';

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ orderId: data.id });
    await ticket.save();

    msg.ack();
  }
}
