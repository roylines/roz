const {isAuthorised} = require('./auth');
const {lambda, autoscaling} = require('./aws');
const {send, pauseForEffect} = require('./message');
const {warn, error, info} = require('lambda-log');

exports.handler = async (evt, context) => {
  try {
    info('message received', {evt});

    // if there's a body, it's from telegram via API gateway
    if (evt.body) return await handleTelegram(evt, context);

    // if the type is scheduled event then that's what is is
    if (evt['detail-type'] == 'Scheduled Event')
      return await handlePoll(evt, context);

    // otherwise it's a direct call
    return await handleDirect(evt, context);
  } catch (e) {
    error(e);
    return {statusCode: 500};
  }
};

// handles requests from telegram. Must return 200 quickly, and reinvoke ourself for actual processing.
const handleTelegram = async ({body}, {invokedFunctionArn: arn}) => {
  info('api gateway call received, authorising');
  // parse the body into JSON
  const {message} = JSON.parse(body);
  // check the user is authorised
  if (!isAuthorised(message.from.id)) {
    warn('unauthorised user', {message});
    return {statusCode: 200}; // we will return 200 anyway, otherwise telegram will retry
  }
  // reinvoke self, and return 200 to stop telegram from retrying
  info('user authorised, re-invoking self');
  await lambda.invoke({arn, message});
  return {statusCode: 200};
};

const handlePoll = async () => {
  info('scheduled event received, checking if the bastion is open');

  // get any instances
  const {instance} = await autoscaling.get();
  if (instance && instance.status == 'running') {
    // bastion is open
    const now = Date.now();
    const launched = new Date(instance.launched);
    // check to see if it's been open for more than 3 minutes
    if (now - launched > 3 * 60000) {
      await send([[`Bastion has been open for too long.`, `I'm closing it`]]);
      await autoscaling.set({capacity: 0});
      await send([[`Close requested`, `Watching. Always watching 👀`]]);
    }
  }
};
const handleDirect = async message => {
  info('telegram message received', {message});
  switch (message.text.toLowerCase()) {
    case 'break glass':
      await handleBreakGlass(message);
      break;
    case 'hello':
      await send([[`I'm watching you...`, `Always watching...`, `Always!`]]);
      break;
    default:
      info('unknown message');
      break;
  }
}; // handle the break glass procedure
const handleBreakGlass = async () => {
  await send([[`OK, I'm opening the bastion now.`]]);
  // open the bastion
  await autoscaling.set({capacity: 1});
  await send([[`Request made, waiting for it to be ready...`]]);
  // wait for the server to be ready
  let instance = (await autoscaling.get()).instance;
  while (!instance || instance.status != 'running') {
    info('waiting on instance', {instance});
    await pauseForEffect({min: 5000, max: 10000});
    await send([
      [`Still waiting...`],
      [`One moment...`],
      [`Tum-tee-tum...`],
      [`Shouldn't be long now...`],
      [`It's not quite ready...`],
      [`Nearly there...`],
      [`Only a couple of minutes more...`],
    ]);
    instance = (await autoscaling.get()).instance;
  }
  // it's done!
  await send([
    [
      `Right it's done! The bastion is open on ${instance.ipaddress}`,
      `Don't do anything silly, I'm watching you...`,
      '👀',
    ],
  ]);
};
