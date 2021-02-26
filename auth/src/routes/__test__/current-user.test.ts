import request from 'supertest';
import app from '../../app';
import { signup } from '../../test/auth-helper';

const CURRENT_USER_ROUTE = '/api/users/currentUser';

describe('Current User Route', () => {
  it('returns the current user', async () => {
    const cookie = await signup();

    const response = await request(app)
      .get(CURRENT_USER_ROUTE)
      .set('Cookie', cookie)
      .send()
      .expect(200);

    expect(response.body.id).toBeDefined();
    expect(response.body.email).toEqual('test@test.com');
  });

  it('returns 401 when user is not logged in', () => {
    return request(app).get(CURRENT_USER_ROUTE).send().expect(401);
  });
});
