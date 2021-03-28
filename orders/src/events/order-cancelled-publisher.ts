import {
  Publisher,
  Subjects,
  OrderCancelledEvent,
} from '@eamaral/ticketing-common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
