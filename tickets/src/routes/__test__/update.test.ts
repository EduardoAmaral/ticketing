import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { Ticket } from '../../model/ticket';
import { getFakeSession } from '../../test/fake-session';

const ROUTE = '/api/tickets';

describe('Update Route', () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();

  it('returns 404 if the provided id does not exist', async () => {
    const response = await request(app)
      .put(`${ROUTE}/${ticketId}`)
      .set('Cookie', getFakeSession())
      .send({
        title: 'Anything',
        price: 1,
      });

    expect(response.status).toEqual(404);
  });

  it('returns 401 if the user is not authenticated', async () => {
    const response = await request(app).put(`${ROUTE}/${ticketId}`).send({});

    expect(response.status).toEqual(401);
  });

  it('does not update the ticket and returns 403 if the the user does not own the ticket', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const ticket = await Ticket.build({
      title: 'Ticket From Another Person',
      price: 1000,
      userId,
    }).save();

    const response = await request(app)
      .put(`${ROUTE}/${ticket.id}`)
      .set('Cookie', getFakeSession())
      .send({
        title: 'New Title',
        price: 1,
      });

    const notUpdatedTicket = await Ticket.findById(ticket.id);

    expect(response.status).toEqual(403);
    expect(notUpdatedTicket.title).toEqual(ticket.title);
    expect(notUpdatedTicket.price).toEqual(ticket.price);
  });

  it('returns 400 if title is not provided', async () => {
    const response = await request(app)
      .put(`${ROUTE}/${ticketId}`)
      .set('Cookie', getFakeSession())
      .send({
        price: 1,
      });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual('Title must be provided');
    expect(response.body[0].field).toEqual('title');
  });

  it('returns 400 if price is not provided', async () => {
    const response = await request(app)
      .put(`${ROUTE}/${ticketId}`)
      .set('Cookie', getFakeSession())
      .send({
        title: 'Title',
      });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual(
      'Price should be numeric and greater than 0'
    );
    expect(response.body[0].field).toEqual('price');
  });

  it('returns 400 if price is less than 0', async () => {
    const response = await request(app)
      .put(`${ROUTE}/${ticketId}`)
      .set('Cookie', getFakeSession())
      .send({
        title: 'Title',
        price: -1,
      });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual(
      'Price should be numeric and greater than 0'
    );
    expect(response.body[0].field).toEqual('price');
  });

  it('updates tickets with provided fields', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const ticket = await Ticket.build({
      title: 'Ticket From Another Person',
      price: 1000,
      userId,
    }).save();

    const response = await request(app)
      .put(`${ROUTE}/${ticket.id}`)
      .set('Cookie', getFakeSession(userId))
      .send({
        title: 'New Title',
        price: 1,
      });

    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(ticket.id);
    expect(response.body.title).toEqual('New Title');
    expect(response.body.price).toEqual(1);
  });
});
