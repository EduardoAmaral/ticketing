import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import { getFakeSession } from '../../test/fake-session';
import { Ticket } from '../../model/ticket';
import { Order, OrderStatus } from '../../model/order';
import { add, differenceInMinutes } from 'date-fns';
import each from 'jest-each';
import { natsWrapper } from '@eamaral/ticketing-common';

const ROUTE = '/api/orders';

describe('Create Order Route', () => {
  it('returns 401 if the user is NOT signed in', async () => {
    const response = await request(app).post(ROUTE).send({});

    expect(response.status).toEqual(401);
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

  it('rejects a reservation if the given ticket does not exist', async () => {
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
    'rejects a reservation if there is already an order "%s" for the given ticket',
    async (status: OrderStatus) => {
      const userId = new mongoose.Types.ObjectId().toHexString();
      const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
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
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
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

  it('reserves a ticket', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const ticket = await Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
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

  it('sets an expiration within x minutes based on config', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const ticket = await Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
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

  it('publishes an order created event after create an order successfully', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const ticket = await Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
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

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
