import { Stack, StackProps } from "aws-cdk-lib";
import { Repository } from "aws-cdk-lib/aws-codecommit";
import { CodeBuildStep, CodePipeline, CodePipelineSource } from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class WorkshopPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps){
        super(scope, id, props);

        // create code commit repository
        const repository = new Repository(this, 'CdkWorkshopRepo', {
            repositoryName: 'CdkWorkshopRepo',
        })

        // create pipeline
        new CodePipeline(this, 'CdkWorkshopPipeline', {
            pipelineName: 'CdkWorkshopPipeline',
            synth: new CodeBuildStep('Synthstep', {
                input: CodePipelineSource.codeCommit(repository, 'master'),
                installCommands: [
                    'npm install -g aws-cdk'
                ],
                commands: [
                    'npm ci',
                    'npm run build',
                    'npx cdk synth'
                ]
            })
        })
    }
}