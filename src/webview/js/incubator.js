//This source file is intended to include new experimental functionality
//when the functionality is solid, it can be moved to another more source file


//copies the selection chosen to the input text the user is working with
function useExpressionLanguage(event, activity)
{
    //obtain worked activity
    //on batch activity creation, it is mostly recommended to pass the activity explicitly
    activity = activity || getActiveActivity()

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

                        case 'kafka':     createKafka();       break;
                        case 'file':     createFile();       break;

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
        case 'xpath-json-to-xml':
            createPredefinedSetJson2xmlXpath(createSet)
            break;
        case 'xpath-xml-to-json':
            createPredefinedSetXml2jsonXpath(createSet)
            break;
        case 'df-json-to-xml':
            createPredefinedSetJson2xmlDataFormat(createSet)
            break;
        case 'df-xml-to-json':
            createPredefinedSetXml2jsonDataFormat(createSet)
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

//Template creation for Kits
//this function will create a new route containing the kit definition
//and then creates a 'direct' call pointing to it
function createPredefinedSetTemplate(uri,snippet,createSet)
{
    //we keep the current reference
    let current = getActiveActivity();

    if(createSet)
    {
        //create snippet
        loadSourceCode(snippet)

        //the above snippet creation will change the view focus
        //so we set the focus where the user was
        nextRoute(getActivityRoute(current).id)
        setConfigSelector(current)
    }

    //we then create a 'direct' activity pointing to the kit just created
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
    useExpressionLanguage(langSelect, activity)
}


//Updates the activity with the configuration settings
function useExpression(input)
{
    //sets the expression value in the activity
    getActiveActivity().components.expression.setValue(input.value)
}

//===================================================
//===================================================

/*
* This (a-frame) component adheres URI manipulation functionality to activities (a-entity)
* URIs are defined as: 'scheme:target?options' (e.g. uri="file:directory?fileName=sample")
* The component creates a visible label with [target] and loads the [options] as component attributes
*/
AFRAME.registerComponent('uri', {
    schema: {
        position: {type: 'string'},
        configMethod: []
    },
    init: function () {

        // let defaultValue = this.defaultExpression || "hello world";

        //label to display the expression value set for the activity
        this.label = createText();
        this.el.appendChild(this.label);
        this.label.setAttribute('value', this.defaultUri);
        this.label.setAttribute('color', 'white');
        this.label.setAttribute('align', 'center');
        this.label.setAttribute('position', this.attrValue.position);
        this.label.setAttribute('side', 'double');

        //as init() runs asynchronously, it might run after the panel was loaded
        //config info needs to be reloaded
        this.attrValue.configMethod[0](this.el)
    },

    setDefinition: function(definition) {

        //defaults
        this.attributes        = {}
        this.defaultUri        = "target1";


        if(definition)
        {
            let uri = definition.firstElementChild.attributes.uri.value.split(":")

            this.scheme = uri[0]

            //remove 'scheme' and keep remaining
            this.defaultUri = uri[1]

            //look at options
            let options = this.defaultUri.split("?")

            //if there are options
            if(options.length > 1)
            {
                //keep path value (before question mark)
                this.defaultUri = options[0]

                //split options
                options = options[1].split("&");

                //loops over options
                for(let i=0; i<options.length; i++)
                {
                    let option = options[i].split("=")

                    //adds uri option to component
                    this.attributes[option[0]] = option[1]
                }
            }
        }
    },
              
    getDefinition: function () {
      return this.definition
    },

    getTarget: function () {
        //only if component has initialised we can return a value
        //because the component loads asynchronously, the config panel may first attempt to get the value before the component is ready 
        if(this.label)
        {
            return this.label.getAttribute('value')
        }

        //otherwise return default one (init might not have yet run)
        return this.defaultUri
    },

    setTarget: function (uri) {
        if(this.label)
        {
            this.label.setAttribute('value', uri)
        }
        else
        {
            //init() might not have executed, so we set value as default
            this.defaultUri = uri
        }
    },

    getOptions: function () {
        return this.attributes
    },

    setOption: function(name, value){
        if(value && (value.length > 0))
        {
            this.attributes[name] = value
        }
        else
        {
            delete this.attributes[name]
        }
    },

    getValue: function () {

        //set target to default value
        let target = this.defaultUri

        //only if component has initialised we can return the label value
        //because the component loads asynchronously, the config panel may first attempt to get the value before the component is ready 
        if(this.label)
        {
            target = this.label.getAttribute('value')
        }

        //get options
        let options = new URLSearchParams(this.attributes).toString();

        //XML escape string
        if(options.length > 0)
        {
            options = "?"+options.replace(/&/g,"&amp;")
        }
        
        return this.scheme+":"+target+options
    },

    // update: function () {},
    // tick: function () {},
    // remove: function () {},
    // pause: function () {},
    // play: function () {}
});


function updateConfigEndpointTo(activity)
{
    //obtain worked activity
    var activity = activity || getActiveActivity()

    //obtains configuration panel
    var panel = document.getElementById("config-endpoint-to");

    //obtain reference to target input
    var targetConfig = panel.getElementsByTagName("input")[0];

    //replace input value using activity values
    targetConfig.value = activity.components.uri.getTarget()

    let options = activity.components.uri.getOptions()

    configEndpointPopulateOptions(panel.lastElementChild, options)
}


function createKafka(definition)
{
    // definition = definition || new DOMParser().parseFromString('<to uri="kafka:topic1"/>', "text/xml")
    definition = definition || new DOMParser().parseFromString('<to uri="kafka:topic1?brokers=YOUR_BROKER_SERVICE_URI&amp;autoOffsetReset=earliest"/>', "text/xml")
 
    return createGenericEndpointTo(definition)
}

function createFile(definition)
{
    // definition = definition || new DOMParser().parseFromString('<to uri="kafka:topic1"/>', "text/xml")
    definition = definition || new DOMParser().parseFromString('<to uri="file:directory?fileName=YOUR_FILE_NAME"/>', "text/xml")
 
    return createGenericEndpointTo(definition)
}

// function createGenericEndpointTo(definition, type)
function createGenericEndpointTo(definition)
{
  //default type will be the scheme of the uri (e.g. 'file' in uri="file:name")
  type = definition.firstElementChild.getAttribute('uri').split(":")[0];

  //create
  let activity = createActivity({type: "to", definition: definition});

  //add expression component (and load definition)
  activity.setAttribute('uri', {position: "0 -0.7 0", configMethod: [updateConfigEndpointTo]})
  activity.components.uri.setDefinition(definition)

  //this is the label inside the geometry (activity descriptor)
  var text = createText();
  activity.appendChild(text);
  text.setAttribute('value', type);
  text.setAttribute('color', 'white');
  text.setAttribute('align', 'center');
  text.setAttribute('side', 'double');

  goLive(activity);

  return activity
}

function useEndpointTarget(input)
{
    //sets the expression value in the activity
    getActiveActivity().components.uri.setTarget(input.value)
}

function useEndpointOption(input)
{
    //sets the expression value in the activity
    getActiveActivity().components.uri.setOption(input.previousElementSibling.textContent.slice(0,-1), input.value)
}

function configEndpointAddOption(element)
{
    snippet = `
        <input type="text"  size="15" value="enter_name">
        <button type="submit"  onclick="configEndpointAddOptionConfirm(this)">&check;</button>
        <input type="text" size="30" style="visibility: hidden;">
    `;

    let option = document.createElement('div');
    option.innerHTML = snippet

    element.parentNode.parentNode.insertBefore(option, element.parentNode)

    option.firstElementChild.select()
}


function configEndpointAddOptionConfirm(element)
{
    let name = element.previousElementSibling.value

    snippet = `
        <label style="width: 15">`+name+`:</label>
        <input type="text" size="30" oninput="useEndpointOption(this);syncEditor()">
        <button type="submit" onclick="configEndpointRemoveOption(this)">&cross;</button>
    `;

    let option = document.createElement('div');
    option.innerHTML = snippet

    element.parentNode.parentNode.insertBefore(option, element.parentNode)
    element.parentNode.parentNode.removeChild(element.parentNode)

    option.children[1].select()

    syncEditor()
}


/** 
 * removes the option from the configuration panel and updates the uri component
 * @param {HTMLElement} element The option to remove from its parent
*/
function configEndpointRemoveOption(element)
{
    //obtain name of option (without the colon separator)
    let option = element.previousElementSibling.previousElementSibling.textContent.slice(0,-1)

    //setting null deletes the attribute
    getActiveActivity().components.uri.setOption(option, null)

    //remove the option from the configuration panel
    element.parentNode.parentNode.removeChild(element.parentNode)

    syncEditor()
}


function configEndpointPopulateOptions(divOptions, options)
{
    //clean options list
    divOptions.innerHTML = ""

    for (var name in options){
        configEndpointAddOptionNameValue(divOptions, name, options[name])
    }

    snippet = `
        <button type="submit" onclick="configEndpointAddOption(this)">add option...</button>
    `;

    let button = document.createElement('div');
    button.innerHTML = snippet

    divOptions.appendChild(button)
}


function configEndpointAddOptionNameValue(divOptions, name, value)
{
    snippet = `
        <label style="width: 15">`+name+`:</label>
        <input type="text" value="`+value+`" size="30" oninput="useEndpointOption(this);syncEditor()">
        <button type="submit" onclick="configEndpointRemoveOption(this)">&cross;</button>
    `;

    let option = document.createElement('div');
    option.innerHTML = snippet

    divOptions.appendChild(option)
}