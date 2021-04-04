import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from '@eamaral/ticketing-common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
