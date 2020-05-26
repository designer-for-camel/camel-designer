//This source file is intended to include new experimental functionality
//when the functionality is solid, it can be moved to another more source file


//copies the selection chosen to the input text the user is working with
function useExpressionLanguage(event)
{
    //obtain worked activity
    let activity = getActiveActivity()

    //update list of attributes
    activity.components.expression.setLanguage(event.selectedOptions[0].text)

    //obtain language attributes
    let attributes = activity.components.expression.getLanguageAttributes()

    //handling for xpath
    if(event.selectedOptions[0].text == "xpath")
    {
        let checked = ""
        if(attributes && attributes.saxon == "true")
        {
            checked = " checked"
        }

        let input = '<input type="checkbox" id="saxon" name="saxon" value="true"'+checked+'>'
        let label = '<label for="saxon">use saxon</label></div>'

        event.parentNode.getElementsByClassName('attributes')[0].innerHTML = input+label
    }
    else
    {
        event.parentNode.getElementsByClassName('attributes')[0].innerHTML = null
    }
}

function useExpressionAttribute(event)
{
    //obtain worked activity
    let activity = getActiveActivity()

    //update list of attributes
    activity.components.expression.setLanguageAttribute(event.target.name, event.target.checked)
}


//copies the selection chosen to the input text the user is working with
function useExpressionVariable(event)
{
    //append expression variable to input text
    event.previousElementSibling.value += "${"+event.selectedOptions[0].text+"}"

    //fire event to update 3D activity
    event.previousElementSibling.oninput()

    //reset to first (default) option ('use variable...')
    event.selectedIndex = 0
}

//returns a collection of simple variables defined on preceding activities.
//simple variables are variables you can use in the Camel simple language
function findExpressionVariables()
{
    //initialise to the preceding activity
    let activity = getPreviousActivity(getActiveActivity())

    //collection to return
    let variables = []

    //while not the end of the route
    while(activity)
    {
        let type = activity.getAttribute('processor-type')

        //if 'setter' found
        if(type == "header" || type == "property"){
        
            //we add to the collection in the format [type.var] (e.g. 'header.h1')
            variables.push(type+"."+activity.getElementsByTagName("a-text")[0].firstChild.getAttribute('value').slice(0, -1))
        }

        //look next
        activity = getPreviousActivity(activity)
    }

    return variables        
}

//includes the selection of expression variables in the HTML element given
function populateExpressionVariables(element)
{
    //obtain expression variables
    let vars = findExpressionVariables();

    //obtain the container with expression variables
    var select = document.getElementById("select-vars");

    //reset list
    select.options.length = 1;

    //include default expression variables (e.g. ${body})
    select.options[select.options.length] = new Option("body", 1);

    //move list to given element
    select.parentNode.removeChild(select)
    element.appendChild(select)
    
    //populate selection with expression variables found
    for(index in vars) {
        select.options[select.options.length] = new Option(vars[index], index);
    }
}

/**
 * Generates a set of Camel actions
 */
function createSelectedFrom(event)
{
    console.log("selected from: "+event.selectedOptions[0].text)

    switch(event.selectedOptions[0].value){
        case 'direct':
            createDirectStart()
            break;
        case 'timer':
            createTimer()
            break;
    }
    
    event.selectedIndex = 0
}


/**
 * Generates selected artifact (from interface menu)
 */
function createSelectedOption(event)
{
    console.log("selected option: "+event.selectedOptions[0].text)

    switch(event.selectedOptions[0].value){
        case 'property': createProperty();   break;
        case 'header':   createHeader();     break;        
        case 'body':     createBody();       break;

        case 'log':      createLog();        break;
        case 'direct':   createDirect();     break;
        case 'choice':   createChoice();     break;
        case 'parallel': createMulticast();  break;

        case 'rest-group': createRestGroup();  break;
        case 'rest-method-get': createRestMethod({method: 'get'});  break;
        case 'rest-method-post': createRestMethod({method: 'post'});  break;
        case 'rest-method-put': createRestMethod({method: 'put'});  break;
    }
    
    event.selectedIndex = 0
}

/**
 * Generates a set of Camel actions
 */
function createPredefinedSet(event)
{
    //While building the Visual elements, TextEditor<=>VisualEditor comms need to stop, 
    syncStartUpEnabled = true;


    console.log("predefined set: "+event.selectedOptions[0].text)

    //boolean to decide if set needs to be built
    let createSet = !Boolean(findRouteIdFromDirectUri(event.selectedOptions[0].value))

    switch(event.selectedOptions[0].value){
        case 'xpath-xml-to-json':
            createPredefinedSetXml2jsonXpath(createSet)
            break;
        case 'xpath-json-to-xml':
            createPredefinedSetJson2xmlXpath(createSet)
            break;
        case 'df-xml-to-json':
            createPredefinedSetXml2jsonDataFormat(createSet)
            break;
        case 'df-json-to-xml':
            createPredefinedSetJson2xmlDataFormat(createSet)
            break;
    }
    
    //reset selection to default (menu title)
    event.selectedIndex = 0

    //Once finished, we need to sync the changes, (new ID values may have been applied)
    syncStartUpEnabled = false;
    syncEditor();
}

function findRouteIdFromDirectUri(targetUri)
{
    //use 'querySelector' to find the route that contains the direct (target)
    //    the query selector used is:
    //             [start]              all elements that have the 'start' attribute (as in 'start of route')
    //                >                 indicates 'parent of'
    //       .uri[value="tartet-uri"]   with class 'uri' and attribute 'value' containing the target uri
    let uri = document.querySelector('[start] > .uri[value="'+targetUri+'"]')
    
    //if nothing found return
    if(uri == null)
    {
        return
    }

    //return ID of route
    let routeId = uri.parentElement.parentElement.id
    return routeId
}

// function createPredefinedSetTest()
// {
//     let snippet = '<setBody><simple>testbody</simple></setBody>'
    
//     loadSourceCode(snippet)
// }

function createPredefinedSetJson2xmlDataFormat(createSet)
{
    let uri = 'df-json-to-xml'

    let snippet = '<route id="'+uri+'"><from uri="direct:'+uri+'"/><log message="input:\n${body}"/><to uri="dataformat:json-jackson:unmarshal"/><to uri="dataformat:jacksonxml:marshal?prettyPrint=true"/><log message="output:\n${body}"/></route>'

    createPredefinedSetTemplate(uri, snippet, createSet)
}

function createPredefinedSetXml2jsonDataFormat(createSet)
{
    let uri = 'df-xml-to-json'

    let snippet = '<route id="'+uri+'"><from uri="direct:'+uri+'"/><log message="input:\n${body}"/><to uri="dataformat:jacksonxml:unmarshal"/><to uri="dataformat:json-jackson:marshal?prettyPrint=true"/><log message="output:\n${body}"/></route>'

    createPredefinedSetTemplate(uri, snippet, createSet)
}

function createPredefinedSetJson2xmlXpath(createSet)
{
    let uri = 'xpath-json-to-xml'

    let snippet = '<route id="'+uri+'"><from uri="direct:'+uri+'"/><log message="input:\n${body}"/><setBody><simple>&lt;data&gt;${body}&lt;/data&gt;</simple></setBody><setBody><xpath saxon="true">json-to-xml(/data)</xpath></setBody><convertBodyTo type="String"/><log message="output:\n${body}"/></route>'

    createPredefinedSetTemplate(uri, snippet, createSet)
}

function createPredefinedSetXml2jsonXpath(createSet)
{
    let uri = 'xpath-xml-to-json'

    let snippet = '<route id="'+uri+'"><from uri="direct:'+uri+'"/><log message="input:\n${body}"/><setBody><xpath saxon="true" resultType="String">xml-to-json(., map { \'indent\' : true() })</xpath></setBody><log message="output:\n${body}"/></route>'

    createPredefinedSetTemplate(uri, snippet, createSet)
}


function createPredefinedSetTemplate(uri,snippet,createSet)
{
    //we keep the current reference
    let current = getActiveActivity();

    if(createSet)
    {
        newRoute()
        loadSourceCode(snippet)

        nextRoute(getActivityRoute(current).id)
        setConfigSelector(current)
    }

    let direct = new DOMParser().parseFromString('<to uri="direct:'+uri+'">', 'application/xml').documentElement

    createDirect({definition: direct})
}

function loadExpressionConfiguration(panel, activity)
{
    //obtain the container with expression variables
    var configuration = document.getElementById("config-expression");

    //move from where it was, to this panel
    configuration.parentNode.removeChild(configuration)
    panel.querySelector('.container-expression').appendChild(configuration)
    
    //obtain the expression configuration element
    var expression = configuration.querySelector('.expression')

    //reset
    populateExpressionVariables(expression)

    //obtain language used
    var language = activity.components.expression.getLanguage()

    //default to 'simple' if none configured
    language = language || "simple"

    //update panel configuration with language
    var langSelect = document.getElementById('select-lang')
    langSelect.value = language
    useExpressionLanguage(langSelect)
}


//Updates the activity with the configuration settings
function useExpression(input)
{
    //sets the expression value in the activity
    getActiveActivity().components.expression.setValue(input.value)
}
