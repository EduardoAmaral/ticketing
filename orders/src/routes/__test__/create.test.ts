import request from 'supertest';
import app from '../../app';
import { getFakeSession } from '../../test/fake-session';

const ROUTE = '/api/tickets';

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
    expect(response.body[0].message).toEqual('Ticket must be provided');
    expect(response.body[0].field).toEqual('ticketId');
  });

  it('returns 201 when order is created', async () => {
    const response = await request(app)
      .post(ROUTE)
      .set('Cookie', getFakeSession())
      .send({
        ticketId: 'id',
      });

    expect(response.status).toEqual(201);
  });
});
