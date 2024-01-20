const COGNITO_AUTHORIZER_IDENTITY_SOURCE_HEADER_NAME = process.env.COGNITO_AUTHORIZER_IDENTITY_SOURCE_HEADER_NAME;

const generateResponse = (principalId, effect, resource) => {
  return {
    context: {
      stringKey: 'stringval',
      numberKey: 123,
      booleanKey: true,
    },
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        }
      ],
    },
  };
};

export const handler = async (event) => {
  console.log('event', JSON.stringify(event));

  const { headers } = event;
  const authorizationHeader = headers[COGNITO_AUTHORIZER_IDENTITY_SOURCE_HEADER_NAME.toLowerCase()];

  if (!authorizationHeader) {
    return 'Unauthorized';
  }

  console.log('authorizationHeader', authorizationHeader);

  const response = generateResponse('user', 'Allow', event.methodArn);

  console.log('response', JSON.stringify(response));

  return response;
};
