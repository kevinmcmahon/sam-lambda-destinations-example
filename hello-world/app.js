const path = require('path');

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.lambdaHandler = async (event, context, callback) => {
  var event_received_at = new Date().toISOString();
  console.log('Event received at: ' + event_received_at);
  console.log('Received event:', JSON.stringify(event, null, 2));

  // Object key may have spaces or unicode non-ASCII characters.
  var srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  );

  var parsedPath = path.parse(srcKey);

  // Infer the image type.
  var typeMatch = parsedPath.ext.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log('Failure');
    context.callbackWaitsForEmptyEventLoop = false;
    callback(
      new Error('Failure from event, Could not determine the file type.'),
      'Destination Function Error Thrown'
    );
  }

  var imageType = typeMatch[1].toLowerCase();
  if (imageType != 'jpg' && imageType != 'png') {
    console.log('Failure');
    context.callbackWaitsForEmptyEventLoop = false;
    callback(
      new Error(
        'Failure from event, Not a supported image. Must be jpg or png.'
      ),
      'Destination Function Error Thrown'
    );
  } else {
    console.log('Success');
    context.callbackWaitsForEmptyEventLoop = false;
    callback(null, { path: parsedPath });
  }
};
