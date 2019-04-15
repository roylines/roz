const {handler} = require('.');
const {TelegramClient} = require('messaging-api-telegram');

jest.mock('messaging-api-telegram');

console.log = jest.fn();
describe('handler', () => {
  const mockTelegram = () => {
    const connect = {sendMessage: jest.fn()};
    connect.sendMessage.mockResolvedValue();
    TelegramClient.connect.mockReturnValue(connect);
  };

  it('should call connect correctly', async () => {
    mockTelegram();
    await handler();
    expect(TelegramClient.connect.mock.calls).toMatchSnapshot();
  });

  it('should return expected', async () => {
    mockTelegram();
    const response = await handler();
    expect(response).toMatchSnapshot();
  });
});
