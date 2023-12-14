const { DynamoDB, Lambda } = require("aws-sdk");

exports.handler = async function (event, context) {
  console.log(`request: ${JSON.stringify(event, undefined, 2)}`);

  // aws sdk clients
  const dynamodb = new DynamoDB();
  const lambda = new Lambda();

  // update dynamodb table
  // increment hits
  await dynamodb
    .updateItem({
      TableName: process.env.HITS_TABLE_NAME,
      Key: { path: { S: event.path } },
      UpdateExpression: "ADD hits :increment",
      ExpressionAttributeValues: { ':increment': { N: '1' } },
    })
    .promise();

  // call downstream lambda function
  const response = await lambda
    .invoke({
      FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
      Payload: JSON.stringify(event),
    })
    .promise();

    console.log(`Downstream response: ${JSON.stringify(response, undefined, 2)}`);

  // return response back to upstream caller
  return JSON.parse(response.Payload)
};
