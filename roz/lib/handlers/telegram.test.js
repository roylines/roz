const {handle} = require('./telegram');
const {lambda, ssm} = require('../aws');
const {warn} = require('lambda-log');

jest.mock('../aws');
jest.mock('lambda-log');

describe('telegram handler', () => {
  const context = {
    invokedFunctionArn: 'ARN',
  };
  it('should warn and return 200 for unknown user', async () => {
    warn.mockReset();
    ssm.getTelegramSecrets.mockResolvedValue({user: 42});
    const body = {message: {from: {id: 84}}};
    const response = await handle({body: JSON.stringify(body)}, context);

    expect(lambda.invoke).not.toHaveBeenCalled();
    expect(response).toMatchSnapshot({statusCode: 200});
    expect(warn.mock.calls[0][0]).toEqual('unauthorised user');
  });

  it('should invoke for known user', async () => {
    ssm.getTelegramSecrets.mockResolvedValue({user: 42});
    const body = {message: {text: 'hello', from: {id: 42}}};
    const response = await handle({body: JSON.stringify(body)}, context);

    expect(response).toMatchSnapshot({statusCode: 200});
    expect(lambda.invoke.mock.calls).toMatchSnapshot();
  });
});
