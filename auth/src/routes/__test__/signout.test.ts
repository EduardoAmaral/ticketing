import request from 'supertest';
import app from '../../app';
import { signup } from '../../test/auth-helper';

const SIGN_OUT_ROUTE = '/api/users/signout';

describe('SignOut Route', () => {
  it('clears the cookie after signout', async () => {
    await signup();

    const response = await request(app)
      .post(SIGN_OUT_ROUTE)
      .send({})
      .expect(200);

    expect(response.get('Set-Cookie')[0]).toEqual(
      'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
    );
  });
});
