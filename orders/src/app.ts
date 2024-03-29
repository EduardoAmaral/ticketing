import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from '@eamaral/ticketing-common';

import { createOrderRouter } from './routes/create';
import { listOrderRouter } from './routes/list';
import { showOrderRouter } from './routes/show';
import { cancelOrderRouter } from './routes/cancel';

const app = express();

app.set('trust proxy', true);

app.use(json());

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUser);

app.use(createOrderRouter);
app.use(listOrderRouter);
app.use(showOrderRouter);
app.use(cancelOrderRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export default app;
