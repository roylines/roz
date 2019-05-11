const {handler} = require('./roz');
const {send} = require('./message');
const {warn} = require('lambda-log');
const {lambda, autoscaling} = require('./aws');

jest.mock('./aws');
jest.mock('./message');
jest.mock('await-sleep');
jest.mock('await-sleep');
jest.mock('lambda-log');
jest.mock('messaging-api-telegram');

describe('handler', () => {
  const context = {
    invokedFunctionArn: 'ARN',
  };
  describe('from api gateway', () => {
    it('should return 200 for unknown user', async () => {
      warn.mockReset();
      process.env.TELEGRAM_USER = 88;
      const body = {message: {from: {id: 42}}};
      const response = await handler({body: JSON.stringify(body)}, context);

      expect(response).toMatchSnapshot({statusCode: 200});
      expect(warn.mock.calls[0][0]).toEqual('unauthorised user');
    });

    it('should invoke for known user', async () => {
      process.env.TELEGRAM_USER = 42;

      const body = {message: {text: 'hello', from: {id: 42}}};
      const response = await handler({body: JSON.stringify(body)}, context);

      expect(response).toMatchSnapshot({statusCode: 200});
      expect(lambda.invoke.mock.calls).toMatchSnapshot();
    });

    it('should return 500 for throws', async () => {
      const response = await handler({});
      expect(response).toMatchSnapshot({statusCode: 500});
    });
  });

  describe('from reinvoke', () => {
    it('should deal with hello', async () => {
      send.mockReset();
      const evt = {text: 'hello'};
      const response = await handler(evt, context);
      expect(response).toMatchSnapshot();
      expect(send.mock.calls).toMatchSnapshot();
    });
    it('should deal with break glass', async () => {
      send.mockReset();
      autoscaling.get.mockResolvedValue({instance: {status: 'running'}});

      const evt = {text: 'break glass'};
      const response = await handler(evt, context);
      expect(response).toMatchSnapshot();
      expect(send.mock.calls).toMatchSnapshot();
      expect(autoscaling.set.mock.calls).toMatchSnapshot();
      expect(autoscaling.get.mock.calls).toMatchSnapshot();
    });
  });
});
