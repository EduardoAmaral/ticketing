import {
  OrderExpiredEvent,
  Publisher,
  Subjects,
} from '@eamaral/ticketing-common';

export class OrderExpiredPublisher extends Publisher<OrderExpiredEvent> {
  subject: Subjects.OrderExpired = Subjects.OrderExpired;
}
