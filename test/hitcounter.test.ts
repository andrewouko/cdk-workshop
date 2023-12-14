import { Stack } from "aws-cdk-lib";
import { HitCounter } from "../lib/hitcounter";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Capture, Template } from "aws-cdk-lib/assertions";

// test for DynamoDB table
test("DynamoDB table is created", () => {
  const stack = new Stack();
  // WHEN
  // new hitcounter is created
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new Function(stack, "TestLambdaFunction", {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset("lambda"),
      handler: "hello.handler",
    }),
  });
  // THEN
  // one DynamoDB table is created
  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});

// test for environment variables
test("Lambda has environment variables", () => {
  const stack = new Stack();
  // WHEN
  // new hitcounter is created
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new Function(stack, "TestLambdaFunction", {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset("lambda"),
      handler: "hello.handler",
    }),
  });
  // THEN
  // environment variables are passed to lambda function
  const template = Template.fromStack(stack);
  const envCapture = new Capture();
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });
  expect(envCapture.asObject()).toEqual({
    Variables: {
      HITS_TABLE_NAME: {
        Ref: "MyTestConstructHits24A357F0",
      },
      DOWNSTREAM_FUNCTION_NAME: {
        Ref: "TestLambdaFunctionC089708A",
      },
    },
  });
});

// test dynamodb table is created with encryption
test("DynamoDB table is created with encryption", () => {
  const stack = new Stack();
  // WHEN
  // new hitcounter is created
  new HitCounter(stack, "MyTestConstruct", {
    downstream: new Function(stack, "TestLambdaFunction", {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset("lambda"),
      handler: "hello.handler",
    }),
  });
  // THEN
  // DynamoDB table is created with encryption
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::DynamoDB::Table", {
    SSESpecification: {
      SSEEnabled: true,
    },
  });
});

// test read capacity is configurable
test("Read capacity", () => {
  const stack = new Stack();
  // expect an error when read capacity is less than 5
  expect(() => {
    new HitCounter(stack, "MyTestConstruct", {
      downstream: new Function(stack, "TestLambdaFunction", {
        runtime: Runtime.NODEJS_16_X,
        code: Code.fromAsset("lambda"),
        handler: "hello.handler",
      }),
      readCapacity: 3
    });
  }).toThrowError('readCapacity must be greater than 5 and less than 20');
});
