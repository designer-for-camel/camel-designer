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
function insertActivity(newElement)
{
  //default shiftX
  var shiftX = 2;

  //obtain the activity the new element needs to follow
  var refActivity = getActiveActivity();

  //obtain parent
  var parent = refActivity.parentNode;
   
  //if it's boxed, then its parent should be the reference
  if(isBoxed(refActivity))
  {
    refActivity = refActivity.parentNode
    parent = refActivity.parentNode;
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

  //if multicast (a box)
  if(newElement.localName == 'a-box')
  {
    //boxes require more space
    shiftX = 4;
  }

  //handling for Choice groups
  if(newElement.getAttribute('processor-type') == 'choice-end')
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
    if(next.localName != 'a-cylinder')
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
  //the activity may be 'boxed' (i.e. multicast)
  if(isBoxed(activity)){
    return activity.parentNode.parentNode;
  }

  return activity.parentNode;
}

//Returns the activity currently being configured (with circle around)
function getActiveActivity()
{
  return document.querySelector("#selector").parentNode;
}

//returns TRUE when activity is contained in a group box (i.e. multicast)
function isBoxed(activity)
{
  if (activity == null)
  {
    return false;
  }

  return activity.parentNode && (activity.parentNode.nodeName.toLowerCase() == "a-box");
}

//returns TRUE when activity is part of a group of acvivities (choices/multicasts)
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

  // if(activity.localName == 'a-box')
  // {
  //   activity = activity.getAttribute('group-end')

  //   if(activity == null)
  //   {
  //     //do not continue
  //     return;
  //   }
  //   //or
  //   //activity = activity.querySelectorAll('#multicast-end')[0]
  // }

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
    //position of parent
    let posBox   = activity.parentNode.object3D.position;
   
    //position inside parent
    let posInBox = activity.object3D.position;

    //absolute position
    let position = { x: posBox.x+posInBox.x,
                     y: posBox.y+posInBox.y,
                     z: 0};

    return position;
  }

  return activity.object3D.position;
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