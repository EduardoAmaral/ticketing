import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import { getFakeSession } from '../../test/fake-session';
import { Ticket } from '../../model/ticket';
import { Order, OrderStatus } from '../../model/order';

const ROUTE = '/api/orders';

describe('Show Order Route', () => {
  it('returns 401 if the user is NOT signed in', async () => {
    const response = await request(app).get(ROUTE).send({});

    expect(response.status).toEqual(401);
  });

  it('should return 404 if order does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    const response = await request(app)
      .get(`${ROUTE}/${id}`)
      .set('Cookie', getFakeSession())
      .send();

    expect(response.status).toEqual(404);
    expect(response.body[0].message).toEqual('Order does not exist');
  });

  it('should return 400 for invalid ids', async () => {
    const response = await request(app)
      .get(`${ROUTE}/1`)
      .set('Cookie', getFakeSession())
      .send();

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual('OrderId invalid');
  });

  it('should return 403 if order does not belong to current user', async () => {
    const currentUserId = new mongoose.Types.ObjectId().toHexString();
    const anotherUserId = new mongoose.Types.ObjectId().toHexString();

    const royKimTicket = await Ticket.build({
      price: 5000,
      title: 'Roy Kim Concert',
    }).save();

    const royKimOrder = await Order.build({
      userId: anotherUserId,
      status: OrderStatus.AwaitingPayment,
      ticket: royKimTicket,
    }).save();

    const response = await request(app)
      .get(`${ROUTE}/${royKimOrder.id}`)
      .set('Cookie', getFakeSession(currentUserId))
      .send();

    expect(response.status).toEqual(403);
  });

  it('should retrieve an order', async () => {
    const currentUserId = new mongoose.Types.ObjectId().toHexString();
    const now = new Date();
    const aimerTicket = await Ticket.build({
      price: 1000,
      title: 'Aimer Concert',
    }).save();

    const aimerOrder = await Order.build({
      userId: currentUserId,
      expiresAt: now,
      status: OrderStatus.Created,
      ticket: aimerTicket,
    }).save();

    const response = await request(app)
      .get(`${ROUTE}/${aimerOrder.id}`)
      .set('Cookie', getFakeSession(currentUserId))
      .send();

    expect(response.status).toEqual(200);
    expect(response.body.expiresAt).toEqual(now.toISOString());
    expect(response.body.id).toEqual(aimerOrder.id);
    expect(response.body.userId).toEqual(currentUserId);
    expect(response.body.status).toEqual(OrderStatus.Created);
    expect(response.body.ticket.id).toEqual(aimerTicket.id);
    expect(response.body.ticket.title).toEqual(aimerTicket.title);
    expect(response.body.ticket.price).toEqual(aimerTicket.price);
  });
});
