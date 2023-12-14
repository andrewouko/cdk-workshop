import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class HitCounter extends Construct {
  // for accessing the counter lambda function
  readonly handler: IFunction;
  // expose Hits table
  readonly table: Table;
  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);
    const table = new Table(this, "Hits", {
      partitionKey: { name: "path", type: AttributeType.STRING },
      // Set the DynamoDB table to be deleted upon stack deletion
      removalPolicy: RemovalPolicy.DESTROY
    });
    this.table = table;
    this.handler = new Function(this, 'HitsCounterHandler', {
        runtime: Runtime.NODEJS_16_X,
        code: Code.fromAsset('lambda'),
        handler: 'hitCounter.handler',
        environment: {
            HITS_TABLE_NAME: table.tableName,
            DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName
        }
    })
    // grant r/w permissions for dynamoDB table to our handler
    table.grantReadWriteData(this.handler)

    // grant invoke role to the downstream handler
    props.downstream.grantInvoke(this.handler)
  }
}

export interface HitCounterProps {
  // func that counts the number of times our url is hit
  downstream: IFunction;
}
