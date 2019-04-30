const {Lambda} = require('aws-sdk');
const {isAuthorised} = require('./auth');
const {open, get} = require('./bastion');
const {send, pauseForEffect} = require('./message');
const {warn, error, info} = require('lambda-log');

// handle the break glass procedure
const handleBreakGlass = async () => {
  try {
    await send([["OK, I'm opening the bastion now."]]);
    // open the bastion
    await open();
    await send([['Request made, waiting for it to be ready...']]);
    // wait for the server to be ready
    let instance = await get();
    while (!instance || instance.status != 'running') {
      info('waiting on instance', {instance});
      await pauseForEffect({min: 3000, max: 7000});
      await send([
        [`Still waiting...`],
        [`One moment...`],
        [`Tum-tee-tum`],
        [`Shouldn't be long now.`],
        [`It's not quite ready.`],
      ]);
      instance = await get();
    }
    await send([
      [
        `Right it's done.`,
        `You can SSH into it at ${instance.ipaddress}`,
        `Don't do anything silly`,
        `I'm watching you...`,
      ],
    ]);
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

// handles reinvoked messages. These are already authorised
const handleReInvoke = async message => {
  info('telegram message received', {message});
  switch (message.text.toLowerCase()) {
    case 'break glass':
      await handleBreakGlass(message);
      break;
    default:
      await send([["I'm watching you...", 'Always watching...', 'Always!']]);
      break;
  }
};

exports.handler = async (evt, context) => {
  try {
    info('message received', {evt});
    const {body} = evt;
    // we can tell if the lambda was invoked from api gateway by the presence of a body
    if (body) {
      // this is a request from telegram via API Gateway
      return await handleAPIGatewayCall(evt, context);
    } else {
      // this is a direct call
      return await handleReInvoke(evt, context);
    }
  } catch (e) {
    error(e);
    return {statusCode: 500};
  }
};
