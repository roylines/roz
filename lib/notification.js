const {send} = require('./message');

const handle = async () => {
  await send({messages: ['Notification received']});
};

module.exports = {
  handle,
};
