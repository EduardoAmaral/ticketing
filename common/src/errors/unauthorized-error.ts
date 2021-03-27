import { CustomError } from './custom-error';

export class UnauthorizedError extends CustomError {
  statusCode = 401;

  constructor(public message: string = 'Not Authorized') {
    super(message);

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
