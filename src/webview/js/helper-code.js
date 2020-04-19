var text, parser, xmlDoc;

// text = "<bookstore><book>" +
// "<title>Everyday Italian</title>" +
// "<author>Giada De Laurentiis</author>" +
// "<year>2005</year>" +
// "</book></bookstore>";

// xmlDoc = parser.parseFromString(text,"text/xml");

// document.getElementById("demo").innerHTML =
// xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;


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

simulateRouteImport(reader.result);
            };

            reader.readAsText(file);    
        } else {
            alert("File not supported, xml files only");
        }
    });

    fileInput.click();
}


function simulateRouteImport(camelContextImport)
{
    let delay = 0;

    // let testxml = '<root><route><from>something</from><to>else</to></route></root>'
    let testxml = '<root>\n<route>\n<from/>\n<to/>\n</route>\n</root>'

    var xmlDoc = new DOMParser().parseFromString(camelContextImport, 'application/xml');
    // var xmlDoc = new DOMParser().parseFromString(testxml, 'application/xml');

    var iteratorFrom = xmlDoc.evaluate('//*[local-name()="from"]', xmlDoc, null, XPathResult.ANY_TYPE, null);
    var iteratorTo = xmlDoc.evaluate('//*[local-name()="route"]/*[local-name() !="from"]', xmlDoc, null, XPathResult.ANY_TYPE, null);

    var from = iteratorFrom.iterateNext();
    var to = iteratorTo.iterateNext();

    // while(thisNode)
    {
        setTimeout(createTimer, delay++);
    }

    while(to)
    {
        delay=+100;
        createActivity(to.tagName, delay);
        // alert(to.tagName)
        to = iteratorTo.iterateNext();






        // if(to.tag)
        // setTimeout(createTimer, delay++);
    }

    // newRoute();
    // createTimer();

    // setTimeout(createLog, 100)
    // setTimeout(createChoice, 200)
    // setTimeout(createDirect, 300)
    // setTimeout(createLog, 400)
    // createLog();
}

function createActivity(type, delay) {

    switch(type) {
        case 'log':
            setTimeout(createLog, delay);
            break;
        case 'direct':
            setTimeout(createDirect, delay);
            break;
        case 'choice':
            setTimeout(createChoice, delay);
            break;
        case 'multicast':
            setTimeout(createMulticast, delay);            
            break;
        default:
            //code block
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
        vscode.postMessage({
            command: 'insert',
            text: prettifyXml(mycode.text)
        })
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