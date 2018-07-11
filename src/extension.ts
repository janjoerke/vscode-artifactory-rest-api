import { GAVCSearch } from './GAVCSearch';
'use strict';
import * as vscode from 'vscode';
import { PatternSearch } from './PatternSearch';

export function activate(context: vscode.ExtensionContext) {

    let url= vscode.workspace.getConfiguration().get('artifactory.rest.api.url');
    let user = vscode.workspace.getConfiguration().get('artifactory.rest.api.user');
    let pass = vscode.workspace.getConfiguration().get('artifactory.rest.api.pass');
    let mavenRepositories = vscode.workspace.getConfiguration().get('artifactory.rest.api.mavenrepositories') as string[];
    let ivyRepositories = vscode.workspace.getConfiguration().get('artifactory.rest.api.ivyrepositories') as string[];

    let ps : PatternSearch = new PatternSearch(url as string, user as string, pass as string);
    let patternSeach = vscode.commands.registerCommand('artifactory.rest.api.patternsearch', async () => {
        const repository = await vscode.window.showQuickPick(mavenRepositories.concat(ivyRepositories), {placeHolder: 'Select repository to query.'});
        const pattern = await vscode.window.showInputBox({prompt: 'Enter Pattern.'});
        ps.call(ps, pattern as string, repository as string);
    });
    context.subscriptions.push(patternSeach);

    let gs : GAVCSearch = new GAVCSearch(url as string, user as string, pass as string);
    let gavcSearch = vscode.commands.registerCommand('artifactory.rest.api.gavcsearch', async () => {
        const repository = await vscode.window.showQuickPick(['All repositories'].concat(mavenRepositories), {placeHolder: 'Select repository to query.'}) as string;
        const group = await vscode.window.showInputBox({prompt: 'Enter Group.'}) as string;
        const artifact = await vscode.window.showInputBox({prompt: 'Enter Artifact.'}) as string;
        const version = await vscode.window.showInputBox({prompt: 'Enter Version.'}) as string;
        const classifier = await vscode.window.showInputBox({prompt: 'Enter Classifier.'}) as string;
        gs.call(gs, repository, group, artifact, version, classifier);
    });
    context.subscriptions.push(gavcSearch);
}

// this method is called when your extension is deactivated
export function deactivate() {
}