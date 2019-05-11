const {lambda} = require('../aws');
const {warn, info} = require('lambda-log');

// handles requests from telegram. Must return 200 quickly, and reinvoke ourself for actual processing.
const handle = async ({body}, {invokedFunctionArn: arn}) => {
  info('api gateway call received, authorising', {body});
  // parse the body into JSON
  const {message} = JSON.parse(body);
  // check the user is authorised
  if (!message || message.from.id != +process.env.TELEGRAM_USER) {
    warn('unauthorised user', {message});
    return {statusCode: 200}; // we will return 200 anyway, otherwise telegram will retry
  }
  // reinvoke self, and return 200 to stop telegram from retrying
  info('user authorised, re-invoking self');
  await lambda.invoke({arn, message});
  return {statusCode: 200};
};

module.exports = {
  handle,
};
