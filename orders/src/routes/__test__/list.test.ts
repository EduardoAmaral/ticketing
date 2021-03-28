import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import { getFakeSession } from '../../test/fake-session';
import { Ticket } from '../../model/ticket';
import { Order, OrderStatus } from '../../model/order';

const ROUTE = '/api/orders';

describe('List Order Route', () => {
  it('returns 401 if the user is NOT signed in', async () => {
    const response = await request(app).get(ROUTE).send({});

    expect(response.status).toEqual(401);
  });

  it('should return empty if user does not have any order', async () => {
    const response = await request(app)
      .get(ROUTE)
      .set('Cookie', getFakeSession())
      .send();

    expect(response.status).toEqual(200);
    expect(response.body).toHaveLength(0);
  });

  it('should retrieve all orders of a user', async () => {
    const currentUserId = new mongoose.Types.ObjectId().toHexString();
    const now = new Date();
    const aimerTicket = await Ticket.build({
      price: 1000,
      title: 'Aimer Concert',
    }).save();

    const royKimTicket = await Ticket.build({
      price: 5000,
      title: 'Roy Kim Concert',
    }).save();

    const aimerOrder = await Order.build({
      userId: currentUserId,
      expiresAt: now,
      status: OrderStatus.Created,
      ticket: aimerTicket,
    }).save();

    const royKimOrder = await Order.build({
      userId: currentUserId,
      status: OrderStatus.AwaitingPayment,
      ticket: royKimTicket,
    }).save();

    const response = await request(app)
      .get(ROUTE)
      .set('Cookie', getFakeSession(currentUserId))
      .send();

    expect(response.status).toEqual(200);
    expect(response.body).toHaveLength(2);
    expect(response.body).toContainEqual({
      expiresAt: now.toISOString(),
      id: aimerOrder.id,
      userId: currentUserId,
      status: OrderStatus.Created,
      ticket: {
        id: aimerTicket.id,
        title: aimerTicket.title,
        price: aimerTicket.price,
      },
    });

    expect(response.body).toContainEqual({
      id: royKimOrder.id,
      userId: currentUserId,
      status: OrderStatus.AwaitingPayment,
      ticket: {
        id: royKimTicket.id,
        title: royKimTicket.title,
        price: royKimTicket.price,
      },
    });
  });

  it('should not get other users orders', async () => {
    const currentUserId = new mongoose.Types.ObjectId().toHexString();
    const anotherUserId = new mongoose.Types.ObjectId().toHexString();
    const now = new Date();
    const huhGakTicket = await Ticket.build({
      price: 1500,
      title: 'HuhGak Concert',
    }).save();

    const royKimTicket = await Ticket.build({
      price: 5000,
      title: 'LiSA Concert',
    }).save();

    const aimerOrder = await Order.build({
      userId: currentUserId,
      expiresAt: now,
      status: OrderStatus.Created,
      ticket: huhGakTicket,
    }).save();

    const royKimOrder = await Order.build({
      userId: anotherUserId,
      status: OrderStatus.AwaitingPayment,
      ticket: royKimTicket,
    }).save();

    const response = await request(app)
      .get(ROUTE)
      .set('Cookie', getFakeSession(currentUserId))
      .send();

    expect(response.status).toEqual(200);
    expect(response.body).toHaveLength(1);
    expect(response.body).toContainEqual({
      expiresAt: now.toISOString(),
      id: aimerOrder.id,
      userId: currentUserId,
      status: OrderStatus.Created,
      ticket: {
        id: huhGakTicket.id,
        title: huhGakTicket.title,
        price: huhGakTicket.price,
      },
    });
  });
});
