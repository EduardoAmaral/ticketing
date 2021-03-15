import { Subjects } from '../../events/subjects';

export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: Subjects, data: any, callback: () => void) => {
          callback();
        }
      ),
  },
};
