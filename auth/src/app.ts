import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { signUpRouter } from './routes/signup';
import { signInRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';
import { currentUserRouter } from './routes/current-user';
import { errorHandler , NotFoundError } from '@eamaral/ticketing-common';

const app = express();

app.set('trust proxy', true);

app.use(json());

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(signUpRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(currentUserRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export default app;
