// const { createFileLevelUniqueName } = require("typescript");
// const { entity } = require("../../../test-aframe/experimental/mock-webgl/aframe-v1.0.4");

//Returns the activity (visible) Route
function vscodePostMessage(command, payload)
{
  //when it runs in VSCode
  if ( top !== self && !syncStartUpEnabled)
  { // we are in the iframe
    vscode.postMessage({
        command: command,
        payload: payload
    })
  }
  //return document.getElementById(routes[0]);
}

//Adds the activity to the scene in ordered manner
//if the newElement is not added last and will sit in between 2 activities
//then we need to open space by shifting all right sided activities further away
function insertActivity(newElement, refActivity)
{
  //default shiftX
  var shiftX = 2;

  //obtain the activity the new element needs to follow
  var refActivity = refActivity || getActiveActivity();

  //obtain parent
  var parent = refActivity.parentNode;
   
  //if reference is boxed and end of group, then reference's parent should be the reference
  //was
  // if(isBoxed(refActivity) && refActivity.getAttribute('processor-type').endsWith('-end'))
  if(refActivity.classList.contains('group-end'))
  {
    refActivity = refActivity.parentNode
    parent = refActivity.parentNode;
  }

  //This ensures activities that follow TRY-CATCH-FINALLY groups
  //are added to the DOM tree after the 3 boxes TRY-CATCH-FINALLY
  if(refActivity.localName == 'a-box'){
    let catchId = refActivity.getAttribute('box-catch')
    if(catchId){
      refActivity = document.getElementById(catchId)

      let finallyId = refActivity.getAttribute('box-finally')
      if(finallyId){
        refActivity = document.getElementById(finallyId)
      }
    }
  }

  //insert after reference
  parent.insertBefore(newElement, refActivity.nextSibling);

  if(newElement.localName != 'a-box')
  {
    //we look at the activity that follows
    let nextActivity = getNextActivity(newElement)

    //if none, no need to continue
    if(nextActivity == null)
    {
      return
    }
    // if there's enough space between the two, no need to continue
    else if(newElement.object3D.position.x+2 <= nextActivity.object3D.position.x)
    {
      return
    }
  }

  // let elType = newElement.getAttribute('processor-type')  

  //if multicast (a box)
  if(newElement.localName == 'a-box' && newElement.id.startsWith('multicast'))
  {
    //boxes require more space
    shiftX = 4;
  }
  //if group box
  else if(newElement.localName == 'a-box' )
  {
    //default boxes have 3 activities (start,activity,end)
    shiftX = 6;
  }

  //handling for Choice groups
  else if(newElement.getAttribute('processor-type') == 'choice-end')
  {
    //hack to count a total shift of 6
    //choice-start counts 2
    //choice-end   counts 4 
    shiftX = 6;
  }

  //This iteration performs right sided activities shifting
  var next = newElement.nextSibling;
  while(next)
  {
    //we have to shift only connected (linked) entities
    if(next.localName != 'a-cylinder' && !next.classList.contains('standalone'))
    {
      //this is a hack and will need revision
      //Choice group inner activities are tagged as 'group'
      //we decide to ignore shifting for inner activities
      //however start and end group activities count 2 loops
      //and 2 shifts is just what we need
      if(newElement.getAttribute('group') != "true")
      {
        shiftActivityPosition(next, shiftX);
      }
    }
    next = next.nextSibling;
  }

  //This iteration performs redraws for the links, since all positions have changed
  next = newElement.nextSibling;
  while(next)
  {
    if(next.localName == 'a-cylinder')
    {
      redrawLink(next);
    }
    next = next.nextSibling;
  }
}

//Shifts an activity's position
function shiftActivityPosition(activity, shiftX)
{
  var shiftX = shiftX || 2;

  activity.object3D.position.set(
      activity.object3D.position.x+shiftX,
      activity.object3D.position.y,
      activity.object3D.position.z
  );
}

//Returns the activity (visible) Route
function getActiveRoute()
{
  return document.getElementById(routes[0]);
}

//Returns the activity (visible) route
function getActivityRoute(activity)
{
  //WAS
  // //the activity may be 'boxed' (i.e. multicast)
  // if(isBoxed(activity)){
  //   return activity.parentNode.parentNode;
  // }
  // return activity.parentNode;

  //'closest'() searches up the DOM tree the closest element matching the selector
  //in this case the selector looks for a DOM element with 'route' attribute
  return activity.closest('[route]')
}

//Returns the activity currently being configured (with circle around)
function getActiveActivity()
{
  if(isRestViewActive())
  {
    return document.querySelector("#selector-rest-activity").parentNode
  }

  return document.querySelector("#selector").parentNode
}

//Returns the activity with circle around
function getSelectedActivityPrimary()
{
  return getActiveActivity()
}

//Returns the activity with a ring used for range selection
//the range of activities are all those between the primary and secondary selectors
function getSelectedActivitySecondary()
{
  let selector = document.getElementById('selector-end')

  if(selector)
  {
    return selector.parentElement
  }

  return null
}

//indicates if a range of activities is currently selected (2 rings in the UI)
function rangeExists()
{
  return (getSelectedActivitySecondary() != null)
}

//returns TRUE when activity is contained in a group box (i.e. multicast)
function isBoxed(activity)
{
  if (activity == null)
  {
    return false;
  }

  return activity.parentNode && (activity.parentNode.nodeName.toLowerCase() == "a-box" || activity.parentNode.nodeName.toLowerCase() == "a-plane");
}

//returns TRUE when activity is part of a group of activities (choices/multicast)
//TODO: review logic for activities inside choice branches
function isGroup(activity)
{
  if (activity == null)
  {
    return false;
  }

  if(isBoxed(activity))
  {
    return true;
  }

  return (activity.getAttribute('processor-type') == 'choice-start');
}

//Given an activity, it retrieves the link that flows forward 
function getForwardLink(activity){

  if(activity.localName == 'a-box')
  {
    // activity = activity.getAttribute('group-end')

    // if(activity == null)
    // {
    //   //do not continue
    //   return;
    // }

    //was
    //activity = activity.querySelector('[processor-type=multicast-end]')
    
    //finds child activity marked as group end
    activity = document.getElementById(activity.getAttribute('group-end'))
  }

  // we look at the links the activity has
  let links = JSON.parse(activity.getAttribute("links"));
  let link;

  if(links == null)//this is the case for FROM elements
  {
    return null;
  }

  //scan links
  for(let i=0; i< links.length; i++)
  {
    link = document.getElementById(links[i]);

    //return first match
    if(link.getAttribute('source') == activity.id)
    {
      return link;
    }
  }
}


//Given an activity, it retrieves the link that flows forward 
function getBackwardsLink(activity){

  if(activity.localName == "a-box")
  {
    //was
    // activity = activity.querySelector('[processor-type=multicast-start]')

    //this should obtain the first BOX's activity
    // activity = activity.querySelector('[group-start]')
    activity = document.getElementById(activity.getAttribute('group-start'))

  }

  // we look at the links the activity has
  let links = JSON.parse(activity.getAttribute("links"));
  let link;

  if(links == null)//this is the case for FROM elements
  {
    return null;
  }

  //scan links
  for(let i=0; i< links.length; i++)
  {
    link = document.getElementById(links[i]);

    //return first match
    if(link.getAttribute('destination') == activity.id)
    {
      return link;
    }
  }
}


//returns the activity that follows
//TODO: review what happens here when there are multiple branches
function getNextActivity(activity)
{
  let link = getForwardLink(activity);

  if(!link)
  {
    return null;
  }

  return document.getElementById(link.getAttribute('destination'));
}

//returns the activity that follows
//TODO: review what happens here when there are multiple branches
function getPreviousActivity(activity)
{
  let link = getBackwardsLink(activity);

  if(!link)
  {
    return null;
  }

  return document.getElementById(link.getAttribute('source'));
}

function getLinkDestination(link)
{
  return document.getElementById(link.getAttribute('destination'));
}

//returns the activity that ends the group
function getGroupEndActivity(activity)
{
  //check in case activity not in group
  if(!isGroup(activity))
  {
    return null;
  }

  //the activity may well be the end of a group
  if(activity.getAttribute('processor-type').endsWith('-end'))
  {
    return activity;
  }

  //the activity may well be the start of a group
  if(activity.getAttribute('processor-type').endsWith('-start'))
  {
    let endId = activity.id + "-end"
    return document.getElementById(endId);
  }

  //let link = getForwardLink(activity)

  let next = getNextActivity(activity);

  while(!next.getAttribute('processor-type').endsWith('-end'))
  {
    next = getNextActivity(activity);
  }

  return next;
}

//Returns the absolute position of an activity
//an activity may be contained in a parent (e.g. a-box)
function getPositionInScene(activity)
{
  if(isBoxed(activity))
  {
    // //position of parent
    // let posBox   = activity.parentNode.object3D.position;
   
    // //position inside parent
    // let posInBox = activity.object3D.position;

    // //absolute position
    // let position = { x: posBox.x+posInBox.x,
    //                  y: posBox.y+posInBox.y,
    //                  z: 0};


    // let route = activity.closest('[route]')
    let topEntity = activity.closest('[route]')

    //might be a REST container
    if(topEntity == null){
      // topEntity = activity.closest('[rest-dsl]')
      topEntity = activity.closest('#rest-definitions')
    }

    //absolute position
    let position = activity.object3D.position

    let entity = activity

    while(entity.parentNode != topEntity){

      entity = entity.parentNode

        //absolute position
      position = { x: position.x+entity.object3D.position.x,
                  y: position.y+entity.object3D.position.y,
                  z: position.z+entity.object3D.position.z};
    }


    return position;
  }
  else if(isRestElement(activity))
  {
      //e.g. REST directs
      //a method is composed of 2 elements (method & direct) under a common container
      //the container lives inside the REST box
      let relativePosDirect    = activity.object3D.position
      let relativePosContainer = activity.parentNode.object3D.position
      let absolutePosRestBox   = activity.parentNode.parentNode.object3D.position
      
      return {
        x: absolutePosRestBox.x+relativePosDirect.x,
        y: absolutePosRestBox.y+relativePosContainer.y+relativePosDirect.y, 
        z: absolutePosRestBox.z
      }
  }

  return  {
    x: activity.object3D.position.x,
    y: activity.object3D.position.y,
    z: activity.object3D.position.z
  }
}

//updates an Activity ID with a new one
//the function also updates ID references from other entities
//Note: if an ID clash is found with an existing activity,
//the ID to set can't be preserved, and a suffix will be added
function updateActivityId(activity, newId)
{
  //when activities are created from source-code, they might not have an id
  if(newId == null || newId == "")
  {
    return;
  }

  //also check the newId is not already in use
  var inUse = document.getElementById(newId);

  //if it's in use and it's not itself
  if(inUse && (inUse != activity))
  {
    //obtain a new ID
    newId = getUniqueID(newId);
  }

  //order of updates is important:
  //First we update all IDs in the links
  //Then we update the activity ID

  // we process all the links the activity has
  let links = JSON.parse(activity.getAttribute("links"));

  //if links is null, we default to empty array
  links = links || []

  let link;

  //iterate links to update reference IDs
  for(let i=0; i< links.length; i++)
  {
    link = document.getElementById(links[i]);

    //if it's the source, we set the new ID 
    if(link.getAttribute('source') == activity.id)
    {
      link.setAttribute('source', newId);
      continue;
    }

    //if it's the destination, we set the new ID 
    if(link.getAttribute('destination') == activity.id)
    {
      link.setAttribute('destination', newId);
    }
  }

  //then we update the activity ID
  activity.setAttribute('id', newId);
}

//Updates the ID of the given Route to the new ID
function updateRouteId(route, newId)
{
  //empty string not a valid route ID
  if(newId == ""){
    return
  }

  for(let i=0; i<routes.length; i++)
  {
    if(routes[i] == route.id)
      routes[i] = newId;
  }

  route.id = newId;
}

//A-Frame loads by default fonts from the internet
//Because the extension needs to work off-line,
//local fonts need to be loaded from source.
//This function creates a test entity with the given font
function createText(font)
{
  //A-Frame's default font
  font = font || fontRoboto;

  var text = document.createElement('a-text');
  text.setAttribute('font', font);
  return text;
}

//Applies Metadata to Visual elements
// 1. Repositions activities with given metadata coordinates
// 2. Redraws links between activities
function loadMetadata(metadata)
{
                //if metadata file exists we load it
                // try {
                //   metadataFile = "/Users/bruno/workspace_vs-camel-editor/test/Untitled-1.xml.metadata";
                //   if (fs.existsSync(metadataFile)) {
                //     metadata = fs.readFileSync(metadataFile, 'utf8')
                //     console.log(metadata)
                //   }
                // } catch (err) {
                //   console.error(err)
                // }
                //metadata = '[{"id":"direct-1-6","x":-5.1375,"y":-3.8124999999999996},{"id":"log-2","x":-5.0125,"y":-1.6375},{"id":"choice-start-29","x":-3.0125,"y":-1.6375},{"id":"direct-31","x":-1.0125000000000002,"y":-0.6375},{"id":"direct-33","x":-1.0125000000000002,"y":-2.6375},{"id":"choice-end-35","x":0.9874999999999998,"y":-1.6375},{"id":"body-9","x":3.4875,"y":-1.65},{"id":"direct-6","x":6.2625,"y":-1.625},{"id":"multicast-box-13","x":9.075,"y":0.0125},{"id":"log-28","x":11.4375,"y":-1.5125000000000002},{"id":"timer-18","x":-5,"y":0},{"id":"log-19","x":-3,"y":1.0875},{"id":"property-26","x":-1.075,"y":1.075}]'
                //metadata = '[{"id":"direct-1","x":-5,"y":0},{"id":"log-2","x":-3.3875,"y":-1.4},{"id":"direct-4","x":-1.0625,"y":-1.3875},{"id":"choice-15-start","x":0.925,"y":-2.375},{"id":"direct-17","x":2.9375,"y":-0.38749999999999996},{"id":"direct-19","x":2.9375,"y":-2.3875},{"id":"choice-15-end","x":4.875,"y":-2.425},{"id":"log-13","x":6.9375,"y":-1.3875},{"id":"direct-6","x":-5,"y":0},{"id":"property-7","x":-3,"y":1.075},{"id":"header-9","x":-1,"y":1.075},{"id":"body-11","x":1,"y":1.075}]'
                //metadata = '[{"id":"direct-1-3","x":-5,"y":0},{"id":"log-2","x":-3.2625,"y":-1.475},{"id":"myid","x":-1.2625000000000002,"y":-1.475},{"id":"direct-10","x":-1.0875,"y":1.4625},{"id":"log-9","x":0.7374999999999998,"y":-0.4750000000000001},{"id":"myid-end","x":2.7375,"y":-1.475}]'

  //if no metadata, no point to continue
  if(!metadata || metadata == "")
  {
    return;
  }

  console.log("metadata is: "+ metadata);
  var coordinates = JSON.parse(metadata);
  var activity;
  console.log("coordinates are: "+ metadata);

  //reset coordinates for all given IDs
  for(let i=0; i<coordinates.length;i++)
  {
    activity = document.getElementById(coordinates[i].id);

    if(activity){
      activity.object3D.position.set(
            coordinates[i].x,
            coordinates[i].y,
            0
      );
    }
  }

  redrawAllLinks()
}

//Redraws all links connecting activities
function redrawAllLinks()
{
  //get all links of all routes
  var allLinks = document.getElementById('route-definitions').getElementsByTagName("A-CYLINDER");

  //redraw them
  for(let i=0; i<allLinks.length;i++)
  {
    redrawLink(allLinks[i]);
  }
}

//Auto-Detects Camel settings to use from the source code given
function autoDetectCamelSettings(source)
{
  //Auto-detect Blueprint
  if(source.includes(CAMEL_NAMESPACE.blueprint))
  {
    setCamelNamespaceBlueprint();
  }

  //Auto-detect Camel version from syntax
  if(source.includes("propertyName") || source.includes("headerName"))
  {
    setCamelVersion2();
  }

  //Auto-detect Camel envelope wrapping Camel definitions
  if(source.includes(CAMEL_SOURCE_ENVELOPE.routeContext))
  {
    camelSourceEnvelope = CAMEL_SOURCE_ENVELOPE.routeContext
  }
  else if(source.includes(CAMEL_SOURCE_ENVELOPE.camelK))
  {
    camelSourceEnvelope = CAMEL_SOURCE_ENVELOPE.camelK
  }
  else{
    camelSourceEnvelope = CAMEL_SOURCE_ENVELOPE.camelContext
  }
}

//experimental
function takeScreenshot()
{
  let current = document.getElementById(currentConfigPane);
  current.style.visibility = "hidden";


  let canvas = document.querySelector('a-scene').components.screenshot.getCanvas('perspective');

  // canvas.toDataURL()

  // var img = document.createElement('img');

  // img.setAttribute("width", "100%");
  // img.setAttribute("height", "100%");
  // img.src = canvas.toDataURL()
  // let pane = document.getElementById('screenshot');
  // pane.appendChild(img)
  // pane.style.visibility = "visible";


  // <a-plane src="#ground" height="100" width="100" rotation="-90 0 0"></a-plane>

  var plane = document.createElement('a-plane');
  plane.setAttribute('width', 4)
  plane.setAttribute('height', 2)
  // activity.appendChild(disc);
  // disc.setAttribute('side', 'double');
  plane.setAttribute('src', canvas.toDataURL());
  getSelectedRoute().appendChild(plane);

}

//this function works with a range of activities
//from activity1 to activity2
//returns a list of activities ordered in execution order 
function getListActivitiesFirstToLast(activity1, activity2)
{
  if(activity1 && !activity2)
  {
    return [activity1]
  }
  else if(activity2 && !activity1)
  {
    return [activity2]
  }

  let next = getNextActivity(activity1)

  while(next)
  {
    if(next == activity2)
    {
      return [activity1,activity2]
    }
    next = getNextActivity(next)
  }

  return [activity2,activity1]
}

//returns TRUE if the entity is a MULTICAST processor
function isMulticast(entity)
{
  if(entity)
  {
    let type = entity.getAttribute('processor-type')

    if(type == 'multicast')
      return true
  }

  return false
}

function getRoutes(){

  //obtain all route definitions
  let routes = document.getElementById('route-definitions').children

  //convert to Array and return
  return  Array.prototype.slice.call(routes);
}
