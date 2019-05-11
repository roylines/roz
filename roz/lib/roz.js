const {error, info} = require('lambda-log');
const telegramHandler = require('./handlers/telegram');
const pollHandler = require('./handlers/poll');
const directHandler = require('./handlers/direct');

exports.handler = async (evt, context) => {
  try {
    info('message received', {evt});

    // if there's a body, it's from telegram via API gateway
    if (evt.body) return await telegramHandler.handle(evt, context);

    // if the type is scheduled event then that's what is is
    if (evt['detail-type'] == 'Scheduled Event')
      return await pollHandler.handle(evt, context);

    // otherwise it's a direct call
    return await directHandler.handle(evt, context);
  } catch (e) {
    error(e);
    // always return 200 to stop telegram from resending
    return {statusCode: 200};
  }
};
