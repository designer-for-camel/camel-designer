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
        case 'direct': createDirectStart(); break;
        case 'timer':  createTimer();       break;
        case 'kafka':  createKafkaStart();  break;
        case 'file':   createFileStart();   break;
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
    definition = definition || new DOMParser().parseFromString('<to uri="kafka:topic1?brokers=YOUR_BROKER_SERVICE_URI&amp;autoOffsetReset=earliest"/>', "text/xml").documentElement
    return createGenericEndpointTo(definition)
}

function createFile(definition)
{
    definition = definition || new DOMParser().parseFromString('<to uri="file:directory?fileName=YOUR_FILE_NAME"/>', "text/xml").documentElement
    return createGenericEndpointTo(definition)
}

// function createGenericEndpointTo(definition, type)
function createGenericEndpointTo(definition)
{
  //default type will be the scheme of the uri (e.g. 'file' in uri="file:name")
  type = definition.getAttribute('uri').split(":")[0];

  //create
  let activity = createActivity({type: "to", definition: definition});

  //add uri component (and load definition)
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




function createKafkaStart(definition)
{
    definition = definition || new DOMParser().parseFromString('<from uri="kafka:topic1?brokers=YOUR_BROKER_SERVICE_URI"/>', "text/xml").documentElement
    return createGenericEndpointFrom(definition)
}

function createFileStart(definition)
{
    definition = definition || new DOMParser().parseFromString('<from uri="file:directory1"/>', "text/xml").documentElement
    return createGenericEndpointFrom(definition)
}

function createGenericEndpointFrom(definition)
{
  //default type will be the scheme of the uri (e.g. 'file' in uri="file:name")
  type = definition.getAttribute('uri').split(":")[0];

  //create
  let activity = createActivity({type: "from", definition: definition, detachable: false});

  //customise to make it a START activity
  activity.setAttribute('material', {color: '#52F40C', transparent: true, opacity: 0.5});
  activity.setAttribute('start', '');

  //add uri component (and load definition)
  activity.setAttribute('uri', {position: "0 0.7 0", configMethod: [updateConfigEndpointTo]})
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
    cameraZ = 7;

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
    <a-entity id="route1" route="" class="clickable" position="0 0 0">
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