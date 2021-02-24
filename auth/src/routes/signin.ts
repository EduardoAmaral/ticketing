import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";

import { User } from "../models/user";
import { Password } from "../services/password";
import { createSession } from "../services/session";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isEmpty()
      .withMessage("Password is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && Password.compare(user.password, password)) {
      createSession(req, user);

      res.status(200).send(user);
    } else {
      throw new BadRequestError("Invalid credentials");
    }
  }
);

export { router as signInRouter };
