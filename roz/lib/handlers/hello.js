const {send} = require('../telegram');
const handle = async () => {
  await send([[`I'm watching you...`, `Always watching...`, `Always!`]]);
};

module.exports = {
  handle,
};
