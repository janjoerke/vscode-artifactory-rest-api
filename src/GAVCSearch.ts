'use strict';
import * as vscode from 'vscode';

export class GAVCSearch {

    url: string;
    options : object;

    constructor(url: string, user:string, pass: string) {
        this.url = url;
        this.options = {
            user: user, 
            password: pass,
            mimetypes: {
                json: ["application/vnd.org.jfrog.artifactory.search.GavcSearchResult+json"]
            }
        };
    }

    call(gs: GAVCSearch, repository: string, group: string, artifact: string, version: string, classifier: string) {
        let Client = require('node-rest-client').Client;
        let client = new Client(this.options);
        let ac = '?';
        let g = '';
        if (group !== '') {
            g = `${ac}g=${group}`;
            ac = '&';
        }
        let a = '';
        if (artifact !== '') {
            a = `${ac}a=${artifact}`;
            ac = '&';
        }
        let v = '';
        if (version !== '') {
            v = `${ac}v=${version}`;
            ac = '&';
        }
        let c = '';
        if (classifier !== '') {
            c = `${ac}c=${classifier}`;
        }
        let r = `&repos=${repository}`;
        if(repository === 'All repositories') {
            r = '';
        }

        let calling = `${this.url}/api/search/gavc${g}${a}${v}${c}${r}`;
        client.get(calling, function (data:any, response:any) {
            let results = data.results;
            let uris : string[] = [];
            for(let result of results) {
                uris.push(result.uri);
            }
            uris.sort();
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
                    gs.result(textEditor, uris, calling)
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