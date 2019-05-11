const {handler} = require('.');
const roz = require('./lib/roz');

jest.mock('./lib/roz');

describe('index', () => {
  it('should call roz', async () => {
    roz.handler.mockResolvedValue('RESP');
    const response = await handler('REQ');

    expect(roz.handler.mock.calls).toMatchSnapshot();
    expect(response).toMatchSnapshot();
  });
});
