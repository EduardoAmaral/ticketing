import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@eamaral/ticketing-common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
