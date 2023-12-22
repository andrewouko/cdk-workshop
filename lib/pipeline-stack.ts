import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { Repository } from "aws-cdk-lib/aws-codecommit";
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
  IFileSetProducer,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { WorkshopPipelineStage } from "./pipeline-stage";

export class WorkshopPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // input (Repository/Source) for the pipeline
    let input: IFileSetProducer;

    // use CodeCommit source
    /* // create a new CodeCommit repository
    const repository = new Repository(this, "CdkWorkshopRepo", {
      repositoryName: "CdkWorkshopRepo",
    });
    input = CodePipelineSource.codeCommit(repository, "master"); */

    // use a GitHub repository
    input = CodePipelineSource.gitHub("andrewouko/cdk-workshop", "master", {
      authentication: SecretValue.secretsManager("github-access-token-secret"),
    });

    // create pipeline
    const pipeline = new CodePipeline(this, "CdkWorkshopPipeline", {
      pipelineName: "CdkWorkshopPipeline",
      synth: new CodeBuildStep("Synthstep", {
        input,
        installCommands: ["npm install -g aws-cdk"],
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      })
    });

    // add deploy step for the CdkWorkshopStack
    const deploy = new WorkshopPipelineStage(this, "Deploy");
    // add it to the pipeline
    const deployStage = pipeline.addStage(deploy);
  }
}
