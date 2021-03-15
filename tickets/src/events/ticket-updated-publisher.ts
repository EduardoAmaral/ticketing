import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@eamaral/ticketing-common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
