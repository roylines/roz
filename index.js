const {TelegramClient} = require('messaging-api-telegram');
const {error, info} = require('lambda-log');
const delay = require('delay');

const send = async ({messages}) => {
  info('sending telegram messages', {messages});
  const client = TelegramClient.connect(process.env.TELEGRAM_TOKEN);

  for (const message of messages) {
    await client.sendMessage(process.env.TELEGRAM_USER, message);
    await delay(1200); // add a fake delay...
  }
};

const isAuthorised = message => {
  return message.from.id == +process.env.TELEGRAM_USER;
};

const watchingMessages = message => [
  `I'm watching you ${message.from.last_name}`,
  'Always watching',
  'Always!',
];

exports.handler = async evt => {
  try {
    info('Message received', {evt});

    // parse the message body
    const {message} = JSON.parse(evt.body);

    // validate user
    if (!isAuthorised(message)) return {statusCode: 403};

    // send a telegram message
    await send({messages: watchingMessages(message)});
    return {statusCode: 200};
  } catch (e) {
    error(e);
    return {statusCode: 500};
  }
};
