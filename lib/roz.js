const {warn, error, info} = require('lambda-log');
const {send} = require('./message');
const {isAuthorised} = require('./auth');
const {open, get} = require('./bastion');
const sleep = require('await-sleep');
const {Lambda} = require('aws-sdk');

const handleBreakGlass = async () => {
  await send([["OK, I'm opening the bastion now."]]);
  // open the bastion
  await open();
  await sleep(2000);
  await send([["I've created the server. Just waiting for it to create..."]]);
  // wait for the server to be ready
  let instance = await get();
  await sleep(2000);
  while (!instance || instance.state != 'InService') {
    await send([['Still waiting...']]);
    instance = await get();
    await sleep(5000);
  }

  await send([
    ["Right it's done. Don't do anything silly.", "I'm watching you..."],
  ]);
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
  switch (message.text) {
    case 'break glass':
      handleBreakGlass(message);
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
