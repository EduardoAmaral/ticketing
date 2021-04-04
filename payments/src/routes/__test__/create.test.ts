import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import { getFakeSession } from '../../test/fake-session';
import { Order, OrderStatus } from '../../models/order';
import { stripe } from '../../stripe';

describe('Create Route', () => {
  it('requires authentication', async () => {
    const response = await request(app).post('/api/payments').send({});

    expect(response.status).toEqual(401);
  });

  it('requires a token to purchase a ticket', async () => {
    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', getFakeSession())
      .send({});

    expect(response.status).toEqual(400);
    expect(response.body[0].field).toEqual('token');
    expect(response.body[0].message).toEqual('Token must be provided');
  });

  it('requires an orderId to purchase a ticket', async () => {
    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', getFakeSession())
      .send({
        token: 'A',
      });

    expect(response.status).toEqual(400);
    expect(response.body[0].field).toEqual('orderId');
    expect(response.body[0].message).toEqual('Order must be provided');
  });

  it('requires an order to exist', async () => {
    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', getFakeSession())
      .send({
        token: 'A',
        orderId: new mongoose.Types.ObjectId().toHexString(),
      });

    expect(response.status).toEqual(404);
    expect(response.body[0].message).toEqual('Order not found');
  });

  it('forbidden a user to charge another user order', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();

    await Order.build({
      id: orderId,
      price: 1000,
      userId: 'another-user-id',
      version: 0,
      status: OrderStatus.Created,
    }).save();

    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', getFakeSession(userId))
      .send({
        token: 'A',
        orderId: orderId,
      });

    expect(response.status).toEqual(403);
  });

  it('fails if an order is cancelled', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();

    await Order.build({
      id: orderId,
      price: 1000,
      userId: userId,
      version: 1,
      status: OrderStatus.Cancelled,
    }).save();

    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', getFakeSession(userId))
      .send({
        token: 'A',
        orderId: orderId,
      });

    expect(response.status).toEqual(422);
    expect(response.body[0].message).toEqual(
      'Cannot purchase a cancelled order'
    );
  });

  it('purchases a ticket sucessfuly', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = await Order.build({
      id: orderId,
      price: 1000,
      userId: userId,
      version: 1,
      status: OrderStatus.Created,
    }).save();

    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', getFakeSession(userId))
      .send({
        token: 'tok_visa',
        orderId: orderId,
      });

    expect(response.status).toEqual(201);

    const charge = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(charge.amount).toEqual(order.price);
    expect(charge.currency).toEqual('usd');
    expect(charge.source).toEqual('tok_visa');
  });
});
