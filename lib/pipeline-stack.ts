import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { Repository } from "aws-cdk-lib/aws-codecommit";
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { WorkshopPipelineStage } from "./pipeline-stage";

export class WorkshopPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create code commit repository
    const repository = new Repository(this, "CdkWorkshopRepo", {
      repositoryName: "CdkWorkshopRepo",
    });

    // create pipeline
    const pipeline = new CodePipeline(this, "CdkWorkshopPipeline", {
      pipelineName: "CdkWorkshopPipeline",
      synth: new CodeBuildStep("Synthstep", {
        // use CodeCommit source
        // input: CodePipelineSource.codeCommit(repository, 'master'),
        // use github source
        // test if change to Github will trigger pipeline
        input: CodePipelineSource.gitHub("andrewouko/cdk-workshop", "master", {
          authentication: SecretValue.secretsManager(
            "github-access-token-secret"
          ),
        }),
        installCommands: ["npm install -g aws-cdk"],
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    // add deploy step
    const deploy = new WorkshopPipelineStage(this, "Deploy");
    const deployStage = pipeline.addStage(deploy);
  }
}
