const {info} = require('lambda-log');
const {autoscaling} = require('./aws');
const defaultName = process.env.BASTION_AUTO_SCALING_GROUP;

// open the bastion
const open = async ({name = defaultName}) => {
  info('opening bastion', {name});
  await autoscaling.set({capacity: 1, name});
};

// close the bastion
const close = async ({name = defaultName}) => {
  info('closing bastion', {name});
  await autoscaling.set({capacity: 0, name});
};

// get bastion details
const get = async ({name = defaultName}) => {
  info('getting instance', {name});
  const {instance} = await autoscaling.get({name});
  return instance;
};

module.exports = {
  open,
  close,
  get,
};
