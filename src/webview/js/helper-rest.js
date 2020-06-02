//coloring scheme based on Apicurio
const methodColor = new Map();
methodColor.set('get'    ,'#52F40C');
methodColor.set('put'    ,'dodgerblue');
methodColor.set('post'   ,'orange');
methodColor.set('delete' ,'red');

//automatic ID if not manually set
var restId = 0;

var nextGroupPosX = 0;


function createRestGroup(definition)
{
    //we're about to create multiple activities, so we stop streaming updates until we're done
    // syncEditorEnabled = false;

    // createRestGroup("multicast", true, "fork", "merge");
    
    createRestGroupBox(definition);

    //when a group is created, all REST buttons should be active
    enableRestButtons(true);

    //now we're done, we switch back on, and we sync.
    // syncEditorEnabled = true;
    syncEditor();
}


function createRestGroupBox(definition)
{
  //if they exit, we use the definition values
  let id = definition ? definition.id : ('rest'+(restId++));
  let path = definition ? definition.path : ('/'+id);

    var scene = document.getElementById('rest-definitions');

    var box = null;
    var container = null;

    box = document.createElement('a-box');
    container = document.createElement('a-entity');
    container.setAttribute('id', "container");
    container.setAttribute('processor-type', "rest-container");
    box.appendChild(container);

    //Needed since A-FRAME v1.0.0
    box.setAttribute('class', 'clickable');

    // rootActivity.appendChild(box);
    box.setAttribute('processor-type', "rest-group");
    box.setAttribute('opacity', .1)
    box.setAttribute('transparent', true)
    box.setAttribute('rest-dsl', '');

    //REST group metadata
    // box.setAttribute('id', "rest-"+restId)
    // box.setAttribute('path', '/rest'+(restId++));
    box.setAttribute('id', id)
    box.setAttribute('path', path);

    // boxPosition = getNextSequencePosition(scene, 1, false);
    boxPosition = {x:nextGroupPosX,y:0,z:0};
    box.object3D.position.set(boxPosition.x, boxPosition.y, boxPosition.z);
    nextGroupPosX+=4;
    // box.setAttribute('position', {x: parseInt(scene.getAttribute("nextPos"))+1, y: 0, z: 0,})

    let numActivities = 2;
    box.setAttribute('height', numActivities)
    //box.setAttribute('height', 1)
    box.setAttribute('width', 2)
    box.setAttribute('depth', 0.00001)
    // box.setAttribute('scale', scale)

    //ATTENTION: this attribute registers the drag & drop behaviour
    box.setAttribute('pulse', '')


    // var text = document.createElement('a-text');
    var text = createText();
    container.appendChild(text);
    text.setAttribute('color', 'grey');
    // text.setAttribute('position', {x: -.85, y: (-numActivities/2-.3)-, z: 0});
    text.setAttribute('position', {x: 0, y: 1.3, z: 0});
    text.setAttribute('side', 'double');
    text.setAttribute('value', path);
    text.setAttribute('align', 'center');


    //order is important
    //elements need to be added to document
    scene.appendChild(box);

    //this call requires elements to exist already in document
    selectRestGroup(box)
}

//Scaling the Group Box involves 3 steps:
//  1) increase height
//  2) reposition group Y axis for visual confort
//  3) reposition container Y axis accordingly
function scaleRestGroupBox(restGroup)
{
   //obtain current number of Group methods already defined
  let numMethods = getRestMethods(restGroup).length;
  //console.log('numMethods: '+numMethods);

  if(numMethods < 2)
  {
    return;
  }

  //obtain position of Group
  let boxPosition = restGroup.object3D.position;

  //increase height to accomodate new Method
  restGroup.setAttribute('height', 1+numMethods)

  //the position should not change...
  //except for the Y axis.
  //As a new Method is to be added, it  we need to shift down the whole collection
  restGroup.object3D.position.set(
      boxPosition.x, 
      boxPosition.y-.5, //this is the axis to reposition 
      boxPosition.z);

  //the container should also be repositioned on the Y axis
  let container = restGroup.querySelector('#container');
  container.object3D.position.set(
      0, 
      container.object3D.position.y+.5, 
      0);

  //resize selector
  resizeRestSelector();
}

//gets the list of REST methods defined for a given group
function getRestMethods(restGroup)
{
  return restGroup.querySelectorAll('[processor-type="rest-method"]');
}

//returns the current (active) REST group selected
function getSelectedRestGroup()
{
  let selector = document.getElementById('selector-rest')

  //it is possible no REST definition exists yet
  if(selector)
  {
    return selector.parentElement;
  }
}

//returns the current (active) REST group selected
function getSelectedRestActivity()
{
  let selector = document.getElementById('selector-rest-activity')

  //it is possible no REST definition exists yet
  if(selector)
  {
    return selector.parentElement;
  }
}

//moves REST selector to given Group
function selectRestGroup(restGroup)
{
  //obtain REST selector
  let selector = document.getElementById('selector-rest');

  //if one exists
  if(selector)
  {  
    //we unselect the previous rest group
    selector.parentElement.removeChild(selector);

    //A-Frame appears to not render box when moved between entities
    //so we create a new one, and dispose the old one.
    selector = document.createElement('a-box')
    selector.setAttribute('id', 'selector-rest');
    selector.setAttribute('opacity', .1)
    selector.setAttribute('transparent', true)
    selector.setAttribute('depth', 0.00001)
    selector.setAttribute('color', 'yellow')
    selector.setAttribute('width', 2+.2)

    //we append the selector to this group
    restGroup.appendChild(selector);

    //redraw Selector
    resizeRestSelector();

    setCameraFocus(restGroup);
  }
  //if it doesn't exist we create it
  else
  {
      //let selector = document.createElement('a-entity');
      let selector = document.createElement('a-box');
      selector.setAttribute('id', 'selector-rest');
      
      //we append the selector to this group
      restGroup.appendChild(selector);

      let groupPos = restGroup.object3D.position;
      let color = 'yellow';

      //let box = document.createElement('a-box')
      //selector.appendChild(box);
      selector.setAttribute('opacity', .1)
      selector.setAttribute('transparent', true)
      selector.setAttribute('depth', 0.00001)
      selector.setAttribute('color', color)
      selector.setAttribute('width', 2+.2)

      resizeRestSelector();
  }

  //set corresponding configuration pane
  let config = switchConfigPane('config-rest-group');
  config.querySelector("input#input-path").value = restGroup.getAttribute('path').slice(1);
}

function resizeRestSelector()
{
  //obtain REST selector
  let selector = document.getElementById('selector-rest');   

  //obtain selected REST group
  let restGroup = selector.parentElement;

  let heightGroup = parseInt(restGroup.getAttribute('height'));
  selector.setAttribute('height', heightGroup+.2);

}

// Creates Entities based on the given Method
// function createRestMethod(definition, color)
function createRestMethod(definition)
{
  let scale = {x: .8, y: .8, z: .8};

  //if they exit, we use the definition values
  let id = definition.id || (definition.method+(restId++));
  let uri = definition.uri || ('/'+id);

  //obtain selected group
  let group = document.getElementById('selector-rest').parentElement;

  //obtain group container
  let container = group.querySelector('#container');

  //obtain current number of Group methods already defined
  let numMethods = getRestMethods(group).length;

  //activity creation
  var activity = document.createElement('a-sphere');
  activity.setAttribute('position', {x: 0, y: -numMethods, z: 0});
  activity.setAttribute('processor-type', "rest-method");
  activity.setAttribute('material', {color: methodColor.get(definition.method), transparent: true, opacity: 0.5});
  activity.setAttribute('radius', .5);
  activity.setAttribute('pulse', '');
  // activity.setAttribute('scale', scale);

  //metadata info
  activity.setAttribute('id', id);
  //activity.setAttribute('uri', uri);
  activity.setAttribute('method', definition.method);


  //add to container
  container.appendChild(activity);

  //Needed since A-FRAME v1.0.0
  activity.setAttribute('class', 'clickable');

  //Create labels
  // var text = document.createElement('a-text');
  var text = createText();
  text.setAttribute('value', definition.method.toUpperCase());
  text.setAttribute('align', 'center');
  text.setAttribute('color', '#f49b42');
  text.setAttribute('side', 'double');
  text.setAttribute('position', '0 .25 0');
  activity.appendChild(text);
    // text = document.createElement('a-text');
    text = createText();
    text.setAttribute('value', uri);
    text.setAttribute('align', 'center');
    text.setAttribute('color', '#f49b42');
    text.setAttribute('side', 'double');
    text.setAttribute('scale', {x: .8, y: .8, z: .8});
    // text.setAttribute('letter-spacing',0)
    activity.appendChild(text);

  //create Direct task
  attachDirect(activity, -numMethods, definition.direct)

  //adjust group size to accommodate new Method
  scaleRestGroupBox(group);

  //select Method
  selectRestActivity(activity);

  syncEditor();

  return activity;
}

//Attaches a Direct task to the given REST method
function attachDirect(restMethod, yPos, definition)
{
  // let elementName = 'rest-direct';
  let scale = {x: .8, y: .8, z: .8};

  //create activity
  let activity = createDirectActivity({scale: scale, definition: definition});
  // let activity = createDirect({scale: scale});

  if(definition)
  {
    //updates the target route it points to
    activity.firstChild.setAttribute("value", definition.getAttribute('uri').substring(7));
  }

  //reposition label (to fit better)
  // activity.querySelector("#routeLabel").setAttribute('position', {x: 0, y: -.5, z: 0});
  activity.querySelector(".uri").setAttribute('position', {x: 0, y: -.5, z: 0});
  
  //set relative position
  activity.setAttribute('position', {x: 2, y: yPos, z: 0});


  //add task to group
  restMethod.parentElement.appendChild(activity);

  //create link
  var cylinder = document.createElement('a-cylinder');

  //3D properties
  cylinder.setAttribute('material','opacity: '+0.2);
  cylinder.setAttribute('radius',.2);
  cylinder.setAttribute('scale',scale);

  //redraw link
  resetLink(cylinder, {x: -.20, y: yPos, z: 0}, {x: 2.5, y: yPos, z: 0});

  //append link
  restMethod.parentElement.appendChild(cylinder);
}

//Determines if the activity belongs to the REST Designer view
function isRestElement(element)
{
  //nothing to do if null
  if(element == null)
  {
    return;
  }

  var type = element.getAttribute('processor-type');

  //no type means it's not REST, as all REST have a processor-type
  if(type == null)
  {
    return false;
  }

  //direct activities are a special case, they exist in both views: Routes & REST
  //we need to look at its parent element to resolve the question
  if(type == 'direct'){
    return isRestElement(element.parentElement);
  }

  return type.startsWith('rest');
}

function selectRestActivity(activity)
{
  selectRestGroup(activity.parentNode.parentNode)

  let ring = document.querySelector("#selector-rest-activity");

  //Since A-Frame 1.0.0
  //A problem moving the ring forces us te destroy and recreate
  if(ring != null)
  {
    ring.parentElement.removeChild(ring);
  }

  //Since A-Frame 1.0.0
  //A problem moving the ring forces us te destroy and recreate
  ring = document.createElement('a-ring');
  activity.appendChild(ring);
  ring.setAttribute('id', 'selector-rest-activity');
  ring.setAttribute('side', 'double');
  ring.setAttribute('color', 'yellow');
  ring.setAttribute('radius-inner', .7);
  ring.setAttribute('radius-outer', .71);


  console.log("rest ring created on: "+activity.id);

  //this is not working proper
  setCameraFocus(activity.parentElement);

  var type = activity.getAttribute('processor-type');

  if(type == 'direct')
  {
    let config = switchConfigPane('newDirect');
    updateConfigDirect(null,activity);
  }
  else
  {
    //set corresponding configuration pane
    let config = switchConfigPane('config-rest-method');
    // config.querySelector("input#input-uri").value = activity.getAttribute('uri').slice(1);

    let path = activity.children[1].getAttribute('value')

    if(path.startsWith('/'))
    {
      path = path.slice(1)
    }
    config.querySelector("input#input-uri").value = path;
  }
}

//Maps the Pane configuration to the REST 3D box
function submitRestGroupConfig()
{
  //obtain user input
  var element = document.getElementById("config-rest-group");
  var path = element.getElementsByTagName("input")[0].value;

  var group = getSelectedRestGroup();
  var text = group.getElementsByTagName("a-text")[0];

  //display new value
  text.setAttribute('value', '/'+path);

  //update group path
  group.setAttribute('path','/'+path);
}

//Maps the Pane configuration to the REST 3D method
function submitRestMethodConfig()
{
  //obtain user input
  var element = document.getElementById("config-rest-method");
  var uri = element.getElementsByTagName("input")[0].value;

  var method = getSelectedRestActivity();
  var text = method.getElementsByTagName("a-text")[1];

  var groupPath = method.parentEl.parentEl.getAttribute('path')

  if(!groupPath.endsWith('/'))
  {
    uri = '/'+uri
  }

  //display new value
  text.setAttribute('value', uri);

  //update method uri
  // method.setAttribute('uri','/'+uri);
}

//returns the Direct activity associated with a Method
function getRestMethodDirectActivity(method)
{
  return method.nextSibling;
}


//returns 'true' if the user is REST definitions are visible
//returns 'false' otherwise (e.g. user viewing Route definitions)
function isRestViewActive()
{
  return Boolean(document.getElementById('rest-definitions').getAttribute('visible'))
}

//returns 'true' if the user is REST definitions are visible
// //returns 'false' otherwise (e.g. user viewing Route definitions)
// function getRestMethodPosition(method)
// {
//   if(isRestElement())
//   {

//   }

//   return Boolean(document.getElementById('rest-definitions').getAttribute('visible'))
// }