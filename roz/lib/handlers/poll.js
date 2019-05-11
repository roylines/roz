const {autoscaling} = require('../aws');
const {send} = require('../telegram');
const {info} = require('lambda-log');

// this is a call from the scheduled poll. Check to see if any bastions are open
const handle = async () => {
  info('scheduled event received, checking if the bastion is open');

  // get any instances
  const {instance} = await autoscaling.get();
  if (instance && instance.status == 'running') {
    // bastion is open
    const now = Date.now();
    const launched = new Date(instance.launched);
    // check to see if it's been open for more than 3 minutes
    if (now - launched > 3 * 60000) {
      await send([[`Bastion has been open for too long.`, `I'm closing it`]]);
      await autoscaling.set({capacity: 0});
      await send([[`Close requested`, `Watching. Always watching 👀`]]);
    }
  }
};
module.exports = {
  handle,
};
