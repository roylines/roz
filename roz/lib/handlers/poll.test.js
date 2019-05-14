const {handle} = require('./poll');
const {autoscaling, ssm} = require('../aws');
const {send} = require('../telegram');

jest.mock('../aws');
jest.mock('lambda-log');
jest.mock('../telegram');

describe('poll handler', () => {
  beforeEach(() => jest.resetAllMocks());
  it('should send greeting if first time', async () => {
    ssm.getInitialised.mockResolvedValue(false);
    autoscaling.get.mockResolvedValue({instance: null});
    await handle();
    expect(send).toMatchSnapshot();
    expect(autoscaling.get.mock.calls).toMatchSnapshot();
    expect(autoscaling.set).not.toHaveBeenCalled();
    expect(ssm.setInitialised).toHaveBeenCalled();
  });
  it('should do nothing if no instances returned', async () => {
    ssm.getInitialised.mockResolvedValue(true);
    autoscaling.get.mockResolvedValue({instance: null});
    await handle();
    expect(autoscaling.get.mock.calls).toMatchSnapshot();
    expect(send).not.toHaveBeenCalled();
    expect(autoscaling.set).not.toHaveBeenCalled();
    expect(ssm.setInitialised).not.toHaveBeenCalled();
  });
  it('should do nothing if instances is not running', async () => {
    ssm.getInitialised.mockResolvedValue(true);
    autoscaling.get.mockResolvedValue({instance: {status: 'terminated'}});
    await handle();
    expect(autoscaling.get.mock.calls).toMatchSnapshot();
    expect(send).not.toHaveBeenCalled();
    expect(autoscaling.set).not.toHaveBeenCalled();
    expect(ssm.setInitialised).not.toHaveBeenCalled();
  });
  it('should do nothing if instances has been running for a short time', async () => {
    ssm.getInitialised.mockResolvedValue(true);
    autoscaling.get.mockResolvedValue({
      instance: {
        status: 'running',
        launched: Date.now(),
      },
    });
    await handle();
    expect(autoscaling.get.mock.calls).toMatchSnapshot();
    expect(send).not.toHaveBeenCalled();
    expect(autoscaling.set).not.toHaveBeenCalled();
    expect(ssm.setInitialised).not.toHaveBeenCalled();
  });
  it('should set capacity to 0 if instances has been running for a long time', async () => {
    ssm.getInitialised.mockResolvedValue(true);
    autoscaling.get.mockResolvedValue({
      instance: {
        status: 'running',
        launched: new Date(2010, 1, 1).getTime(),
      },
    });
    await handle();
    expect(autoscaling.get.mock.calls).toMatchSnapshot();
    expect(send).toMatchSnapshot();
    expect(autoscaling.set).toMatchSnapshot();
    expect(ssm.setInitialised).not.toHaveBeenCalled();
  });
});
