const sleep = require('await-sleep');
const {Lambda} = require('aws-sdk');
const {handler} = require('./roz');
const {open, get} = require('./bastion');
const {send} = require('./message');
const {warn} = require('lambda-log');

jest.mock('./bastion');
jest.mock('./message');
jest.mock('await-sleep');
jest.mock('await-sleep');
jest.mock('aws-sdk');
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

    it('should reinvoke for known user', async () => {
      process.env.TELEGRAM_USER = 42;
      const promise = jest.fn().mockResolvedValue({});
      const invoke = jest.fn().mockReturnValue({promise});
      Lambda.prototype.invoke = invoke;
      const body = {message: {text: 'hello', from: {id: 42}}};

      const response = await handler({body: JSON.stringify(body)}, context);

      expect(response).toMatchSnapshot({statusCode: 200});
      expect(invoke.mock.calls).toMatchSnapshot();
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
      const evt = {text: 'break glass'};
      const response = await handler(evt, context);
      expect(response).toMatchSnapshot();
      expect(send.mock.calls).toMatchSnapshot();
      expect(open.mock.calls).toMatchSnapshot();
      expect(get.mock.calls).toMatchSnapshot();
    });
  });
});
