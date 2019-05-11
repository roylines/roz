const {info} = require('lambda-log');

const helloHandler = require('./hello');
const breakGlassHandler = require('./breakglass');

const handle = async message => {
  info('telegram message received', {message});
  switch (message.text.toLowerCase()) {
    case 'break glass':
      await breakGlassHandler.handle();
      break;
    case 'hello':
      await helloHandler.handle();
      break;
    default:
      info('unknown message');
      break;
  }
};

module.exports = {handle};
