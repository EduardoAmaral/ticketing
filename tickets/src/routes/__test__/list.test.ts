import request from 'supertest';
import app from '../../app';
import { Ticket } from '../../model/ticket';
import { getFakeSession } from '../../test/fake-session';

describe('Index Route', () => {
  it('returns all tickets from unsigned users', async () => {
    const avengedSevenfoldTicket = await Ticket.build({
      title: 'Avenged Sevenfold Concert',
      price: 10000,
      userId: 'A7X',
    }).save();

    const coldplayTicket = await Ticket.build({
      title: 'Coldplay Concert',
      price: 8000,
      userId: 'Martin',
    }).save();

    const response = await request(app).get('/api/tickets').send();

    expect(response.body).toHaveLength(2);
    expect(response.body).toContainEqual({
      id: avengedSevenfoldTicket.id,
      title: avengedSevenfoldTicket.title,
      price: avengedSevenfoldTicket.price,
      userId: avengedSevenfoldTicket.userId,
    });

    expect(response.body).toContainEqual({
      id: coldplayTicket.id,
      title: coldplayTicket.title,
      price: coldplayTicket.price,
      userId: coldplayTicket.userId,
    });
  });

  it('returns all tickets from signed users', async () => {
    const arcticTicket = await Ticket.build({
      title: 'Arctic Monkeys Concert',
      price: 12000,
      userId: 'Alex Turner',
    }).save();

    const bfmvTicket = await Ticket.build({
      title: 'Bullet For My Valentine Concert',
      price: 8000,
      userId: 'Matt Tuck',
    }).save();

    const response = await request(app)
      .get('/api/tickets')
      .set('Cookie', getFakeSession())
      .send();

    expect(response.body).toHaveLength(2);
    expect(response.body).toContainEqual({
      id: arcticTicket.id,
      title: arcticTicket.title,
      price: arcticTicket.price,
      userId: arcticTicket.userId,
    });

    expect(response.body).toContainEqual({
      id: bfmvTicket.id,
      title: bfmvTicket.title,
      price: bfmvTicket.price,
      userId: bfmvTicket.userId,
    });
  });
});
