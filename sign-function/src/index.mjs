import { sign } from './sign.mjs';

// Environment variable provided by AWS.
const AWS_REGION = process.env.AWS_REGION;

// Environment variable injected by CloudFormation.
const WEBSOCKET_API_URL = process.env.WEBSOCKET_API_URL;

export const handler = async (event) => {
  console.log('event', JSON.stringify(event));

  let requestedHeaders, requestedUrl;

  // Take headers and URL provided by the client, if any.
  if (event.body) {
    try {
      const body = JSON.parse(event.body);

      console.log('request', JSON.stringify(body));

      requestedHeaders = body.headers;
      requestedUrl = body.url;
    } catch (error) {
      console.error('error', JSON.stringify(error));

      return { statusCode: 400 };
    }
  }

  // Use WebSocket API URL by default.
  const url = requestedUrl ? requestedUrl : WEBSOCKET_API_URL;

  // Provide additional query parameters according to requirements.
  const query = {
    customQueryParameter: 'customQueryParameterValue',
  };

  // Provide additional headers according to requirements.
  const headers = {
    ...requestedHeaders,
    customHeader: 'customHeaderValue',
  };

  let response;
  try {
    response = await sign(AWS_REGION, url, query, headers);
  } catch (error) {
    console.error('error', JSON.stringify(error));

    return { statusCode: 500 };
  }

  const responseJson = JSON.stringify(response);

  console.log('response', responseJson);

  return {
    body: responseJson,
    headers: {
      'content-type': 'application/json',
    },
    statusCode: 200,
  };
};
