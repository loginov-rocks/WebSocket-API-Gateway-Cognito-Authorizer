import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const CONNECTIONS_TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME;

const dynamoDbClient = new DynamoDBClient({});
const dynamoDbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler = async (event) => {
  console.log('event', JSON.stringify(event));

  const { authorizer, connectionId } = event.requestContext;

  // Obtain headers and query parameters added to the request by the client and context value added by the Authorizer
  // Function.
  const { headers, queryStringParameters } = event;
  let clientHeader, clientQueryParameter, customPayload;

  if (headers) {
    ({ clientHeader } = headers);
  }

  if (queryStringParameters) {
    ({ clientQueryParameter } = queryStringParameters);
  }

  if (authorizer) {
    ({ customPayload } = authorizer);
  }

  const item = {
    connectionId, clientHeader, clientQueryParameter, customPayload,
  };

  const putCommand = new PutCommand({
    Item: item,
    TableName: CONNECTIONS_TABLE_NAME,
  });

  let putCommandResponse;
  try {
    putCommandResponse = await dynamoDbDocumentClient.send(putCommand);
  } catch (error) {
    console.error('error', JSON.stringify(error));

    return { statusCode: 500 };
  }

  console.log('putCommandResponse', JSON.stringify(putCommandResponse));

  return { statusCode: 204 };
};
