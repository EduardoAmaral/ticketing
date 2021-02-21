import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";

const router = express.Router();

router.get(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 8, max: 32 })
      .withMessage("Password must be between 8 and 32 characters"),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array());
    }

    const { email, password } = req.body;

    console.log("Creating a user...");
    res.send({});
  }
);

export { router as signUpRouter };
