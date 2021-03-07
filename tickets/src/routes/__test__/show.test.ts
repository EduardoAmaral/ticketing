import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { Ticket } from '../../model/ticket';

describe('Show Route', () => {
  it('returns 404 if the ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    const response = await request(app).get(`/api/tickets/${id}`).send();

    expect(response.status).toEqual(404);
  });

  it('returns the ticket if the ticket is found', async () => {
    const title = 'Bring Me The Horizon Concert';
    const price = 40000;
    const userId = 'someuserid';

    const ticket = await Ticket.build({
      title,
      price,
      userId,
    }).save();

    const response = await request(app).get(`/api/tickets/${ticket.id}`).send();

    expect(response.status).toEqual(200);
    expect(response.body.title).toEqual(title);
    expect(response.body.price).toEqual(price);
  });
});
