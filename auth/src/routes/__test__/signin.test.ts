import request from 'supertest';
import app from '../../app';
import { signup } from '../../test/auth-helper';

const SIGN_IN_ROUTE = '/api/users/signin';

describe('SignIn Route', () => {
  it('returns 400 with empty email', async () => {
    const response = await request(app)
      .post(SIGN_IN_ROUTE)
      .send({
        password: '1',
      })
      .expect(400);

    expect(response.body[0].field).toBe('email');
    expect(response.body[0].message).toBe('Email must be valid');
  });

  it('returns 400 with invalid email', async () => {
    const response = await request(app)
      .post(SIGN_IN_ROUTE)
      .send({
        email: 'asd',
        password: '1',
      })
      .expect(400);

    expect(response.body[0].field).toBe('email');
    expect(response.body[0].message).toBe('Email must be valid');
  });

  it('returns 400 with empty password', async () => {
    const response = await request(app)
      .post(SIGN_IN_ROUTE)
      .send({
        email: 'email@mail.com',
      })
      .expect(400);

    expect(response.body[0].field).toBe('password');
    expect(response.body[0].message).toBe('Password must be provided');
  });

  it('fails when user does not exist', async () => {
    const response = await request(app)
      .post(SIGN_IN_ROUTE)
      .send({
        email: 'email@mail.com',
        password: '1',
      })
      .expect(400);

    expect(response.body[0].message).toBe('Invalid credentials');
  });

  it('fails when an incorrect password is supplied', async () => {
    await signup();

    const response = await request(app)
      .post(SIGN_IN_ROUTE)
      .send({
        email: 'test@test.com',
        password: 'wrong password',
      })
      .expect(400);

    expect(response.body[0].message).toBe('Invalid credentials');
  });

  it('responds with a cookie when given valid credentials', async () => {
    await signup();

    const response = await request(app)
      .post(SIGN_IN_ROUTE)
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});
