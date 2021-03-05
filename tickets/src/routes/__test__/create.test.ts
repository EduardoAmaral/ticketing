import request from 'supertest';
import app from '../../app';
import { getFakeSession } from '../../test/fake-session';

const ROUTE = '/api/tickets';

describe('New Ticket Route', () => {
  it('has a route handler listening to /api/tickets for post requests', async () => {
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
});
