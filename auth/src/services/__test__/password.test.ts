import { Password } from '../password';

describe('Password', () => {
  it('should return a hash salted from a given password', async () => {
    const password = 'my password';

    const hashedPassword = await Password.toHash(password);

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toEqual(password);
    expect(hashedPassword.split('.')).toHaveLength(2);
  });

  it('should return true if hashed password macthes with provided password', async () => {
    const hashedPassword =
      'd8f4e6f131a73bbf929a88c15340de88608ad0895bfc5463510880adef8395fe0e02278f9fce8e2181dbb6f2f463fcda2b39a052035d7b61484005e6671503b2.80a726de618ad1e3';
    const providedPassword = 'my password';

    const matches = await Password.matches(hashedPassword, providedPassword);

    expect(matches).toBeTruthy();
  });

  it('should return false if hashed password does NOT macthes with provided password', async () => {
    const hashedPassword = 'asd.80a726de618ad1e3';
    const providedPassword = 'my password';

    const matches = await Password.matches(hashedPassword, providedPassword);

    expect(matches).toBeFalsy();
  });

  it('should throw error if hashed password is not valid', async () => {
    expect.assertions(1);
    try {
      await Password.matches('', 'my password');
    } catch (err) {
      expect(err.message).toEqual(
        '[Password] Hashed provided for matches is not valid'
      );
    }
  });
});
