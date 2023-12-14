import { App, Stack, StackProps } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { HitCounter } from "./hitcounter";
import { TableViewer } from "cdk-dynamo-table-viewer";
import { Construct } from "constructs";
export class CdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // aws lambda resource
    const hello = new Function(this, "HelloHandler", {
      // nodejs runtime used
      runtime: Runtime.NODEJS_20_X,
      // code is loaded from the lambda folder
      code: Code.fromAsset("lambda"),
      // file.functionName
      handler: "hello.handler",
    });

    const helloWithCounter = new HitCounter(this, 'HelloHtCounter', {
      downstream: hello
    })

    // API Gateway which proxies all requests to our lambda function
    // creates a new endpoint visible on deploy
    new LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    })

    // table viewer
    new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello Hits',
      table: helloWithCounter.table,
      // -hits denotes sort the result in descending order of hits column
      sortBy: '-hits'
    })
  }
}
