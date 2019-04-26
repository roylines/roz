const sleep = require('await-sleep');
const {TelegramClient} = require('messaging-api-telegram');
const {info} = require('lambda-log');
const random = require('random-int');

const send = async messages => {
  info('sending telegram messages');
  // create the telegram client
  const client = TelegramClient.connect(process.env.TELEGRAM_TOKEN);
  // pick phrases randomly
  const phrases = messages[random(0, messages.length - 1)];
  // loop the phrases, with delays for added realism
  let wait = 0;
  for (const phrase of phrases) {
    await sleep(wait);
    await client.sendMessage(process.env.TELEGRAM_USER, phrase);
    wait = random(200, 1500); // pick a random time to sleep before saying next phrase
  }
};

module.exports = {
  send,
};
