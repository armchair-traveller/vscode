import * as vscode from 'vscode';
import * as path from 'path';
import { Client, query as q, Expr } from 'faunadb';
import { SchemaType } from './types';

export default class FunctionSchemaItem extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly itemPath?: string,
    private client?: Client
  ) {
    super(name);
  }

  get tooltip(): string {
    return `${this.name}`;
  }

  public displayInfo() {
    if (!this.client) {
      return Promise.resolve(null);
    }

    return this.client
      .query(q.Get(q.Function(this.name)))
      .then(async (content: any) => {
        let uri = vscode.Uri.parse(
          // @ts-ignore comment
          `fqlcode:${this.name}#${Expr.toString(q.Object(content))}`
        );
        let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
        await vscode.window.showTextDocument(doc, { preview: false });
        vscode.languages.setTextDocumentLanguage(doc, 'javascript');
      })
      .catch(error => console.error(error));
  }

  command = {
    command: 'fauna.get',
    title: '',
    arguments: [this]
  };

  iconPath = {
    light: path.join(__filename, '..', '..', 'media', 'code.svg'),
    dark: path.join(__filename, '..', '..', 'media', 'code.svg')
  };

  contextValue = SchemaType.Function;
}
