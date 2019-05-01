const {Lambda} = require('aws-sdk'); //TODO move to helper
const {isAuthorised} = require('./auth');
const {open, close, get} = require('./bastion');
const {polling} = require('./aws');
const {send, pauseForEffect} = require('./message');
const {warn, error, info} = require('lambda-log');

// handle the break glass procedure
const handleBreakGlass = async () => {
  try {
    await send([[`OK, I'm opening the bastion now.`]]);
    // open the bastion
    await open();
    await send([[`Request made, waiting for it to be ready...`]]);
    // wait for the server to be ready
    let instance = await get();
    while (!instance || instance.status != 'running') {
      info('waiting on instance', {instance});
      await pauseForEffect({min: 3000, max: 7000});
      await send([
        [`Still waiting...`],
        [`One moment...`],
        [`Tum-tee-tum...`],
        [`Shouldn't be long now...`],
        [`It's not quite ready...`],
        [`Nearly there...`],
        [`Only a couple of minutes more...`],
      ]);
      instance = await get();
    }
    await send([
      [
        `Right it's done! The bastion is open on ${instance.ipaddress}`,
        `Don't do anything silly, I'm watching you...`,
        '👀',
      ],
    ]);

    await polling.set({frequency: '1 minute'});
  } catch (e) {
    error('ERROR', e);
    throw e;
  }
};
// handles requests from telegram. Must return 200 quickly, and reinvoke ourself for actual processing.
const handleAPIGatewayCall = async ({body}, {invokedFunctionArn: arn}) => {
  info('api gateway call received, authorising');
  const {message} = JSON.parse(body);
  if (!isAuthorised(message.from.id)) {
    warn('unauthorised user', {message});
    return {statusCode: 200}; // we will return 200 anyway, otherwise telegram will retry
  }
  info('user authorised, re-invoking self');
  const lambdaParams = {
    FunctionName: arn,
    InvocationType: 'Event',
    Payload: JSON.stringify(message),
  };
  const lambda = new Lambda();
  await lambda.invoke(lambdaParams).promise();
  return {statusCode: 200};
};
// handles scheduled events to check for open bastions
const handleScheduledEvent = async () => {
  info('scheduled event received, checking if the bastion is open');
  let instance = await get();
  if (instance && instance.status == 'running') {
    // bastion is open
    const now = Date.now();
    const launched = new Date(instance.launched);
    const elapsed = now - launched;
    if (elapsed > 5 * 60000) {
      await send([[`Bastion has been open for too long.`, `I'm closing it`]]);
      await close();
      await send([
        [`Bastion closure initiated`, `Watching. Always watching 👀`],
      ]);
      // TODO INCREASE THE POLL THRESHOLD
      await polling.set({frequency: '1 hour'});
    }
  }
}; // handles reinvoked messages. These are already authorised
const handleReInvoke = async message => {
  info('telegram message received', {message});
  switch (message.text.toLowerCase()) {
    case 'break glass':
      await handleBreakGlass(message);
      break;
    default:
      await send([[`I'm watching you...`, `Always watching...`, `Always!`]]);
      break;
  }
};
exports.handler = async (evt, context) => {
  try {
    info('message received', {evt});
    const {body, 'detail-type': type} = evt;
    // if there's a body, it's from telegram via API gateway
    if (body) return await handleAPIGatewayCall(evt, context);
    // if the type is scheduled event then that's what is is
    if (type == 'Scheduled Event')
      return await handleScheduledEvent(evt, context);
    // otherwise it's a direct call
    return await handleReInvoke(evt, context);
  } catch (e) {
    error(e);
    return {statusCode: 500};
  }
};
