const {info} = require('lambda-log');
const {find} = require('lodash');
const AWS = require('aws-sdk');

// create the helpers
const autoscaling = new AWS.AutoScaling({apiVersion: '2011-01-01'});
const ec2 = new AWS.EC2();
const lambda = new AWS.Lambda();
const ssm = new AWS.SSM();

// inspect the auto-scaling group
const get = async () => {
  info('getting auto-scaling group');

  const autoscalingParams = {
    AutoScalingGroupNames: [process.env.BASTION_AUTO_SCALING_GROUP],
  };
  const {
    AutoScalingGroups: [{Instances: instances}],
  } = await autoscaling.describeAutoScalingGroups(autoscalingParams).promise();

  let instance = null;
  if (instances.length) {
    // get the id and state
    const id = instances[0].InstanceId;

    // load the extra info from describeInstances
    const {
      Reservations: [{Instances: details}],
    } = await ec2.describeInstances({InstanceIds: [id]}).promise();

    // pull out additional info if the instance is ready
    if (details.length) {
      const {
        State: {Name: status},
        LaunchTime: launched,
        PublicIpAddress: ipaddress,
      } = details[0];
      instance = {
        id,
        status,
        launched,
        ipaddress,
      };
    }
  }

  const ret = {instance};
  info('got auto-scaling group', ret);
  return ret;
};

// set the desired capacity of the auto-scaling group
const set = async ({capacity}) => {
  info('setting desired capacity', {capacity});

  const autoscalingParams = {
    AutoScalingGroupName: process.env.BASTION_AUTO_SCALING_GROUP,
    DesiredCapacity: capacity,
  };

  const ret = await autoscaling.setDesiredCapacity(autoscalingParams).promise();
  info('set desired capacity', ret);
};

// invoke the lambda
const invoke = async ({arn, message}) => {
  info('invoking lambda', {arn});

  const params = {
    FunctionName: arn,
    InvocationType: 'Event',
    Payload: JSON.stringify(message),
  };

  await lambda.invoke(params).promise();
};

// get parameters
let __telegramSecretsCache;

const getTelegramSecrets = async () => {
  info('getting ssm parameters');
  // check the cache
  if (__telegramSecretsCache) return __telegramSecretsCache;

  const token = `${process.env.NAME}-telegram-token`;
  const user = `${process.env.NAME}-telegram-user`;

  const params = {
    Names: [token, user],
    WithDecryption: true,
  };
  const {Parameters: parameters} = await ssm.getParameters(params).promise();

  __telegramSecretsCache = {
    token: find(parameters, {Name: token}).Value,
    user: find(parameters, {Name: user}).Value,
  };

  return __telegramSecretsCache;
};

let __initialisedCache;
const getInitialised = async () => {
  info('getting ssm parameters');
  // check the cache
  if (__initialisedCache != undefined) return __initialisedCache;

  const name = `${process.env.NAME}-initialised`;
  const params = {
    Name: name,
    WithDecryption: false,
  };
  const {
    Parameter: {Value: value},
  } = await ssm.getParameter(params).promise();

  __initialisedCache = value == 'true';
  return __initialisedCache;
};

const setInitialised = async () => {
  const name = `${process.env.NAME}-initialised`;
  const params = {
    Name: name,
    Type: 'String',
    Value: 'true',
    Overwrite: true,
  };
  await ssm.putParameter(params).promise();
  __initialisedCache = true;
};

module.exports = {
  autoscaling: {
    get,
    set,
  },
  lambda: {
    invoke,
  },
  ssm: {
    getTelegramSecrets,
    getInitialised,
    setInitialised,
  },
};
