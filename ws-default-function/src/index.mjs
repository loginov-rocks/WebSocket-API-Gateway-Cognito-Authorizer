import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const CONNECTIONS_TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME;
const WEBSOCKET_API_GATEWAY_ENDPOINT = process.env.WEBSOCKET_API_GATEWAY_ENDPOINT;

const apiGatewayManagementApiClient = new ApiGatewayManagementApiClient({
  endpoint: WEBSOCKET_API_GATEWAY_ENDPOINT,
});
const dynamoDbClient = new DynamoDBClient({});
const dynamoDbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler = async (event) => {
  console.log('event', JSON.stringify(event));

  const { connectionId } = event.requestContext;

  // Get DynamoDB item saved on $connect.
  const getCommand = new GetCommand({
    Key: { connectionId },
    TableName: CONNECTIONS_TABLE_NAME,
  });

  let getCommandResponse;
  try {
    getCommandResponse = await dynamoDbDocumentClient.send(getCommand);
  } catch (error) {
    console.error('error', JSON.stringify(error));

    return { statusCode: 500 };
  }

  console.log('getCommandResponse', JSON.stringify(getCommandResponse));

  if (!getCommandResponse.Item) {
    return { statusCode: 404 };
  }

  // Respond to the incoming message with data, DynamoDB item will have headers and query parameters added to the
  // request by Sign Function.
  const data = JSON.stringify({
    dynamoDbItem: getCommandResponse.Item,
    event,
  });

  console.log('data', data);

  const postToConnectionCommand = new PostToConnectionCommand({
    Data: data,
    ConnectionId: connectionId,
  });

  let postToConnectionCommandResponse;
  try {
    postToConnectionCommandResponse = await apiGatewayManagementApiClient.send(postToConnectionCommand);
  } catch (error) {
    console.error('error', JSON.stringify(error));

    return { statusCode: 500 };
  }

  console.log('postToConnectionCommandResponse', JSON.stringify(postToConnectionCommandResponse));

  return { statusCode: 204 };
};
