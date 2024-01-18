import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const CONNECTIONS_TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME;

const dynamoDbClient = new DynamoDBClient({});
const dynamoDbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler = async (event) => {
  console.log('event', JSON.stringify(event));

  const { connectionId } = event.requestContext;

  const deleteCommand = new DeleteCommand({
    Key: { connectionId },
    TableName: CONNECTIONS_TABLE_NAME,
  });

  let deleteCommandResponse;
  try {
    deleteCommandResponse = await dynamoDbDocumentClient.send(deleteCommand);
  } catch (error) {
    console.error('error', JSON.stringify(error));

    return { statusCode: 500 };
  }

  console.log('deleteCommandResponse', JSON.stringify(deleteCommandResponse));

  return { statusCode: 204 };
};
