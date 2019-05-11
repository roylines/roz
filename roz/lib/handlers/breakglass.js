const {autoscaling} = require('../aws');
const {send, pauseForEffect} = require('../telegram');
const {info} = require('lambda-log');

// handle the break glass procedure
const handle = async () => {
  await send([[`OK, I'm opening the bastion now.`]]);
  // open the bastion
  await autoscaling.set({capacity: 1});
  await send([[`Request made, waiting for it to be ready...`]]);
  // wait for the server to be ready
  let instance = (await autoscaling.get()).instance;
  while (!instance || instance.status != 'running') {
    info('waiting on instance', {instance});
    await pauseForEffect({min: 5000, max: 10000});
    await send([
      [`Still waiting...`],
      [`One moment...`],
      [`Tum-tee-tum...`],
      [`Shouldn't be long now...`],
      [`It's not quite ready...`],
      [`Nearly there...`],
      [`Only a couple of minutes more...`],
    ]);
    instance = (await autoscaling.get()).instance;
  }
  // it's done!
  await send([
    [
      `Right it's done! The bastion is open on ${instance.ipaddress}`,
      `Don't do anything silly, I'm watching you...`,
      '👀',
    ],
  ]);
};
module.exports = {
  handle,
};
