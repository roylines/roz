const {info} = require('lambda-log');
const AWS = require('aws-sdk');

// create the autoscaling helper
const autoscaling = new AWS.AutoScaling({apiVersion: '2011-01-01'});

// inspect the auto-scaling group
const get = async ({name}) => {
  info('getting auto-scaling group', name);

  const autoscalingParams = {AutoScalingGroupNames: [name]};
  const {
    AutoScalingGroups: [{DesiredCapacity: capacity, Instances}],
  } = await autoscaling.describeAutoScalingGroups(autoscalingParams).promise();

  let instance = null;
  if (Instances.length) {
    instance = {
      id: Instances[0].InstanceId,
      state: Instances[0].LifecycleState,
    };
  }

  const ret = {capacity, instance};
  info('got auto-scaling group', ret);
  return ret;
};

// set the desired capacity of the auto-scaling group
const set = async ({name, capacity}) => {
  info('setting desired capacity', {name, capacity});

  const autoscalingParams = {
    AutoScalingGroupName: name,
    DesiredCapacity: capacity,
  };

  const ret = await autoscaling.setDesiredCapacity(autoscalingParams).promise();
  info('set desired capacity', ret);
};

module.exports = {
  autoscaling: {
    get,
    set,
  },
};
