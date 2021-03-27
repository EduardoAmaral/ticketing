import { CustomError } from './custom-error';

export class ForbiddenError extends CustomError {
  statusCode = 403;

  constructor(
    public message: string = 'User does not have permission to access this resource'
  ) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
