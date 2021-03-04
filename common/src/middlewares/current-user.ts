import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { UnauthorizedError } from "../errors/unauthorized-error";

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.jwt) {
    throw new UnauthorizedError();
  }

  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_SECRET!
    ) as UserPayload;

    req.currentUser = payload;
  } catch (err) {
    throw new UnauthorizedError();
  }

  next();
};
