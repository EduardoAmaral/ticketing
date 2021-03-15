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

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  await natsWrapper.connect(
    process.env.NATS_CLUSTER_ID,
    process.env.NATS_CLIENT_ID,
    process.env.NATS_URL
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
