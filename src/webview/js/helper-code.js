var text, parser, xmlDoc;

// text = "<bookstore><book>" +
// "<title>Everyday Italian</title>" +
// "<author>Giada De Laurentiis</author>" +
// "<year>2005</year>" +
// "</book></bookstore>";

// xmlDoc = parser.parseFromString(text,"text/xml");

// document.getElementById("demo").innerHTML =
// xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;


//loads source code from File System
function importSource()
{

    var element = document.createElement('div');
    element.innerHTML = '<input type="file">';
    var fileInput = element.firstChild;

    fileInput.addEventListener('change', function() {
        var file = fileInput.files[0];

        if (file.name.match(/\.(xml)$/)) {
            var reader = new FileReader();

            reader.onload = function() {
                console.log(reader.result);

                loadSourceCode(reader.result);
            };

            reader.readAsText(file);    
        } else {
            alert("File not supported, xml files only");
        }
    });

    fileInput.click();
}

//Parses the source code and generates the graph
//When source code is loaded, a batch of creation activities is triggered
//This would cause a sequence of code updates sent to VSCode we want to avoid.
//To stop sending messages to VSCode, COMMS was disabled prior to calling this function
function loadSourceCode(camelContextImport)
{
    let delay = 0;

    var xmlDoc = new DOMParser().parseFromString(camelContextImport, 'application/xml');

    //REST definitionss
    createRestDefinitions(xmlDoc);

    //defined routes in source
    var iteratorRoute = xmlDoc.evaluate('//*[local-name()="route"]', xmlDoc, null, XPathResult.ANY_TYPE, null);
    var route = iteratorRoute.iterateNext();

    //if it has an ID, we update the default route ID
    if(route.id)
    {
        updateRouteId(getSelectedRoute(), route.id);
    }

    while(route)
    {
        //if this is not the very first route
        if(route.previousElementSibling != null && route.previousElementSibling.tagName == 'route')
        {
            //then we need to create a new route in the scene
            newRoute(route.id);
        }

        //obtain FROM definition
        let definition = route.getElementsByTagName("from")[0];

        //obtain FROM component
        let type = definition.attributes.uri.value.split(":")[0];

        switch(type) {
            case 'timer':
                createTimer(route.getElementsByTagName("from")[0]);
                break;            
            case 'direct':
                createDirectStart(route.getElementsByTagName("from")[0]);
                break;
            default:
                //if none of the above, then it's unknown or unsupported yet.
                createUnknown(definition);
                break;
        }

        //obtain all the route processors to iterate
        let processors = route.children;

        //iteration starts after FROM (i=1)
        for(i=1; i<processors.length;i++)
        {
            //because all creation actions are asynchronous, 
            //we need to space them apart with a gap of time
            delay=+100;

            //The XML tag identifies the activity, e.g. <log> is a Log activity
            let xmlTag = processors[i].tagName;

            //if IS last processor, we flag it.
            //the purpose is to enable communications with VSCode when done.
            //otherwise VSCode keeps getting code updates
            let isLastProcessor = (i<processors.length)

            //create activity with flag
            createActivity(xmlTag, delay, processors[i], isLastProcessor);
        }

        route = iteratorRoute.iterateNext();
    }
}

//Creates REST definitions
function createRestDefinitions(xmlDoc) {
    var iteratorRest = xmlDoc.evaluate('//*[local-name()="rest"]', xmlDoc, null, XPathResult.ANY_TYPE, null);

    var rest = iteratorRest.iterateNext();

    while(rest)
    {
        //if this is not the very first route
        //if(rest.previousElementSibling != null)
        {
            //then we need to create a new route in the scene
            createRestGroup({
                id: rest.id, 
                path: rest.getAttribute('path')
            });
        }

        let methods = rest.children;

        for(i=0; i<methods.length;i++)
        {

            createRestMethod({
                method: methods[i].tagName,
                id: methods[i].id, 
                uri: methods[i].getAttribute('uri')
            });            
        }

        rest = iteratorRest.iterateNext();
    }
}

//Creates an activity based on the XML tag (type)
//it delays the creation activity because all creation actions are asynchronous
//if it is the last action, we need to flag it.
function createActivity(type, delay, definition,lastAction) {

    //when XML tag is 'to', we need to identify the Camel component
    if(type == 'to'){
        type = definition.attributes.uri.value.split(":")[0];
    }

    switch(type) {
        case 'log':
            //setTimeout(createLog, delay);
            createActivityDelayed(createLog, delay, definition,lastAction);
            break;
        case 'direct':
            //setTimeout(createDirect, delay);
            createActivityDelayed(createDirect, delay, definition, lastAction);
            break;
        case 'choice':
            //setTimeout(createChoice, delay);
            createActivityDelayed(createChoice, delay, definition, lastAction);
            break;
        case 'multicast':
            //setTimeout(createMulticast, delay);            
            createActivityDelayed(createMulticast, delay, definition, lastAction);            
            break;
        case 'setProperty':
            createActivityDelayed(createProperty, delay, definition, lastAction);            
            break;
        case 'setHeader':
            createActivityDelayed(createHeader, delay, definition, lastAction);            
            break;
        case 'setBody':
            createActivityDelayed(createBody, delay, definition, lastAction);            
            break;
        default:
            //if none of the above, then it's unknown or unsupported yet.
            createActivityDelayed(createUnknown, delay, definition, lastAction);            
            break;
            //code block
    }
}


//Creates an activity using its creator function (creator)
//it delays the creation activity because all creation actions are asynchronous
//if it is the last action, we need to wait for completion and open coms with VSCode
function createActivityDelayed(creator, delay, definition, lastAction)
{
    //experiment
    creator(definition);
    return;

//FROM HERE, TO BE DEPRECATED
    
    lastAction = lastAction || false;
    //tet creationPromise

    if(!lastAction)
    {
        setTimeout(creator(definition), delay);
    }
    else
    {
        let creationPromise = new Promise((resolve, reject) => {
            // We call resolve(...) when what we were doing asynchronously was successful, and reject(...) when it failed.
            // In this example, we use setTimeout(...) to simulate async code. 
            // In reality, you will probably be using something like XHR or an HTML5 API.
            setTimeout( function() {
                            creator(definition)
                            resolve("Success!")  // Yay! Everything went well!
                        },
                        delay) 
        })

        creationPromise
            .then(function(value) {
                    console.log("last 'create' action completed");
                    syncStartUpEnabled = false;
                  })
            .catch(function() {
                    console.log("last 'create' action completed");
                    syncStartUpEnabled = false;
                  });
    }
}


var prettifyXml = function(sourceXml)
{
    var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
    var xsltDoc = new DOMParser().parseFromString([
        // describes how we want to modify the XML - indent everything
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
        '  <xsl:output omit-xml-declaration="yes" indent="yes"/>',
        '    <xsl:template match="node()|@*">',
        '      <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
        '    </xsl:template>',
        '</xsl:stylesheet>',
    ].join('\n'), 'application/xml');

    var xsltProcessor = new XSLTProcessor();    
    xsltProcessor.importStylesheet(xsltDoc);
    var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    var resultXml = new XMLSerializer().serializeToString(resultDoc);
    return resultXml;
};

console.log(prettifyXml('<root><node/></root>'));

var xml_special_to_escaped_one_map = {
    '&': '&amp;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;'
};



function encodeXml(string) {
    return string.replace(/([\&"<>])/g, function(str, item) {
        return xml_special_to_escaped_one_map[item];
    });
};

function initCamelGenerator()
{
	parser = new DOMParser();
}

function getCamelSource()
{
    //This is a test for experimental purposes
    // showCamelSource();


    let mycode = {text:"", tab:""};

    renderCamelContext(mycode);

    
    //when it runs in VSCode
    if ( top !== self ) { // we are in the iframe
        //was
        // vscode.postMessage({
        //     command: 'insert',
        //     text: prettifyXml(mycode.text)
        // })
        vscodePostMessage('insert', mycode.text);
    }
    //when it runs in a browser
    else { // not an iframe
    
        var myWindow = window.open("", "_blank")//, "width=200,height=100");
        // myWindow.document.write("<code>"+text+"</code>");
        // myWindow.document.write(encodeXml(mycode.text).replace(new RegExp('\r?\n','g'), '<br />'));
        // myWindow.document.write(encodeXml(prettifyXml(mycode.text)));

        var myhtml ='<textarea rows="50" cols="100">'+prettifyXml(mycode.text)+'</textarea>'

        myWindow.document.write(myhtml);
    }
}



function renderCamelContext(mycode) {

    mycode.text +=  '<camelContext id="camel" xmlns="http://camel.apache.org/schema/spring">\n\n'
    mycode.tab += '  '

    renderCamelRestDsl(mycode);
    renderCamelRoutes(mycode);

    mycode.tab = mycode.tab.slice(0, -2);
    mycode.text +=  '</camelContext>\n\n'
}



function renderCamelRestDsl(mycode) {

    var iterator = document.evaluate('//a-box[@rest-dsl]', document, null, XPathResult.ANY_TYPE, null);
    var thisNode = iterator.iterateNext();

    let restConfiguration = false;

    while (thisNode) {

        //only once
        if(!restConfiguration)
        {
            mycode.text +=  mycode.tab+'<restConfiguration component="servlet" apiContextPath="/openapi.json"/>\n\n';
            // mycode.text +=  mycode.tab+'<rest path="/" id="'+thisNode.id+'">\n';
            // mycode.tab+= '  '
            restConfiguration = true;
        }

        mycode.text +=  mycode.tab+'<rest path="'+thisNode.getAttribute("path")+'" id="'+thisNode.id+'">\n';
        mycode.tab+= '  '

        //obtains all Methods
        let methods = getRestMethods(thisNode);

        //loop over methods
        methods.forEach(
            function renderCamelRestDslMethod(value) {
                let uri = value.getAttribute("uri");
                if(uri)
                    mycode.text += mycode.tab+'<'+value.getAttribute("method")+' uri="'+uri+'" id="'+value.id+'">\n'
                else
                    mycode.text += mycode.tab+'<'+value.getAttribute("method")+' id="'+value.id+'">\n'
                mycode.tab += '  '
                // renderMethod(thisNode.id, mycode);
                let direct = getRestMethodDirectActivity(value);
                //mycode.text +=  mycode.tab+'<to uri="direct:'+'pending(hardcoded in helper-code line 460)'+'"/>\n'
                mycode.text += mycode.tab+'<to uri="direct:'+direct.querySelector("#routeLabel").getAttribute('value')+'" id="'+direct.id+'"/>\n'


                mycode.tab = mycode.tab.slice(0, -2);
                mycode.text +=  mycode.tab+'</'+value.getAttribute("method")+'>\n'
            }
        )
        
        mycode.tab = mycode.tab.slice(0, -2);
        mycode.text +=  mycode.tab+'</rest>\n\n'
        thisNode = iterator.iterateNext();
    }

    // if(restConfiguration)
    // {
    //     mycode.text +=  mycode.tab+'</rest>\n\n'
    // }
}


function renderCamelRoutes(mycode) {

    var iterator = document.evaluate('//a-entity[@route]', document, null, XPathResult.ANY_TYPE, null);
    var thisNode = iterator.iterateNext();

    while (thisNode && thisNode.children.length > 0) {

        mycode.text +=  mycode.tab+'<route id="'+thisNode.id+'">\n'
                                        mycode.tab += '  '
                                        renderRoute(thisNode.id, mycode);
                                        mycode.tab = mycode.tab.slice(0, -2);
        mycode.text +=  mycode.tab+'</route>\n\n'
        thisNode = iterator.iterateNext();
    }

    // alert(mycode.text)
}


function renderRoute(routeId, mycode) {

    var iterator = document.evaluate('//a-entity[@id="'+routeId+'"]//a-sphere[@start]', document, null, XPathResult.ANY_TYPE, null);
    var thisNode = iterator.iterateNext();

//any FROM is valid as a starting point
let start = thisNode;

//test
// walkRoute(thisNode);

    while (thisNode) {

        let type = thisNode.getAttribute('processor-type');

        // if(type == 'direct' )
        // {
        //     mycode.text += mycode.tab+'<from uri="direct:'+routeId+'" id="'+thisNode.id+'"/>\n'
        // }
        // else
        // {
        //     mycode.text += mycode.tab+'<from uri="timer:demo" id="'+thisNode.id+'"/>\n'
        // }

        switch(type) {
            case 'direct':
                mycode.text += mycode.tab+'<from uri="direct:'+routeId+'" id="'+thisNode.id+'"/>\n'
                break;
            case 'timer':
                mycode.text += mycode.tab+'<from uri="timer:demo" id="'+thisNode.id+'"/>\n'
                break;
            default:
                mycode.text += mycode.tab+thisNode.getElementsByTagName('a-text')[1].firstChild.getAttribute('value')+'\n'
                break;
                //code block
        }







        thisNode = iterator.iterateNext();
    }

    iterator = document.evaluate('//a-entity[@id="'+routeId+'"]//a-sphere[not(@start)]', document, null, XPathResult.ANY_TYPE, null);
    // thisNode = iterator.iterateNext();
      
//we start walking the route
thisNode = getNextActivity(start);



    while (thisNode) {
        thisNode = renderRouteActivity(thisNode, mycode, iterator);
        // mycode.text += '  <log message='+thisNode.getElementsByTagName('a-text')[0].firstChild.getAttribute('value')+' id="'+thisNode.id+'"/>\n'
        // thisNode = iterator.iterateNext();
// thisNode = getNextActivity(thisNode);

    } 
}

function renderRouteActivity(activity, mycode, iterator) {

    var processorType = activity.getAttribute('processor-type');

    switch(processorType) {
        case 'log':
            mycode.text += mycode.tab+'<log message='+activity.getElementsByTagName('a-text')[0].firstChild.getAttribute('value')+' id="'+activity.id+'"/>\n'
            break;
        case 'property':
            mycode.text += mycode.tab+'<setProperty name="'+activity.getElementsByTagName('a-text')[0].firstChild.getAttribute('value').slice(0,-1)+'" id="'+activity.id+'">\n'+
                           mycode.tab+mycode.tab+'<simple>'+activity.getElementsByTagName('a-text')[0].lastChild.getAttribute('value').slice(1,-1)+'</simple>\n'+
                           mycode.tab+'</setProperty>\n'
            break;
        case 'header':
            mycode.text += mycode.tab+'<setHeader name="'+activity.getElementsByTagName('a-text')[0].firstChild.getAttribute('value').slice(0,-1)+'" id="'+activity.id+'">\n'+
                           mycode.tab+mycode.tab+'<simple>'+activity.getElementsByTagName('a-text')[0].lastChild.getAttribute('value').slice(1,-1)+'</simple>\n'+
                           mycode.tab+'</setHeader>\n'
            break;
        case 'body':
            mycode.text += mycode.tab+'<setBody id="'+activity.id+'">\n'+
                           mycode.tab+mycode.tab+'<simple>'+activity.getElementsByTagName('a-text')[0].firstChild.getAttribute('value').slice(1,-1)+'</simple>\n'+
                           mycode.tab+'</setBody>\n'
            break;
        case 'direct':
            mycode.text += mycode.tab+'<to uri="direct:'+activity.querySelector("#routeLabel").getAttribute('value')+'" id="'+activity.id+'"/>\n'
            break;
        case 'choice-start':
            return renderChoice(activity, mycode, iterator);
            break;
        case 'choice-end':
            return getNextActivity(activity);
            //ignore, it's handled by renderChoice
            break;
        case 'multicast-start':
            // ading the ID for now is problematic, needs to be reviewed first
            // mycode.text += mycode.tab+'<multicast strategyRef="demoStrategy" id="'+activity.parentNode.id+'">\n'
            mycode.text += mycode.tab+'<multicast strategyRef="demoStrategy">\n'
            mycode.tab  += '  '
            // mycode.tab  += '<p>'

    iterator = document.evaluate('//a-box[@id="'+activity.parentNode.id+'"]//a-sphere[@processor-type="direct"]', document, null, XPathResult.ANY_TYPE, null);

                    // activity = iterator.iterateNext();


                   let direct = iterator.iterateNext();


            // while (processorType != 'multicast-end') {
            while (direct) {
                    // var next = iterator.iterateNext();
                    // processorType = next.getAttribute('processor-type');
                    renderRouteActivity(direct, mycode, iterator);
                    direct = iterator.iterateNext();

            }
            //we return the end activity to force closure
            return getNextActivity(getNextActivity(activity));
            break;
        case 'multicast-end':
            mycode.tab = mycode.tab.slice(0, -2);
            mycode.text += mycode.tab+'</multicast>\n'
            break;
        case 'unknown':
            mycode.text += mycode.tab+activity.getElementsByTagName('a-text')[0].firstChild.getAttribute('value')+'\n'
            break;
        default:
            //code block
    }

return getNextActivity(activity);
    // return 
    // alert(mycode.text)
}


//Render choice
function renderChoice(choice, mycode, iterator) {

    //obtain choice paths
    var links = JSON.parse(choice.getAttribute("links"));

    let link;
    let condition;
    let alternative;
    let start = choice;

    mycode.text += mycode.tab+'<choice>\n'
    mycode.tab  += '  '

    //Itereta over the paths...
    //... but we jump i=0 as it connects with previous activity
    for(i=1; i<links.length; i++)
    {
        link = document.getElementById(links[i]);

        alternative = link.getElementsByTagName('a-text')[0].getAttribute('value');

        if(alternative == 'when')
        {
            condition   = link.getElementsByTagName('a-text')[1].getAttribute('value');

            mycode.text += mycode.tab+'<when>\n'
            mycode.tab += '  ';
            mycode.text += mycode.tab+'<simple>'+condition+'</simple>\n'
            // renderRouteActivity(iterator.iterateNext(), mycode, iterator);
            choice = getNextActivity(choice);

            while(choice.getAttribute('processor-type') != 'choice-end')
            {
                // choice = renderRouteActivity(getNextActivity(choice), mycode, iterator);
                choice = renderRouteActivity(choice, mycode, iterator);
            }

            mycode.tab = mycode.tab.slice(0, -2);
            mycode.text += mycode.tab+'</when>\n'
        }
        else
        {
            mycode.text += mycode.tab+'<otherwise>\n'
            mycode.tab += '  ';
            // renderRouteActivity(iterator.iterateNext(), mycode, iterator);
            // end = renderRouteActivity(getLinkDestination(link), mycode, iterator);

            choice = getLinkDestination(link);

            while(choice.getAttribute('processor-type') != 'choice-end')
            {
                // choice = renderRouteActivity(getNextActivity(choice), mycode, iterator);
                choice = renderRouteActivity(choice, mycode, iterator);
            }

            mycode.tab = mycode.tab.slice(0, -2);
            mycode.text += mycode.tab+'</otherwise>\n'
        }
    }

    mycode.tab = mycode.tab.slice(0, -2);
    mycode.text += mycode.tab+'</choice>\n'

    return choice;
}


//THIS IS A TEST FOR EXPERIMENTAL PURPOSES
function showCamelSource() {
    var text = "<camell3>"+(""+document.getElementById(routes[0]).firstChild.parentNode.innerHTML)+"</camell3>";
    console.log(text)
    var myWindow = window.open("", "_blank")//, "width=200,height=100");
    // myWindow.document.write("<code>"+text+"</code>");
    myWindow.document.write("<p>"+encodeXml(text)+"</p>");
}



function walkRoute(start)
{
    let activities = start.id+"\n";

    let next = getNextActivity(start);

    // let ref = [next];

    // while(ref[0] != null)
    while(next)
    {
        activities += next.id+"\n";
        next = getNextActivity(next);
        // ref[0] = next;
        // ref[0] = next;
    }

    alert("list:\n"+activities);
}