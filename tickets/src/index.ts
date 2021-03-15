import mongoose from 'mongoose';
import { randomBytes } from 'crypto';

import app from './app';
import { natsWrapper } from '@eamaral/ticketing-common';

const start = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  await natsWrapper.connect(
    'ticketing',
    randomBytes(8).toString('hex'),
    'http://nats-srv:4222'
  );

  natsWrapper.client.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });
  process.on('SIGINT', () => natsWrapper.client.close());
  process.on('SIGNTERM', () => natsWrapper.client.close());

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();
