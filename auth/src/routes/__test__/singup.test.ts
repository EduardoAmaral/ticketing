import request from 'supertest';
import app from '../../app';

const ROUTE = '/api/users/signup';

describe('SignUp Router', () => {
  it('returns a 201 on successful singup', () => {
    return request(app)
      .post(ROUTE)
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);
  });

  it('returns a 400 with an invalid email', async () => {
    const response = await request(app)
      .post(ROUTE)
      .send({
        email: 'test.com',
        password: 'password',
      })
      .expect(400);

    expect(response.body[0].message).toBe('Email must be valid');
    expect(response.body[0].field).toBe('email');
  });

  it('returns a 400 with a password that has less than 8 characteres', async () => {
    const response = await request(app)
      .post(ROUTE)
      .send({
        email: 'test@test.com',
        password: '1',
      })
      .expect(400);

    expect(response.body[0].message).toBe(
      'Password must have between 8 and 32 characters'
    );
    expect(response.body[0].field).toBe('password');
  });

  it('returns a 400 with a password that has more than 32 characteres', async () => {
    const response = await request(app)
      .post(ROUTE)
      .send({
        email: 'test@test.com',
        password: '1234567890123456789012345678901234567890',
      })
      .expect(400);

    expect(response.body[0].message).toBe(
      'Password must have between 8 and 32 characters'
    );
    expect(response.body[0].field).toBe('password');
  });

  it('returns 400 with missing email and password', async () => {
    await request(app)
      .post(ROUTE)
      .send({
        password: '12345678',
      })
      .expect(400);

    await request(app)
      .post(ROUTE)
      .send({
        email: 'test@test.com',
      })
      .expect(400);
  });

  it('disallows dupicate emails', async () => {
    await request(app)
      .post(ROUTE)
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);

    const response = await request(app)
      .post(ROUTE)
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(400);

    expect(response.body[0].message).toBe('Email already in use');
  });
});
