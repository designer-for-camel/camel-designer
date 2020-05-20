// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require("path");
const fs = require("fs");

              //xpath testing
              var dom = require('xmldom').DOMParser;
              var xpath = require('xpath');

              var xml = "<book><title>Harry Potter</title></book>"
              var doc = new dom().parseFromString(xml)
              var title = xpath.select("//title/text()", doc).toString()
              console.log(title)

//metadata related to the source code generated
var metadata;

//Camel XML editor (textEditor)
var te;

//Camel Visual Designer (webview panel)
var vd;
var td;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let currentPanel = undefined;

  console.log('Camel Designer extension is now active');

  let disposable = vscode.commands.registerCommand('extension.showDesigner', () => {

    //keep reference of Camel XML editor
    te = vscode.window.activeTextEditor;
    td = te.document;
    // if(vd == null)
    // {
      currentPanel = vscode.window.createWebviewPanel(
        'VR Camel',
        'VR Camel',
        vscode.ViewColumn.Three,
        {
            retainContextWhenHidden: true,
            enableScripts: true,
            // localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview')).with({ scheme: 'vscode-resource' })]
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath)).with({ scheme: 'vscode-resource' })]
        });

      //Path to local source HTML (index.html)
      const onDiskPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview', 'index.html'));
      const indexHtml = onDiskPath.with({ scheme: 'vscode-resource' });
      console.log('path: ' + indexHtml.path);
      console.log('path: ' + indexHtml.fsPath);
      console.log('path: ' + indexHtml);

      if(vd == null)
      {
        // And set its HTML content
        currentPanel.webview.html = getWebviewContent(context);
      }
      else
      {
        currentPanel.webview.html = vd;
      }


      // Handler for messages from the webview
      console.log('adding message handler');
      currentPanel.webview.onDidReceiveMessage(
        message => {
          // console.log('got message !!');

          switch (message.command) {

            case 'insert':
              // console.log('insert message handler');
              te = vscode.window.showTextDocument(td,1,true).then(e => {
                e.edit(edit => {
                    // edit.insert(new vscode.Position(0, 0), "Your advertisement here");

                  //the window may have been destroyed and a new one created
                  //we need to reset the languageId if unset
                  if(e.document.languageId != "xml"){
                    vscode.languages.setTextDocumentLanguage(e.document, "xml");
                  }

                  //obtain text on Editor
                  var docText = e.document.getText();

                  //work on the text to replace Camel definitions
                  //other non Camel elements are left 'as is'
                  var closingElement = '</'+message.payload.envelope+'>'
                  var newText = docText.substring(0, docText.indexOf('<'+message.payload.envelope)) +
                                message.payload.code +
                                docText.substring(docText.indexOf(closingElement)+closingElement.length, docText.length)
                                
                  //the full content is selected (to be replaced)
                  var firstLine = e.document.lineAt(0);
                  var lastLine = e.document.lineAt(e.document.lineCount - 1);
                  var textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);

                  //Content replaced with Designer update
                  // edit.replace(textRange, message.payload.code);
                  edit.replace(textRange, newText);

                  metadata = message.payload.metadata;

                  //we clear selection
                  let pos0 = new vscode.Position(0, 0);
                  e.selection = new vscode.Selection(pos0, pos0);
                });
              });

              return;

            case 'metadata':
              console.log('synching metadata');
              metadata = message.payload.metadata;
              return;

            case 'alert':
              console.log('alert message handler');
              vscode.window.showErrorMessage(message.payload);
              return;

            case 'atlasmap-start':
              console.log('starting AtlasMap');
              vscode.window.showErrorMessage(message.payload);
              //vscode.commands.executeCommand("atlasmap.start");
              // let test = vscode.commands.executeCommand("editor.action.webvieweditor.selectAll");

              // test
              // .then(function(value) {
              //         console.log("last 'create' action completed");
              //         syncStartUpEnabled = false;
              //       })

              console.log(vscode.window.visibleTextEditors);
              return;

            case 'importCamelDefinition':
              console.log("got 'importCamelDefinition request'");

              if(te.document.getText().trim().length == 0)
              {
                //abort import process if content is empty
                return;
              }

              //PENDING
              //Here we should implement some validation to confirm the code is a valid Camel definition
              var metadataFile = te.document.fileName+".metadata";
              
              //if metadata file exists we load it
              try {
                if (fs.existsSync(metadataFile)) {
                  metadata = fs.readFileSync(metadataFile, 'utf8')
                  console.log(metadata)
                }
              } catch (err) {
                console.error(err)
              }

              //we capture the editor's content and send it to the designer
              currentPanel.webview.postMessage({ command: 'importCamelDefinition' , source: te.document.getText(), metadata: metadata});

              return;
          }
        },
        undefined,
        context.subscriptions
      );//end of onDidReceiveMessage

      currentPanel.onDidDispose(
        () => {
          vd = currentPanel.webview.html;
          console.log("panel closed");
        },
        null,
        context.subscriptions
      );
    // }
    // else{
    //   currentPanel.webview.html = vd;
    // }

	// // In this example, we want to start watching the currently open doc
	// let currActiveDoc = currOpenEditor.document;

	// let onDidChangeDisposable = vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent)=>{
	// 	if (event.document === currActiveDoc){
	// 		console.log('Watched doc changed');
	// 	}
	// 	else {
	// 		console.log('Non watched doc changed');
	// 	}
  // });
  
          //sample code change
          vscode.workspace.onDidChangeTextDocument((e) => {
            console.log("is it our document: "+(te.document == e.document));          
            // console.log("TEST textChange: "+e.document.fileName);
            // console.log(`changed: ${JSON.stringify(e)}`);
          })

          //sample code change
          vscode.window.onDidChangeTextEditorSelection((e) => {
            console.log("is it our textEditor: "+(te == e.textEditor));
            
            //textLine reference
            var line = null;

            //result of regEx matches
            var result = null;

            //loop to look for activity id
            //the strategy is:
            //  we explore from bottom to top, as the 'id' is an attribute of the parent element
            //  for example, if the cursor is placed at the bottom of the following node:
            //     <setProperty name="dummy" id="prop1">
            //        <simple>dummy</simple>
            //     </setProperty>
            //  we need to seek the 'id' moving upwards
            for(currentLine = e.selections[0].start.line; currentLine > 0; currentLine--)
            {
              //obtains textLine where cursor is placed
              line = e.textEditor.document.lineAt(currentLine).text.trim();

              //if we find a route, we seek the 1st activity in the route to find its 'id'
              if(line.startsWith("<route"))
              {
                line = e.textEditor.document.lineAt(currentLine+1).text.trim();
              }

              //return if if line is empty
              if(line.length == 0){
                console.log("empty line");
                return;
              }

              //run the regular expression looking for the 'id'
              result = line.match(/id="([^"]+)"/);

              //if matches are found
              if(result != null)
              {
                console.log("id is: "+result[1]);

                // Send a message to our webview.
                // You can send any JSON serializable data.
                currentPanel.webview.postMessage({ command: 'setFocus' , id: result[1]});
                
                //when we find a match we stop
                return;
              }
            }
            // console.log("TEST textChange: "+e.document.fileName);
            // console.log(`changed: ${JSON.stringify(e)}`);
            // if(te == e.textEditor)
            // {
            //   e.textEditor.
            // }
          })

          vscode.workspace.onDidSaveTextDocument((e) => {
            console.log("document was saved");          
            // console.log("TEST textChange: "+e.document.fileName);
            // console.log(`changed: ${JSON.stringify(e)}`);

            if(metadata)
            {
              fs.writeFile(e.fileName+'.metadata', metadata, function (err) {
                if (err) return console.log(err);
                //console.log('Hello World > helloworld.txt');
              });
            }
          })


    console.log('showDesigner has been registered');
  }); //end of registerCommand

  console.log('trace2');
  // Temporary command to test comms from Editor to Designer
  context.subscriptions.push(vscode.commands.registerCommand('extension.sendMessage', () => {
      if (!currentPanel) {
          return;
      }
      // Send a message to our webview.
      // You can send any JSON serializable data.
      currentPanel.webview.postMessage({ command: 'importCamelDefinition' });
  }));
  context.subscriptions.push(disposable);
  console.log('trace3');
}
exports.activate = activate;

//Obtains the HTML with paths replaced
function getWebviewContent(context) {
  const indexPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview', 'index.html'));
  const indexHtml = indexPath.with({ scheme: 'vscode-resource' });

  //These are needed to replace paths in the HTML content using 'eval'
  // const srcPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview'));
  const srcPath = vscode.Uri.file(path.join(context.extensionPath));
  const srcPathScheme = srcPath.with({ scheme: 'vscode-resource' });

  //We run 'eval' as a workaround to apply variable substitutions to set file paths
  let source = eval("`"+fs.readFileSync(indexHtml.fsPath, 'utf8')+"`");
  return source;
}

// this method is called when your extension is deactivated
function deactivate() {
  console.log("deactivation ongoing...")
}

module.exports = {
	activate,
	deactivate
}
