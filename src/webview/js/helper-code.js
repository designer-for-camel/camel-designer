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

    // let testxml = '<root><route><from>something</from><to>else</to></route></root>'
    let testxml = '<root>\n<route>\n<from/>\n<to/>\n</route>\n</root>'

    var xmlDoc = new DOMParser().parseFromString(camelContextImport, 'application/xml');
    // var xmlDoc = new DOMParser().parseFromString(testxml, 'application/xml');

    var iteratorRoute = xmlDoc.evaluate('//*[local-name()="route"]', xmlDoc, null, XPathResult.ANY_TYPE, null);


    //var iteratorFrom = xmlDoc.evaluate('//*[local-name()="from"]', xmlDoc, null, XPathResult.ANY_TYPE, null);
    var iteratorTo; //= xmlDoc.evaluate('//*[local-name()="route"]/*[local-name() !="from"]', xmlDoc, null, XPathResult.ANY_TYPE, null);

    var route = iteratorRoute.iterateNext();
    //var from = iteratorFrom.iterateNext();
    var to;// = iteratorTo.iterateNext();
    var current;
    var xmlTag;

    // while(thisNode)
    {
        //setTimeout(createTimer, delay++);
        // createTimer();
        //createDirectStart();
    }

    while(route)
    {
        //if this is not the very first route
        if(route.previousElementSibling != null)
        {
            //then we need to create a new route in the scene
            newRoute(route.id);
        }

        //obtain FROM element
        let type = route.getElementsByTagName("from")[0].attributes.uri.value.split(":")[0];
        //let id = route.getElementsByTagName("from")[0].attributes.id.value;
        switch(type) {
            case 'timer':
                createTimer(route.getElementsByTagName("from")[0]);
                break;            
            case 'direct':
                createDirectStart(route.getElementsByTagName("from")[0]);
                break;
        }

        //iteratorTo = //*[local-name()="route" and @id="route1"]/*[local-name() !="from"]
        iteratorTo = xmlDoc.evaluate('//*[local-name()="route" and @id="'+route.id+'"]/*[local-name() !="from"]', xmlDoc, null, XPathResult.ANY_TYPE, null);

        //get first element
        to = iteratorTo.iterateNext();

        while(to)
        {
            //because all creation actions are asynchronous, 
            //we need to space them apart with a gap of time
            delay=+100;

            //The XML tag identifies the activity, e.g. <log> is a Log activity
            xmlTag = to.tagName;
            current = to;

            //was
            // createActivity(to.tagName, delay);
            // // alert(to.tagName)
            // to = iteratorTo.iterateNext();

            //we iterate beforehand to determine if node IS last
            to = iteratorTo.iterateNext();
            if(to)
            {
                //if not last we proceed normally
                createActivity(xmlTag, delay, current, false);
            }
            else{
                //if IS last, we flag it.
                //the purpose is to enable communications with VSCode when done.
                //otherwise VSCode keeps getting code updates
                createActivity(xmlTag, delay, current, true);
            }

            // if(to.tag)
            // setTimeout(createTimer, delay++);
        }

        route = iteratorRoute.iterateNext();
    }

    // newRoute();
    // createTimer();

    // setTimeout(createLog, 100)
    // setTimeout(createChoice, 200)
    // setTimeout(createDirect, 300)
    // setTimeout(createLog, 400)
    // createLog();
}

//Creates an activity based on the XML tag (type)
//it delays the creation activity because all creation actions are asynchronous
//if it is the last action, we need to flag it.
function createActivity(type, delay, definition,lastAction) {

    switch(type) {
        case 'log':
            //setTimeout(createLog, delay);
            createActivityDelayed(createLog, delay, definition,lastAction);
            break;
        case 'to':
            //setTimeout(createDirect, delay);
            createActivityDelayed(createDirectFromDefinition, delay, definition, lastAction);
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
            createActivityDelayed(createBody, delay, lastAction);            
            break;
        default:
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

    renderCamelRoutes(mycode);

    
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



function renderCamelRoutes(mycode) {

    var iterator = document.evaluate('//a-entity[@route]', document, null, XPathResult.ANY_TYPE, null);

    var thisNode = iterator.iterateNext();

        mycode.text +=  '<camelContext id="camel" xmlns="http://camel.apache.org/schema/spring">\n\n'
         mycode.tab += '  '
    while (thisNode) {


        mycode.text +=  mycode.tab+'<route id="'+thisNode.id+'">\n'
                                        mycode.tab += '  '
                                        // mycode.tab += '<p>'
                                        renderRoute(thisNode.id, mycode);
                                        mycode.tab = mycode.tab.slice(0, -2);
        mycode.text +=  mycode.tab+'</route>\n\n'
        thisNode = iterator.iterateNext();
    }

        mycode.tab = mycode.tab.slice(0, -2);
        mycode.text +=  '</camelContext>\n\n'
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

        if(type == 'direct' )
        {
            mycode.text += mycode.tab+'<from uri="direct:'+routeId+'" id="'+thisNode.id+'"/>\n'
        }
        else
        {
            mycode.text += mycode.tab+'<from uri="timer:demo" id="'+thisNode.id+'"/>\n'
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