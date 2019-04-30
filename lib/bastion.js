const {info} = require('lambda-log');
const {autoscaling} = require('./aws');
const name = process.env.BASTION_AUTO_SCALING_GROUP;

// open the bastion
const open = async () => {
  info('opening bastion', {name});
  await autoscaling.set({capacity: 1, name});
};

// close the bastion
const close = async () => {
  info('closing bastion', {name});
  await autoscaling.set({capacity: 0, name});
};

// get bastion details
const get = async () => {
  info('getting instance', {name});
  const {instance} = await autoscaling.get({name});
  return instance;
};

module.exports = {
  open,
  close,
  get,
};
