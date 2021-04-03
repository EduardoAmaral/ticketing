import mongoose from 'mongoose';
import { Order, OrderStatus } from '../order';
import { Ticket } from '../ticket';

describe('Order Model', () => {
  it('should increment the version for each save operation', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 1000,
      title: 'BrotherSu Concert',
      version: 0,
    });

    const order = Order.build({
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      ticket: ticket
    });

    await order.save();
    expect(order.version).toEqual(0);

    await order.save();
    expect(order.version).toEqual(1);

    await order.save();
    expect(order.version).toEqual(2);
  });

  it('should fail if version updated is not the current one', async (done) => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 1000,
      title: 'BrotherSu Concert',
      version: 0,
    });

    const order = Order.build({
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      ticket: ticket
    });

    await order.save();

    const firstInstance = await Order.findById(order.id);
    const secondInstance = await Order.findById(order.id);

    firstInstance.set({ price: 2000 });
    secondInstance.set({ price: 5000 });

    await firstInstance.save();

    try {
      await secondInstance.save();
    } catch (err) {
      return done();
    }

    throw new Error('Should not reach this point');
  });
});
