const random = require('random-int');
const sleep = require('await-sleep');
const {TelegramClient} = require('messaging-api-telegram');
const {info} = require('lambda-log');

const pauseForEffect = async ({min = 800, max = 2500} = {}) => {
  // pick a random time to sleep between phrases, to feel natural
  await sleep(random(min, max));
};

const send = async messages => {
  info('sending telegram messages', messages);
  // create the telegram client
  const client = TelegramClient.connect(process.env.TELEGRAM_TOKEN);
  // set status to 'typing...'
  await client.sendChatAction(process.env.TELEGRAM_USER, 'typing');
  // pick phrases randomly
  const phrases = messages[random(0, messages.length - 1)];
  // loop the phrases, with delays for added realism
  for (const phrase of phrases) {
    // pause a little, for effect
    await pauseForEffect();
    // send it
    await client.sendMessage(process.env.TELEGRAM_USER, phrase);
    info('phrase sent', phrase);
  }
};

module.exports = {
  send,
  pauseForEffect,
};
