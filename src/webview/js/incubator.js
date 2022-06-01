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

        //careful here, attribute might be set on UI (boolean) or read from code (string)
        if(attributes && (attributes.saxon == true || attributes.saxon == "true"))
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
function findExpressionVariables(activity)
{
    //if activity not provided, initialise with preceding activity
    activity = activity || getPreviousActivity(getActiveActivity())

    //collection to return
    let variables = []

    //while not the end of the route
    while(activity)
    {
        let type = activity.getAttribute('processor-type')

        //if direct, we dive into the route invoked to scan for variables
        if(type == "direct"){

            //obtain target
            let target = activity.firstChild.attributes.value.value

            //find direct starting activity
            let found = document.querySelector("[processor-type=direct][start] > a-text[value="+target+"]")
            
            if(found){ //scan route
                let route = found.closest('[route]')
                variables = findExpressionVariablesInRoute(route, variables)
            }
        }

        //if 'setter' found
        else if(type == "header" || type == "property"){
        
            let simpleNamingConvention

            if(type == "header"){
                simpleNamingConvention = getCamelSimpleHeaderName()
            }
            else{
                simpleNamingConvention = getCamelSimplePropertyName()
            }

            //we add to the collection in the format [type.var] (e.g. 'header.h1')
            let newvar = simpleNamingConvention+"."+activity.getElementsByTagName("a-text")[0].firstChild.getAttribute('value').slice(0, -1)

            //we prevent duplicates
            if(!variables.includes(newvar)){
                variables.push(newvar)                
            }
        }

        //look next
        activity = getPreviousActivity(activity)
    }

    return variables        
}

function findExpressionVariablesInRoute(route, variables, done)
{
    //collection to return
    variables = variables || []

    //list of routes already scanned (helps preventing cycle calls)
    done = done || []

    //scan for headers/properties and direct invocations (excluding FROMs)
    let activities = route.querySelectorAll('[processor-type=property],[processor-type=header],[processor-type=direct]:not([start])')

    for(let i=0; i<activities.length; i++){
        let type = activities[i].getAttribute('processor-type')

        //if 'setter' found
        if(type == "header" || type == "property"){
        
            let simpleNamingConvention

            if(type == "header"){
                simpleNamingConvention = getCamelSimpleHeaderName()
            }
            else{
                simpleNamingConvention = getCamelSimplePropertyName()
            }

            //we add to the collection in the format [type.var] (e.g. 'header.h1')
            let newvar = simpleNamingConvention+"."+activities[i].getElementsByTagName("a-text")[0].firstChild.getAttribute('value').slice(0, -1)
            
            //we prevent duplicates
            if(!variables.includes(newvar)){
                variables.push(newvar)                
            }
        }
        //if direct, we dive into the route invoked to scan for variables
        else if(type == "direct"){

            //obtain target
            let target = activities[i].firstChild.attributes.value.value

            //find direct starting activity
            let found = document.querySelector("[processor-type=direct][start] > a-text[value="+target+"]")
            
            if(found){ //scan route
                route = found.closest('[route]')

               //we cyclic scans
                if(!done.includes(route)){
                    done.push(route)
                    variables = findExpressionVariablesInRoute(route, variables, done)
                }
            }
        }

        
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
        case 'direct': createDirectStart(); break;
        case 'timer':  createTimer();       break;
        case 'kafka':  createKafkaStart();  break;
        case 'file':   createFileStart();   break;
        case 'ftp':    createFtpStart();    break;
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

        case 'kafka':    createKafka();      break;
        case 'file':     createFile();       break;
        case 'ftp':      createFTP();        break;
        case 'pdf':      createPDF();        break;

        // case 'dataformat':     createDataformat();       break;
        case 'base64':       createDataformatWith(event.selectedOptions[0].value);       break;
        case 'jacksonxml':   createDataformatWith(event.selectedOptions[0].value);       break;
        case 'json-jackson': createDataformatWith(event.selectedOptions[0].value);       break;
        case 'dftest':       createDataformat();                                         break;


        case 'log':      createLog();        break;
        case 'direct':   createDirect();     break;
        case 'choice':   createChoice();     break;
        case 'try-catch':createTryCatch();   break;
        case 'split':    createSplit();      break;
        case 'parallel': createMulticast();  break;

        case 'rest-group': createRestGroup();  break;
        case 'rest-method-get': createRestMethod({method: 'get'});  break;
        case 'rest-method-post': createRestMethod({method: 'post'});  break;
        case 'rest-method-put': createRestMethod({method: 'put'});  break;
    }
    
    event.selectedIndex = 0
}

/**
 * Generates a set of Camel actions (aka Kits)
 * The event carries the kit ID
 */
function createPredefinedSet(event)
{
    console.log("predefined set: "+event.selectedOptions[0].text)
    
    createPredefinedSetWithId(event.selectedOptions[0].value)
    
    //reset selection to default (menu title)
    event.selectedIndex = 0
}

/**
 * Generates a set of Camel actions (aka Kits)
 * The ID identifies the Kit to generate
 */
function createPredefinedSetWithId(id)
{
    //While building the Visual elements, TextEditor<=>VisualEditor comms need to stop, 
    syncStartUpEnabled = true;

    //boolean to decide if set needs to be built
    let createSet = !Boolean(findRouteIdFromDirectUri(id))

    switch(id){
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
        
        case 'experiment-1':
            createPredefinedSetExperiment1(createSet)
            break;
    }
    

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
    //       [value="tartet-uri"]       a-text with attribute 'value' containing the target uri
    let activity = document.querySelector('[start] > [value='+targetUri+']')
    
    //if nothing found return
    if(activity == null)
    {
        return
    }

    //otherwise, we reset the variable to its activity (parent) 
    activity = activity.parentElement

    //return ID of route
    let routeId = activity.components.uri.getTarget()
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


function createPredefinedSetExperiment1(createSet)
{
    let uri = 'experiment1'

    let snippet = '<route id="'+uri+'"><from uri="direct:'+uri+'"/><log message="trace1"/><log message="trace2"/><log message="trace3"/><log message="trace4"/></route>'

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


// function createKafka(definition)
// {
//     definition = definition || new DOMParser().parseFromString('<to uri="kafka:topic1?brokers=YOUR_BROKER_SERVICE_URI&amp;autoOffsetReset=earliest"/>', "text/xml").documentElement
//     return createGenericEndpointTo({definition: definition, icon: "#icon-kafka"})
// }

function createKafka(definition)
{
    definition = definition || {definition: new DOMParser().parseFromString('<to uri="kafka:topic1?brokers=YOUR_BROKER_SERVICE_URI&amp;autoOffsetReset=earliest"/>', "text/xml").documentElement}
    definition.icon = "#icon-kafka"
    return createGenericEndpointTo(definition)
}


function createFile(definition)
{
    definition = definition || {definition: new DOMParser().parseFromString('<to uri="file:directory?fileName=YOUR_FILE_NAME"/>', "text/xml").documentElement}
    return createGenericEndpointTo(definition)
}

function createFTP(definition)
{
    definition = definition || {definition: new DOMParser().parseFromString('<to uri="ftp://demoserver:21/directoryName?passiveMode=true&amp;username=YOUR_USERNAME&amp;password=YOUR_PASSWORD"/>', "text/xml").documentElement}
    return createGenericEndpointTo(definition)
}

function createPDF(definition)
{
    definition = definition || {definition: new DOMParser().parseFromString('<to uri="pdf:create"/>', "text/xml").documentElement}
    return createGenericEndpointTo(definition)
}

/*
function createSMTP(definition)
{
    // definition = definition || new DOMParser().parseFromString('<toD uri="smtp://standalone.demo-mail.svc:3025?from=camel@apache.com&amp;to=demo@demo.com&amp;subject=camel-demo&amp;password=demo&amp;username=demo"/>', "text/xml").documentElement
    definition = definition || new DOMParser().parseFromString('<to uri="smtp://standalone.demo-mail.svc:3025?username=demo&amp;password=demo"/>', "text/xml").documentElement
    return createGenericEndpointTo({definition: definition, icon: "#icon-mail"})
}
*/

function createGoogleDrive(definition)
{
    definition = definition || {definition: new DOMParser().parseFromString('<to uri="google-drive://drive-files/insert?clientId=YOUR_ID&amp;clientSecret=YOUR_SECRET&amp;accessToken=YOUR_TOKEN&amp;refreshToken=YOUR_REFRESH_TOKEN"/>', "text/xml").documentElement}
    definition.icon = "#icon-gdrive"
    return createGenericEndpointTo(definition)
}

function createGoogleSheets(definition)
{
    definition = definition || {definition: new DOMParser().parseFromString('<to uri="google-sheets://data/update?clientId=YOUR_ID&amp;clientSecret=YOUR_SECRET&amp;accessToken=YOUR_TOKEN&amp;refreshToken=YOUR_REFRESH_TOKEN&amp;spreadsheetId=YOUR_SPREADSHEET_ID"/>', "text/xml").documentElement}
    definition.icon = "#icon-gsheets"
    return createGenericEndpointTo(definition)
}

//PENDING
function createGoogleDriveStart(definition)
{
    definition = definition || new DOMParser().parseFromString('', "text/xml").documentElement
    return createGenericEndpointFrom({definition: definition, icon: "#icon-gsheets"})
}

function createGoogleSheetsStart(definition)
{
    definition = definition || new DOMParser().parseFromString('<from uri="google-sheets-stream://data?clientId=YOUR_ID&amp;clientSecret=YOUR_SECRET&amp;accessToken=YOUR_TOKEN&amp;refreshToken=YOUR_REFRESH_TOKEN&amp;spreadsheetId=YOUR_SPREADSHEET_ID"/>"/>', "text/xml").documentElement
    return createGenericEndpointFrom({definition: definition, icon: "#icon-gsheets"})
}



// function createGenericActivityTo(definition, type)
function createGenericActivityTo(definition)
{
  //default type will be the scheme of the uri (e.g. 'file' in uri="file:name")
//   type = definition.getAttribute('uri').split(":")[0];
  type = definition.definition.getAttribute('uri').split(":")[0];

  //create
//   let activity = createActivity({type: "to", definition: definition});
  definition.type = 'to'
  let activity = createActivity(definition);

  //add uri component (and load definition)
  activity.setAttribute('uri', {position: "0 -0.7 0", configMethod: [updateConfigEndpointTo]})
//   activity.components.uri.setDefinition(definition)
  activity.components.uri.setDefinition(definition.definition)

  if(definition.icon){
    //no type label
    type=''

    var img = document.createElement('a-image');
    activity.appendChild(img);
    img.setAttribute('side', 'double');
    img.setAttribute('src', definition.icon);
    activity.setAttribute('opacity', '.2');

    // var disc = document.createElement('a-ring');
    // activity.appendChild(disc);
    // disc.setAttribute('side', 'double');
    // disc.setAttribute('src', definition.icon);
    // disc.setAttribute('radius-inner', 0.00001);
    // disc.setAttribute('radius-outer', 0.5);
    // disc.setAttribute('opacity', '.8');
  }

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



function createDirectStart(definition)
{
    let snippet = '<from uri="direct:'+getActiveRoute().id+'"/>'
    definition = definition || new DOMParser().parseFromString(snippet, "text/xml").documentElement
    let direct = createGenericEndpointFrom({definition: definition})

    //special attribute needed for REST functionality
    direct.setAttribute('direct','')

    return direct
}

function createTimer(definition)
{
    let snippet = '<from uri="timer:'+getUniqueID('timer')+'?period=5000"/>'
    definition = definition || new DOMParser().parseFromString(snippet, "text/xml").documentElement
    
    let timer = createGenericEndpointFrom({definition: definition})

    //create clock hands
    var minutes = document.createElement('a-triangle');
    minutes.setAttribute("vertex-a","0 .4 0")
    minutes.setAttribute("vertex-b","-.02 0 0")
    minutes.setAttribute("vertex-c",".02 0 0")
    minutes.setAttribute('animation', {property: 'rotation', dur: '20000', to: '0 0 -360', loop: true, easing: 'linear'});

    var hours = document.createElement('a-triangle');
    hours.setAttribute("vertex-a","0 .25 0")
    hours.setAttribute("vertex-b","-.02 0 0")
    hours.setAttribute("vertex-c",".02 0 0")
    hours.setAttribute('animation', {property: 'rotation', dur: '240000', to: '0 0 -360', loop: true, easing: 'linear'});

    //add clock hands
    timer.appendChild(minutes);
    timer.appendChild(hours);


    return timer
}


function createKafkaStart(definition)
{
    // definition = definition || new DOMParser().parseFromString('<from uri="kafka:topic1?brokers=YOUR_BROKER_SERVICE_URI"/>', "text/xml").documentElement
    definition = definition || new DOMParser().parseFromString('<from uri="kafka:topic1?brokers=my-cluster-kafka-bootstrap:9092&amp;autoOffsetReset=earliest"/>', "text/xml").documentElement
    // return createGenericEndpointFrom(definition)
    return createGenericEndpointFrom({definition: definition, icon: "#icon-kafka"})
}

function createFileStart(definition)
{
    definition = definition || new DOMParser().parseFromString('<from uri="file:directory1"/>', "text/xml").documentElement
    // return createGenericEndpointFrom(definition)
    return createGenericEndpointFrom({definition: definition})
}


function createFtpStart(definition)
{
    // definition = definition || new DOMParser().parseFromString('<from uri="file:directory1"/>', "text/xml").documentElement
    definition = definition || new DOMParser().parseFromString('<from uri="ftp://demoserver:21/directoryName?username=YOUR_USERNAME&amp;password=YOUR_PASSWORD"/>', "text/xml").documentElement

    // return createGenericEndpointFrom(definition)
    return createGenericEndpointFrom({definition: definition})
}

function createGenericEndpointFrom(definition)
{
  //default type will be the scheme of the uri (e.g. 'file' in uri="file:name")
  type = definition.definition.getAttribute('uri').split(":")[0];

  //defaults
  definition.type = 'from'
  definition.detachable = false

  //create
  let activity = createActivity(definition);

  //customise to make it a START activity
  activity.setAttribute('material', {color: '#52F40C', transparent: true, opacity: 0.5});
  activity.setAttribute('start', '');

  //add uri component (and load definition)
  activity.setAttribute('uri', {position: "0 0.7 0", configMethod: [updateConfigEndpointTo]})
  activity.components.uri.setDefinition(definition.definition)

  if(definition.icon){
    //no type label
    type=''

    // var img = document.createElement('a-image');
    // activity.appendChild(img);
    // img.setAttribute('side', 'double');
    // img.setAttribute('src', definition.icon);
    // // activity.setAttribute('opacity', '.2');

    var disc = document.createElement('a-ring');
    activity.appendChild(disc);
    disc.setAttribute('side', 'double');
    disc.setAttribute('src', definition.icon);
    disc.setAttribute('radius-inner', 0.00001);
    disc.setAttribute('radius-outer', 0.5);
    disc.setAttribute('opacity', '.99');
  }

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




// /**
//  * Implement AABB collision detection for entities with a mesh.
//  * (https://en.wikipedia.org/wiki/Minimum_bounding_box#Axis-aligned_minimum_bounding_box)
//  * It sets the specified state on the intersected entities.
//  *
//  * @property {string} objects - Selector of the entities to test for collision.
//  * @property {string} state - State to set on collided entities.
//  *
//  */
// AFRAME.registerComponent('aabb-collider', {
//     schema: {
//       objects: {default: ''},
//       state: {default: 'collided'}
//     },
  
//     init: function () {
//       this.els = [];
//       this.collisions = [];
//       this.elMax = new THREE.Vector3();
//       this.elMin = new THREE.Vector3();
//     },
  
//     /**
//      * Update list of entities to test for collision.
//      */
//     update: function () {
//       var data = this.data;
//       var objectEls;
  
//       // Push entities into list of els to intersect.
//       if (data.objects) {
//         objectEls = this.el.sceneEl.querySelectorAll(data.objects);
//       } else {
//         // If objects not defined, intersect with everything.
//         objectEls = this.el.sceneEl.children;
//       }
//       // Convert from NodeList to Array
//       this.els = Array.prototype.slice.call(objectEls);
//     },
  
//     tick: (function () {
//       var boundingBox = new THREE.Box3();
//       return function () {
//         var collisions = [];
//         var el = this.el;
//         var mesh = el.getObject3D('mesh');
//         var self = this;
//         // No mesh, no collisions
//         if (!mesh) { return; }
//         // Update the bounding box to account for rotations and
//         // position changes.
//         updateBoundingBox();
//         // Update collisions.
//         this.els.forEach(intersect);
//         // Emit events.
//         collisions.forEach(handleHit);
//         // No collisions.
//         if (collisions.length === 0) { self.el.emit('hit', {el: null}); }
//         // Updated the state of the elements that are not intersected anymore.
//         this.collisions.filter(function (el) {
//           return collisions.indexOf(el) === -1;
//         }).forEach(function removeState (el) {
//           el.removeState(self.data.state);
//           el.emit('hitend');
//         });
//         // Store new collisions
//         this.collisions = collisions;
  
//         // AABB collision detection
//         function intersect (el) {
//           var intersected;
//           var mesh = el.getObject3D('mesh');
//           var elMin;
//           var elMax;
//           if (!mesh) { return; }
//           boundingBox.setFromObject(mesh);
//           elMin = boundingBox.min;
//           elMax = boundingBox.max;
//           // Bounding boxes are always aligned with the world coordinate system.
//           // The collision test checks for the conditions where cubes intersect.
//           // It's an extension to 3 dimensions of this approach (with the condition negated)
//           // https://www.youtube.com/watch?v=ghqD3e37R7E
//           intersected = (self.elMin.x <= elMax.x && self.elMax.x >= elMin.x) &&
//                         (self.elMin.y <= elMax.y && self.elMax.y >= elMin.y) &&
//                         (self.elMin.z <= elMax.z && self.elMax.z >= elMin.z);
//           if (!intersected) { return; }
//           collisions.push(el);
//         }
  
//         function handleHit (hitEl) {
//           hitEl.emit('hit');
//           hitEl.addState(self.data.state);
//           self.el.emit('hit', {el: hitEl});
//         }
  
//         function updateBoundingBox () {
//           boundingBox.setFromObject(mesh);
//           self.elMin.copy(boundingBox.min);
//           self.elMax.copy(boundingBox.max);
//         }
//       };
//     })()
//   });


//=========================================

function resetDesigner()
{
    //Switch to stream edit updates
    syncEditorEnabled = true;
    syncStartUpEnabled = false;
    
    //Camera default position in axis
    cameraY = 0;

    if(document.getElementById("thescene").is('vr-mode')){
        cameraZ = 8
    }
    else{
        cameraZ = 7
    }

    routes = ["route1"];
//   this.routes = ["resetDesigner"];
    routeNum = 1;

    startActivityPos = -5;
    stepPos = 2;
    setGreen = false;
    
    //counter to generate new Unique IDs
    uidCounter = 0;
    
    moving = false;
    movingObj = null;
    movingObjX = null;
    movingObjY = null;
    event1X = null;
    event1Y = null;

    configObj = null;

    currentConfigPane = "introconfig";

    timestampFirstClick = Date.now();

    hintDirectPending     = true;
    hintDetachablePending = true;

    flagTestEnabled = false;

    var allroutes = document.getElementById('route-definitions')//.firstElementChild

    // updateRouteId(route1, "route1")

    // route1.innerHTML = ""
    while (allroutes.firstChild) {
        allroutes.removeChild(allroutes.firstChild);
    }

    snippet = `
    <a-entity id="route1" route="" class="interactive" position="0 0 0">
    </a-entity>
    `;

    let route1 = document.createElement('div');
    route1.innerHTML = snippet

    allroutes.innerHTML = route1.innerHTML
    // element.parentNode.parentNode.insertBefore(option, element.parentNode)


    var allrest = document.getElementById('rest-definitions')//.firstElementChild
    allrest.innerHTML = ""
    allrest.setAttribute('visible', 'false')
    allrest.setAttribute('position', '0 100 0')

    // viewRouteDefinitions()
    // nextRoute()
}


//====================== TRACE MESSAGES VIA JOLOKIA

// reference:
    // https://access.redhat.com/documentation/en-us/red_hat_fuse/7.6/html/managing_fuse/manage-monitor-fuse-springboot#fuse-console-access-springboot1

// Need to include in SpringBoot:

//POM:
    // <dependency>
    // <groupId>io.hawt</groupId>
    // <artifactId>hawtio-springboot-1</artifactId>
    // </dependency>

// application.properties
//========================
    // management.port=10001
    // # enable management endpoints for healthchecks and hawtio
    // endpoints.enabled = false
    // endpoints.hawtio.enabled = true
    // endpoints.jolokia.enabled = true
    // endpoints.health.enabled = true
    // management.health.defaults.enabled=false
    // camel.health.enabled=false
    // camel.health.indicator.enabled=true
    // endpoints.jolokia.sensitive=false
    // endpoints.hawtio.sensitive=false
    // hawtio.authenticationEnabled=false


// Enables/Disables tracing functionality
function tracingSwitch(element) {

    //when disabled
    if(element.checked != true)
    {
        //clear list of exchange IDs
        document.getElementById('myUL').innerHTML = ""

        //remove tracing component
        document.getElementById('route-definitions').removeAttribute("tracing")

        return
    }

    //obtain user configuration
    let config = getTracingConfig()

    //add tracing component
    document.getElementById('route-definitions').setAttribute("tracing", config)    
}


//setup functionality for the Tracing functionality
function setupTracingSwitch() {

    // Add a "checked" symbol when clicking on a list item
    var list = document.querySelector('ul');

    list.addEventListener('click', function(ev) {

        //we ignore 'close' clicks
        //only selection clicks on this list are processed
        if(ev.target.localName == 'span')
        {
            return
        }

        //deselect all options
        var items = list.querySelectorAll('li')
        for(let i=0; i<items.length; i++)
        {
            // ev.target.classList.toggle('checked', false);
            if(items[i].classList.length > 0)
                items[i].classList.toggle('checked', false);
        }

        //select the one clicked
        if (ev.target.tagName === 'LI') {
            ev.target.classList.toggle('checked');

            let exchangeId = ev.target.firstChild.textContent
            // currentTrace = exchangeId

            var routes = document.getElementById('route-definitions')

            routes.components.tracing.showTrace(exchangeId)
            // showTrace(exchangeId)
        }
    }, false);
};


//Displays tracing configuration pane to the user
function tracingShowConfig(show)
{
    if(show)
    {
        document.getElementById('tracing-config').style.visibility="visible"
    }
    else
    {
        let routes = document.getElementById('route-definitions')
        let tracing = routes.components.tracing

        //if tracing is already active
        if(tracing)
        {
            //update configuration
            routes.setAttribute('tracing', getTracingConfig())
        }

        //check if there is a trace already selected by the user
        let selected = document.querySelector('#myUL > li.checked')

        //if so
        if(selected)
        {
            //obtain the ID value
            let exchangeId = selected.firstChild.nodeValue

            //clear links and regenerate
            tracing.traceClearTraceLinks()
            tracing.showTrace(exchangeId)
        }

        document.getElementById('tracing-config').style.visibility="hidden"
    }
}

//////////////////
// This is an interface layer function.
// Its purpose is to decouple the User UI interface (menus/buttons) from the Visual 3D Canvas
// This gives room to replace the current User UI with other choices (i.e. PatternFly)
///////////////////////////////////////////////////////////////////////////////////////
//obtain the configuration data from the tracing configuration pane
function getTracingConfig()
{
    let tracingConfig = document.getElementById('tracing-config')

    let fields = tracingConfig.getElementsByTagName('input')

    let config = {
        url: fields[0].value,
        showBody: fields[1].hasAttribute('checked'),
        showHeaders: fields[2].hasAttribute('checked')
    }

    return config
}

//////////////////
// This is an interface layer function.
// Its purpose is to decouple the User UI interface (menus/buttons) from the Visual 3D Canvas
// This gives room to replace the current User UI with other choices (i.e. PatternFly)
///////////////////////////////////////////////////////////////////////////////////////
//displays an alert message to the user
function setTracingUserAlert(message, disableTracing)
{
    //log
    console.error(message);

    //we inform the user
    document.getElementById('tracingerror').style.visibility="visible"

    //only switch-off when failure occurs during switch-on, otherwise execution falls into an ON-OFF spiral
    if(disableTracing)
    {
        //we disable tracing

        //this doesn't work, it should, but doesn't
        // document.getElementById('trace-switch').click()

        //so we un-check manually and fire the click event to trigger tracing tear down
        let tSwitch = document.getElementById('trace-switch')
        tSwitch.checked = false
        tSwitch.dispatchEvent(new Event('click'));
    }    
}


/*
function setGroupSelector(activity)
{
        //Since A-Frame 1.0.0
        //A problem moving the ring forces us te destroy and recreate
        let ring = document.createElement('a-ring');
        activity.appendChild(ring);
        ring.setAttribute('id', 'selector-end');
        ring.setAttribute('side', 'double');
        ring.setAttribute('color', 'orange');
        ring.setAttribute('radius-inner', .7);
        ring.setAttribute('radius-outer', .71);
      
        // let ring2 = document.createElement('a-ring');
        // ring.appendChild(ring2);
        // ring2.setAttribute('id', 'selector-end2');
        // ring2.setAttribute('side', 'double');
        // ring2.setAttribute('color', 'yellow');
        // ring2.setAttribute('radius-inner', .8);
        // ring2.setAttribute('radius-outer', .81);
      
        let groupButton = document.createElement('a-entity')
        ring.appendChild(groupButton)
        groupButton.setAttribute('id', 'group-button')
        groupButton.setAttribute('class', 'interactive menu-button')
        groupButton.setAttribute('mixin', 'uigroup')
        groupButton.setAttribute('position', '0 1.5 0')

        var text = createText();
        groupButton.appendChild(text);
        // text.setAttribute('class', 'uri');
        text.setAttribute('value', 'try/catch');
        text.setAttribute('color', 'white');
        text.setAttribute('align', 'center');
        text.setAttribute('side', 'double');


        // groupButton.addEventListener('click', actionGroupActivities, { once: true });
        groupButton.addEventListener('click', wrapActivitiesWithTryCatch, { once: true });

        //we need to delay this action because we're still processing a 'click event'
        // setTimeout(function(){ alert("Hello"); }, 3000);

        // console.log("ring created on: "+activity.id);
}
*/

//creates a frame around the start/end activities
//returns the frame created
function actionGroupActivities(start, end)
{
    //flag to indicate if the second selector exists and needs to be cleaned.
    //for instance...
    //  - creating activities from source will use start/end activities
    //  - user interaction will use selectors to demark range of activities
    let cleanSelector = !(start && end)
    let extraWidth = 0

    if(cleanSelector)
    {
        //when grouping a selection we graphically want to include start and end activities
        extraWidth = 2

        start = getSelectedActivityPrimary()
        end   = getSelectedActivitySecondary()
    }

    // start = start || getActiveActivity()
    // end   = end   || document.getElementById('selector-end').parentElement
 
// let first = getEarliestActivity(start, end)


    console.log("pretending activities are being grouped.")

    // let activity1 = getActiveActivity()
    // let activity2 = document.getElementById('selector-end').parentElement
    let activity1 = start
    let activity2 = end

    console.log("act1: "+activity1.object3D.position.x)
    console.log("act2: "+activity2.object3D.position.x)

    let posx = (activity1.object3D.position.x - activity2.object3D.position.x)/2
    let width = Math.abs(activity1.object3D.position.x - activity2.object3D.position.x)+extraWidth
    
    let group = document.createElement('a-plane');
    activity2.appendChild(group);
    // ring2.setAttribute('id', 'selection');
    group.setAttribute('side', 'double');
    group.setAttribute('color', '#2C3539');
    group.setAttribute('width', width);
    group.setAttribute('height', 2);
    // group.setAttribute('position', posx+" 0 -.1");
    group.object3D.position.set(
        posx,
        0,
        -.1
    )

    if(cleanSelector)
    {
        activity2.removeChild(document.getElementById('selector-end'))
    }

    return group
}


function wrapActivitiesWithTryCatch()
{
    wrapWithTryCatch()
}


//UNDER CONSTRUCTION
//function createTryCatch(definition)
function wrapWithTryCatch(definition)
{
    if(!definition)
    {
        //default definition if not given
        definition = new DOMParser().parseFromString('<doTry><log message="try catch sample"/><doCatch><exception>java.io.Exception</exception><log message="got exception"/></doCatch><doFinally><log message="finally section"/></doFinally></doTry>', 'application/xml').documentElement;
    }

    wrapActivitiesWith(definition)
}

function wrapActivitiesWith(definition)
{
    let wrapActivities = rangeExists()

    //we're about to create multiple activities, so we stop streaming updates until we're done
    syncEditorEnabled = false;

    //obtain range of activities to work with
    //(this only makes sense when wrapping activities)
    let range = getListActivitiesFirstToLast(
                    getSelectedActivityPrimary(),
                    getSelectedActivitySecondary()
                )

    //Given the activities [A1,A2,A3,A4], when wrapping activities [A2,A3] in a try{} statement we should see:
    //before:  A1 ------> A2 -> A3 ------> A4
    //after:   A1 -> { -> A2 -> A3 -> } -> A4
    // A1 is the activity before try{}
    // A3 is the activity ending try{}
    let activityBeforeTryCatch = getPreviousActivity(range[0])
    let activityEndingTryCatch = range[range.length-1]
    

    refPosition = getPositionInScene(activityBeforeTryCatch)


    // create CHOICE start activity
    let start = createActivity({type: 'try-start', definition: definition, detachable: false});

    //We create an 'end' activity
    //We need to provide a specific ID for the end activity (with format: "[startId]-end")
    //Updating the ID from the source definition causes the following error:
    //  [The document has mutated since the result was returned]
    //Cloning the object causes the same error.
    //The workaround is to unmarshal/marshal (passing a whitelist filter of the fields to keep)
    let definitionUpdate = JSON.parse(JSON.stringify(definition, ["id", "tagName"]))

    // and then update the ID
    definitionUpdate.id = start.id+"-end"

    //then we can create the end activity with the given ID
    let end = createActivity({type: 'try-end', definition: definitionUpdate, detachable: false});

    //align choice to preceding activity
    //this is particularly important to maintain flow in Y coordinate 
    start.object3D.position.set(
        refPosition.x+2, //we shift 2
        refPosition.y,
        refPosition.z
    )

    //align choice to preceding activity
    end.object3D.position.set(
    //   activityEndingTryCatch.object3D.position.x+2,
        refPosition.x,
        refPosition.y,
        refPosition.z
    )

    start.setAttribute('radius', '.25')
    end.setAttribute('radius', '.25')

    //labels for Root activity
    var text = createText();
    start.appendChild(text);
    text.setAttribute('value', 'try');
    text.setAttribute('color', 'white');
    text.setAttribute('align', 'center');
    text.setAttribute('side', 'double');

    //labels for End activity
    text = createText();
    end.appendChild(text);
    text.setAttribute('value', 'end');
    text.setAttribute('color', 'white');
    text.setAttribute('align', 'center');
    text.setAttribute('side', 'double');

    //we keep referece.
    let orphanLink = detachForwardLink(activityBeforeTryCatch)

     //default value for <otherwise> (no expression)
    let expression = null;

    //if new segment was injected in between activities
    //we attach the segment-end to the orphan link
    if(orphanLink)
    {
        attachSourceToLink(start, orphanLink);
    }

    //insert Start
    insertActivity(start, activityBeforeTryCatch)

    //connect Start to preceding activity
    linkActivities(activityBeforeTryCatch, start)


    orphanLink = detachForwardLink(activityEndingTryCatch)
    linkActivities(activityEndingTryCatch, end)

    attachSourceToLink(end, orphanLink);


    //insert End Choice
    insertActivity(end,activityEndingTryCatch)
          
    setConfigSelector(end)
    redrawAllLinks()

    //--------------------
    let frame = actionGroupActivities(start, end)
    initialiseTryCatchFrame(frame)
    //--------------------

    cleanSelectorRange()

    //now we're done, we switch back on, and we sync.
    syncEditorEnabled = true;
    syncEditor();

    //we return the 'end' activity
    //this is necessary to process nested choices (or an inner choice)
    return end
}

function initialiseTryCatchFrame(frame)
{
    let height = frame.getAttribute('height')
    let posY   = height/2+.25

    let button = document.createElement('a-plane');
    frame.appendChild(button);
    // ring2.setAttribute('id', 'selection');
    button.setAttribute('side', 'double');
    button.setAttribute('color', '#18399a')//'#696969');
    button.setAttribute('width', 1);
    button.setAttribute('height', .5);
    button.setAttribute('position', "0 -"+posY+" 0");

    let text = createText();
    button.appendChild(text);
    text.setAttribute('value', 'doCatch');
    text.setAttribute('color', 'white');
    text.setAttribute('align', 'center');
    text.setAttribute('side', 'double');

    // let current = getActiveActivity()

    var scale = {x: .8, y: .8, z: .8};


    // create CHOICE start activity
    // let doCatch = createActivity({type: 'catch-start', definition: null, detachable: false, scale: scale})

    // goLive(
    //     doCatch,
    //     {x: -2, y: -2, z: 0},//getNextParallelPosition(scene,i,numActivities,0, boxed),
    //     null, //[rootActivity],
    //     scale, 
    //     true, 
    //     frame); //parent entity

    let activity = createLog({golive: false, scale: scale})
    activity.setAttribute('golive', true)
    goLive(
        activity,
        {x: -2, y: -2, z: 0},//getNextParallelPosition(scene,i,numActivities,0, boxed),
        [],//[doCatch], //[rootActivity],
        scale, 
        true, 
        frame); //parent entity


    let activity2 = createLog({golive: false, scale: scale})
    activity2.setAttribute('golive', true)
    goLive(
        activity2,
        {x: 0, y: -2, z: 0},//getNextParallelPosition(scene,i,numActivities,0, boxed),
        [activity],//null,//[doCatch], //[rootActivity],
        scale, 
        true, 
        frame); //parent entity

    let link = linkActivities(activity, activity2)
    // redrawLink(link)

    // switchConfigPaneByActivity(current)
}


//============================================================
//============================================================


//Creates a Split code segment
    //Given the activities [A1,A2]:
    //before:  A1 -------------------------> A2
    //after:   A1 -> { -> activities -> } -> A2
function createSplit(definition)
{
    //we're about to create multiple activities, so we stop streaming updates until we're done
    syncEditorEnabled = false;

    if(!definition)
    {
        //default definition if not given
        definition = new DOMParser().parseFromString('<split><xpath>//foo/bar</xpath><log message="split message"/></split>', 'application/xml').documentElement;
    }

    //we keep a copy of the full definition
    let fullDefinition = definition.cloneNode(true)

    //We remove the expression node to leave processing actions only
    definition.removeChild(definition.children[0])

    //we create the group of activities inside 'split'
    let splitBox = createActivityGroup('split', 'split', 'end', definition)

    //we obtain the starting activity to configure it
    let start = document.getElementById(splitBox.getAttribute('group-start'))

    //create visual integration pattern
    let animation = createSplitAnimation()
    animation.setAttribute("position", "0 1 0")
    start.appendChild(animation)

    //add expression component (and load definition)
    start.setAttribute('expression', {position: "0 -0.7 0", configMethod: [updateConfigSplit]})
    start.components.expression.setDefinition(fullDefinition)

    //As we're creating many boxes and re-positioning, the camera is all over the place
    //so we reset it where we want it to be 
    switchConfigPaneByActivity(
        document.getElementById(splitBox.getAttribute('group-end'))
    )

  //now we're done, we switch back on, and we sync.
  syncEditorEnabled = true;
  syncEditor();
}

//Creates a Try/Catch code segment
    //Given the activities [A1,A2]:
    //before:  A1 -------------------------> A2
    //after:   A1 -> { -> activities -> } -> A2
function createTryCatch(definition)
{
    //we're about to create multiple activities, so we stop streaming updates until we're done
    syncEditorEnabled = false;


    if(!definition)
    {
        //default definition if not given
        // definition = new DOMParser().parseFromString('<doTry><log message="sample 1"/><doCatch><exception>java.io.Exception</exception><log message="got exception"/></doCatch><doFinally><log message="finally section"/></doFinally></doTry>', 'application/xml').documentElement;
        definition = new DOMParser().parseFromString('<doTry><log message="try 1"/><log message="try 2"/><doCatch><exception>java.lang.NullPointerException</exception><exception>java.lang.Exception</exception><log message="got exception"/></doCatch><doFinally><log message="finally section"/></doFinally></doTry>', 'application/xml').documentElement;
    }

    //split definition in separate entities
    let definitionDoCatch   = definition.querySelector('doCatch')
    let definitionDoFinally = definition.querySelector('doFinally')
    definition.removeChild(definitionDoCatch)
    if(definitionDoFinally){
        definition.removeChild(definitionDoFinally)
    }

    //create TRY group
    let tryBox = createActivityGroup('try', 'try', 'end', definition)

    //obtain frame
    let tryFrame = tryBox.querySelector('.dnd-handler')

    let width = tryFrame.getAttribute('width')

    //add hide ON/OFF button
    let groupButton = createButtonReveal()
    groupButton.setAttribute('position', -(width/2-.5)+' -1 0.1')
    tryFrame.appendChild(groupButton)

    groupButton.addEventListener('click', function(){

        //obtain parent box
        let tryBox = this.closest('a-box')

        //find the catch box
        let catchBox = document.getElementById(tryBox.getAttribute('box-catch'))

        //if catch is visible and we're about the hide it
        //we also hide the finally box
        if(catchBox.getAttribute('visible') == true)
        {
            //find the finally box
            let finallyBox = document.getElementById(catchBox.getAttribute('box-finally'))

            //if visible we hide it
            if(finallyBox && finallyBox.getAttribute('visible') == true){
                catchBox.querySelector('.menu-button').click()
            }           
        }

        //reverse visibility
        let visible = catchBox.getAttribute('visible')
        visible = !visible
        catchBox.setAttribute('visible', visible)

        let fromClass = 'interactive'
        let toClass   = 'interactive-hidden'

        if(visible){
            fromClass = 'interactive-hidden'
            toClass   = 'interactive'
        }

        let interactiveEntities = catchBox.querySelectorAll('.'+fromClass)

        //make all activities static
        for(entity of interactiveEntities) {
            entity.classList.replace(fromClass, toClass)
        }

    });

    //extract catch exceptions
    let exceptions = definitionDoCatch.querySelectorAll('exception')

    //leave processing actions only
    for(e of exceptions){
        definitionDoCatch.removeChild(e)
    }

    //create 'doCatch' group
    let catchBox = createActivityGroup('catch', 'catch', 'end', definitionDoCatch, false)

    //indicates it is an unconnected block (does not follow the end-to-end processing path)
    catchBox.classList.add('standalone')

    //not visible by default
    catchBox.setAttribute('visible', false)

    //align position with 'doTry' group
    catchBox.object3D.position.set(
        tryBox.object3D.position.x,
        tryBox.object3D.position.y-2,
        tryBox.object3D.position.z,
    )
    catchBox.querySelector('a-plane').setAttribute('color','yellow')
    catchBox.querySelector('.dnd-handler').classList.remove('interactive')

    //keep reference of catch box
    tryBox.setAttribute('box-catch', catchBox.id)

    //make all activities static
    let interactiveEntities = catchBox.querySelectorAll('.interactive')
    for(entity of interactiveEntities) {
        entity.classList.replace('interactive', 'interactive-hidden')
    }


//find start element
let catchStart = catchBox.querySelector('a-sphere')

//add uri component (and load definition)
catchStart.setAttribute('exceptions', {position: "0 -0.7 0", configMethod: [updateConfigCatch]})
// catchStart.components.uri.setDefinition(definition)
catchStart.components.exceptions.setExceptions(exceptions)




    if(definitionDoFinally)
    {
        //obtain frame
        let catchFrame = catchBox.querySelector('.dnd-handler')

        width = catchFrame.getAttribute('width')

        //add hide ON/OFF button
        groupButton = createButtonReveal()
        groupButton.setAttribute('position', -(width/2-.5)+' -1 0.1')
        catchFrame.appendChild(groupButton)

        groupButton.addEventListener('click', function(){
            //obtain parent box
            let tryBox = this.closest('a-box')

            //find the catch box
            let finallyBox = document.getElementById(tryBox.getAttribute('box-finally'))

            //reverse visibility
            let visible = finallyBox.getAttribute('visible')
            visible = !visible
            finallyBox.setAttribute('visible', visible)

            let fromClass = 'interactive'
            let toClass   = 'interactive-hidden'

            if(visible){
                fromClass = 'interactive-hidden'
                toClass   = 'interactive'
            }

            let interactiveEntities = finallyBox.querySelectorAll('.'+fromClass)

            //make all activities static
            for(entity of interactiveEntities) {
                entity.classList.replace(fromClass, toClass)
            }

        });

        //create 'doCatch' group
        let finallyBox = createActivityGroup('finally', 'finally', 'end', definitionDoFinally, false)

        //indicates it is an unconnected block (does not follow the end-to-end processing path)
        finallyBox.classList.add('standalone')

        //not visible by default
        finallyBox.setAttribute('visible', false)

        //align position with 'doTry' group
        finallyBox.object3D.position.set(
            tryBox.object3D.position.x,
            tryBox.object3D.position.y-4,
            tryBox.object3D.position.z,
        )
        finallyBox.querySelector('a-plane').setAttribute('color','yellow')
        finallyBox.querySelector('.dnd-handler').classList.remove('interactive')

        //keep reference of catch box
        catchBox.setAttribute('box-finally', finallyBox.id)

        //make all activities static
        interactiveEntities = finallyBox.querySelectorAll('.interactive')
        for(entity of interactiveEntities) {
            entity.classList.replace('interactive', 'interactive-hidden')
        }
    }

    //As we're creating many boxes and re-positioning, the camera is all over the place
    //so we reset it where we want it to be 
    switchConfigPaneByActivity(
        document.getElementById(tryBox.getAttribute('group-end'))
    )
    
  //now we're done, we switch back on, and we sync.
  syncEditorEnabled = true;
  syncEditor();
}

function createButtonReveal()
{
    let groupButton = document.createElement('a-entity')
    // tryFrame.appendChild(groupButton)
    // groupButton.setAttribute('id', 'group-button')
    groupButton.setAttribute('class', 'interactive menu-button')
    groupButton.setAttribute('mixin', 'uigroup')
    // groupButton.setAttribute('position', -(width/2-.5)+' -1 0.1')

    var arrow = document.createElement('a-triangle');
    groupButton.appendChild(arrow);
    arrow.setAttribute("vertex-a","0 -.25 0")
    arrow.setAttribute("vertex-b","-.25 .25 0")
    arrow.setAttribute("vertex-c",".25 .25 0")
    arrow.setAttribute("color","grey")
    arrow.setAttribute('side', 'double');
    arrow.setAttribute('scale', '.8 .8 .8')

    groupButton.addEventListener('click', function(){

        let rotation = this.getAttribute('rotation').z 

        if(rotation == 0)
            rotation = 180
        else
            rotation = 0

        this.setAttribute('animation', {property: 'rotation', dur: '100', to: '0 0 '+rotation});
    });

    return groupButton
}



function cleanSelectorRange()
{
    let selector = document.getElementById('selector-end')

    if(!selector){
        return
    }
    
    selector.parentElement.remove(selector)
}




//This building block is complicated.
//It aims to deliver on the following bullet points:
// - create a container (visual and logical) for children activities
// - freedom to organise internal activities with drag'n'drop
// - freedom to drag'n'drop the container, and all its children along
// - automatic container resizing to accommodate children
//To deliver on all the above, its shape is unintuitive, and is shaped as follows:
// - The top level container is a-box, invisible and always size 0. (it provides a fixed coordinates reference)
// - a child 'frame' used to visually contain the activities (it resizes to envelope the activities)
// - a child 'start' and 'end' activities to envelope the activities (START -> a -> a -> a -> END)
// - child activities (representing the Camel actions)
//The 'frame' entity plays the role of the invisible a-box in that when dragged, it actually moves the parent box.
//When the 'frame' is given the 'dnd-handler' attribute, the drag'n'drop component applies the above behavior.
function createActivityGroup(groupName, labelStart, labelEnd, definition, connected)
{
  var boxed = true
  var numActivities = 2;
  var activities = [];
  var scale = {x: .5, y: .5, z: .5};

  var typeStart = groupName + "-start";
  var typeEnd   = groupName + "-end";

  var scene = document.getElementById(routes[0]);

  //Groups can be connected or disconnected
  //e.g. a 'try' group is connected, a 'catch' group is disconnected
  if(connected == null){
      connected = true
  }


  var box = document.createElement('a-box')
  box.classList.add('interactive')
  var groupId = getUniqueID(groupName+"-box");
  box.setAttribute('id', groupId)
  box.setAttribute('opacity', .0)
  box.setAttribute('transparent', true)

  boxPosition = getNextSequencePosition()
  box.object3D.position.set(boxPosition.x, boxPosition.y, boxPosition.z);

  box.setAttribute('height', 0)
  box.setAttribute('width', 0)
  box.setAttribute('depth', 0.00001)
//   box.setAttribute('depth', 0)
  box.setAttribute('dragndrop', '')

  insertActivity(box);

  let source = null
  let sourceFwdLink = null

  if(connected)
  {
    //get reference of activity to follow.
    source = getActiveActivity();

    //we keep referece.
    sourceFwdLink = detachForwardLink(source)
  }

  //create root activity  
  let rootActivity = createActivity({type: typeStart, scale: scale, detachable: false});

  //we make the group start activity static
  //ATTENTION: removing the DOM attribute does not remove internally the a-frame component
  rootActivity.removeAttribute('dragndrop')

  //we need to manually flush, otherwise further checks on the component will be corrupt/inaccurate/wrong
  rootActivity.components.dragndrop.flushToDOM();

  //these classes help parenting and redrawing links
  rootActivity.classList.add('group-start')
  rootActivity.classList.add('boxed')

  let rootId = rootActivity.getAttribute('id');

//   let rootPos = {x: -1, y: 0, z: 0};
  let rootPos = {x: 0, y: 0, z: 0};

  let sources = []

  if(connected){
      sources.push(source)
  }

  // goLive(rootActivity, rootPos, null, scale, boxed, box);
  goLive( rootActivity,
          rootPos,
          //[source],  //sources to connect the activity, here null (automatic)
          sources,  //sources to connect the activity, here null (automatic)
          scale,
          boxed,
          box)


    // let last = createChildrenActivitiesInGroup(null, rootActivity, definition.children, null)
    let last = createChildrenActivitiesInGroup(rootActivity, definition.children)
    activities.push(last)

 
  let posClosing = {x: last.object3D.position.x+2, y: 0, z: 0};


  //create closing activity
  var closeActivity = createActivity({type: typeEnd, scale: scale, detachable: false});
//   closeActivity.removeAttribute('dragndrop')
  
  //these classes help parenting and redrawing links
  closeActivity.classList.add('group-end')
  closeActivity.classList.add('boxed')

  //we make the closing activity to shares ID with starting activity.
  //the difference between them is the suffix. Example: 'choice-1-start' 'choice-1-end'
  updateActivityId(closeActivity, rootId.split('start')[0]+"-end");


  //labels for Root activity
  var text = createText();
  rootActivity.appendChild(text);
  text.setAttribute('value', labelStart);
  text.setAttribute('color', 'white');
  text.setAttribute('side', 'double');
  text.setAttribute('align', 'center');
  text.setAttribute('scale', '.9 .9 .9');
  rootActivity.setAttribute('radius', .25)
  rootActivity.setAttribute('scale', '1 1 1')


  //labels for End activity
  text = createText();
  closeActivity.appendChild(text);
  text.setAttribute('value', labelEnd);
  text.setAttribute('color', 'white');
  text.setAttribute('side', 'double');
  text.setAttribute('align', 'center');
  text.setAttribute('scale', '1.8 1.8 1.8');

//   goLive(closeActivity, posClosing, activities, scale, boxed, box);
  goLive(closeActivity, posClosing, activities, scale, false, box);


  //only when a forward link existed, we attach it to the end of the group
  if(sourceFwdLink)
  {
    attachSourceToLink(closeActivity, sourceFwdLink);
  }

  box.setAttribute('group-start', rootActivity.id);
  box.setAttribute('group-end',   closeActivity.id);

  //is this necessary?
  scene.setAttribute('lastCreated', closeActivity.id);


                let frameWidth = closeActivity.object3D.position.x-rootActivity.object3D.position.x

                let frame = document.createElement('a-plane');
                box.appendChild(frame);
                frame.classList.add('interactive')
                frame.classList.add('dnd-handler')
                frame.setAttribute('dragndrop','')
                frame.setAttribute('side', 'double');
                // frame.setAttribute('color', '#2C3539');
                frame.setAttribute('width', frameWidth);
                frame.setAttribute('height', 2);
                frame.setAttribute('opacity', .1)
                frame.setAttribute('transparent', true)
                frame.id = box.id + "-frame"

                // frame.setAttribute('position', posx+" 0 -.1");
                frame.object3D.position.set(
                    (rootActivity.object3D.position.x+closeActivity.object3D.position.x)/2,
                    0,
                    0
                )

                // //box label
                // var text = createText();
                // frame.appendChild(text);
                // text.setAttribute('value', "[TRY]");
                // text.setAttribute('color', 'grey');
                // text.setAttribute('side', 'double');
                // text.setAttribute('position', -(frameWidth/2-.5)+' 1 0.1')



  if(connected){
    //somehow the link to the multicast is not accurate, need to redraw
    //anyone wants to review this?
    redrawLink(getBackwardsLink(rootActivity))
  }

        //   box.setAttribute('detachable','')


  //we try to obtain enveloping frame (if there is one)
  let groupFrame = getActivityFrame(box)

  //if found, we have 'nested frames'
  if(groupFrame)
  {
    //we position nested frames on top (Z axis) of their parent frame
    //it's necessay to ensure Drag'n'Drop with work for the child frame
    frame.object3D.position.set(
        frame.object3D.position.x,
        frame.object3D.position.y,
        frame.object3D.position.z + .01 //on top
    )

    //we redimension the frame
    redrawBoxFrame(groupFrame)
  }


//   redrawBox(box, rootActivity, closeActivity)

  return box;
}


//Creates a sequence of linked activities (steps)
// function createChildrenActivitiesInGroup(expression, refStart, steps, axisY)
function createChildrenActivitiesInGroup(refStart, steps)
{
    //collection of activities created:
    var branch = []

    setConfigSelector(refStart)

    let lastActivity;

    for(let i=0; i<steps.length; i++)
    {
        console.log("step: "+ steps[i].tagName)

        lastActivity = createActivityFromSource(steps[i].tagName, null, {definition: steps[i]})

        //add to collection
        branch.push(lastActivity);
    }

    //return last activity created
    return branch[branch.length-1]
}

//Resizes the frame ensuring all activities feel visually contained.
function redrawBoxFrame(frame)
{
    //obtains activities (for now, not including boxes/groups)
    let activities = frame.parentNode.querySelectorAll('a-sphere')

    //get START/END activities (first and last)
    let rootActivity  = activities[0]
    let closeActivity = activities[activities.length-1]

    //vars for maximum and minimum Y coordinate
    let maxY = 0
    let minY = 0

    //find maximum and minimum values
    for(let i=0; i<activities.length;i++){
        
        if(activities[i].object3D.position.y > maxY){
            maxY = activities[i].object3D.position.y
            continue
        }
        
        if(activities[i].object3D.position.y < minY){
            minY = activities[i].object3D.position.y
            continue
        }
    }

    //calculate new height, width and frame Y shift
    let height = (maxY - minY) + 2
    let shiftY = (maxY + minY) / 2
    let width  = closeActivity.object3D.position.x - rootActivity.object3D.position.x

    //setters
    frame.setAttribute('width', width);
    frame.setAttribute('height', height)

    // frame.setAttribute('position', posx+" 0 -.1");
    frame.object3D.position.set(
        (rootActivity.object3D.position.x + closeActivity.object3D.position.x)/2,
        shiftY,
        0
    )

    //reposition the reveal/hide button in the corner
    groupButton = frame.querySelector('.menu-button')
    if(groupButton){
        // groupButton.setAttribute('position', -(width/2-.5)+' -1 0.1')
        groupButton.object3D.position.set(
            -(width/2-.5),
            - height/2,
            0.1
        )
    }

    //Identify type of group
    let groupType = rootActivity.getAttribute("processor-type")

    //Depending on the group type, sibling frames might need to be adjusted
    //e.g. dragging activities in frames of type try-catch-finally might require to redraw sibling frames
    switch(groupType){
        case 'try-start': 
            redrawFrameTrySiblings(frame, height)
            break;
        case 'catch-start': 
            redrawFrameCatchSiblings(frame, height)
            break;
        case 'finally-start':
            redrawFrameFinallySiblings(frame, height)
            break;
        default:
            return;
    }
}

//Repositions TRY sibling frames (affected by TRY size and position changes)
function redrawFrameTrySiblings(frame, height)
{
    //obtain all related group boxes
    let boxTry     = frame.parentNode
    let boxCatch   = boxTry.nextSibling
    let boxFinally = document.getElementById(boxCatch.getAttribute('box-finally'))

    //obtain CATCH variables
    let frameCatch = boxCatch.querySelector('.dnd-handler')
    let heightCatch = frameCatch.getAttribute('height')

    //set new CATCH position according to new frame size and position
    boxCatch.object3D.position.set(
        boxTry.object3D.position.x,
        boxTry.object3D.position.y - height/2 + frame.object3D.position.y - heightCatch/2 - frameCatch.object3D.position.y,
        0
    )

    if(boxFinally)
    {
        //obtain FINALLY variables
        let frameFinally = boxFinally.querySelector('.dnd-handler')
        let heightFinally = frameFinally.getAttribute('height')
    
        //set FINALLY position according to new frame size and position
        boxFinally.object3D.position.set(
            boxTry.object3D.position.x,
            boxTry.object3D.position.y - height/2 + frame.object3D.position.y - heightCatch/1 - heightFinally/2 - frameFinally.object3D.position.y,
            0
        )
    }
}

//Repositions CATCH sibling frames (affected by CATCH size and position changes)
function redrawFrameCatchSiblings(frame, height)
{
    //obtain all related group boxes
    let boxCatch = frame.parentNode
    let boxTry = boxCatch.previousSibling
    let boxFinally = document.getElementById(boxCatch.getAttribute('box-finally'))

    //obtain TRY variables
    let frameTry = boxTry.querySelector('.dnd-handler')
    let heightTry = frameTry.getAttribute('height')

    //set TRY position according to new frame size and position
    boxTry.object3D.position.set(
        boxCatch.object3D.position.x,
        boxCatch.object3D.position.y + height/2 + frame.object3D.position.y + heightTry/2 - frameTry.object3D.position.y,
        0
    )

    if(boxFinally)
    {
        //obtain FINALLY variables
        let frameFinally = boxFinally.querySelector('.dnd-handler')
        let heightFinally = frameFinally.getAttribute('height')
    
        //set FINALLY position according to new frame size and position
        boxFinally.object3D.position.set(
            boxCatch.object3D.position.x,
            boxCatch.object3D.position.y - height/2 + frame.object3D.position.y - heightFinally/2 - frameFinally.object3D.position.y,
            0
        )
    }

    redrawAllLinks()
}

//Repositions FINALLY sibling frames (affected by FINALLY size and position changes)
function redrawFrameFinallySiblings(frame, height)
{
    //obtain all related group boxes
    let boxFinally = frame.parentNode
    let boxCatch   = boxFinally.previousSibling
    let boxTry     = boxCatch.previousSibling

    //obtain TRY variables
    let frameTry = boxTry.querySelector('.dnd-handler')
    let heightTry = frameTry.getAttribute('height')

    //obtain CATCH variables
    let frameCatch  = boxCatch.querySelector('.dnd-handler')
    let heightCatch = frameCatch.getAttribute('height')

    //set CATCH position according to new frame size and position
    boxCatch.object3D.position.set(
        boxFinally.object3D.position.x,
        boxFinally.object3D.position.y + height/2 + frame.object3D.position.y + heightCatch/2 - frameCatch.object3D.position.y,
        0
    )

    //set TRY position according to new frame size and position
    boxTry.object3D.position.set(
        boxFinally.object3D.position.x,
        boxFinally.object3D.position.y + height/2 + frame.object3D.position.y + heightCatch/1 + heightTry/2 - frameTry.object3D.position.y,
        0
    )

    redrawAllLinks()
}

//Returns the activity's frame if there is one
//Only activities within a group have a frame that envelopes them
//If the activity does not live in a group, it has no frame
function getActivityFrame(activity)
{
    // if(!activity || !activity.parentEl){
    if(!activity || !activity.parentNode){
        return
    }

    // let siblings = activity.parentEl.children
    let siblings = activity.parentNode.children

    for(sibling of siblings){
        if(sibling.localName == 'a-plane'){
            return sibling
        }
    }
}



//===========================================

function configCatchPopulateExceptions(divOptions, options)
{
    //clean options list
    divOptions.innerHTML = ""

    for (var name in options){
        configCatchAddExceptionElements(divOptions, options[name])
    }

    snippet = `
        <button type="submit" onclick="configCatchAddExceptionUserAction(this)">add exception...</button>
    `;

    let button = document.createElement('div');
    button.innerHTML = snippet

    divOptions.appendChild(button)
}

function configCatchAddExceptionElements(divOptions, value)
{
    // snippet = `
    //     <label style="width: 15">`+name+`:</label>
    //     <input type="text" value="`+value+`" size="30" oninput="useEndpointOption(this);syncEditor()">
    //     <button type="submit" onclick="configEndpointRemoveOption(this)">&cross;</button>
    // `;

    snippet = `
        <input type="text" value="`+value+`" size="30" oninput="useCatchException(this);syncEditor()">
        <button type="submit" onclick="configCatchRemoveException(this)">&cross;</button>
    `;

    let option = document.createElement('div');
    option.innerHTML = snippet

    divOptions.appendChild(option)
}


function configCatchAddExceptionUserAction(element)
{
    // let name = element.previousElementSibling.value

    // snippet = `
    //     <label style="width: 15">`+name+`:</label>
    //     <input type="text" size="30" oninput="useEndpointOption(this);syncEditor()">
    //     <button type="submit" onclick="configEndpointRemoveOption(this)">&cross;</button>
    // `;

    snippet = `
        <input type="text" size="30" oninput="useCatchException(this);syncEditor()">
        <button type="submit" onclick="configCatchRemoveException(this)">&cross;</button>
    `;

    let option = document.createElement('div');
    option.innerHTML = snippet

    element.parentNode.parentNode.insertBefore(option, element.parentNode)
    // element.parentNode.parentNode.removeChild(element.parentNode)

    option.children[0].select()

    syncEditor()
}


/** 
 * removes the option from the configuration panel and updates the uri component
 * @param {HTMLElement} element The option to remove from its parent
*/
function configCatchRemoveException(element)
{
    //obtain input container
    let div = element.parentNode

    //obtain index of input (out of all inputs)
    let index = Array.prototype.indexOf.call(div.parentNode.children, div)


    //obtain name of option (without the colon separator)
    // let option = element.previousElementSibling.textContent.slice(0,-1)

    //setting null deletes the attribute
    // getActiveActivity().components.uri.setOption(option, null)
    getActiveActivity().components.exceptions.setException(index, null)

    //remove the option from the configuration panel
    element.parentNode.parentNode.removeChild(element.parentNode)

    syncEditor()
}

function useCatchException(input)
{
    //obtain input container
    let div = input.parentNode

    //obtain index of input (out of all inputs)
    let index = Array.prototype.indexOf.call(div.parentNode.children, div)

    //sets the expression value in the activity
    // getActiveActivity().components.uri.setOption(input.previousElementSibling.textContent.slice(0,-1), input.value)
    // getActiveActivity().components.uri.setOption(index, input.value)
    getActiveActivity().components.exceptions.setException(index, input.value)

    let allExceptions = input.parentNode.parentNode.querySelectorAll('input')

    let labelValue = ""

    for(ex of allExceptions){
        labelValue = labelValue + ex.value + "\n"
    }

    // getActiveActivity().components.uri.setTarget(labelValue)
    // getActiveActivity().components.exceptions.setTarget(labelValue)
}

function updateConfigCatch(activity)
{
    //obtain worked activity
    var activity = activity || getActiveActivity()

    // if(!activity.components.uri){
    if(!activity.components.exceptions){
        return
    }

    //obtains configuration panel
    var panel = document.getElementById("config-catch");

    //obtain reference to target input
    // var targetConfig = panel.getElementsByTagName("input")[0];

    //replace input value using activity values
    // targetConfig.value = activity.components.uri.getTarget()

    // let options = activity.components.uri.getOptions()
    let options = activity.components.exceptions.getExceptions()

    // configEndpointPopulateOptions(panel.lastElementChild, options)
    configCatchPopulateExceptions(panel.lastElementChild, options)
}


//======================================

function copyActivity(activity)
{
    //only allow cloning for basic steps
    if(    activity.localName != 'a-sphere' 
        || activity.getAttribute('processor-type').endsWith('-start')
        || activity.getAttribute('processor-type').endsWith('-end')){
        
        return
    }

    let source = {text:"", tab:""};
    renderActivity(activity, source, null)

    let definition = new DOMParser().parseFromString(source.text, 'application/xml').documentElement;
  
    let copy = createActivityFromSource(definition.tagName, null, {definition: definition, golive: false})

    return copy        
}


function cloneActivity(activity)
{
    let position = activity.object3D.position.clone()

    let clone = copyActivity(activity)

    if(clone == null){
        return
    }

    clone.id = activity.id

    clone.setAttribute('links', activity.getAttribute('links'))

    clone.object3D.position.set(
        position.x,
        position.y,
        position.z,
    )
    // let parent = activity.parentNode
    // parent.removeChild(activity)
    // parent.appendChild(clone)

    return clone
}


//------------------------

function getStartOfCatch(tryBox)
{
    //when given
    if(tryBox)
    {
        //we obtain the catch box
        let catchBox = document.getElementById(tryBox.getAttribute('box-catch'))

        //return the start element
        return document.getElementById(catchBox.getAttribute('group-start'))
    }
}

function getStartOfFinally(catchBox)
{
    //when given
    if(catchBox)
    {
        //we obtain the catch box
        let finallyBox = document.getElementById(catchBox.getAttribute('box-finally'))

        //if there is one
        if(finallyBox)
        {
            //return the start element
            return document.getElementById(finallyBox.getAttribute('group-start'))
        }
    }
}



//Updates UI configuration panel with DataFormat activity data
function updateConfigEndpointDataformat(activity)
{
    //obtain worked activity
    var activity = activity || getActiveActivity()

    //obtains configuration panel
    var panel = document.getElementById("config-dataformat");

    //obtain reference to target input
    var targetConfig = panel.getElementsByTagName("select")[0];

    //replace input value using activity values
    targetConfig.value = activity.components.uri.getTarget()

    //optain URI options
    let options = activity.components.uri.getOptions()

    //populate UI config options
    configEndpointPopulateOptions(panel.lastElementChild, options)
}

//Updates activity data using UI's configuration panel data
function useDataFormatDirection(input)
{
    //obtain activity
    var activity = getActiveActivity()

    //sets the expression value in the activity
    activity.components.uri.setTarget(input.value)

    //update DataFormat label info
    let label = activity.querySelector('a-text')
    label.setAttribute('value', getDataFormatDetails(activity)['info'])
}

//Returns information details relevant to the type of DataFormat given
function getDataFormatDetails(dataformat)
{
    let type = dataformat.components.uri.getDataFormat()
    let dir  = dataformat.components.uri.getTarget()

    switch(type){
        case 'base64':
            if(dir == 'marshal'){
                return {info:'(String to Base64)', in: 'str', out: 'B64'}
            }
            else{
                return {info:'(Base64 to String)', in: 'B64', out: 'str'}
            }
        ;

        case 'jacksonxml':
            if(dir == 'marshal'){
                return {info:'(Java to XML)', in: 'Java',   out: 'XML'}
            }
            else{
                return {info:'(XML to Java)', in: 'XML', out: 'Java', }
            }
        ;

        case 'json-jackson':
            if(dir == 'marshal'){
                return {info:'(Java to JSON)', in: 'Java',   out: 'JSON'}
            }
            else{
                return {info:'(JSON to Java)', in: 'JSON', out: 'Java', }
            }
        ;
    }
}

//This function translates DataFormat definitions from:
//  from: <marhal><(type)></marhal>
//  to:   <to uri="dataformat:type:marshal"...
//Both definitions are equivalent, but the second is defined as a one line endpoint definition
function defineDataFormatAsOneLiner(definition)
{
    //keeps marhal/unmarshal instruction
    let direction      = definition.nodeName

    //keeps the dataformat in use
    let dataFormatType = definition.firstElementChild.nodeName

    //keeps all attributes defined
    let attributes = definition.firstElementChild.attributes

    //variable to keep the URI options for 1 line definition
    let options = ""
    // if(attributes.length > 0){
    //     options = "?"
    // }

    //special case for JSON which requires a library
    if(dataFormatType == "json"){

        //if the attribute library exists
        if(attributes['library']){
            dataFormatType += "-"+attributes.library.value.toLowerCase()
            attributes.removeNamedItem('library')
        }
        else{
            //default library
            dataFormatType += "-jackson"
        }
    }

    //translate attributes to URI options
    for(let i=0; i<attributes.length; i++){
        if(i==0){
            options += attributes[i].name + "=" +attributes[i].value
        }
        else{
            options += "&amp;"+attributes[i].name + "=" +attributes[i].value
        }
    }

    if(attributes.length > 0){
        options = "?"+options
    }

    //returns DataFormat definition as a one line definition
    return new DOMParser().parseFromString('<to uri="dataformat:'+dataFormatType+':'+direction+options+'">', "text/xml").documentElement
}



//============================================================
//============================================================


    //Creates an Aggregator code segment
    //Given the activities [A1,A2]:
    //before:  A1 -------------------------> A2
    //after:   A1 -> { -> activities -> } -> A2
    function createAggregator(definition)
    {
        //we're about to create multiple activities, so we stop streaming updates until we're done
        syncEditorEnabled = false;
    
        if(!definition)
        {
            let defaultAggregation =
                '<aggregate strategyRef="qaStrategy" completionSize="2">'+
                    '<correlationExpression>'+
                        '<header>correlation</header>'+
                        // '<xpath saxon="false">correlation</xpath>'+
                    '</correlationExpression>'+
                    '<log message="aggregated message"/>'+
                '</aggregate>'

            //default definition if not given
            definition = new DOMParser().parseFromString(defaultAggregation, 'application/xml').documentElement;
        }

        //we keep a copy of the full definition
        let fullDefinition = definition.cloneNode(true)
    
        //We remove the expression node to leave processing actions only
        definition.removeChild(definition.children[0])
    
        //we create the group of activities inside 'split'
        let aggregateBox = createActivityGroup('aggregate', 'aggr.', 'end', definition)
    
        //we obtain the starting activity to configure it
        let start = document.getElementById(aggregateBox.getAttribute('group-start'))
    
        //animated EIP pattern
        let animation = createAggregateAnimation()
        animation.setAttribute("position", "0 1 0")
        start.appendChild(animation)

        //add expression component (and load definition)
        start.setAttribute('expression', {position: "0 -0.7 0", configMethod: [updateConfigSplit]})
        start.components.expression.setDefinition(fullDefinition)
    
        //add component necessary for 3D configuration forms
        // start.setAttribute('definition', {element: fullDefinition})
        start.setAttribute('definition', null)
        start.components.definition.setDefinition(fullDefinition)
        
        //setup form configurator for Aggregator
        createAggregatorConfigurator()

        //As we're creating many boxes and re-positioning, the camera is all over the place
        //so we reset it where we want it to be 
        switchConfigPaneByActivity(
            document.getElementById(aggregateBox.getAttribute('group-end'))
        )
    
    //   get3DconfigPanel()
            // UiInput.setValue(start.components.definition.getValue("strategyRef"))

      //now we're done, we switch back on, and we sync.
      syncEditorEnabled = true;
      syncEditor();
    }

    //creates a 3D panel configurator for the Aggregator EIP
    //this function is intimately related to the 3D Form definition for Aggregators
    function createAggregatorConfigurator(){

        let form = document.getElementById('ui-config-aggregate')

        //if the form already has its configurator, nothing to do
        if(form.components.form.configurator){
            return
        }

        let configurator = {configure: function(form) {

            //here 'this' is the 1st argument from the dynamic call 'configure.call(activity, form)'
            let activity = this

            //get UI elements
            let list   = form.querySelector('a-dropdown')
            let saxon   = form.querySelector('a-checkbox')
            let inputs = Array.from(form.querySelectorAll('a-input'))
      
            //get language
            let language = activity.components.expression.getLanguage()
      
            //set UI checkbox
            saxon.setAttribute('visible', (language == "xpath"))
            saxon.setAttribute('checked', activity.components.expression.getLanguageAttributes().saxon == true)
      
            //set UI language
            list.setAttribute('value', language)
      
            //set UI actions on dropdown selection
            list.onclick = function(){
              let language = list.getAttribute('value')
              
              //update language
              activity.components.expression.setLanguage(language)
              
              //show/hide checkbox
              list.nextElementSibling.setAttribute('visible', language == 'xpath')
      
              syncEditor()
            }
      
            //set UI actions checkbox selection
            saxon.onclick = function(){
              //is it checked
              let checked = saxon.getAttribute('checked') == "true"
      
              //update activity parameter
              activity.components.expression.setLanguageAttribute('saxon', checked)
      
              syncEditor()
            }
      
            //set UI correlation expression
            inputs[0].setAttribute('value', activity.components.expression.getValue())
            inputs[0].components.input.setFunctionOnUpdate(function(){
              activity.components.expression.setValue(inputs[0].getAttribute('value'))
            })
      
            //set UI attributes
            inputs[1].setAttribute('value', activity.components.definition.getAttributes().strategyRef)
            inputs[1].components.input.setFunctionOnUpdate(function(){
              console.log('strategy action')      
              activity.components.definition.setAttribute('strategyRef', inputs[1].getAttribute('value'))
            })
      
            inputs[2].setAttribute('value', activity.components.definition.getAttributes().completionSize)
            inputs[2].components.input.setFunctionOnUpdate(function(){
              console.log('strategy action')      
              activity.components.definition.setAttribute('completionSize', inputs[2].getAttribute('value'))
            })
          } 
        }       

        //set the configurator in the form
        form.components.form.setConfigurator(configurator)
    }

    function createAggregateAnimation(){

        //animation container
        let container = document.createElement("a-entity")
        container.setAttribute('position', "0 1 0")
        container.setAttribute('scale', ".15 .15 .15")
    
        //animated exchange
        let ex1 = document.createElement("a-box")
        ex1.setAttribute('color', 'grey')
        ex1.setAttribute('class', 'exchange')
        ex1.setAttribute('width', '1')
        ex1.setAttribute('height', '1')
        ex1.setAttribute('animation__receive',    {property: 'position', from: '-2 2 0', to: '0 2 0'});
        ex1.setAttribute('animation__merge',      {property: 'position', from: ' 0 2 0', to: '0 0 0'});
        ex1.setAttribute('animation__return',     {property: 'position', from: ' 0 0 0', to: '3 0 0'});
        ex1.setAttribute('animation-timeline__1', {timeline: '#timelineExchange', loop: "true"});
        container.appendChild(ex1)
    
        //animated exchange
        ex1 = document.createElement("a-box")
        ex1.setAttribute('color', 'grey')
        ex1.setAttribute('class', 'exchange')
        ex1.setAttribute('width', '1')
        ex1.setAttribute('height', '1')
        ex1.setAttribute('animation__receive',    {property: 'position', from: '-2.5 0 0', to: '0 0 0'});
        ex1.setAttribute('animation__merge',      {property: 'position', from: ' 0   0 0', to: '0 0 0'});
        ex1.setAttribute('animation__return',     {property: 'position', from: ' 0   0 0', to: '3 0 0'});
        ex1.setAttribute('animation-timeline__1', {timeline: '#timelineExchange', loop: "true"});
        container.appendChild(ex1)
         
        //animated exchange
        ex1 = document.createElement("a-box")
        ex1.setAttribute('color', 'grey')
        ex1.setAttribute('class', 'exchange')
        ex1.setAttribute('width', '1')
        ex1.setAttribute('height', '1')
        ex1.setAttribute('animation__receive',    {property: 'position', from: '-3 -2 0', to: '0 -2 0'});
        ex1.setAttribute('animation__merge',      {property: 'position', from: ' 0 -2 0', to: '0  0 0'});
        ex1.setAttribute('animation__return',     {property: 'position', from: ' 0  0 0', to: '3  0 0'});
        ex1.setAttribute('animation-timeline__1', {timeline: '#timelineExchange', loop: "true"});
        container.appendChild(ex1)

        ex1 = document.createElement("a-box")
        ex1.setAttribute('color', 'grey')
        // ex1.setAttribute('depth', '1.5')
        ex1.setAttribute('width', '1.5')
        ex1.setAttribute('height', '5.5')
        ex1.setAttribute('opacity', '0.4')
        container.appendChild(ex1)
    
        //Frame around animation
        ex1 = document.createElement("a-entity")
        ex1.setAttribute('line'   , {start: "-3.5  3.5 0", end: " 3.5  3.5 0", color: "grey"})
        ex1.setAttribute('line__2', {start:  "3.5  3.5 0", end: " 3.5 -3.5 0", color: "grey"})
        ex1.setAttribute('line__3', {start:  "3.5 -3.5 0", end: "-3.5 -3.5 0", color: "grey"})
        ex1.setAttribute('line__4', {start: "-3.5 -3.5 0", end: "-3.5  3.5 0", color: "grey"})
        container.appendChild(ex1)

        //Frame label
        ex1 = appendLabel(container, "Aggregator")
        ex1.setAttribute("position", "0 4.5 0")
        ex1.setAttribute("scale", "9 9 9")
        ex1.setAttribute("color", "grey")

        return container
      }

      function createSplitAnimation(){

        //animation container
        let container = document.createElement("a-entity")
        container.setAttribute('position', "0 1 0")
        container.setAttribute('scale', ".15 .15 .15")
    
        //animated exchange
        let ex1 = document.createElement("a-box")
        ex1.setAttribute('color', 'grey')
        ex1.setAttribute('class', 'exchange')
        ex1.setAttribute('width', '1')
        ex1.setAttribute('height', '1')
        ex1.setAttribute('animation__receive',    {property: 'position', from: '-3 0 0', to: '0 0 0'});
        ex1.setAttribute('animation__merge',      {property: 'position', from: ' 0 0 0', to: '0 2 0'});
        ex1.setAttribute('animation__return',     {property: 'position', from: ' 0 2 0', to: '3 2 0'});
        ex1.setAttribute('animation-timeline__1', {timeline: '#timelineExchange', loop: "true"});
        container.appendChild(ex1)

        //animated exchange
        ex1 = document.createElement("a-box")
        ex1.setAttribute('color', 'grey')
        ex1.setAttribute('class', 'exchange')
        ex1.setAttribute('width', '1')
        ex1.setAttribute('height', '1')
        ex1.setAttribute('animation__receive',    {property: 'position', from: '-3 0 0', to: '0   0 0'});
        ex1.setAttribute('animation__merge',      {property: 'position', from: ' 0 0 0', to: '0   0 0'});
        ex1.setAttribute('animation__return',     {property: 'position', from: ' 0 0 0', to: '2.5 0 0'});
        ex1.setAttribute('animation-timeline__1', {timeline: '#timelineExchange', loop: "true"});
        container.appendChild(ex1)
     
        //animated exchange
        ex1 = document.createElement("a-box")
        ex1.setAttribute('color', 'grey')
        ex1.setAttribute('class', 'exchange')
        ex1.setAttribute('width', '1')
        ex1.setAttribute('height', '1')
        ex1.setAttribute('animation__receive',    {property: 'position', from: '-3  0 0', to: '0  0 0'});
        ex1.setAttribute('animation__merge',      {property: 'position', from: ' 0  0 0', to: '0 -2 0'});
        ex1.setAttribute('animation__return',     {property: 'position', from: ' 0 -2 0', to: '2 -2 0'});
        ex1.setAttribute('animation-timeline__1', {timeline: '#timelineExchange', loop: "true"});
        container.appendChild(ex1)

        //visual processor where split happens
        ex1 = document.createElement("a-box")
        ex1.setAttribute('color', 'grey')
        ex1.setAttribute('width', '1.5')
        ex1.setAttribute('height', '5.5')
        ex1.setAttribute('opacity', '0.4')
        container.appendChild(ex1)
    
        //Frame around animation
        ex1 = document.createElement("a-entity")
        ex1.setAttribute('line'   , {start: "-3.5  3.5 0", end: " 3.5  3.5 0", color: "grey"})
        ex1.setAttribute('line__2', {start:  "3.5  3.5 0", end: " 3.5 -3.5 0", color: "grey"})
        ex1.setAttribute('line__3', {start:  "3.5 -3.5 0", end: "-3.5 -3.5 0", color: "grey"})
        ex1.setAttribute('line__4', {start: "-3.5 -3.5 0", end: "-3.5  3.5 0", color: "grey"})
        container.appendChild(ex1)

        //Frame label
        ex1 = appendLabel(container, "Splitter")
        ex1.setAttribute("position", "0 4.5 0")
        ex1.setAttribute("scale", "9 9 9")
        ex1.setAttribute("color", "grey")

        return container
      }


      function createChoiceAnimation(){
        let container = document.createElement("a-entity")
        container.setAttribute('position', "0 1 0")
        container.setAttribute('scale', ".15 .15 .15")
    
        let ex1 = document.createElement("a-box")
        ex1.setAttribute('color', 'grey')
        ex1.setAttribute('class', 'exchoice')
        ex1.setAttribute('width', '1')
        ex1.setAttribute('height', '1')
        ex1.setAttribute('animation__receive',    {property: 'position', from: '-3 0 0', to: '0 0 0'});
        ex1.setAttribute('animation__route1',    {property: 'position', from: '0 0 0', to: '0 2 0'});
        ex1.setAttribute('animation__branch1',    {property: 'position', from: '0 2 0', to: '3 2 0'});
        ex1.setAttribute('animation__route2',    {property: 'position', from: '0 0 0', to: '0 -2 0'});
        ex1.setAttribute('animation__branch2',    {property: 'position', from: '0 -2 0', to: '3 -2 0'});
        ex1.setAttribute('animation-timeline__1',    {timeline: '#timelineChoice', loop: "true"});
        container.appendChild(ex1)
    

        ex1 = document.createElement("a-box")
        ex1.setAttribute('color', 'grey')
        ex1.setAttribute('width', '1.5')
        ex1.setAttribute('height', '5.5')
        ex1.setAttribute('opacity', '0.4')
        container.appendChild(ex1)
    
        //Frame around animation
        ex1 = document.createElement("a-entity")
        ex1.setAttribute('line'   , {start: "-3.5  3.5 0", end: " 3.5  3.5 0", color: "grey"})
        ex1.setAttribute('line__2', {start:  "3.5  3.5 0", end: " 3.5 -3.5 0", color: "grey"})
        ex1.setAttribute('line__3', {start:  "3.5 -3.5 0", end: "-3.5 -3.5 0", color: "grey"})
        ex1.setAttribute('line__4', {start: "-3.5 -3.5 0", end: "-3.5  3.5 0", color: "grey"})
        container.appendChild(ex1)

        //Frame label
        ex1 = appendLabel(container, "Router")
        ex1.setAttribute("position", "0 4.5 0")
        ex1.setAttribute("scale", "9 9 9")
        ex1.setAttribute("color", "grey")

        return container
      }
      

//Creates a DataFormat given a parsed XML definition
function createProcess(definition)
{
    // definition = definition || new DOMParser().parseFromString('<to uri="dataformat:base64:marshal"/>', "text/xml").documentElement    
    definition = definition || {definition: new DOMParser().parseFromString(
        '<process ref="myJavaProcess"/>',
        "text/xml").documentElement}

    //create activity
    // let process = createEndpointDataFormat(definition)
    // dataformat.setAttribute('opacity', 0.2)

    //create activity
    definition.type = "process"
    let activity = createActivity(definition);

      //this is the label inside the geometry (activity descriptor)
    var text = createText();
    activity.appendChild(text);
    text.setAttribute('value', 'process');
    text.setAttribute('color', 'white');
    text.setAttribute('align', 'center');
    text.setAttribute('side', 'double');

    // text with actual LOG as configured in Camel
    var label = createText();
    text.appendChild(label);
    label.setAttribute('value', definition.definition.getAttribute("ref"));
    label.setAttribute('color', 'white');
    label.setAttribute('align', 'center');
    label.setAttribute('position', {x: 0, y: -.7, z: 0});
    label.setAttribute('side', 'double');

    let gear = document.createElement("a-entity")
    gear.setAttribute('position', "0 0 -.1")
    gear.setAttribute('scale', ".15 .15 .15")
    gear.setAttribute('animation',    {property: 'rotation', from: '0 0 0', to: '0 0 -360', loop: true, easing: 'linear', dur: 10000});

    let wheel = document.createElement('a-cylinder')
    wheel.setAttribute('color', '#454545')
    wheel.setAttribute('radius', '2')
    wheel.setAttribute('height', '.2')
    wheel.setAttribute('rotation', '90 0 0')
    gear.appendChild(wheel)

    let teeth
    for(let i=0;i<180;i+=30){
        teeth = document.createElement("a-box")
        teeth.setAttribute('color', '#454545')
        teeth.setAttribute('width', '.6')
        teeth.setAttribute('height', '5')
        teeth.setAttribute('depth', '.2')
        teeth.setAttribute('rotation', "0 0 "+i)
        gear.appendChild(teeth)
    }

    activity.appendChild(gear)

    //add uri component (and load definition)
    // activity.setAttribute('uri', {position: "0 -.9 0", configMethod: [updateConfigEndpointDataformat]})
    // activity.components.uri.setDefinition(definition.definition)

    goLive(activity);

    return activity
}

function createRemoveHeaders(definition)
{
  //default definition if not provided
  definition = definition || {definition: new DOMParser().parseFromString('<removeHeaders pattern="*"/>', "text/xml").documentElement}

  // let activity = createActivity({type: 'body', definition: definition});
  definition.type = 'remove-headers'
  let activity = createActivity(definition);

  //add expression component (and load definition)
  //activity.setAttribute('expression', {position: "0 -0.7 0", configMethod: [updateConfigBody]})
  // activity.components.expression.setDefinition(definition)
  //activity.components.expression.setDefinition(definition.definition)

  //this is the label inside the geometry (activity descriptor)
  var text = createText();
  activity.appendChild(text);
  text.setAttribute('value', 'clean\nheaders');
  text.setAttribute('color', 'white');
  text.setAttribute('align', 'center');
  text.setAttribute('side', 'double');

  goLive(activity);

  return activity
}

//function invoked my 'window resize' events
//certain UI element's position needs to be recalculated (i.e Menus)
function manageUI(){

    // console.log("window was resized !")

    //obtain MENU bar
    let handle = document.getElementById("handle");

    //seems like sometimes during HTML intialisation the handle has not loaded yet
    // if(!handle)
        // return

    //place item as per proportions on screen
    setUiItemLocation(handle, .75, .95)

    //obtain current position
    let refPos = handle.object3D.position
    
    //obtain control menu
    handle = document.getElementById("handle-control");

    //position after MENU bar
    handle.object3D.position.set(
        refPos.x + 6,
        refPos.y,
        refPos.z
    )

    //obtain Navigation control
    let navControl = document.getElementById("navigation-control");

    //place item as per proportions on screen
    // setUiItemLocation(navControl, -.7, .9)
    // setUiItemLocation(navControl, -.75, .85)
    setUiItemLocation(navControl, -.8, .85)
}


/*
function editLabel(label){

    let input = UiInput.getActiveElement()

    if(input){
        input.parentElement.parentElement.setAttribute('visible', true);
        UiInput.setValue(getActiveRoute().id+" ")
        return
    }

    //create button entity
    input = document.createElement('a-plane-rounded')
    input.id = 'ui-input-text'

    input.setAttribute('color', 'grey')
    input.setAttribute('width', '2.5')
    input.setAttribute('height', '.5')
    input.setAttribute('radius', '.1')
    input.setAttribute('opacity', '.4')
    input.setAttribute('position', '-1.25 0 -2')

    let listener = function (event) {
         renameActiveRoute(event.detail.value)

         UiInput.getActiveElement().parentElement.parentElement.setAttribute('visible', false)
    }

    let textbox = createTextInput(getActiveRoute().id, listener)
    textbox.setAttribute('position', '1.25 .25 0')

    input.appendChild(textbox)

    var camera = document.getElementById("main-camera");
    camera.appendChild(input)
   
    return input
  }
*/
//==================================


//Creates a Split code segment
    //Given the activities [A1,A2]:
    //before:  A1 -------------------------> A2
    //after:   A1 -> { -> activities -> } -> A2
    function createPipeline(definition)
    {
        //we're about to create multiple activities, so we stop streaming updates until we're done
        syncEditorEnabled = false;
    
        if(!definition)
        {
            //default definition if not given
            definition = new DOMParser().parseFromString('<pipeline><log message="split message"/></pipeline>', 'application/xml').documentElement;
            // definition = new DOMParser().parseFromString('<pipeline></pipeline>', 'application/xml').documentElement;
        }
    
        //we keep a copy of the full definition
        let fullDefinition = definition.cloneNode(true)
    
        //We remove the expression node to leave processing actions only
        // definition.removeChild(definition.children[0])
    
        //we create the group of activities inside 'split'
        let pipelineBox = createActivityGroup('pipeline', 'pipe-\nline', 'end', definition)
    
        //we obtain the starting activity to configure it
        let start = document.getElementById(pipelineBox.getAttribute('group-start'))
    
        //add expression component (and load definition)
        start.setAttribute('expression', {position: "0 -0.7 0", configMethod: [updateConfigSplit]})
        start.components.expression.setDefinition(fullDefinition)
    
        //As we're creating many boxes and re-positioning, the camera is all over the place
        //so we reset it where we want it to be 
        switchConfigPaneByActivity(
            document.getElementById(pipelineBox.getAttribute('group-end'))
        )
    
      //now we're done, we switch back on, and we sync.
      syncEditorEnabled = true;
      syncEditor();
    }

//Creates an AtlasMap activity
function createAtlasMap(definition)
{
    if(camelVersion == CAMEL_RELEASE.v3)    {
        definition = definition || {definition: new DOMParser().parseFromString('<to uri="atlasmap:demo.adm"/>', "text/xml").documentElement}
    }
    else{
        definition = definition || {definition: new DOMParser().parseFromString('<to uri="atlas:demo.adm"/>', "text/xml").documentElement}
    }

    definition.icon = "#icon-atlasmap"

    //default type will be the scheme of the uri (e.g. 'file' in uri="file:name")
    type = definition.definition.getAttribute('uri').split(":")[0];

    //create
    definition.type = 'atlasmap'
    let activity = createActivity(definition);

    //add uri component (and load definition)
    activity.setAttribute('uri', {position: "0 -0.7 0", configMethod: []}) //no need for config method
    activity.components.uri.setDefinition(definition.definition)

    //add component necessary for 3D configuration forms
    activity.setAttribute('definition', null)
    activity.components.definition.setDefinition(definition.definition)

    //setup form configurator for atlasmap
    createAtlasMapConfigurator()

    if(definition.icon){
        //no type label
        type=''

        var img = document.createElement('a-image');
        activity.appendChild(img);
        img.setAttribute('side', 'double');
        img.setAttribute('src', definition.icon);
        activity.setAttribute('opacity', '.2');
    }

    //this is the label inside the geometry (activity descriptor)
    var text = createText();
    activity.appendChild(text);
    text.setAttribute('value', type);
    text.setAttribute('color', 'white');
    text.setAttribute('align', 'center');
    text.setAttribute('side', 'double');

    goLive(activity);

    //obtain available ADMs to list in configuration dropdown
    vscodePostMessage('atlasmap-get-adms', {id: activity.id})

    return activity
}


//creates a 3D panel configurator for the AtlasMap activity
//this function is intimately related to the 3D Form definition for AtlasMap
function createAtlasMapConfigurator(){

    let form = document.getElementById('ui-config-atlasmap')

    //if the form already has its configurator, nothing to do
    if(form.components.form.configurator){
        return
    }
    
    let configurator = {
        configure: function(form) {
            //here 'this' is the 1st argument from the dynamic call 'configure.call(activity, form)'
            let activity = this

            //get UI elements
            let list   = form.querySelector('a-dropdown')

            //set UI language
            list.components.dropdown.setValue(activity.components.uri.getTarget())

            //set UI actions on dropdown selection
            list.onclick = function(){
                let adm = list.getAttribute('value')
                
                activity.components.uri.setTarget(adm)

                syncEditor()
            }
        } 
    }       

    //set the configurator in the form
    form.components.form.setConfigurator(configurator)
}

//Invokes AtlasMap's extension to edit an exisiting data mapping definition
function atlasMapAdmEdit()
{
    //obtain activity
    let activity = getActiveActivity()

    //obtain selected ADM
    let adm = activity.components.uri.getTarget()

    //invoke AtlasMap
    vscodePostMessage('atlasmap-edit', {admfile: adm})
}

//Invokes the AtlasMap's extension to create a new data mapping definition
function atlasMapAdmNew()
{
    vscodePostMessage('atlasmap-new')
}


//TEST function to inspect AtlasMap behaviour
function updateAtlasMapList2(admlist)
{
    //set default list if none passed
    admlist = admlist || [
        // {"label":"maps/map2.adm"},
        // {"label":"adm2.adm"},
        // {"label":"adm3.adm"},
        // {"label":"adm4.adm"}
        ]

        updateAtlasMapList(admlist, true)
}

//Updates the list of available ADMs in the AtlasMap configuration panel
// - admlist: list of current ADM files in the workspace
// - newadm: when true it indicates a new ADM file was created
// - activityId: when provided, sets the list to the activity's value
function updateAtlasMapList(admlist, newadm, activityId)
{
    //helper variable
    let activity

    //if activity id provided
    if(activityId){
        //obtain activity
        activity = document.getElementById(activityId)
    }

    //obtain the form
    let form = document.getElementById('ui-config-atlasmap').children[1]

    //we obtain the dropdown element
    let list = form.querySelector('a-dropdown')

    //the 'New' buttom is OFF by default. We switch ON when working with VSCode 
    form.querySelectorAll('a-button')[0].setAttribute('enabled', true)
    form.querySelectorAll('a-button')[1].setAttribute('enabled', true)

    //set default list if none passed (when there is no interaction with the VS extension)
    admlist = admlist || [
                                {"label":"maps/map2.adm"},
                                {"label":"adm2.adm"},
                                {"label":"adm3.adm"}
                                ]

    //if the list is empty (no ADM files in the workspace), we include a demo entry
    if(admlist.length == 0){
        admlist.push({"label":"demo.adm"})
    }

    for (var entry in admlist){

        let wrapcount = 20

        if(admlist[entry].label.length > wrapcount){
            wrapcount = admlist[entry].label.length + 1
        }

        //this helps to display the label in 1 single line
        // admlist[entry]['labelWrapCount'] = admlist[entry].label.length + 1
        admlist[entry]['labelWrapCount'] = wrapcount
    }

    //setup menu full structure
    menu = {
        "name":"dd-atlasmap",
        "label":"atlasmapmenu",
        "class":"ui",
        "enabled":true,
        "menu": admlist}

    //keep current configuration
    let oldMenu = list.components.dropdown.getMenuEntries()

    //update the current dropdown menu with the new list
    list.components.dropdown.setMenu(menu)

    //if a new ADM was created
    if(newadm){
        //we compare old/new lists to determine which from the list is the new ADM file 
        for (var i in oldMenu){
            for (var j in admlist){
                if(oldMenu[i] == admlist[j].label){
                    admlist.splice(j,1) 
                    break
                }
            }
        }

        //we assume the remaining file in the list is the new ADM
        //when the user creates a new ADM file, we update the activity's configuration 
        list.components.dropdown.setValue(admlist[0].label)
        activity.components.uri.setTarget(admlist[0].label)
        
        //as we're updating the activity's ADM, we synchorise the code
        syncEditor();
        return
    }

    //if there is an activity to use then...
    if(activity){
        //when NOT a new ADM file, and...
        //when we update the dropdown menu, it's important to maintain the current
        //ADM file the activity is using
        list.components.dropdown.setValue(activity.components.uri.getTarget())
    }
}

//this function opens a documentation URL.
function openDocumentation(code){

    let url
    code = code || "how-to"

    switch(code) {

        case 'how-to':
            url = "https://github.com/designer-for-camel/camel-designer/blob/master/docs/how-to.md#how-to"
            break;

        default:
            url = "https://github.com/designer-for-camel/camel-designer/blob/master/docs/how-to.md#how-to"
    }

    if(runningAsVscodeWebview()){
        vscodePostMessage('documentation-url', {url: url})
    }
    else{
        window.open(url)
    }
}


function createHttps(definition)
{
    let code = `<to uri="https://demoserver/path"/>`
    definition = definition || {definition: new DOMParser().parseFromString(code, "text/xml").documentElement}
    createHttp(definition)
}


function createHttp(definition)
{
    //a mapping will be attached and requires async initialisation
    //we need to pause comms until the mapping is fully ready
    //the mapping component reactivates comms when ready
    syncEditorEnabled = false;

    //TEST xpath from body (no header name attribute)
    //TEST xpath from header name
    //TEST xpath with parameters (e.g. saxon=true)

// let code = `<pipeline >
//                 <setHeader name="content-type">
//                     <xpath saxon="true" other="sample">/application/json</xpath>
//                 </setHeader>

//                 <setHeader name="header-2" >
//                     <simple>something `+'${body} ${header.data}'+`</simple>
//                 </setHeader>


//                 <setBody id="to-8-map-tgt-payload-body">
//                 <simple>`+'${exchangeProperty.prop1}'+`</simple>
//               </setBody>

//                 <to uri="http://demoserver/apath/somewhere?opt1=`+'${body}'+`" id="to-8"/>
//             </pipeline>`

    let code = `<to uri="http://demoserver/path"/>`


    definition = definition || {definition: new DOMParser().parseFromString(code, "text/xml").documentElement}

    //keep given metadata
    let metadata = definition

    //simplify definition usage
    definition = definition.definition

    //if activity starts with to/toD (instead of pipeline), we wrap it
    if(definition.nodeName == "to" || definition.nodeName == "toD"){
        let wrapping = document.createElement("pipeline")
        wrapping.appendChild(definition.cloneNode(true)) //ATTENTION: needs to be cloned!! 'append' operations move nodes from one parent to another
        definition = wrapping
    }

    //obtain endpoint
    let endpoint = definition.querySelector('to,toD')

    //set endpoint as definition
    metadata.definition = endpoint

    //create activity
    let activity = createGenericActivityTo(metadata)

    //create HTTP animated icon
    let planet = document.createElement('a-entity')

    //helper variables
    let circle 
    let radius = .4

    //draw planet's parallels
    for(let angle=0; angle<180; angle+=30){
        circle = document.createElement('a-torus')
        circle.setAttribute("radius", radius)
        circle.setAttribute("radius-tubular", .004)
        // circle.setAttribute("radius-tubular", .003)
        circle.setAttribute("opacity", '.4')
        // circle.setAttribute('color', '#74BEC1')
        circle.setAttribute("rotation", "0 "+angle+" 0")
        planet.appendChild(circle)
    }

    //draw planet's meridians
    for(let angle=30; angle<180; angle+=30){
        let mradius = radius * Math.sin(angle * (Math.PI / 180))
        let merY    = radius * Math.cos(angle * (Math.PI / 180))
        circle = document.createElement('a-torus')
        circle.setAttribute("radius", mradius)
        circle.setAttribute("radius-tubular", .004)
        // circle.setAttribute("radius-tubular", .003)
        circle.setAttribute("opacity", '.4')
        // circle.setAttribute('color', '#74BEC1')
        circle.setAttribute("position", "0 "+merY+" 0")
        circle.setAttribute("rotation", "90 0 0")
        planet.appendChild(circle)
    }

    //animate rotation
    planet.setAttribute('animation', {property: 'rotation', loop: true, dur: '20000', to: '0 180 0', easing: 'linear'});
    activity.appendChild(planet)
    activity.setAttribute("opacity", ".2")      

    // let target = activity.components.uri.getValue()

    //we obtain parts separated by '/', and filter out empty values
    let parts   = activity.components.uri.getTarget().split('/').filter(element => element)

    //we obtain URI options
    let options = activity.components.uri.getOptions()

    //make a shallow copy (to preserve URI object intact)
    options = Object.assign({}, options);

    //custom method field
    let method = options.httpMethod

    //remove camel fields from list of options
    delete options.httpMethod
  
    //prepare mapping fields
    let target = parts[0].split(":")
    let scheme = activity.components.uri.getScheme()
    let host = target[0]
    let port = (scheme == "http") ? "80":"443"

    //set port if given
    if(target.length>1){
        port = target[1]
    }

    //discard host:port token from array
    parts.shift()

    //rebuild path with remaining parts
    let path = "/"+parts.join("/")

    //define data model for activity inputs
    let datamodel = {
        parameters: {
            host: host,
            port: port,
            path: path,
            method: method || ""
        },
        options: options,
        headers: {
            "content-type": "",
            // accept:         "",
            // authorization:  "",
        },
        payload:{}
    }

    let targetModel = {

        //name of the model
        // name: "http",
        name: scheme,

        //the data model
        datamodel: datamodel,

        //define which fields from the datamodel can be customised.
        //items in the custom list indicate the user can:
        // - add a new child hanging from the item group
        // - nest childs if recursive is set to true
        // - edit the child name and value
        // - notify user ui updates on fields
        custom:{
            parameters: {
                notify: "target-parameter"
            },
            options: {
                prefix: "option",
                button: true,
                editable: true,
                recursive: false,
                notify: "target-option"
            },
            headers: {
                prefix: "header",
                button: true,
                editable: true,
                recursive: false,
                langsupport: true
            },
            payload: {
                prefix: "body",
                button: true,
                childlimit: 1,
                recursive: false,
                langsupport: true,
                hint: "To override the payload (body), add a new body mapping."
            },
        },
    } 

    //set mapping to activity
    activity.setAttribute("mapping", {
        datatarget: JSON.stringify(targetModel),
    })

    // activity.setAttribute('processor-type', "http");

    definition.removeChild(endpoint)

    // let mappings = definition.querySelectorAll(':not(to)')
    // let mappings = definition.children

    // //this action will ensure there is a default source data tree
    // activity.components.mapping.refreshProcessContext()

    let mappings = Array.from(definition.children)
    // mappings = mappings.pop()

    // activity.components.mapping.processCamelParsing(mappings)
    activity.components.mapping.setInitMappings(mappings)


    //listener for changes on options
    activity.addEventListener('target-option', function(evt){ 
        console.log("entry got edited !!: "+ JSON.stringify(evt.detail))
        
        switch(evt.detail.action){
            case 'set':
                //set option in URI
                activity.components.uri.setOption(evt.detail.field, evt.detail.value)
                break;
            case 'rename':
                //keep option value
                let value = activity.components.uri.getOptions()[evt.detail.old]
                //remove old option
                activity.components.uri.setOption(evt.detail.old, null)
                //add new option with same value
                activity.components.uri.setOption(evt.detail.new, value)
                break;
            case 'delete':
                //remove option from URI
                activity.components.uri.setOption(evt.detail.field, null)
                break;
        }
    }.bind(this))

    //listener for changes on parameters
    activity.addEventListener('target-parameter', function(evt){ 
        console.log("entry got edited !!: "+ JSON.stringify(evt.detail))
        
        switch(evt.detail.action){
            case 'set':

                if(evt.detail.field == "method"){
                    activity.components.uri.setOption("httpMethod", evt.detail.value)
                    break;
                }

                //obtain all parameter map entries
                let parameters = activity.querySelectorAll('a-map-entry[value="parameters"] a-map-entry')

                //obtain all field expressions (mappings or values)
                let fields = {
                    host: parameters[0].components.mapentry.expression.expression,
                    port: parameters[1].components.mapentry.expression.expression,
                    path: parameters[2].components.mapentry.expression.expression,
                }

                //the event contains the updated value (the expression is not reliable on user update)
                fields[evt.detail.field] = evt.detail.value

                //ensure path starts with slash
                if(!fields.path.startsWith("/")){
                    fields.path = "/"+fields.path
                }

                //compose target
                let target = "//"+fields.host+":"+fields.port + fields.path

                //update component URI
                activity.components.uri.setTarget(target)
                break;
        }
    }.bind(this))

    return activity
}

function createMapData(definition)
{
    let code = `<pipeline id="to-8-pipeline">
                  <to uri="http://demoserver:80/resource" id="to-8"/>
                </pipeline>`

    definition = definition || new DOMParser().parseFromString(code, "text/xml").documentElement

    
    let endpoint = definition.querySelector('to')
    
    let activity = createGenericActivityTo({definition: endpoint})

    let datamodel = {                       
                        target1: "value1",
                        target2: "value2",
                        target3: "value3",
                        target4: {
                            target5: "value5",
                            target6: "value6",
                            target7: "value7"
                        },
                    }
    
    let targetModel = {
        name: "json data",
        // datamodel: datamodel,
        datamodel: {},
        custom:{
            "json data": {
                prefix: "new",
                button: true,
                editable: true,
                recursive: true
            }
        },
    } 
    // let targetModel = {"json data": {}} 


    activity.setAttribute("mapping", {
        datatarget: JSON.stringify(targetModel),
        // rootname: "JSON-DATA"
    })
    // activity.setAttribute('processor-type', "map-data");

    definition.removeChild(endpoint)

    let mappings = []
    activity.components.mapping.setInitMappings(mappings)

    return activity
}


// function createMapMailSMTP(definition)
function createSMTP(definition)
{
    //a mapping will be attached and requires async initialisation
    //we need to pause comms until the mapping is fully ready
    //the mapping component reactivates comms when ready
    syncEditorEnabled = false;

    let code = `<pipeline >

        <setHeader name="from">
            <simple>user1@demo.camel</simple>
        </setHeader>
        <setHeader name="to">
          <simple>user2@demo.camel</simple>
        </setHeader>
        <setHeader name="subject">
            <simple>greeting</simple>
        </setHeader>
        <setBody>
            <simple>hello world</simple>
        </setBody>
        <to uri="smtp://standalone.demo-mail.svc:3025?username=demo&amp;password=demo&amp;to=bmesegue@redhat.com&amp;from=dummy" id="to-8"/>

    </pipeline>`


    definition = definition || {definition: new DOMParser().parseFromString(code, "text/xml").documentElement}
    definition.icon = "#icon-mail"

    //keep given metadata
    let metadata = definition

    //simplify definition usage
    definition = definition.definition

    //if activity starts with to/toD (instead of pipeline), we wrap it
    if(definition.nodeName == "to" || definition.nodeName == "toD"){
        let wrapping = document.createElement("pipeline")
        wrapping.appendChild(definition.cloneNode(true)) //ATTENTION: needs to be cloned!! 'append' operations move nodes from one parent to another
        definition = wrapping
    }

    //obtain endpoint
    let endpoint = definition.querySelector('to,toD')

    //set endpoint as definition
    metadata.definition = endpoint

    //create activity
    let activity = createGenericActivityTo(metadata)

    //we obtain parts separated by '/', and filter out empty values
    let parts   = activity.components.uri.getTarget().split('/').filter(element => element)

    //we obtain URI options
    let options = activity.components.uri.getOptions()

    //prepare group of email fields
    let email = {
        from:    options.from    || "",
        to:      options.to      || "",
        cc:      options.cc      || "",
        bcc:     options.bcc     || "",
        subject: options.subject || "",
    }

    //make a shallow copy (to preserve URI object intact)
    options = Object.assign({}, options);

    //remove email fields from list of options
    delete options.from
    delete options.to
    delete options.cc
    delete options.bcc
    delete options.subject

    //prepare mapping fields
    let target = parts[0].split(":")
    let host = target[0]
    let port = "80"
    let username = options.username
    let password = options.password

    //delete user/pass
    delete options.username
    delete options.password

    //set port if given
    if(target.length>1){
        port = target[1]
    }

    //discard host:port token from array
    parts.shift()

    //rebuild path with remaining parts
    // let path = "/"+parts.join("/")

    //define data model for activity inputs
    let datamodel = {
        server: {
            host: host,
            port: port,
            username: username || "",
            password: password || "",
        },
        email: email,
        options: options,
        headers: {},
        payload:{}
    }

    let targetModel = {

        //name of the model
        name: "Mail (SMTP)",

        //the data model
        datamodel: datamodel,

        //define which fields from the datamodel can be customised.
        //items in the custom list indicate the user can:
        // - add a new child hanging from the item group
        // - nest childs if recursive is set to true
        // - edit the child name and value
        // - notify user ui updates on fields
        custom:{
            server: {
                notify: "server"
            },
            email: {
                notify: "email"
            },
            options: {
                prefix: "option",
                button: true,
                editable: true,
                recursive: false,
                notify: "option"
            },
            headers: {
                prefix: "header",
                button: true,
                editable: true,
                recursive: false,
                langsupport: true
            },
            payload: {
                prefix: "body",
                button: true,
                childlimit: 1,
                recursive: false,
                langsupport: true,
                hint: "To override the payload (body), add a new body mapping."
            }
        }
    } 

    //set mapping to activity
    activity.setAttribute("mapping", {
        datatarget: JSON.stringify(targetModel),
    })

    // activity.setAttribute('processor-type', "map-mail");

    definition.removeChild(endpoint)

    let mappings = Array.from(definition.children)

    activity.components.mapping.setInitMappings(mappings)


    //listener for changes on options
    activity.addEventListener('email', function(evt){ 
        console.log("entry got edited !!: "+ JSON.stringify(evt.detail))
        
        switch(evt.detail.action){
            case 'set':
                //set option in URI
                activity.components.uri.setOption(evt.detail.field, evt.detail.value)
                break;
        }
    }.bind(this))

    //listener for changes on options
    activity.addEventListener('option', function(evt){ 
        console.log("entry got edited !!: "+ JSON.stringify(evt.detail))
        
        switch(evt.detail.action){
            case 'set':
                //set option in URI
                activity.components.uri.setOption(evt.detail.field, evt.detail.value)
                break;
            case 'rename':
                //keep option value
                let value = activity.components.uri.getOptions()[evt.detail.old]
                //remove old option
                activity.components.uri.setOption(evt.detail.old, null)
                //add new option with same value
                activity.components.uri.setOption(evt.detail.new, value)
                break;
            case 'delete':
                //remove option from URI
                activity.components.uri.setOption(evt.detail.field, null)
                break;
        }
    }.bind(this))

    //listener for changes on parameters
    activity.addEventListener('server', function(evt){ 
        console.log("entry got edited !!: "+ JSON.stringify(evt.detail))
        
        switch(evt.detail.action){
            case 'set':

                //obtain all parameter map entries
                let parameters = activity.querySelectorAll('a-map-entry[value="server"] a-map-entry')

                //obtain all field expressions (mappings or values)
                let fields = {
                    host:     parameters[0].components.mapentry.expression.expression,
                    port:     parameters[1].components.mapentry.expression.expression,
                    username: parameters[2].components.mapentry.expression.expression,
                    password: parameters[3].components.mapentry.expression.expression,
                }

                //the event contains the updated value (the expression is not reliable on user update)
                fields[evt.detail.field] = evt.detail.value

                //compose target
                let target = "//"+fields.host+":"+fields.port //+ fields.path
              
                //update component URI
                activity.components.uri.setTarget(target)

                activity.components.uri.setOption("username", fields.username)
                activity.components.uri.setOption("password", fields.password)

                break;
        }
    }.bind(this))

    return activity
}


function createGenericEndpointTo(definition)
{
    //a mapping will be attached and requires async initialisation
    //we need to pause comms until the mapping is fully ready
    //the mapping component reactivates comms when ready
    syncEditorEnabled = false;

    //keep given metadata
    let metadata = definition

    //simplify definition usage
    definition = definition.definition

    //if activity starts with to/toD (instead of pipeline), we wrap it
    if(definition.nodeName == "to" || definition.nodeName == "toD"){
        let wrapping = document.createElement("pipeline")
        wrapping.appendChild(definition.cloneNode(true)) //ATTENTION: needs to be cloned!! 'append' operations move nodes from one parent to another
        definition = wrapping
    }

    //obtain endpoint
    let endpoint = definition.querySelector('to,toD')

    //set endpoint as definition
    metadata.definition = endpoint

    //create activity
    let activity = createGenericActivityTo(metadata)

    //obtain target
    let target = activity.components.uri.getTarget()

    //we obtain URI options
    let options = activity.components.uri.getOptions()

    //make a shallow copy (to preserve URI object intact)
    options = Object.assign({}, options);

    //define data model for activity inputs
    let datamodel = {
        target: target,
        options: options,
        headers: {},
        payload:{}
    }

    //define target tree map configuration
    let targetModel = {

        //name of the model
        name: activity.components.uri.scheme[0],

        //the data model
        datamodel: datamodel,

        //define which fields from the datamodel can be customised.
        //items in the custom list indicate the user can:
        // - add a new child hanging from the item group
        // - nest childs if recursive is set to true
        // - edit the child name and value
        // - notify user ui updates on fields
        custom:{
            target: {
                notify: "target"
            },
            options: {
                prefix: "option",
                button: true,
                editable: true,
                recursive: false,
                notify: "option"
            },
            headers: {
                prefix: "header",
                button: true,
                editable: true,
                recursive: false,
                langsupport: true
            },
            payload: {
                prefix: "body",
                button: true,
                childlimit: 1,
                recursive: false,
                langsupport: true,
                hint: "To override the payload (body), add a new body and map it."
            }
        }
    } 

    //set mapping to activity
    activity.setAttribute("mapping", {
        datatarget: JSON.stringify(targetModel),
    })

    //activity.setAttribute('processor-type', "map-mail");

    //to define the mappings, first we strip out the endpoint from the definition
    definition.removeChild(endpoint)

    //we prepare an array of mappings
    let mappings = Array.from(definition.children)

    //set mappings to initialise
    activity.components.mapping.setInitMappings(mappings)

    //listener for changes on options
    activity.addEventListener('option', function(evt){ 
        console.log("entry got edited !!: "+ JSON.stringify(evt.detail))
        
        switch(evt.detail.action){
            case 'set':
                //set option in URI
                activity.components.uri.setOption(evt.detail.field, evt.detail.value)
                break;
            case 'rename':
                //keep option value
                let value = activity.components.uri.getOptions()[evt.detail.old]
                //remove old option
                activity.components.uri.setOption(evt.detail.old, null)
                //add new option with same value
                activity.components.uri.setOption(evt.detail.new, value)
                break;
            case 'delete':
                //remove option from URI
                activity.components.uri.setOption(evt.detail.field, null)
                break;
        }
    }.bind(this))

    //listener for changes on target
    activity.addEventListener('target', function(evt){ 
        console.log("entry got edited !!: "+ JSON.stringify(evt.detail))
        
        switch(evt.detail.action){
            case 'set':
                //update component URI
                activity.components.uri.setTarget(evt.detail.value)
                break;
        }
    }.bind(this))

    return activity
}