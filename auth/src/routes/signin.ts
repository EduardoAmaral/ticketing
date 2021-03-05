import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@eamaral/ticketing-common';

import { User } from '../models/user';
import { Password } from '../services/password';
import { createSession } from '../services/session';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('Password must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await Password.matches(user.password, password))) {
      createSession(req, user);

      res.status(200).send(user);
    } else {
      throw new BadRequestError('Invalid credentials');
    }
  }
);

export { router as signInRouter };
