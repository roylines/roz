const delay = require('delay');
const {TelegramClient} = require('messaging-api-telegram');
const {info} = require('lambda-log');

const send = async ({messages}) => {
  info('sending telegram messages', {messages});
  const client = TelegramClient.connect(process.env.TELEGRAM_TOKEN);
  let wait = 0;

  for (const message of messages) {
    await delay(wait);
    await client.sendMessage(process.env.TELEGRAM_USER, message);
    wait += 1000;
  }
};

module.exports = {
  send,
};
