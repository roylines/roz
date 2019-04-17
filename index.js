const {TelegramClient} = require('messaging-api-telegram');
const {info} = require('lambda-log');

const sendMessage = async message => {
  info('sending telegram message', {message});
  const {sendMessage} = TelegramClient.connect(process.env.TELEGRAM_TOKEN);
  sendMessage(process.env.TELEGRAM_USER, message);
};

const isAuthorised = message => {
  return message.from.id == +process.env.TELEGRAM_USER;
};

exports.handler = async evt => {
  info('Message received', {evt});

  // parse the message body
  const {message} = JSON.parse(evt.body);

  // validate user
  if (!isAuthorised(message)) return {statusCode: 403};

  // send a telegram message
  await sendMessage(
    `I'm watching you, ${message.from.last_name}. Always watching. Always!`,
  );

  // return 200
  return {statusCode: 200};
};
