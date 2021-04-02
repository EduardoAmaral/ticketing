import { Ticket } from '../ticket';

describe('Ticket Model', () => {
  it('should increment the version for each save operation', async () => {
    const ticket = Ticket.build({
      title: 'I am not a Robot',
      price: 1980,
      userId: '1',
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);
  });

  it('should fail if version updated is not the current one', async (done) => {
    const ticket = Ticket.build({
      title: 'I am not a Robot',
      price: 1980,
      userId: '1',
    });

    await ticket.save();

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstInstance.set({ price: 2000 });
    secondInstance.set({ price: 5000 });

    await firstInstance.save();

    try {
      await secondInstance.save();
    } catch (err) {
      return done();
    }

    throw new Error('Should not reach this point');
  });
});
