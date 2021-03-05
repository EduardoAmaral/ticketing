import jwt from 'jsonwebtoken';

const getFakeSession = (): string[] => {
  const payload = {
    id: '1',
    email: 'test@test.com',
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET!);

  const session = { jwt: token };

  const sessionJson = JSON.stringify(session);

  const base64 = Buffer.from(sessionJson).toString('base64');

  return [`express:sess=${base64}`];
};

export { getFakeSession };
