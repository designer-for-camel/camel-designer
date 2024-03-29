// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');

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

const camel = {
  K:         'k',
  SPRING:    'spring',
  BLUEPRINT: 'blueprint',
  UNKNOWN:   'unknown',
};

var codeType;

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
        });

      //Path to local source HTML (index.html)
      const onDiskPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview', 'index.html'));
      const indexHtml = currentPanel.webview.asWebviewUri(onDiskPath);
      console.log('path: ' + indexHtml.path);
      console.log('path: ' + indexHtml.fsPath);
      console.log('path: ' + indexHtml);

      if(vd == null)
      {
        // And set its HTML content
        currentPanel.webview.html = getWebviewContent(context, currentPanel);
      }
      else
      {
        currentPanel.webview.html = vd;
      }


      // Handler for messages from the webview
      console.log('adding message handler');
      let disposableMessageReceiver = currentPanel.webview.onDidReceiveMessage(
        message => {
          // console.log('got message: '+message.command);

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

                  //helper variable
                  var newText

                  if(docText.includes("<beans ")){
                    codeType = camel.SPRING
                  }
                  else if(docText.includes("<blueprint ")){
                    codeType = camel.BLUEPRINT
                  }
                  else if(docText.includes("<routes ") || docText.includes("<rests ") ){
                    codeType = camel.K
                  }
                  else{
                    codeType = camel.UNKNOWN
                  }

                  // case [X-to-CamelK] scenario
                  if(message.payload.envelope == "routes" || message.payload.envelope == "rests"){

                    //For current Camel K code, header flags to be preserved
                    if(codeType == camel.K){
                      //work on the text to replace Camel definitions
                      //other non Camel elements are left 'as is'
                      var closingElement = '</'+message.payload.envelope+'>'
                      newText = docText.substring(0, docText.indexOf('<'+message.payload.envelope)) +
                                    message.payload.code +
                                    docText.substring(docText.indexOf(closingElement)+closingElement.length, docText.length)
                    }
                    else{
                      //for current Camel types other than Camel K, we replace ALL
                      newText = message.payload.code
                    }
                  }
                  // case [X-to-NOTCamelK] scenario
                  else {
                    //if current is Camel K, we replace ALL
                    if(codeType == camel.K){
                      newText = message.payload.code
                    }
                    else{
                      //work on the text to replace Camel definitions
                      //other non Camel elements are left 'as is'
                      var closingElement = '</'+message.payload.envelope+'>'
                      newText = docText.substring(0, docText.indexOf('<'+message.payload.envelope+' ')) +
                                    message.payload.code +
                                    docText.substring(docText.lastIndexOf(closingElement)+closingElement.length, docText.length)

                    }
                  }

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

            case 'tracing-enable':
              console.log('enabling tracing...');
              sendCamelTracingEnabled(message.url, message.payload, currentPanel.webview);
              return;

            case 'tracing-poll-traces':
              console.log('polling traces...');
              sendCamelTracingPoll(message.url, currentPanel.webview);
              return;

            case 'alert':
              console.log('alert message handler');
              vscode.window.showErrorMessage(message.payload);
              return;

            case 'configuration-load':
              console.log('loading extension configuration')
              let customComponents = vscode.workspace.getConfiguration('cameldesigner').custom.components
              currentPanel.webview.postMessage({ command: 'configuration-load' , payload: customComponents});
              return

            case 'documentation-url':
              console.log('loading extension configuration')
              vscode.env.openExternal(vscode.Uri.parse(message.payload.url))
              return

            case 'atlasmap-new':
              console.log('new AtlasMap file')

              //verify AtlasMap extension is valid
              if(isAtlasMapExtensionInstallationValid() == false){
                return
              }

              //invoke AtlasMap to create a new ADM file
              let created = vscode.commands.executeCommand("atlasmap.file.create")
              created.then(function(value) {
                      console.log("last 'create' action completed");

                      //find ADM files in workspaces
                      let found = vscode.workspace.findFiles('**/*.adm')
                      found.then(function(files) {
                              console.log("got ADM files: value: "+files);

                              //ATTENTION: currently not covering a multi-workspaces use case
                              //we assume only 1 workspace is open (index=0)
                              let currentPath = vscode.workspace.workspaceFolders[0].uri.path

                              //helper for ADMs
                              let adms = []
        
                              for(i in files)
                              {
                                //add JSON (as Camel Designer wants it) with relative path of ADM
                                adms.push({"label":files[i].path.split(currentPath).pop().substring(1)})
                              }
        
                              //send list to webview
                              currentPanel.webview.postMessage({ command: 'atlasmap-files-list' , payload: adms, newadm: true});
                            })
                    })

              return

            case 'atlasmap-edit':
              console.log('edit AtlasMap file')
              
              //verify AtlasMap extension is valid
              if(isAtlasMapExtensionInstallationValid() == false){
                return
              }

              //obtain full ADM uri
              let admuri = vscode.workspace.workspaceFolders[0].uri.path + "/" + message.payload.admfile

              //(async) check if the ADM exists in the workspace
              // let adm = vscode.workspace.findFiles(admuri)
              let adm = vscode.workspace.findFiles('**/'+message.payload.admfile)
              adm.then(function(value) {
                //if does not exist, display error
                if(value.length == 0){
                  vscode.window.showErrorMessage("ADM not found: "+message.payload.admfile);
                  return
                }

                //invoke VSCode to open ADM file
                vscode.commands.executeCommand('vscode.open', vscode.Uri.file(admuri));
                return
              })
            
              return

            case 'atlasmap-get-adms':
              console.log('locating ADM files in workspace');

              //find ADM files in workspace
              let files = vscode.workspace.findFiles('**/*.adm')
              files.then(function(value) {
                      console.log("got ADM files: value: "+value);

                      //TODO: what if you have multiple workspaces
                      let currentPath = vscode.workspace.workspaceFolders[0].uri.path

                      //holder
                      let adms = []

                      //iterate list of files
                      for(let i = 0; i < value.length; i++)
                      {
                        //keep only relative path in workspace
                        adms.push({"label":value[i].path.split(currentPath).pop().substring(1)})
                      }
                      
                      //prepare response message
                      let response = { command: 'atlasmap-files-list' , payload: adms}

                      //if request contains a specific activity id, we pass it back
                      //it's a correlator-id the caller uses to configure activities
                      if(message.payload.id){
                        response.id = message.payload.id
                      }

                      //return list of available ADM files in workspace
                      currentPanel.webview.postMessage(response);
              })

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

  
          //sample code change
          let disposableChangeTextDocument = vscode.workspace.onDidChangeTextDocument((e) => {
            console.log("is it our document: "+(te.document == e.document));          
            // console.log("TEST textChange: "+e.document.fileName);
            // console.log(`changed: ${JSON.stringify(e)}`);
          })

          //sample code change
          let disposableChangeTextSelection = vscode.window.onDidChangeTextEditorSelection((e) => {
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

          let disposableSaveTextDocument = vscode.workspace.onDidSaveTextDocument((e) => {
            console.log("document was saved");     
            // console.log("TEST textChange: "+e.document.fileName);
            // console.log(`changed: ${JSON.stringify(e)}`);

            if(metadata && (td.fileName == e.fileName))
            {
              fs.writeFile(e.fileName+'.metadata', metadata, function (err) {
                if (err) return console.log(err);
                //console.log('Hello World > helloworld.txt');
              });
            }
          })


          currentPanel.onDidDispose(
            () => {
              console.log("panel closed");
              metadata = null
    
              //dispose of panel and listeners
              currentPanel.dispose();
              disposableChangeTextDocument.dispose()
              disposableChangeTextSelection.dispose()
              disposableSaveTextDocument.dispose()
              disposableMessageReceiver.dispose()

              vd = null
              td = null
            },
            null,
            context.subscriptions
          );

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
function getWebviewContent(context, panel) {
  const indexPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview', 'index.html'));
  const indexHtml = panel.webview.asWebviewUri(indexPath);

  //These are needed to replace paths in the HTML content using 'eval'
  const srcPath = vscode.Uri.file(path.join(context.extensionPath));
  const srcPathScheme = panel.webview.asWebviewUri(srcPath);

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



//signals Camel to enable tracing
//if successful, it polls Camel for new traces (check frequency)
//if not, it informs the user and disables tracing
async function sendCamelTracingEnabled(url, enabled, webview)
{
  //helper variable
  let networkError = null

  //sends a signal to Camel to enable tracing
  let response = await fetch(url+"/?maxDepth=7&maxCollectionSize=50000&ignoreErrors=true&canonicalNaming=false", {
      "headers": {
      },
      "body": "{\"type\":\"write\",\"mbean\":\"org.apache.camel:context=MyCamel,type=tracer,name=BacklogTracer\",\"attribute\":\"Enabled\",\"value\":"+enabled+"}",
      "method": "POST"

  }).catch(function(error) {
      // Error handling here!
      console.error("Tracing network error, could not talk to Jolokia: " + error);
      networkError = error
  });

  // if HTTP-status is 200-299
  if (response && response.ok) {

      // get the response body (the method explained below)
      let json = await response.json();

      console.log("got: " + json.value)
  
      if(enabled)
      {
        console.log("invoke webview 'tracing-activate-poller'")

        webview.postMessage({ command: 'tracing-activate-poller'});
      }

  } else {

      let errorMessage = "Tracing error, could not talk to Jolokia: " + networkError.message

      console.error(errorMessage);

      //only switch-off tracing when failure occurs during switch-on, otherwise execution falls into an ON-OFF spiral
      if(enabled)
      {
        console.log("invoke webview 'tracing-enable-failed'")
        webview.postMessage({ command: 'tracing-enable-failed', payload: errorMessage});
      }
  }
}


//signals Camel to enable tracing
//if successful, it polls Camel for new traces (check frequency)
//if not, it informs the user and disables tracing
async function sendCamelTracingPoll(url, webview)
{
    //sends a signal to Camel to poll traces
    let response = await fetch(url+"/?maxDepth=7&maxCollectionSize=50000&ignoreErrors=true&canonicalNaming=false", {
      "headers": {
      },
      "body": "[{\"type\":\"exec\",\"mbean\":\"org.apache.camel:context=MyCamel,type=tracer,name=BacklogTracer\",\"operation\":\"dumpAllTracedMessagesAsXml()\",\"ignoreErrors\":true,\"arguments\":[],\"config\":{}}]",
      "method": "POST"
    }).catch(function(error) {
        // Error handling here!
        console.error("Tracing network error, could not talk to Jolokia: " + error);
        networkError = error
    });

    // if HTTP-status is 200-299
    if (response && response.ok) {

        // get the response body
        let json = await response.json();

        console.log("got: " + json[0].value)
        webview.postMessage({ command: 'tracing-poll-traces-response', payload: json[0].value});

    } else {
        console.error("Tracing error, could not talk to Jolokia: " + response.status);
    }
}

//returns true if a valid installation of AtlasMap extension is found
//returns false otherwise
function isAtlasMapExtensionInstallationValid(){

  let amv = vscode.extensions.getExtension('redhat.atlasmap-viewer')

  if(!amv){
    vscode.window.showErrorMessage("AtlasMap extension seems not installed or is disabled.");
    return false
  }

  //we expect a minimum of [0][1][2]
  let version = amv.packageJSON.version.split(".")

  if(version[1] == "0"){
    vscode.window.showErrorMessage("Expected AtlasMap v0.1.2 or higher, version installed is: "+amv.packageJSON.version);
    return false
  }

  if(parseInt(version[2]) < 2){
    vscode.window.showErrorMessage("Expected AtlasMap v0.1.2 or higher, version installed is: "+amv.packageJSON.version);
    return false
  }

  return true
}