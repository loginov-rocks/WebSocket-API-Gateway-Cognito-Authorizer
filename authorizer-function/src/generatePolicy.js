const generatePolicy = (principalId, effect, resource, context) => ({
  context,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      },
    ],
  },
  principalId,
});

export const generateAllowPolicy = (principalId, resource, context) => (
  generatePolicy(principalId, 'Allow', resource, context)
);

export const generateDenyPolicy = (principalId, resource, context) => (
  generatePolicy(principalId, 'Deny', resource, context)
);
