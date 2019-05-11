const {handler} = require('./roz');

const {error} = require('lambda-log');
const telegramHandler = require('./handlers/telegram');
const pollHandler = require('./handlers/poll');
const directHandler = require('./handlers/direct');

jest.mock('./handlers/telegram');
jest.mock('./handlers/poll');
jest.mock('./handlers/direct');
jest.mock('lambda-log');

describe('roz', () => {
  beforeEach(() => jest.resetAllMocks());
  describe('telegram message', () => {
    it('should return 200 if handler throws', async () => {
      telegramHandler.handle.mockRejectedValue('FAILED TELEGRAM');
      const response = await handler({body: 'BODY'}, 'CONTEXT');
      expect(response).toMatchSnapshot({statusCode: 200});
      expect(error).toMatchSnapshot();
    });
    it('should call handler correctly', async () => {
      telegramHandler.handle.mockResolvedValue('TELEGRAM');
      const response = await handler({body: 'BODY'}, 'CONTEXT');
      expect(response).toMatchSnapshot('TELEGRAM');
    });
  });

  describe('poll', () => {
    it('should return 200 if handler throws', async () => {
      pollHandler.handle.mockRejectedValue('FAILED POLL');
      const response = await handler(
        {'detail-type': 'Scheduled Event'},
        'CONTEXT',
      );
      expect(response).toMatchSnapshot({statusCode: 200});
      expect(error).toMatchSnapshot();
    });
    it('should call handler correctly', async () => {
      pollHandler.handle.mockResolvedValue('POLL');
      const response = await handler(
        {'detail-type': 'Scheduled Event'},
        'CONTEXT',
      );
      expect(response).toMatchSnapshot('POLL');
    });
  });

  describe('direct', () => {
    it('should return 200 if handler throws', async () => {
      directHandler.handle.mockRejectedValue('FAILED DIRECT');
      const response = await handler({}, 'CONTEXT');
      expect(response).toMatchSnapshot({statusCode: 200});
      expect(error).toMatchSnapshot();
    });
    it('should call handler correctly', async () => {
      directHandler.handle.mockResolvedValue('DIRECT');
      const response = await handler({}, 'CONTEXT');
      expect(response).toMatchSnapshot('DIRECT');
    });
  });
});
