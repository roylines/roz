const {TelegramClient} = require('messaging-api-telegram');

const sendMessage = async message => {
  const {sendMessage} = TelegramClient.connect(process.env.TELEGRAM_TOKEN);
  sendMessage(process.env.TELEGRAM_USER, message);
};

exports.handler = async () => {
  await sendMessage(`I'm watching you, Wazowski. Always watching. Always!`);
};
