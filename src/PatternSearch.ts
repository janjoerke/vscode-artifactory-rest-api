'use strict';
import * as vscode from 'vscode';

export class PatternSearch {

    url: string;
    options : object;

    constructor(url: string, user:string, pass: string) {
        this.url = url;
        this.options = {
            user: user, 
            password: pass,
            mimetypes: {
                json: ["application/vnd.org.jfrog.artifactory.search.PatternResultFileSet+json"]
            }
        };
    }

    call(ps: PatternSearch, pattern: string, repository: string) {
        let Client = require('node-rest-client').Client;
        let client = new Client(this.options);
        let calling = `${this.url}/api/search/pattern?pattern=${repository}:${pattern}`;
        client.get(calling, function (data:any, response:any) {
            let files : string[];
            files = data.files;
            files.sort();
            let documents = vscode.workspace.textDocuments;
            let document : string;
            if(documents.length === 0) {
                document = 'untitled:Untitled-1';
            } else {
                let i : number = 0;
                let name : string;
                do {
                    i++;
                    name = `Untitled-${i}`;
                } while(documents.find(d => d.fileName === name) !== undefined);
                document = `untitled:${name}`;
            }
            vscode.workspace.openTextDocument(vscode.Uri.parse(document)).then(textDocument =>
                vscode.window.showTextDocument(textDocument).then(textEditor =>
                    ps.result(textEditor, files, calling)
                )
            );
        });
    }

    private result(textEditor: vscode.TextEditor, files: string[], calling: string) {
        textEditor.edit(textEditorEdit => {
            textEditorEdit.insert(new vscode.Position(0, 0), `${calling}\n`);
            if(files.length === 0) {
                textEditorEdit.insert(new vscode.Position(1, 0), 'No results\n');
            } else {
                for (var _i = 1; _i <= files.length; _i++) {
                    textEditorEdit.insert(new vscode.Position(_i, 0), `${files[_i - 1]}\n`);
                }
            }
        });
    }
}