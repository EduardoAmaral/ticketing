import request from 'supertest';
import app from '../../app';

const CURRENT_USER_ROUTE = '/api/users/currentUser';

describe('Current User Route', () => {
  it('clears the cookie after signout', async () => {
    const authResponse = await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);

    const cookie = authResponse.get('Set-Cookie');

    const response = await request(app)
      .get(CURRENT_USER_ROUTE)
      .set('Cookie', cookie)
      .send()
      .expect(200);

    expect(response.body.id).toBeDefined();
    expect(response.body.email).toEqual('test@test.com');
  });
});
