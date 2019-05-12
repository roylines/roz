const random = require('random-int');
const sleep = require('await-sleep');
const {TelegramClient} = require('messaging-api-telegram');
const {info} = require('lambda-log');
const {ssm} = require('./aws');

const pauseForEffect = async ({min = 800, max = 2500} = {}) => {
  // pick a random time to sleep between phrases, to feel natural
  await sleep(random(min, max));
};

const send = async messages => {
  const secrets = await ssm.getTelegramSecrets();

  info('sending telegram messages', messages);
  // create the telegram client
  const client = TelegramClient.connect(secrets.token);
  // set status to 'typing...'
  await client.sendChatAction(secrets.user, 'typing');
  // pick phrases randomly
  const phrases = messages[random(0, messages.length - 1)];
  // loop the phrases, with delays for added realism
  for (const phrase of phrases) {
    // pause a little, for effect
    await pauseForEffect();
    // send it
    await client.sendMessage(secrets.user, phrase);
    info('phrase sent', phrase);
  }
};

module.exports = {
  send,
  pauseForEffect,
};
