import { generateAllowPolicy /*, generateDenyPolicy */ } from './generatePolicy';
import { verifyToken } from './verifyToken';

// Environment variable provided by AWS.
const AWS_REGION = process.env.AWS_REGION;

// Environment variables injected by CloudFormation.
const COGNITO_AUTHORIZER_IDENTITY_SOURCE_HEADER_NAME = process.env.COGNITO_AUTHORIZER_IDENTITY_SOURCE_HEADER_NAME;
const USER_POOL_ID = process.env.USER_POOL_ID;

exports.handler = async (event) => {
  console.log('event', JSON.stringify(event));

  const { headers } = event;
  const identitySourceHeader = headers[COGNITO_AUTHORIZER_IDENTITY_SOURCE_HEADER_NAME.toLowerCase()];

  // `identitySourceHeader` should be present and have the following format: `Bearer JWT`.
  if (!identitySourceHeader || identitySourceHeader.substring(0, 7) !== 'Bearer ') {
    return 'Unauthorized';
  }

  const token = identitySourceHeader.substring(7);

  if (!token) {
    return 'Unauthorized';
  }

  const verifyTokenResponse = await verifyToken(AWS_REGION, USER_POOL_ID, token);

  if (!verifyTokenResponse) {
    return 'Unauthorized';
  }

  console.log('verifyTokenResponse', JSON.stringify(verifyTokenResponse));

  // Optionally: use `verifyTokenResponse` data to allow or deny (with `generateDenyPolicy()`) user access based on
  // your business requirements. You can also add whatever context payload you'd like - it will be available in every
  // WS lambda call.
  const policy = generateAllowPolicy('user', event.methodArn, {
    ...verifyTokenResponse,
    customPayload: 'customPayloadValue',
  });

  console.log('policy', JSON.stringify(policy));

  return policy;
};
