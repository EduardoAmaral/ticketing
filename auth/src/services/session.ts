import { Request } from "express";
import jwt from "jsonwebtoken";

export const createSession = (req: Request, user: any) => {
  const userJwt = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!
  );

  req.session = {
    jwt: userJwt,
  };
};
