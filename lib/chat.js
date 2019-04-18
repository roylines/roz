const {error, info} = require('lambda-log');
const {send} = require('./message');
const {isAuthorised} = require('./auth');

const watchingMessages = message => [
  `I'm watching you...`,
  'Always watching...',
  'Always!',
];

const handle = async ({body}) => {
  try {
    // parse the message body
    const {message} = JSON.parse(body);
    info('Chat received', {message});

    // validate user
    if (!isAuthorised(message.from.id)) return {statusCode: 403};

    // send a telegram message
    await send({messages: watchingMessages(message)});
    return {statusCode: 200};
  } catch (e) {
    error(e);
    return {statusCode: 500};
  }
};

module.exports = {
  handle,
};
