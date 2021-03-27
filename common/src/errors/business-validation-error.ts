import { CustomError } from "./custom-error";

export class BusinessValidationError extends CustomError {
  statusCode = 422;

  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, BusinessValidationError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
