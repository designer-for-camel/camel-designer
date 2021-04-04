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
        
        case 'experiment-1':
            createPredefinedSetExperiment1(createSet)
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
//To deliver on all the above, its shape is unintuitive, and is as follows:
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
  rootActivity.removeAttribute('dragndrop')

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


function redrawBoxFrame(frame)
{
    // let rootActivity  = document.getElementById(frame.parentNode.getAttribute('group-start'))
    // let closeActivity = document.getElementById(frame.parentNode.getAttribute('group-end'))

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

        // let type = rootActivity.getAttribute('processor-type')

        // if(type == 'try-start'){
        //     let boxCatch = document.getElementById(frame.parentNode.getAttribute('box-catch'))
        // }
    }
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


function doubleClick(fn, timeout = 500) {
    let last = Date.now();

    return function(e) {
        const now = Date.now();
        const diff = now - last;

        console.log('single');

        if (diff < timeout) {
            fn(e);

            console.log('double');
        }

        last = now;
    }
};

AFRAME.registerComponent('double-click', {

    init: function() {
        // this.el.sceneEl.canvas.addEventListener('click', doubleClick(this.onDoubleClick.bind(this)));
        this.el.addEventListener('click', doubleClick(this.onDoubleClick.bind(this)));
    },

    onDoubleClick: function() {

        var camera = document.getElementById("main-camera");

        //listens to animation end
        camera.addEventListener('animationcomplete', function enterDirect() {

          //delete listener
          this.removeEventListener('animationcomplete', enterDirect);

          //delete animation
          this.removeAttribute('animation');

          //to switch route:
          // 1) obtain the target 'uri' the direct activity points to
          // 2) find the route that contains the direct (target)
          let targetUri = getSelectedActivityPrimary().querySelector(".uri").getAttribute('value')
          let routeId = findRouteIdFromDirectUri(targetUri)

          //jump to route
          nextRoute(routeId);
        });

        //obtain the absolute position to provide a target for the camera
        let target = getPositionInScene(this.el)

        //animation starts from this moment
        camera.setAttribute('animation', {property: 'position', dur: '1500', to: target, loop: false});

    }
});
