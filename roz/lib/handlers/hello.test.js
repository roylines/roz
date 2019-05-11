const {handle} = require('./hello');
const {send} = require('../telegram');

jest.mock('../telegram');

describe('hello handler', () => {
  it('should say hello back', async () => {
    await handle();
    expect(send.mock.calls).toMatchSnapshot();
  });
});
