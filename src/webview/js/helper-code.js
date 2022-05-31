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

                //attempt to detect Camel settings to use
                autoDetectCamelSettings(reader.result)
                
                //simulate message from VSCode
                message = {source: reader.result}
                runSourceCodeLoad(message)
/*
                loadSourceCode(reader.result);

                            //test
                            loadMetadata();
*/

            };

            reader.readAsText(file);    
        } else {
            alert("File not supported, xml files only");
        }
    });

    fileInput.click();
}

//Parses the source code and generates the visual artifacts
//When source code is loaded, a batch of creation activities is triggered
//This would cause a sequence of code updates sent to VSCode we want to avoid.
//To stop sending messages to VSCode, COMMS was disabled prior to calling this function
function parseSourceCode(camelContextImport)
{
    let xmlDoc = new DOMParser().parseFromString(camelContextImport, 'application/xml');

    return xmlDoc
}

//Parses the source code and generates the visual artifacts
//When source code is loaded, a batch of creation activities is triggered
//This would cause a sequence of code updates sent to VSCode we want to avoid.
//To stop sending messages to VSCode, COMMS was disabled prior to calling this function
function loadSourceCode(camelContextImport, parsedCode)
{
    let xmlDoc

    //if provided
    if(parsedCode){
        //use it
        xmlDoc = parsedCode
    }
    else{
        //parse from code
        xmlDoc = parseSourceCode(camelContextImport)
    }

    //create REST definitions
    //they might contain inner routes that we need to create
    let methodRoutes = createRestDefinitions(xmlDoc);

    if(methodRoutes)
    {
        //create REST inner routes as Context routes
        createRouteDefinitions(methodRoutes)
    }

    //obtain all route definitions with 'from' element (discard REST inner routes as they don't have 'from')
    var iteratorRoute = xmlDoc.evaluate('//*[local-name()="from"]/ancestor::*[1]', xmlDoc, null, XPathResult.ANY_TYPE, null);
    
    //container for context routes
    let contextRoutes = []

    //iterate to populate container
    var route = iteratorRoute.iterateNext();
    while(route)
    {
        contextRoutes.push(route)
        route = iteratorRoute.iterateNext()
    }

    //create routes
    createRouteDefinitions(contextRoutes)

    //ensures buttons are set to defaults, and camera shows routes
    viewRouteDefinitions()
}

//Creates REST definitions
function createRestDefinitions(xmlDoc) {
    var iteratorRest = xmlDoc.evaluate('//*[local-name()="rest"]', xmlDoc, null, XPathResult.ANY_TYPE, null);

    var rest = iteratorRest.iterateNext();

    var routesToCreate = []

    while(rest)
    {
        //create REST container
        createRestGroup({
            id: rest.id, 
            path: rest.getAttribute('path')
        });

        //obtain methods
        let methods = rest.children;

        //process methods
        for(let i=0; i<methods.length;i++)
        {
            //check if method contains a route definition
            let methodRoute = methods[i].querySelector('route')

            let definition;

            if(methodRoute)
            {
                var uri = methodRoute.id

                if(uri == null)
                {
                    uri = getUniqueID(methods[i].tagName)
                }

                //this is the 'direct' definition to be attached to the methood
                definition = new DOMParser().parseFromString(
                                                '<to uri="direct:'+uri+'"/>', 
                                                "text/xml"
                                             ).documentElement

                //the route in the method lacks a 'from' element, needs to be added
                let route = new DOMParser().parseFromString(methodRoute.outerHTML, "text/xml").documentElement
                
                //create 'from' element
                let definitionFrom = new DOMParser().parseFromString('<from uri="direct:'+uri+'"/>', "text/xml").documentElement

                //insert in route
                route.insertBefore(definitionFrom,route.firstChild)

                //include in collection
                routesToCreate.push(route)
            }
            else
            {
                definition = methods[i].querySelector('to')
            }
            
            createRestMethod({
                method: methods[i].tagName,
                id: methods[i].id, 
                uri: methods[i].getAttribute('uri'),
                direct: definition
            });            
        }

        rest = iteratorRest.iterateNext();
    }

    return routesToCreate
}

function createRouteDefinitions(routes)
{
    let sceneRoutes = document.getElementById('route-definitions')

    for(let i=0; i < routes.length; i++)
    {
        //for code simplicity we declare a variable
        let route = routes[i]

        //check if no Routes have been created before
        if(sceneRoutes.children[0].children.length == 0)
        {
            //if this is the very first route to be created
            //we update the ID of the empty default route in the scene ('route1')
            updateRouteId(getSelectedRoute(), route.id);
        }
        else //otherwise we create a new route
        {
            //check route ID already is in use
            let used = sceneRoutes.querySelector("[route]#"+route.id)

            if(used){
                //we don't reuse it, a new id will be generated
                newRoute(route.id+"-bis")
            }
            else{
                //safe to use the id given 
                newRoute(route.id);
            }
        } 
    
        //obtain FROM definition
        let definition = route.getElementsByTagName("from")[0];

        //obtain FROM Camel component (scheme)
        let type = definition.attributes.uri.value.split(":")[0];

        switch(type) {
            case 'timer':
                createTimer(definition);
                break;
            case 'direct':
                createDirectStart(definition);
                break;
            case 'kafka':
                createKafkaStart(definition);
                break;
            case 'file':
                createFileStart(definition);
                break;

            case 'google-sheets-stream':
                createGoogleSheetsStart(definition);
                break;  

            default:

                //we might have a custom configured consumer
                if(customConfiguredConsumers.includes(type)){
                    createGenericEndpointFrom(definition);  
                    break;          
                }

                //if none of the above, then it's unknown or unsupported yet.
                createUnknown(definition);
                break;
        }

        //obtain all the route processors to iterate
        let processors = route.children;

        //iteration starts after FROM (i=1)
        for(let i=1; i<processors.length;i++)
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
            createActivityFromSource(xmlTag, delay, {definition: processors[i]}, isLastProcessor);
        }
    }
}

//Creates an activity based on the XML tag (type)
//it delays the creation activity because all creation actions are asynchronous
//if it is the last action, we need to flag it.
function createActivityFromSource(type, delay, definition, lastAction) {

    //when XML tag is 'to', we need to identify the Camel component
    if(type == 'to' || type == 'toD'){
        // type = definition.attributes.uri.value.split(":")[0];
        type = definition.definition.attributes.uri.value.split(":")[0];

        //<log> and <to uri="log"> are different  
        if(type == 'log')
        {
            type = 'to-log'
        }
    }

    switch(type) {
        case 'log':
            //setTimeout(createLog, delay);
            // return createActivityDelayed(createLog, delay, definition,lastAction);
            // return createActivityDelayed(createLog, delay, {definition: definition},lastAction);
            return createActivityDelayed(createLog, delay, definition, lastAction);
            // break;
        case 'direct':
            //setTimeout(createDirect, delay);
            // return createActivityDelayed(createDirect, delay, {definition: definition}, lastAction);
            return createActivityDelayed(createDirect, delay, definition, lastAction);
            // break;
        case 'choice':
            //setTimeout(createChoice, delay);
            return createActivityDelayed(createChoice, delay, definition.definition, lastAction);
            // break;
        case 'multicast':
            //setTimeout(createMulticast, delay);            
            return createActivityDelayed(createMulticast, delay, definition.definition, lastAction);            
            // break;
        case 'setProperty':
            // return createActivityDelayed(createProperty, delay, definition.definition, lastAction);            
            return createActivityDelayed(createProperty, delay, definition, lastAction);            
            // break;
        case 'setHeader':
            // return createActivityDelayed(createHeader, delay, definition.definition, lastAction);            
            return createActivityDelayed(createHeader, delay, definition, lastAction);            
            // break;
        case 'setBody':
            // return createActivityDelayed(createBody, delay, definition.definition, lastAction);            
            return createActivityDelayed(createBody, delay, definition, lastAction);            
            // break;


        case 'process':
            return createActivityDelayed(createProcess, delay, definition, lastAction);            

        case 'removeHeaders':
            return createActivityDelayed(createRemoveHeaders, delay, definition, lastAction);            
    
        case 'google-drive':
            return createActivityDelayed(createGoogleDrive, delay, definition, lastAction);
        case 'google-sheets':
            return createActivityDelayed(createGoogleSheets, delay, definition, lastAction);            
        case 'smtp':
            return createActivityDelayed(createSMTP, delay, definition, lastAction);            
        case 'kafka':
            return createActivityDelayed(createKafka, delay, definition, lastAction);

        // case 'kafka':
        case 'file':
        case 'ftp':
        case 'pdf':
        // case 'smtp':
                return createActivityDelayed(createGenericEndpointTo, delay, definition, lastAction);

        case 'split':
            return createActivityDelayed(createSplit, delay, definition.definition, lastAction);
        case 'aggregate':
            return createActivityDelayed(createAggregator, delay, definition.definition, lastAction);            
        case 'doTry':
            return createActivityDelayed(createTryCatch, delay, definition.definition, lastAction);

        
        case 'atlas':
        case 'atlasmap':
            return createActivityDelayed(createAtlasMap, delay, definition, lastAction);

        //The following 3 types adhere to DataFormats
        case 'dataformat':
        case 'marshal':
        case 'unmarshal':
            return createActivityDelayed(createDataformat, delay, definition, lastAction);


        case 'http':
            return createActivityDelayed(createHttp,  delay, definition, lastAction);
        case 'https':
            return createActivityDelayed(createHttps, delay, definition, lastAction);
    

        case 'pipeline':

            console.log("Validating pipeline...")

            let targets    = definition.definition.querySelectorAll('to,toD')
            let numHeaders = definition.definition.querySelectorAll('setHeader').length
            let bodies     = definition.definition.querySelectorAll('setBody')

            //validation rules
            validation: {

                //target validation
                if(    targets.length != 1                                       //only one 'to' element allowed
                    || targets[0] != definition.definition.lastElementChild      //has to be positioned last
                  ){
                    console.warn("Pipeline validation: failed to validate target")
                    break validation
                }

                //body validation
                if(    bodies.length > 1                                //can't have more than 1
                    || (bodies.length == 1 &&                           //if there is one...
                        bodies[0] != targets[0].previousElementSibling) //...has to be second to last
                ){
                    console.warn("Pipeline validation: failed to validate body setter")
                    break validation
                }

                //contents validation: only headers/body are permitted
                if( numHeaders != definition.definition.childElementCount - bodies.length - 1){ 
                    console.warn("Pipeline validation: failed to validate pipeline contents")
                    break validation
                }

                //type of endpoint the pipeline contains
                let pipelineType = targets[0].attributes.uri.value.split(":")[0];

                //at this point all the validation rules are successful
                return createActivityFromSource(pipelineType, delay, definition)
            }

            console.log("INVALID pipeline.")

        default:

            //we might have a custom configured producer
            if(customConfiguredProducers.includes(type)){
                return createActivityDelayed(createGenericEndpointTo, delay, definition, lastAction);            
            }

            //if none of the above, then it's unknown or unsupported yet.
            return createActivityDelayed(createUnknown, delay, definition.definition, lastAction);            
            // break;
            //code block
    }
}


//Creates an activity using its creator function (creator)
//it delays the creation activity because all creation actions are asynchronous
//if it is the last action, we need to wait for completion and open coms with VSCode
function createActivityDelayed(creator, delay, definition, lastAction)
{
    //experiment
    return creator(definition);
}


var prettifyXml = function(sourceXml)
{
    return sourceXml;

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
    //if ( top !== self ) { // we are in the iframe
    if (runningAsVscodeWebview()) {
        vscodePostMessage('insert', {
            code: mycode.text,
            metadata: getMetadata(),
            envelope: getCamelSourceEnvelope()
        });
    }
    //when it runs in a browser
    else { // not an iframe
        var myWindow = window.open("", "_blank")

        //was
        // var myhtml ='<textarea rows="50" cols="100">'+prettifyXml(mycode.text)+'</textarea>'
        // myWindow.document.write(myhtml);

        //now
        //escaping is needed in situations like XML within XML: <simple>&lt;data/&gt;<simple>
        var escapeHTML = function(unsafe) {
            return unsafe.replace(/[&<"']/g, function(m) {
              switch (m) {
                case '&':
                  return '&amp;';
                case '<':
                  return '&lt;';
                case '"':
                  return '&quot;';
                default:
                  return '&#039;';
              }
            });
          };

        //we escape the content
        var myhtml ='<textarea rows="50" cols="100">'+escapeHTML(prettifyXml(mycode.text))+'</textarea>'
        myWindow.document.write(myhtml);  
    }
}



function renderCamelContext(mycode) {

    let streamCache =  ' streamCache="true"'

    if(getCamelSourceEnvelope() == CAMEL_SOURCE_ENVELOPE.camelK){
        streamCache = ''
    }

    mycode.text +=  '<'+getCamelSourceEnvelope()+' id="camel" '+getCamelNamespace()+streamCache+'>\n\n'
    mycode.tab += '  '

    renderCamelRestDsl(mycode);
    renderCamelRoutes(mycode);

    mycode.tab = mycode.tab.slice(0, -2);
    mycode.text +=  '</'+getCamelSourceEnvelope()+'>'
}



function renderCamelRestDsl(mycode) {

    var iterator = document.evaluate('//a-box[@rest-dsl]', document, null, XPathResult.ANY_TYPE, null);
    var thisNode = iterator.iterateNext();

    let restConfiguration = false;

    while (thisNode) {

        //only once
        if(!restConfiguration)
        {
            mycode.text +=  mycode.tab+'<restConfiguration component="servlet" apiContextPath="/openapi.json" contextPath="camel" apiContextRouteId="rest1"/>\n\n';
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

                let method = value.getAttribute("method")
                let type = (method == 'get') ? '' : ' type="String"'

                let uri = value.children[1].getAttribute("value");
                if(uri)
                    mycode.text += mycode.tab+'<'+value.getAttribute("method")+' uri="'+uri+'" id="'+value.id+'"'+type+'>\n'
                else
                    mycode.text += mycode.tab+'<'+value.getAttribute("method")+' id="'+value.id+'"'+type+'>\n'
                mycode.tab += '  '

                let direct = getRestMethodDirectActivity(value);
                mycode.text += mycode.tab+'<to uri="direct:'+direct.querySelector(".uri").getAttribute('value')+'" id="'+direct.id+'"/>\n'

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

        switch(type) {
            case 'direct':
                // mycode.text += mycode.tab+'<from uri="direct:'+routeId+'" id="'+thisNode.id+'"/>\n'
                mycode.text += mycode.tab+'<from uri="direct:'+thisNode.querySelector(".uri").getAttribute('value')+'" id="'+thisNode.id+'"/>\n'
                break;
            case 'timer':
                let uri = "timer:"+thisNode.getElementsByTagName('a-text')[1].attributes.value.textContent
                mycode.text += mycode.tab+'<from uri="'+uri+'" id="'+thisNode.id+'"/>\n'
                break;

            case 'from':
                //assumes activity is an endpoint (<to>) and has URI
                mycode.text += mycode.tab+'<from uri="'+thisNode.components.uri.getValue()+'" id="'+thisNode.id+'"/>\n'
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
    }
}

function renderRouteActivity(activity, mycode, iterator)
{
    let last = renderActivity(activity, mycode, iterator)

    if(last){
        return getNextActivity(last)
    }

    return getNextActivity(activity);
}

// function renderRouteActivity(activity, mycode, iterator) {
function renderActivity(activity, mycode, iterator) {

    var processorType = activity.getAttribute('processor-type');

    switch(processorType) {
        case 'log':
            mycode.text += mycode.tab+'<log message='+activity.getElementsByTagName('a-text')[0].firstChild.getAttribute('value')+' id="'+activity.id+'"/>\n'
            break;
        case 'property':
            mycode.text += mycode.tab+'<setProperty '+getCamelAttributePropertyName()+'="'+activity.getElementsByTagName('a-text')[0].firstChild.getAttribute('value').slice(0,-1)+'" id="'+activity.id+'">\n'+
                        //    mycode.tab+mycode.tab+'<simple>'+activity.getElementsByTagName('a-text')[0].lastChild.getAttribute('value').slice(1,-1)+'</simple>\n'+
                        //    mycode.tab+mycode.tab+'<simple>'+activity.getElementsByTagName('a-text')[0].lastChild.getAttribute('value').slice(1,-1)+'</simple>\n'+
                        //    mycode.tab+mycode.tab+'<'+activity.attributes.language.value+activity.getLanguageAttributes()+'>'+activity.getElementsByTagName('a-text')[0].lastChild.getAttribute('value').slice(1,-1)+'</'+activity.attributes.language.value+'>\n'+
                           mycode.tab+'  '+activity.components.expression.getXml()+'\n'+
                           mycode.tab+'</setProperty>\n'
            break;
        case 'header':
            mycode.text += mycode.tab+'<setHeader '+getCamelAttributeHeaderName()+'="'+activity.getElementsByTagName('a-text')[0].firstChild.getAttribute('value').slice(0,-1)+'" id="'+activity.id+'">\n'+
                        //    mycode.tab+mycode.tab+'<simple>'+activity.getElementsByTagName('a-text')[0].lastChild.getAttribute('value').slice(1,-1)+'</simple>\n'+
                        //    mycode.tab+mycode.tab+'<'+activity.attributes.language.value+activity.getLanguageAttributes()+'>'+activity.getElementsByTagName('a-text')[0].lastChild.getAttribute('value').slice(1,-1)+'</'+activity.attributes.language.value+'>\n'+
                           mycode.tab+'  '+activity.components.expression.getXml()+'\n'+
                           mycode.tab+'</setHeader>\n'
            break;
        case 'body':
            mycode.text += mycode.tab+'<setBody id="'+activity.id+'">\n'+
                        //    mycode.tab+mycode.tab+'<simple>'+activity.getElementsByTagName('a-text')[0].firstChild.getAttribute('value').slice(1,-1)+'</simple>\n'+
                           mycode.tab+'  '+activity.components.expression.getXml()+'\n'+
                           mycode.tab+'</setBody>\n'
            break;
        case 'direct':
            // mycode.text += mycode.tab+'<to uri="direct:'+activity.querySelector("#routeLabel").getAttribute('value')+'" id="'+activity.id+'"/>\n'
            mycode.text += mycode.tab+'<to uri="direct:'+activity.querySelector(".uri").getAttribute('value')+'" id="'+activity.id+'"/>\n'
            break;
        case 'choice-start':
            return renderChoice(activity, mycode, iterator);
            break;
        case 'choice-end':
            return getNextActivity(activity);
            //ignore, it's handled by renderChoice
            break;


        case 'split-start':
            mycode.text += mycode.tab+'<split id="'+activity.parentNode.id+'">\n'+
                           mycode.tab+'  '+activity.components.expression.getXml()+'\n'
            mycode.tab  += '  '
            break;
        case 'split-end':
            mycode.tab = mycode.tab.slice(0, -2);
            mycode.text += mycode.tab+'</split>\n'
            break;


        case 'aggregate-start':
            mycode.text +=  mycode.tab+'<aggregate'+activity.components.definition.getXmlParameters()+' id="'+activity.parentNode.id+'">\n'+
                            mycode.tab+'  <correlationExpression>\n'+
                            mycode.tab+'    '+activity.components.expression.getXml()+'\n'+
                            mycode.tab+'  </correlationExpression>\n'

            mycode.tab  += '  '
            break;
        case 'aggregate-end':
            mycode.tab = mycode.tab.slice(0, -2);
            mycode.text += mycode.tab+'</aggregate>\n'
            break;

        //Try-Catch statements are handled in the following way:
        // - on try-start we open the XML tag
        // - on try-end:
        //     1) we obtain the catch-start and render 
        //     2) we obtain the finally-start and render
        //     3) we close the doTry XML tag
        case 'try-start':
            mycode.text += mycode.tab+'<doTry id="'+activity.parentNode.id+'">\n'
            mycode.tab  += '  '
            break;
        case 'try-end':

            //obtain CATCH start activity
            let catchActivity = getStartOfCatch(activity.parentNode)

            do{
                //render all CATCH activities
                catchActivity = renderRouteActivity(catchActivity, mycode, null)
            }
            while(catchActivity.getAttribute('processor-type') != 'catch-end')

            //close CATCH tag
            mycode.tab = mycode.tab.slice(0, -2);
            mycode.text += mycode.tab+'</doCatch>\n'

            //obtain FINALLY start activity
            let finallyActivity = getStartOfFinally(catchActivity.parentNode)

            //if there is one
            if(finallyActivity)
            {
                do{
                    //render all FINALLY activities
                    finallyActivity = renderRouteActivity(finallyActivity, mycode, null)
                }
                while(finallyActivity.getAttribute('processor-type') != 'finally-end')

                //close CATCH tag
                mycode.tab = mycode.tab.slice(0, -2);
                mycode.text += mycode.tab+'</doFinally>\n'
            }

            //close TRY tag
            mycode.tab = mycode.tab.slice(0, -2);
            mycode.text += mycode.tab+'</doTry>\n'
            break;

        case 'catch-start':
            mycode.text += mycode.tab+'<doCatch id="'+activity.parentNode.id+'">\n'
            mycode.tab  += '  '

            let exceptions = activity.components.exceptions.getExceptions()

            // for(let i=0; i<exceptions.length; i++){
            for(key in exceptions){
                mycode.text += mycode.tab+'<exception>'+exceptions[key]+'</exception>\n'
            }

            break;
        case 'finally-start':
            mycode.text += mycode.tab+'<doFinally id="'+activity.parentNode.id+'">\n'
            mycode.tab  += '  '
            break;


        case 'multicast-start':
            // adding the ID for now is problematic, needs to be reviewed first
            mycode.text += mycode.tab+'<multicast strategyRef="demoStrategy" id="'+activity.parentNode.id+'">\n'
            // mycode.text += mycode.tab+'<multicast strategyRef="demoStrategy">\n'
            mycode.tab  += '  '

            iterator = document.evaluate('//a-box[@id="'+activity.parentNode.id+'"]//a-sphere[@processor-type="direct"]', document, null, XPathResult.ANY_TYPE, null);
  
            let direct = iterator.iterateNext();
            let lastDirect

            while (direct) {
                    renderRouteActivity(direct, mycode, iterator);
                    lastDirect = direct
                    direct = iterator.iterateNext();
            }

            //return last multicast activity
            return lastDirect
        case 'multicast-end':
            mycode.tab = mycode.tab.slice(0, -2);
            mycode.text += mycode.tab+'</multicast>\n'
            break;
        case 'unknown':
            mycode.text += mycode.tab+activity.getElementsByTagName('a-text')[0].firstChild.getAttribute('value')+'\n'
            break;


        case 'process':
            mycode.text += mycode.tab+'<process ref="'+activity.getElementsByTagName('a-text')[0].firstChild.getAttribute('value')+'" id="'+activity.id+'"/>\n'
            break;
            
        case 'remove-headers':
            mycode.text += mycode.tab+'<removeHeaders pattern="*" id="'+activity.id+'"/>\n'
            break;

        case 'dataformat':
            //assumes activity is an endpoint (<to>) and has URI
            mycode.text += mycode.tab+'<to uri="'+activity.components.uri.getValue()+'" id="'+activity.id+'"/>\n'
            break;

        case 'atlasmap':
            //default scheme is for Camel v3
            let uri = "atlasmap:"

            //AtlasMap has a different scheme for v2
            if(camelVersion == CAMEL_RELEASE.v2){
                uri = "atlas:"
            }

            //full URI
            uri = uri + activity.components.uri.getValue().split(":",2)[1]

            //assumes activity is an endpoint (<to>) and has URI
            mycode.text += mycode.tab+'<to uri="'+uri+'" id="'+activity.id+'"/>\n'
            break;


        case 'to':
            mycode.text += activity.components.mapping.processCamelRendering(mycode.tab) 
            break;

/*
        // case 'to':
        case 'DISABLEDto':
            let to = activity.hasAttribute("dynamic") ? "<toD" : "<to"
            //assumes activity is an endpoint (<to>) and has URI
            // mycode.text += mycode.tab+'<to uri="'+activity.components.uri.getValue()+'" id="'+activity.id+'"/>\n'
            mycode.text += mycode.tab+to+' uri="'+activity.components.uri.getValue()+'" id="'+activity.id+'"/>\n'
            break;
*/

        default:
            console.warn("could not render activity to XML, type unknown: ["+processorType+"]")
            //code block
    }

    // return getNextActivity(activity);
}


//Render choice
function renderChoice(choice, mycode, iterator) {

    //obtain choice paths
    // var links = JSON.parse(choice.getAttribute("links"));

    let link;
    let condition;
    let alternative;
    // let start = choice;

    mycode.text += mycode.tab+'<choice id="'+choice.id+'">\n'
    mycode.tab  += '  '

    //obtain all links rooted in the choice activity
    let domlinks = document.querySelectorAll('a-cylinder[source="'+choice.id+'"]');

    // Convert NodeList to an array
    var linksArray = Array.prototype.slice.call(domlinks);

    // Sort the links by their vertical position
    linksArray.sort(function(a,b) {
        //only exception is choice's OTHERWISE, needs to be last
        let label = a.getElementsByTagName('a-text')[0].getAttribute('value')
        if(label == 'otherwise'){
            return 1
        }
        var aY = a.object3D.position.y;
        var bY = b.object3D.position.y;
        if (aY > bY) return -1;
        if (aY < bY) return 1;
        return 0;
    });

    //Itereta over the paths...
    for(let i=0; i<linksArray.length; i++)
    {
        //get link
        link = linksArray[i];

        //attempt to obtain label entity
        alternative = link.getElementsByTagName('a-text')[0]
        
        //obtain text on label
        alternative = alternative.getAttribute('value');

        if(alternative == 'when')
        {
            condition   = link.getElementsByTagName('a-text')[1].getAttribute('value');

            mycode.text += mycode.tab+'<when>\n'
            mycode.tab += '  ';
            mycode.text += mycode.tab+'<simple>'+condition+'</simple>\n'
            // renderRouteActivity(iterator.iterateNext(), mycode, iterator);
            //choice = getNextActivity(choice);
            choice = getLinkDestination(link)

            while(choice.getAttribute('processor-type') != 'choice-end')
            {
                // choice = renderRouteActivity(getNextActivity(choice), mycode, iterator);
                choice = renderRouteActivity(choice, mycode, iterator);
            }

            mycode.tab = mycode.tab.slice(0, -2);
            mycode.text += mycode.tab+'</when>\n'
        }
        else if(alternative == 'otherwise')
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

//Generates Metadata information about the Camel definitions
//Main purpose is to save/restore state when files are opened/closed 
function getMetadata()
{
    var iterator = document.evaluate('//a-entity[@route]/*[local-name()!="a-cylinder"]', document, null, XPathResult.ANY_TYPE, null);
    var thisNode = iterator.iterateNext();

    // var metadata = "";

    var activities = [];

    while (thisNode) {

        activities.push({
            id: thisNode.id,
            x: thisNode.object3D.position.x,
            y: thisNode.object3D.position.y
        })

        //metadata += "id:"+thisNode.id+" x:"+thisNode.object3D.position.x+" y:"+thisNode.object3D.position.y+"\n"
        thisNode = iterator.iterateNext();
    }

    //return metadata;
    return JSON.stringify(activities,null,'\t');
}