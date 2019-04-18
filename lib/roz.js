const {error, info} = require('lambda-log');
const {handle: chat} = require('./chat');
const {handle: notification} = require('./notification');

exports.handler = async evt => {
  info('Message received', {evt});

  // if there is a body, then it is a telegram chat
  if (evt.body) return await chat(evt);

  // otherwise assume it's an SNS notification
  return await notification(evt);
};
