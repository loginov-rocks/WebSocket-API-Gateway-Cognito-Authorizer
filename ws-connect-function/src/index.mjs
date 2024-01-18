import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const CONNECTIONS_TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME;

const dynamoDbClient = new DynamoDBClient({});
const dynamoDbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler = async (event) => {
  console.log('event', JSON.stringify(event));

  const { connectionId } = event.requestContext;

  // Obtain headers and query parameters added to the request by Sign Function.
  const { headers, queryStringParameters } = event;
  const { clientHeader, customHeader } = headers;
  const { clientQueryParameter, customQueryParameter } = queryStringParameters;

  const item = {
    connectionId, clientHeader, clientQueryParameter, customHeader, customQueryParameter,
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
