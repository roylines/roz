const {handler} = require('.');

console.log = jest.fn();
describe('handler', () => {
  it('should return expected', async () => {
    const response = await handler();
    expect(response).toMatchSnapshot();
  });
});
