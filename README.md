# WebSocket API Gateway Cognito Authorizer

WebSocket API Gateway Cognito Authorizer.

Medium: https://loginov-rocks.medium.com/authorize-access-to-websocket-api-gateway-with-cognito-d7c0d35e7e89

## Authorizer Function

```sh
npm i
npm run build
npm run package
```

Upload `authorizer-function.zip` as source code for the Lambda.

## Cognito Web Auth

```sh
npm i
npm start
```

## Lambda Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "execute-api:Invoke",
      "Effect": "Allow",
      "Resource": "arn:aws:execute-api:us-east-1:1234567890:abc123/production/*"
    }
  ]
}
```

Where:

* `us-east-1` - region,
* `1234567890` - account,
* `abc123` - API Gateway ID,
* `production` - stage.

## wscat

```sh
npm install -g wscat
```

```sh
wscat -c 'wss://abc123.execute-api.us-east-1.amazonaws.com/$default'
```
