import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@eamaral/ticketing-common';

import { User } from '../models/user';
import { createSession } from '../services/session';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isStrongPassword()
      .withMessage(
        'Password must be at least 8 characters long with a minimum of one uppercase, one lowercase, one numeric and one symbol'
      ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    const user = User.build({ email, password });
    await user.save();

    createSession(req, user);

    res.status(201).send(user);
  }
);

export { router as signUpRouter };
