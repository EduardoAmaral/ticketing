import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.mock('@eamaral/ticketing-common/build/nats/nats-wrapper');
jest.mock('../stripe');

let mongo: any;
beforeAll(async () => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'whatevertestsecret';
  process.env.STRIPE_SECRET = 'stripesecret';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});