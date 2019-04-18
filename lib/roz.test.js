const {handler} = require('./roz');
const {TelegramClient} = require('messaging-api-telegram');

jest.mock('messaging-api-telegram');
jest.mock('lambda-log');
jest.mock('delay');

describe('handler', () => {
  const mockTelegram = () => {
    process.env.TELEGRAM_TOKEN = 'TOKEN';
    process.env.TELEGRAM_USER = '42';
    const connect = {sendMessage: jest.fn()};
    connect.sendMessage.mockResolvedValue();
    TelegramClient.connect.mockReturnValue(connect);
    TelegramClient.connect.mockClear();
    return {connect: TelegramClient.connect, sendMessage: connect.sendMessage};
  };

  const getMessage = () => ({
    message: {
      from: {
        id: 42,
        first_name: 'Mike',
        last_name: 'Wazowski',
        username: 'waz',
      },
      chat: {
        id: 4242,
      },
      text: '/start',
    },
  });

  it('should return 403 for unknown user', async () => {
    mockTelegram();
    const body = getMessage();
    body.message.from.id = 88;

    const response = await handler({body: JSON.stringify(body)});

    expect(response).toMatchSnapshot({statusCode: 403});
  });

  it('should return 200 for known user', async () => {
    mockTelegram();

    const response = await handler({body: JSON.stringify(getMessage())});

    expect(response).toMatchSnapshot({statusCode: 200});
  });

  it('should send message for known user', async () => {
    const {connect, sendMessage} = mockTelegram();

    await handler({body: JSON.stringify(getMessage())});

    expect(connect.mock.calls).toMatchSnapshot();
    expect(sendMessage.mock.calls).toMatchSnapshot();
  });

  it('should return 500 for throws', async () => {
    const {sendMessage} = mockTelegram();
    sendMessage.mockRejectedValue('ERROR');

    const body = getMessage();

    const response = await handler({body: JSON.stringify(body)});

    expect(response).toMatchSnapshot({statusCode: 500});
  });
});
