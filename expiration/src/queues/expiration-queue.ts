import { natsWrapper } from '@eamaral/ticketing-common';
import Queue from 'bull';
import { OrderExpiredPublisher } from '../events/publishers/order-expired-publisher';

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  new OrderExpiredPublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
