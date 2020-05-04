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

  return activity.parentNode.nodeName.toLowerCase() == "a-box";
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


function getPositionInScene(activity)
{
  if(isBoxed(activity))
  {
    //was
    //let posBox   = activity.parentNode.components.position.attrValue;
    let posBox   = activity.parentNode.object3D.position;
    //was
    //let posInBox = activity.components.position.attrValue;
    let posInBox = activity.object3D.position;

    let position = { x: posBox.x+posInBox.x,
                     y: posBox.y+posInBox.y,
                     z: 0};

    return position;
  }

  //was
  //return activity.components.position.attrValue;
  return activity.object3D.position;
}

//updates an Activity ID with a new one
//the function also updates ID references from other entities
function updateActivityId(activity, newId)
{
  //when activities are created from source-code, they might not have an id
  if(newId == null)
  {
    return;
  }

  //order of updates is important:
  //first, we update the link reference with the new ID
  let link = getBackwardsLink(activity);

  //check if link exists
  //FROM elements do not have a preceding link
  if(link){
    link.setAttribute('destination', newId);
  }

  //then we update the activity ID
  activity.setAttribute('id', newId);
}

//Updates the ID of the given Route to the new ID
function updateRouteId(route, newId)
{
  for(i=0; i<routes.length; i++)
  {
    if(routes[i] == route.id)
      routes[i] = newId;
  }

  route.id = newId;
}