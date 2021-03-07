import request from 'supertest';
import app from '../../app';
import { signup } from '../../test/auth-helper';

const SIGN_IN_ROUTE = '/api/users/signin';

describe('SignIn Route', () => {
  it('returns 400 with empty email', async () => {
    const response = await request(app).post(SIGN_IN_ROUTE).send({
      password: '1',
    });

    expect(response.status).toEqual(400);
    expect(response.body[0].field).toEqual('email');
    expect(response.body[0].message).toEqual('Email must be valid');
  });

  it('returns 400 with invalid email', async () => {
    const response = await request(app).post(SIGN_IN_ROUTE).send({
      email: 'asd',
      password: '1',
    });

    expect(response.status).toEqual(400);
    expect(response.body[0].field).toEqual('email');
    expect(response.body[0].message).toEqual('Email must be valid');
  });

  it('returns 400 with empty password', async () => {
    const response = await request(app).post(SIGN_IN_ROUTE).send({
      email: 'email@mail.com',
    });

    expect(response.status).toEqual(400);
    expect(response.body[0].field).toEqual('password');
    expect(response.body[0].message).toEqual('Password must be provided');
  });

  it('fails when user does not exist', async () => {
    const response = await request(app).post(SIGN_IN_ROUTE).send({
      email: 'email@mail.com',
      password: '1',
    });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual('Invalid credentials');
  });

  it('fails when an incorrect password is supplied', async () => {
    await signup();

    const response = await request(app).post(SIGN_IN_ROUTE).send({
      email: 'test@test.com',
      password: 'wrong password',
    });

    expect(response.status).toEqual(400);
    expect(response.body[0].message).toEqual('Invalid credentials');
  });

  it('responds with a cookie when given valid credentials', async () => {
    await signup();

    const response = await request(app)
      .post(SIGN_IN_ROUTE)
      .send({
        email: 'test@test.com',
        password: '#3aBq13l',
      })
      .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});
