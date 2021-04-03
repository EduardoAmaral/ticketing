import {
  Listener,
  Subjects,
  OrderExpiredEvent,
  natsWrapper,
} from '@eamaral/ticketing-common';
import { Message } from 'node-nats-streaming';
import { Order, OrderStatus } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { orderServiceQueueGroupName } from './queue-group-name';

export class OrderExpiredListener extends Listener<OrderExpiredEvent> {
  subject: Subjects.OrderExpired = Subjects.OrderExpired;
  queueGroupName = orderServiceQueueGroupName;

  async onMessage(data: OrderExpiredEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
