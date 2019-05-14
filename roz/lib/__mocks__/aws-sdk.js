const AWS = jest.genMockFromModule('aws-sdk');

// helper
const getImplementation = v => {
  const promise = jest.fn().mockResolvedValue(`${v}Response`);
  return jest.fn().mockReturnValue({promise});
};

// autoscaling
const describeAutoScalingGroups = getImplementation(
  'describeAutoScalingGroups',
);
const setDesiredCapacity = getImplementation('setDesiredCapacity');
AWS.AutoScaling.mockImplementation(() => {
  return {describeAutoScalingGroups, setDesiredCapacity};
});

// ec2
const describeInstances = getImplementation('describeInstances');
AWS.EC2.mockImplementation(() => {
  return {describeInstances};
});

// lambda
const invoke = getImplementation('invoke');
AWS.Lambda.mockImplementation(() => {
  return {invoke};
});

// ssm
const getParameters = getImplementation('getParameters');
const getParameter = getImplementation('getParameter');
const putParameter = getImplementation('putParameter');
AWS.SSM.mockImplementation(() => {
  return {getParameters, getParameter, putParameter};
});

module.exports = AWS;
