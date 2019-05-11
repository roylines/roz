const {autoscaling} = require('../aws');
const {handle} = require('./breakglass.js');
const {send, pauseForEffect} = require('../telegram');

jest.mock('../aws');
jest.mock('../telegram');
jest.mock('lambda-log');

describe('breakglass handler', () => {
  beforeEach(() => jest.resetAllMocks());

  it('should set capacity and send notifications (ready first time)', async () => {
    autoscaling.get.mockResolvedValue({
      instance: {
        status: 'running',
      },
    });

    await handle();

    expect(autoscaling.set.mock.calls).toMatchSnapshot();
    expect(autoscaling.get.mock.calls).toMatchSnapshot();
    expect(send.mock.calls).toMatchSnapshot();
    expect(pauseForEffect.mock.calls).toMatchSnapshot();
  });
  it('should wait for ready', async () => {
    autoscaling.get.mockReset();
    autoscaling.get
      .mockResolvedValueOnce({
        instance: null,
      })
      .mockResolvedValueOnce({
        instance: {
          status: 'starting',
        },
      })
      .mockResolvedValueOnce({
        instance: {
          status: 'running',
        },
      });

    await handle();

    expect(autoscaling.set.mock.calls).toMatchSnapshot();
    expect(autoscaling.get.mock.calls).toMatchSnapshot();
    expect(send.mock.calls).toMatchSnapshot();
    expect(pauseForEffect.mock.calls).toMatchSnapshot();
  });
});
