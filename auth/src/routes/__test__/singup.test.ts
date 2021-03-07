import request from 'supertest';
import app from '../../app';
import { User } from '../../models/user';

const SIGNUP_ROUTE = '/api/users/signup';

describe('SignUp Router', () => {
  it('returns a 201 on successful singup', () => {
    return request(app)
      .post(SIGNUP_ROUTE)
      .send({
        email: 'test@test.com',
        password: '#3aBq13l',
      })
      .expect(201);
  });

  it('sets a cookie after successful singup', async () => {
    const response = await request(app)
      .post(SIGNUP_ROUTE)
      .send({
        email: 'test@test.com',
        password: '#3aBq13l',
      })
      .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();
  });

  it('should not set cookie if signup fails', async () => {
    const response = await request(app)
      .post(SIGNUP_ROUTE)
      .send({
        email: 'test@.com',
        password: '#3aBq13l',
      })
      .expect(400);

    expect(response.get('Set-Cookie')).toBeUndefined();
  });

  it('returns 400 with an invalid email', async () => {
    const response = await request(app)
      .post(SIGNUP_ROUTE)
      .send({
        email: 'test.com',
        password: '#3aBq13l',
      })
      .expect(400);

    expect(response.body[0].message).toBe('Email must be valid');
    expect(response.body[0].field).toBe('email');
  });

  it('returns 400 with a password that has less than 8 characteres', async () => {
    const response = await request(app)
      .post(SIGNUP_ROUTE)
      .send({
        email: 'test@test.com',
        password: '1',
      })
      .expect(400);

    expect(response.body[0].message).toBe(
      'Password must be at least 8 characters long with a minimum of one uppercase, one lowercase, one numeric and one symbol'
    );
    expect(response.body[0].field).toBe('password');
  });

  it('returns 400 with a weak password', async () => {
    const response = await request(app)
      .post(SIGNUP_ROUTE)
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(400);

    expect(response.body[0].message).toBe(
      'Password must be at least 8 characters long with a minimum of one uppercase, one lowercase, one numeric and one symbol'
    );
    expect(response.body[0].field).toBe('password');
  });

  it('returns 400 with missing email and password', async () => {
    await request(app)
      .post(SIGNUP_ROUTE)
      .send({
        password: '#3aBq13l',
      })
      .expect(400);

    await request(app)
      .post(SIGNUP_ROUTE)
      .send({
        email: 'test@test.com',
      })
      .expect(400);
  });

  it('disallows dupicate emails', async () => {
    const email = 'test@test.com';
    const password = '#3aBq13l';

    await User.build({
      email,
      password,
    }).save();

    const response = await request(app)
      .post(SIGNUP_ROUTE)
      .send({
        email,
        password,
      })
      .expect(400);

    expect(response.body[0].message).toBe('Email already in use');
  });
});
