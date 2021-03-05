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

  it('returns an error if an invalid title is provided', async () => {
    const response = await request(app)
      .post(ROUTE)
      .set('Cookie', getFakeSession())
      .send({
        price: 100,
      });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual('Title is required');
    expect(response.body[0].field).toEqual('title');
  });

  it('returns an error if price is not provided', async () => {
    const response = await request(app)
      .post(ROUTE)
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

  it('returns an error if price is lower than 0', async () => {
    const response = await request(app)
      .post(ROUTE)
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

  it('returns an error if price is not numeric', async () => {
    const response = await request(app)
      .post(ROUTE)
      .set('Cookie', getFakeSession())
      .send({
        title: 'Title',
        price: 'A',
      });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual(
      'Price should be numeric and greater than 0'
    );
    expect(response.body[0].field).toEqual('price');
  });
});
