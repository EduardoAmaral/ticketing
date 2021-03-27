import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import { getFakeSession } from '../../test/fake-session';
import { Ticket } from '../../model/ticket';
import { Order, OrderStatus } from '../../model/order';
import { add, differenceInMinutes } from 'date-fns';
import each from 'jest-each';

const ROUTE = '/api/orders';

describe('Create Order Route', () => {
  it('has a route handler listening to /api/orders for post requests', async () => {
    const response = await request(app).post(ROUTE).send({});

    expect(response.status).not.toEqual(404);
  });

  it('returns 401 if the user is NOT signed in', async () => {
    const response = await request(app).post(ROUTE).send({});

    expect(response.status).toEqual(401);
  });

  it('should allow user to create ticket if the user is signed in', async () => {
    const response = await request(app)
      .post(ROUTE)
      .set('Cookie', getFakeSession())
      .send({});

    expect(response.status).not.toEqual(401);
  });

  it('returns an error if a ticket ID is NOT provided', async () => {
    const response = await request(app)
      .post(ROUTE)
      .set('Cookie', getFakeSession())
      .send({});

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual('TicketId must be provided');
    expect(response.body[0].field).toEqual('ticketId');
  });

  it('returns an error if a ticket ID is not valid', async () => {
    const response = await request(app)
      .post(ROUTE)
      .set('Cookie', getFakeSession())
      .send({
        ticketId: 'a',
      });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual('TicketId invalid');
    expect(response.body[0].field).toEqual('ticketId');
  });

  it('returns a 404 if a ticket does not exist for a given TicketId', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    const response = await request(app)
      .post(ROUTE)
      .set('Cookie', getFakeSession())
      .send({
        ticketId: id,
      });

    expect(response.status).toEqual(404);
    expect(response.body[0].message).toEqual(
      'TicketId provided does not exist'
    );
  });

  each([
    OrderStatus.Created,
    OrderStatus.AwaitingPayment,
    OrderStatus.Complete,
  ]).it(
    'returns a 422 if there is already a ticket "%s"',
    async (status: OrderStatus) => {
      const userId = new mongoose.Types.ObjectId().toHexString();
      const ticket = await Ticket.build({
        title: 'Ticket',
        price: 1000,
      }).save();

      await Order.build({
        userId: userId,
        status: status,
        expiresAt: new Date(),
        ticket: ticket,
      }).save();

      const response = await request(app)
        .post(ROUTE)
        .set('Cookie', getFakeSession())
        .send({
          ticketId: ticket.id,
        });

      expect(response.status).toEqual(422);
      expect(response.body[0].message).toEqual('Ticket is already reserved');
    }
  );

  it('creates an order when there is a cancelled order for the ticket', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const ticket = await Ticket.build({
      title: 'Ticket',
      price: 1000,
    }).save();

    await Order.build({
      userId: userId,
      status: OrderStatus.Cancelled,
      expiresAt: new Date(),
      ticket: ticket,
    }).save();

    const response = await request(app)
      .post(ROUTE)
      .set('Cookie', getFakeSession(userId))
      .send({
        ticketId: ticket.id,
      });

    expect(response.status).toEqual(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.status).toEqual(OrderStatus.Created);
    expect(response.body.userId).toEqual(userId);
    expect(response.body.expiresAt).toBeDefined();
    expect(response.body.ticket.title).toEqual(ticket.title);
    expect(response.body.ticket.price).toEqual(ticket.price);

    const newOrder = await Order.findById(response.body.id).populate('ticket');
    expect(newOrder.userId).toEqual(userId);
    expect(newOrder.status).toEqual(OrderStatus.Created);
    expect(newOrder.expiresAt).toBeDefined();
    expect(newOrder.ticket.title).toEqual(ticket.title);
    expect(newOrder.ticket.price).toEqual(ticket.price);
  });

  it('returns 201 when order is created', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const ticket = await Ticket.build({
      title: 'Ticket',
      price: 1000,
    }).save();

    const response = await request(app)
      .post(ROUTE)
      .set('Cookie', getFakeSession(userId))
      .send({
        ticketId: ticket.id,
      });

    expect(response.status).toEqual(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.status).toEqual(OrderStatus.Created);
    expect(response.body.userId).toEqual(userId);
    expect(response.body.expiresAt).toBeDefined();
    expect(response.body.ticket.title).toEqual(ticket.title);
    expect(response.body.ticket.price).toEqual(ticket.price);

    const newOrder = await Order.findById(response.body.id).populate('ticket');
    expect(newOrder.userId).toEqual(userId);
    expect(newOrder.status).toEqual(OrderStatus.Created);
    expect(newOrder.expiresAt).toBeDefined();
    expect(newOrder.ticket.title).toEqual(ticket.title);
    expect(newOrder.ticket.price).toEqual(ticket.price);
  });

  it('sets expiresAt within x minutes, based on ', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const ticket = await Ticket.build({
      title: 'Ticket',
      price: 1000,
    }).save();

    const expiresAt = add(new Date(), {
      minutes: Number(process.env.ORDER_EXPIRATION_IN_MINUTES!),
    });

    const response = await request(app)
      .post(ROUTE)
      .set('Cookie', getFakeSession(userId))
      .send({
        ticketId: ticket.id,
      });

    expect(response.status).toEqual(201);
    expect(response.body.status).toEqual(OrderStatus.Created);
    expect(
      differenceInMinutes(expiresAt, new Date(response.body.expiresAt))
    ).toEqual(-0);

    const newOrder = await Order.findById(response.body.id).populate('ticket');
    expect(newOrder.status).toEqual(OrderStatus.Created);
    expect(
      differenceInMinutes(expiresAt, new Date(newOrder.expiresAt))
    ).toEqual(-0);
  });
});
