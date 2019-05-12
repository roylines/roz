const {send} = require('./telegram');
const {ssm} = require('./aws');
const random = require('random-int');
const {TelegramClient} = require('messaging-api-telegram');

jest.mock('await-sleep');
jest.mock('lambda-log');
jest.mock('messaging-api-telegram');
jest.mock('random-int');
jest.mock('./aws');

describe('message', () => {
  const mockTelegram = () => {
    ssm.getTelegramSecrets.mockResolvedValue({token: 'TOKEN', user: '42'});
    const connect = {sendMessage: jest.fn(), sendChatAction: jest.fn()};
    connect.sendMessage.mockResolvedValue();
    connect.sendChatAction.mockResolvedValue();
    TelegramClient.connect.mockReturnValue(connect);
    TelegramClient.connect.mockClear();
    return {connect: TelegramClient.connect, ...connect};
  };

  test('it should send expected rand 0', async () => {
    const {connect, sendMessage, sendChatAction} = mockTelegram();
    random.mockReturnValue(0);
    await send([['MESSAGE1-1', 'MESSAGE1-2'], ['MESSAGE2-1', 'MESSAGE2-2']]);
    expect(connect.mock.calls).toMatchSnapshot();
    expect(sendMessage.mock.calls).toMatchSnapshot();
    expect(sendChatAction.mock.calls).toMatchSnapshot();
    expect(random.mock.calls).toMatchSnapshot();
  });
  test('it should send expected rand 1', async () => {
    const {connect, sendMessage, sendChatAction} = mockTelegram();
    random.mockReturnValue(1);
    await send([['MESSAGE1-1', 'MESSAGE1-2'], ['MESSAGE2-1', 'MESSAGE2-2']]);
    expect(connect.mock.calls).toMatchSnapshot();
    expect(sendMessage.mock.calls).toMatchSnapshot();
    expect(sendChatAction.mock.calls).toMatchSnapshot();
    expect(random.mock.calls).toMatchSnapshot();
  });
});
