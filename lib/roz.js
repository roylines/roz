const {warn, error, info} = require('lambda-log');
const {send} = require('./message');
const {isAuthorised} = require('./auth');

const watchingMessages = message => [
  `I'm watching you...`,
  'Always watching...',
  'Always!',
];

exports.handler = async ({body}) => {
  try {
    // parse the message body
    const {message} = JSON.parse(body);
    info('telegram message received', {message});

    // validate user
    if (!isAuthorised(message.from.id)) {
      warn('unauthorised user', {message});
      return {statusCode: 403};
    }

    if (message.text == 'break glass') {
      await send({messages: ['breaking glass']});
    } else {
      await send({messages: watchingMessages(message)});
    }

    return {statusCode: 200};
  } catch (e) {
    error(e);
    return {statusCode: 500};
  }
};
