import { CustomError } from "./custom-error";

export class ForbiddenError extends CustomError {
  statusCode = 403;

  constructor() {
    super("User does not have permission to access this");

    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  serializeErrors() {
    return [{ message: "User does not have permission to access this" }];
  }
}
