/* import {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
  Handler,
} from "aws-lambda"; */

exports.handler = async (event, context) => {
  console.log("EVENT: \n" + JSON.stringify(event, null, 2));
  console.log("Log stream name:" + context.logStreamName);
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Good night, CDK! You have hit ${event.path}`,
  };
};
