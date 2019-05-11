const {handle} = require('./direct');
const helloHandler = require('./hello');
const breakGlassHandler = require('./breakglass');

jest.mock('./hello');
jest.mock('./breakglass');

describe('direct handler', () => {
  beforeEach(() => jest.resetAllMocks());
  it('should call hello handler for hello', async () => {
    await handle({text: 'Hello'});
    expect(helloHandler.handle).toHaveBeenCalled();
    expect(breakGlassHandler.handle).not.toHaveBeenCalled();
  });
  it('should call break glass handler for break glass', async () => {
    await handle({text: 'Break glass'});
    expect(helloHandler.handle).not.toHaveBeenCalled();
    expect(breakGlassHandler.handle).toHaveBeenCalled();
  });
  it('should do nothing otherwise', async () => {
    await handle({text: 'Yo'});
    expect(helloHandler.handle).not.toHaveBeenCalled();
    expect(breakGlassHandler.handle).not.toHaveBeenCalled();
  });
});
