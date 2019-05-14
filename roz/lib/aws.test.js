const aws = require('./aws');
const AWS = require('aws-sdk');

jest.mock('aws-sdk');
jest.mock('lambda-log');

describe('aws', () => {
  process.env.BASTION_AUTO_SCALING_GROUP = 'ASG';
  describe('autoscaling', () => {
    describe('get', () => {
      it('can call get (no instances)', async () => {
        // conditions
        AWS.AutoScaling()
          .describeAutoScalingGroups()
          .promise.mockResolvedValue({
            AutoScalingGroups: [{DesiredCapacity: 42, Instances: []}],
          });

        // call get
        const response = await aws.autoscaling.get('describeAlarms');

        // assertions
        expect(response).toMatchSnapshot();
        expect(
          AWS.AutoScaling().describeAutoScalingGroups.mock.calls,
        ).toMatchSnapshot();
      });
      it('can call get (instance not ready)', async () => {
        // conditions
        AWS.AutoScaling()
          .describeAutoScalingGroups()
          .promise.mockResolvedValue({
            AutoScalingGroups: [
              {
                DesiredCapacity: 42,
                Instances: [{InstanceId: 'IID'}],
              },
            ],
          });

        AWS.EC2()
          .describeInstances()
          .promise.mockResolvedValue({
            Reservations: [
              {
                Instances: [],
              },
            ],
          });

        // call get
        const response = await aws.autoscaling.get('describeAlarms');

        // assertions
        expect(response).toMatchSnapshot();
        expect(
          AWS.AutoScaling().describeAutoScalingGroups.mock.calls,
        ).toMatchSnapshot();
        expect(AWS.EC2().describeInstances.mock.calls).toMatchSnapshot();
      });
      it('can call get (instance ready)', async () => {
        // conditions
        AWS.AutoScaling()
          .describeAutoScalingGroups()
          .promise.mockResolvedValue({
            AutoScalingGroups: [
              {
                DesiredCapacity: 42,
                Instances: [{InstanceId: 'IID'}],
              },
            ],
          });

        AWS.EC2()
          .describeInstances()
          .promise.mockResolvedValue({
            Reservations: [
              {
                Instances: [
                  {
                    State: {
                      Name: 'STATUS',
                    },
                    LaunchTime: 'LAUNCHTIME',
                    PublicIpAddress: 'IPADDRESS',
                  },
                ],
              },
            ],
          });

        // call get
        const response = await aws.autoscaling.get('describeAlarms');

        // assertions
        expect(response).toMatchSnapshot();
        expect(
          AWS.AutoScaling().describeAutoScalingGroups.mock.calls,
        ).toMatchSnapshot();
        expect(AWS.EC2().describeInstances.mock.calls).toMatchSnapshot();
      });
    });
    describe('set', () => {
      it('should set desired capacity', async () => {
        //call set
        await aws.autoscaling.set({capacity: 42});
        expect(
          AWS.AutoScaling().setDesiredCapacity.mock.calls,
        ).toMatchSnapshot();
      });
    });
  });
  describe('lambda', () => {
    describe('invoke', () => {
      it('should call invoke correctly', async () => {
        //call set
        await aws.lambda.invoke({arn: 'ARN', message: {a: 'A'}});
        expect(AWS.Lambda().invoke.mock.calls).toMatchSnapshot();
      });
    });
  });
  describe('ssm', () => {
    describe('getTelegramSecrets', () => {
      it('should call getParameters correctly', async () => {
        AWS.SSM()
          .getParameters()
          .promise.mockResolvedValue({
            Parameters: [
              {
                Name: 'NAME-telegram-token',
                Value: 'TOKEN',
              },
              {
                Name: 'NAME-telegram-user',
                Value: 'USER',
              },
            ],
          });

        process.env.NAME = 'NAME';
        //call set
        const response = await aws.ssm.getTelegramSecrets();
        expect(response).toMatchSnapshot({token: 'TOKEN', user: 'USER'});
        expect(AWS.SSM().getParameters.mock.calls).toMatchSnapshot();
      });
      it('should cache', async () => {
        //call set
        const response = await aws.ssm.getTelegramSecrets();
        expect(response).toMatchSnapshot({token: 'TOKEN', user: 'USER'});
      });
    });
    describe('getInitialised', () => {
      it('should call getParameter correctly', async () => {
        AWS.SSM()
          .getParameter()
          .promise.mockResolvedValue({
            Parameter: {
              Value: 'false',
            },
          });

        process.env.NAME = 'NAME';
        //call set
        const response = await aws.ssm.getInitialised();
        expect(response).toEqual(false);
        expect(AWS.SSM().getParameter.mock.calls).toMatchSnapshot();
      });
      it('should cache', async () => {
        //call set
        const response = await aws.ssm.getInitialised();
        expect(response).toEqual(false);
      });
    });
    describe('setInitialised', () => {
      it('should call putParameter correctly', async () => {
        process.env.NAME = 'NAME';
        await aws.ssm.setInitialised();
        expect(AWS.SSM().putParameter.mock.calls).toMatchSnapshot();
        const response = await aws.ssm.getInitialised();
        expect(response).toEqual(true);
      });
    });
  });
});
