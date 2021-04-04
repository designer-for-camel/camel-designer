//Obtains a unique ID that guarantees is not already in use.
//Base IDs are expected to be given in 2 formats:
// - Normal activities     (eg. 'log', 'direct', ...)
// - Group starters/enders (eg. 'multicast-start', 'try-start', ...)
function getUniqueID(baseUid)
{
  baseUid = baseUid || "step";

  var newUid;

  //WAS
  // if(baseUid.startsWith('choice-'))
  // {
  //   //example: 'choice-start' => 'choice-1-start'
  //   // newUid = "choice-"+ (++uidCounter) + baseUid.split('choice')[1];

  //   //example: 'choice-start' => 'choice-1'
  //   newUid = "choice-"+ (++uidCounter);
  // }
  // else if(baseUid.startsWith('multicast-'))
  // {
  //   //example: 'multicast-start' => 'multicast-1'
  //   newUid = "multicast-"+ (++uidCounter);
  // }

  //NOW
  let baseTokens = baseUid.split('-')

  //if base contains '-' then it is a group (e.g. multicast-start, try-start, ...)
  if(baseTokens.length > 1)
  {
    //we keep first token and add ID
    newUid = baseTokens[0] + '-' + (++uidCounter)
  }
  else
  {
    //we add ID
    newUid = baseUid + "-" + (++uidCounter);
  }


  //check if the ID is already in use
  var activity = document.getElementById(newUid);

  //if used, then we discard it, increase the counter and try again
  while(activity)
  {
    //new id
    newUid = baseUid + "-" + (++uidCounter);

    //check again
    activity = document.getElementById(newUid);
  }

  return newUid;
}


function createFrom(metadata)
{
  //should be always attached to the flow
  metadata.detachable = false

  //create activity
  let from = createActivity(metadata)

  //customise to make it a START activity
  from.setAttribute('material', {color: '#52F40C', transparent: true, opacity: 0.5});
  from.setAttribute('start', '');

  //create inner label
  var text = createText();
  from.appendChild(text);
  text.setAttribute('value', metadata.type);
  text.setAttribute('color', '#f49b42');
  text.setAttribute('position', {x: -0.3, y: 0, z: 0});
  text.setAttribute('side', 'double');

  return from;
}


function createTimer(metadata)
{
  let params = {};
  params.type = 'timer'

  if(metadata && metadata.scale){
    params.scale = metadata.scale;
  }
  if(metadata && metadata.definition){
    params.definition = metadata.definition
  }

  //create activity
  let timer = createFrom(params);

  //'timer' name defaults to the Route ID
  let label = timer.id


  if(metadata)
  {
    //updates the 'direct' name
    label = metadata.definition.getAttribute('uri').substring(6)
  }

  //label to display the name of the 'timer' component (as in uri="timer:name")
  var text = createText();
  timer.appendChild(text);
  text.setAttribute('value', label);
  text.setAttribute('color', 'white');
  text.setAttribute('align', 'center');
  text.setAttribute('position', {x: 0, y: .7, z: 0});
  text.setAttribute('side', 'double');

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

  goLive(timer);
}


function createDirectStart(metadata)
{
  let params = {};
  params.type = 'direct'

  if(metadata && metadata.scale){
    params.scale = metadata.scale;
  }
  if(metadata && metadata.definition){
    params.definition = metadata.definition
  }

  let direct = createFrom(params);

  //'direct' name defaults to the Route ID
  let label = getActiveRoute().id

  if(metadata)
  {
    //updates the 'direct' name
    label = metadata.definition.getAttribute('uri').substring(7)
  }

  //label to display the name of the 'direct' component (as in uri="direct:name")
  var text = createText();
  direct.appendChild(text);
  text.setAttribute('class', 'uri');
  text.setAttribute('value', label);
  text.setAttribute('color', 'white');
  text.setAttribute('align', 'center');
  text.setAttribute('position', {x: 0, y: .7, z: 0});
  text.setAttribute('side', 'double');

  goLive(direct);
}
      
//creates Activity
//metadata may include the definition (from source)
function createActivity(metadata)
{
  var scale         = {x: 1, y: 1, z: 1}
  var processorType;
  var detachable = true
  var golive = true
  var dragndrop = true
  var clickable = true

  if('detachable' in metadata){
    detachable = metadata.detachable
  }

  if('dragndrop' in metadata){
    dragndrop = metadata.dragndrop
  }

  if('clickable' in metadata){
    clickable = metadata.clickable
  }

  //activity may have been flagged to be manually inserted in the scene (golive = false)
  //see goLive function
  if('golive' in metadata){
    golive = metadata.golive
  }

  //definition takes precedence
  if(metadata.definition)
  {
    //when XML tag is 'to', we need to identify the Camel component
    if(metadata.definition.tagName == 'to' || metadata.definition.tagName == 'from'){
      processorType = metadata.definition.attributes.uri.value.split(":")[0];
    }
    else{
      processorType = metadata.definition.tagName

      //choice special handling
      if(processorType == 'choice'){
        processorType = metadata.type
      }
    }
  }

  //type given takes precedence, otherwise type definition applies
  processorType = metadata.type || processorType

  //if a scale is given, we take it, otherwise we use default
  scale = metadata.scale || scale
  
  //create activity
  var newActivity = document.createElement('a-sphere');

  //order here is important:
  // 1) first set the default (on-creation) ID
  newActivity.setAttribute('id', getUniqueID(processorType));

  // 2) if one is given, we update
  if(metadata.definition && metadata.definition.id)
  {
    //the new ID might not be valid, this call handles it with care
    updateActivityId(newActivity, metadata.definition.id);
  }

  configObj = newActivity;

  //Needed since A-FRAME v1.0.0
  // newActivity.setAttribute('class', 'interactive');
  newActivity.classList.add('interactive')
  newActivity.classList.add('configurable')
  newActivity.setAttribute('processor-type', processorType);

  //is this necessary?    
  //newActivity.setAttribute(newActivity.id.toLowerCase(),'');

  newActivity.setAttribute('material', {color: '#ACF5F5', transparent: true, opacity: 0.5});


  var animatedScale = {x: scale.x+.1, y: scale.y+.1, z: scale.z+.1};

  newActivity.setAttribute('radius', .5);
  newActivity.setAttribute('scale', scale);

  // newActivity.setAttribute('animation', {  startEvents:'mouseenter',
  //                                 pauseEvents:'mouseleave',
  //                                 property: 'scale',
  //                                 dir: 'alternate',
  //                                 dur: '500',
  //                                 to: animatedScale,
  //                                 loop: 5});

  // newActivity.setAttribute('animation__2',{
  //                                 startEvents:'mouseleave',
  //                                 property: 'scale',
  //                                 dur: '500',
  //                                 to: scale});

  if(detachable){
    newActivity.setAttribute('detachable','')
  }

  if(dragndrop){
    newActivity.setAttribute('dragndrop','')
  }

  //dragndrop makes it already clickable
  //it might not be dragndrop but might be clickable (eg 'direct' on a multicast)
  if(!dragndrop && clickable){
    newActivity.setAttribute('clickable','')
  }

  if(golive){
    newActivity.setAttribute('golive','')
  }

  return newActivity;
}



// function createLog(definition)
function createLog(metadata)
{
  //if no metadata is given we initialise it
  metadata = metadata || {}

  //we ensure type is set
  metadata.type = 'log'

  //we create the activity
  let log = createActivity(metadata)

  //was
  // let log = createActivity({type: 'log', definition: definition});

  // Activity label
  var text = createText();
  log.appendChild(text);
  text.setAttribute('value', 'log');
  text.setAttribute('color', 'white');
  text.setAttribute('align', 'center');
  text.setAttribute('side', 'double');

  let defaultMessage = "demo trace "+log.id;

  // text with actual LOG as configured in Camel
  var label = createText();
  text.appendChild(label);
  label.setAttribute('value', '"'+defaultMessage+'"');
  label.setAttribute('color', 'white');
  label.setAttribute('align', 'center');
  label.setAttribute('position', {x: 0, y: -.7, z: 0});
  label.setAttribute('side', 'double');

  //insert activity in the scene
  goLive(log);

  if(metadata && metadata.definition)
  {
    //update message shown in label
    log.getElementsByTagName("a-text")[0].firstChild.setAttribute('value', '"'+metadata.definition.getAttribute('message')+'"');
  }

  //test
  //vscodePostMessage('atlasmap-start')

  return log
}

//creates a setProperty activity
function createProperty(definition)
{
  var property = createNameValuePair('property', definition);

  if(definition)
  {
    //obtain name value
    var propertyName = definition.getAttribute(getCamelAttributePropertyName())

    //if null, try switching Camel version
    if(propertyName == null)
    {
      console.warn('Could not find setProperty attribute "'+getCamelAttributePropertyName()+'", switching Camel version...')
      switchCamelVersion()
      propertyName = definition.getAttribute(getCamelAttributePropertyName())
    }

    property.getElementsByTagName("a-text")[0].firstChild.setAttribute('value', propertyName+':');
    //property.getElementsByTagName("a-text")[0].lastChild.setAttribute('value', '"'+definition.firstElementChild.innerHTML+'"');
  }

  return property
}

//creates a setHeader activity
function createHeader(definition)
{
  var header = createNameValuePair('header', definition);

  if(definition)
  {
    //obtain name value
    var headerName = definition.getAttribute(getCamelAttributeHeaderName())

    //if null, try switching Camel version
    if(headerName == null)
    {
      console.warn('Could not find setHeader attribute "'+getCamelAttributeHeaderName()+'", switching Camel version...')
      switchCamelVersion()
      headerName = definition.getAttribute(getCamelAttributeHeaderName())
    }

    header.getElementsByTagName("a-text")[0].firstChild.setAttribute('value', headerName+':');
    //header.getElementsByTagName("a-text")[0].lastChild.setAttribute('value', '"'+definition.firstElementChild.innerHTML+'"');
  }

  return header
}

function createNameValuePair(setterType, definition)
{
  //let activity = createTo(setterType);
  let activity = createActivity({type: setterType, definition: definition});

  //add expression component (and load definition)
  activity.setAttribute('expression', {position: "0 -1 0", configMethod: [updateConfigNameValuePair]})
  activity.components.expression.setDefinition(definition)

  if(!definition)
  {
    //default expression if not defined
    activity.components.expression.setValue("dummy")
  }
  
  //create activity label
  var text = createText();
  activity.appendChild(text);
  text.setAttribute('value', setterType);
  text.setAttribute('color', 'white');
  text.setAttribute('align', 'center');
  text.setAttribute('side', 'double');

  //defaults
  let defaultName = activity.id;

  //label for field name
  var label = createText();
  text.appendChild(label);
  label.setAttribute('value', defaultName+':');
  label.setAttribute('color', 'grey');
  label.setAttribute('align', 'center');
  label.setAttribute('position', {x: 0, y: -.7, z: 0});
  label.setAttribute('side', 'double');

  //live on scene
  goLive(activity);

  return activity;
}

//creates an Unknown activity
function createUnknown(definition)
{
  var activity;
  var tag;

  if(definition.tagName == 'from')
  {
    // activity = createFrom('unknown');
    activity = createFrom({type: 'unknown', definition: definition});
    activity.firstChild.setAttribute('value','');

    tag = definition.attributes.uri.value.split(":")[0];
  }
  else
  {
    activity = createActivity({type: 'unknown', definition: definition});

    if(definition.tagName == 'to')
    {
      tag = definition.attributes.uri.value.split(":")[0];
    }
    else
    {
      tag = definition.tagName;
    }
  }

  activity.setAttribute('color', '#FF5733');
  activity.setAttribute('opacity', .5)

  var text = createText();
  activity.appendChild(text);
  text.setAttribute('value', tag);
  text.setAttribute('color', 'white');
  text.setAttribute('align', 'center');
  text.setAttribute('side', 'double');

  //defaults
  // let defaultCode = definition.outerHTML.replace(' xmlns="'+CAMEL_NAMESPACE+'"','');
  let defaultCode = definition.outerHTML.replace(' '+getCamelNamespace(),'');

  //label for field name
  var label = createText(fontSourceCodePro);
  text.appendChild(label);
  label.setAttribute('value', defaultCode);
  label.setAttribute('color', 'grey');
  label.setAttribute('align', 'center');
  label.setAttribute('position', {x: 0, y: -1.2, z: 0});
  label.setAttribute('side', 'double');


  label = createText();
  activity.appendChild(label);
  label.setAttribute('value', '(not supported yet)');
  label.setAttribute('align', 'center');
  label.setAttribute('side', 'double');
  label.setAttribute('position', {x: 0, y: 0.7, z: 0});
  label.setAttribute('color', 'grey');

  goLive(activity);

  return activity;
}

function createBody(definition)
{
  //let activity = createTo('body');
  let activity = createActivity({type: 'body', definition: definition});

  //add expression component (and load definition)
  activity.setAttribute('expression', {position: "0 -0.7 0", configMethod: [updateConfigBody]})
  activity.components.expression.setDefinition(definition)

  //this is the label inside the geometry (activity descriptor)
  var text = createText();
  activity.appendChild(text);
  text.setAttribute('value', 'body');
  text.setAttribute('color', 'white');
  text.setAttribute('align', 'center');
  text.setAttribute('side', 'double');

  goLive(activity);

  return activity
}

// function directCreate()
function createDirect(metadata)
{
  let activity = createDirectActivity(metadata);

  if(metadata)
  {
    //updates the target route it points to
    // activity.children.routeLabel.setAttribute("value", metadata.definition.getAttribute('uri').substring(7));
    activity.firstChild.setAttribute("value", metadata.definition.getAttribute('uri').substring(7));
  }

  //add to scene (and other stuff)
  goLive(activity);

  return activity
}


//Creates a Direct activity
function createDirectActivity(metadata)
// function createDirect(metadata)
{
  // let params = {};
  // params.type = 'direct'

  // if(metadata && metadata.scale){
  //   params.scale = metadata.scale;
  // }
  // if(metadata && metadata.definition){
  //   params.definition = metadata.definition
  // }
  // if(metadata && ('detachable' in metadata)){
  //   params.detachable = metadata.detachable
  // }

  let params = {};

  if(metadata){
    params = metadata
  }

  params.type = 'direct'


  
  //create activity
  let activity = createActivity(params);

      activity.setAttribute('double-click','')

  //lower opacity
  activity.setAttribute('opacity', 0.2);
  
  //obtain dialog
  var element = document.getElementById("newDirect");

  //obtain list
  var list = element.getElementsByTagName("select")[0];

  populateWithDirectStarters(list)

  // if(routes.length > 1)
  // {
  //   list.value = routes[1];
  // }
  // else
  // {
  //   list.value = routes[0];
  // }

  // label to display Route it points to
  var text = createText();
  activity.appendChild(text);
  text.setAttribute('class', 'uri');
  text.setAttribute('value', list.value);
  text.setAttribute('color', 'white');
  text.setAttribute('align', 'center');
  text.setAttribute('position', {x: 0, y: -.7, z: 0});
  text.setAttribute('side', 'double');

  //set Image showing a route
  var disc = document.createElement('a-ring');
  activity.appendChild(disc);
  disc.setAttribute('side', 'double');
  disc.setAttribute('src', '#routeThumbnail');
  disc.setAttribute('radius-inner', 0.00001);
  disc.setAttribute('radius-outer', 0.5);

  if(hintDirectPending && !activity.attributes.hint)
  {
    hintDirectPending = false;

    activity.setAttribute('hint', 'message: double-click \n to open route')
    // createDirectHint(activity);
  }

  return activity;
}


// Includes the activities into the scene
function goLive(activity, givenPos, sources, scale, staticLink, parent, handleRewires)
{
  //by default activities 'golive' is ON
  //some activities may have the 'golive' switch OFF (to be inserted manually)
  if(!activity.hasAttribute('golive'))
  {
    //when OFF do nothing
    return
  }

  //if it's a FROM activity we delegate
  if(activity.hasAttribute('start'))
  {
    goLiveFrom(activity);
    switchConfigPaneByActivity(activity);

    syncEditor();
    return;
  }

  //otherwise
  goLiveTo(activity, givenPos, sources, staticLink, parent, handleRewires);
  //switchConfigPaneByActivity(activity);
  
  syncEditor();

}

//Updates VSCode editor with the changes
function syncEditor()
{
  //only when it runs in VSCode
  if ( top !== self ) { // we are in the iframe
    if(syncEditorEnabled && !syncStartUpEnabled) {
      getCamelSource();
    }
  }
}

//Updates VSCode editor with the changes
function syncMetadata()
{
  //only when it runs in VSCode
  if ( top !== self ) { // we are in the iframe
    if(syncEditorEnabled && !syncStartUpEnabled) {
      
      vscodePostMessage('metadata', {
        metadata: getMetadata()
      });

    }
  }
}

function goLiveFrom(from)
{
  //get Scene where activities will be added
  var scene = document.getElementById(routes[0]);

  //default START position
  var fromPos = {x: startActivityPos, y: 0, z: 0};
  from.object3D.position.set(fromPos.x, fromPos.y, fromPos.z);

  //once created, no more STARTs are permitted (as for Camel 3)
  enableFromButtons(false);

  scene.setAttribute("lastCreated", from.id);
  scene.appendChild(from);
  configObj = from;
}


function goLiveTo(to, givenPos, sources, staticLink, parent, handleRewires)
{
  let processorType = to.getAttribute('processor-type');

  //Solution for Creating Entities.
  var scene = document.getElementById(routes[0]);

  //obtain reference to attach (wire) to
  sources = sources || [ getActiveActivity() ];


  //determine parent that will own the activity
  if(parent == null)
  {
    //we use the same parent as source, unless it is an end group activity
    if(sources.length == 1 && !sources[0].getAttribute('processor-type').endsWith('-end')){
      parent = sources[0].parentNode
    }
    else{
      //scene as default parent if not given
      parent = parent || scene
    }
  }


  // //scene as default parent if not given
  // parent = parent || scene;



  var position;

  if(givenPos != null)
  {
    position = givenPos;
  }
  else if(sources.length == 1 && !sources[0].getAttribute('processor-type').endsWith('-end')){
    position = {
        x: sources[0].object3D.position.x+2,
        y: sources[0].object3D.position.y,
        z: 0
    }
  } 
  else
  {
    position = getNextSequencePosition();
  }

            // if(staticLink)
            // {
            //   parent.appendChild(to);
            // }
            // else
            // {
            //   //otherwise we use insertActivity to maintain order of DOM elements.
            //   insertActivity(to);
            // }

  //it seems setting attribute does ops async and may unsettle fast code execution
  //we use both settings (3D object and attribute) which seems works
  //to.setAttribute('position', position);
  to.object3D.position.set(position.x, position.y, position.z);

  // if(staticLink)
  // {
  //   parent.appendChild(to);
  // }
  // else
  // {
  //   //otherwise we use insertActivity to maintain order of DOM elements.
  //   insertActivity(to);
  // }

  //loop sources
  for(item of sources)
  {
    var link;


    if(processorType == 'catch-start')
    {
      //do nothing
      //these are standalone activity sequences
      return
    }
    // else if(processorType == 'multicast-start')
    else if(processorType != 'choice-start' && processorType.endsWith('-start'))
    {
      //for multicast-start the link should not be static
      link = createLink(item, to, false, handleRewires);
    }
    else
    {
      link = createLink(item, to, staticLink, handleRewires);
    }

    //was
    //if(parent == null || processorType == "multicast-start")
    //links to Boxes should not be added to the box 
    if(processorType.endsWith('-start'))
    {
      // scene.appendChild(link);
      let linkParent = determineLinkParent(item, to, parent)
      linkParent.appendChild(link)
    }
    else
    {
      parent.appendChild(link);
    }
  //}); // END FOR-EACH

  }// END FOR

  if(staticLink)
  {
    parent.appendChild(to);
  }
  else
  {
    //otherwise we use insertActivity to maintain order of DOM elements.
    insertActivity(to);
  }

  //we try to obtain the group frame (if there is one)
  let groupFrame = getActivityFrame(to)

  if(groupFrame)
  {
    redrawBoxFrame(groupFrame)
  }


  switchConfigPaneByActivity(to);

  scene.setAttribute("lastCreated", to.id);

  if(hintDetachablePending && (uidCounter>3) && to.components.detachable && !to.attributes.hint)
  {
    hintDetachablePending = false
    to.setAttribute('hint', 'message: to detach: SHIFT + CLICK \n to reattach: drag & drop')
  }
}


//This function evaluates the source and destination to determine
//the parent that should own the link between the two
//The destination may yet not be in the scene, hence why its parent needs to be given
function determineLinkParent(source, destination, destinationParent)
{
  //if the parent is not given, we assume the destination is on the scene
  destinationParent = destinationParent || destination.parentNode

  //this covers the case for same level activities, or activities of the same group
  if(source.parentNode == destinationParent)
  {
    return destinationParent          
  }
  //this covers the case for links connecting 2 different groups (group-end ---> group-start)
  else if(source.classList.contains('group-end') && destination.classList.contains('group-start'))
  {
    return source.parentNode.parentNode
  }
  //this covers the case for links connecting a group to an activity (group-end ---> activity)
  else if(source.classList.contains('group-end') && !destination.classList.contains('group-start'))
  {
    return destinationParent
  }
  //this covers when destination is boxed and source isn't
  //this covers the case for links connecting an activity to a group (activity ---> group-start)
  else if(!source.classList.contains('group-end') && destination.classList.contains('group-start'))
  {
    return source.parentNode
  }
}


//returns Start activity, or box if 'boxed'
function createMulticastBox(groupName, labelStart, labelEnd)
{
  var boxed = true
  var numActivities = 2;
  var activities = [];
  var scale = {x: .5, y: .5, z: .5};

  var typeStart = groupName + "-start";
  var typeEnd   = groupName + "-end";

  var scene = document.getElementById(routes[0]);

  var box = document.createElement('a-box')

  //Needed since A-FRAME v1.0.0
  // box.setAttribute('class', 'interactive');
  box.classList.add('interactive')
  var groupId = getUniqueID("multicast-box");
  box.setAttribute('id', groupId)
  box.setAttribute('opacity', .1)
  box.setAttribute('transparent', true)

  box.setAttribute('processor-type','multicast')

  boxPosition = getNextSequencePosition()
  boxPosition.x += 1
  box.object3D.position.set(boxPosition.x, boxPosition.y, boxPosition.z);

  box.setAttribute('height', numActivities)
  box.setAttribute('width', 2)
  box.setAttribute('depth', 0.00001)
  box.setAttribute('dragndrop', '')

  //box label
  var text = createText();
  box.appendChild(text);
  text.setAttribute('value', "parallel  execution\n(camel multicast)");
  text.setAttribute('color', 'grey');
  text.setAttribute('position', {x: -.85, y: -numActivities/2-.3, z: 0});
  text.setAttribute('side', 'double');

  insertActivity(box);


  //get reference of activity to follow.
  source = getActiveActivity();

  //we keep referece.
  let sourceFwdLink = detachForwardLink(source)

  //create root activity  
  let rootActivity = createActivity({type: typeStart, scale: scale, detachable: false});
  rootActivity.removeAttribute('dragndrop')

  //these classes help parenting and redrawing links
  rootActivity.classList.add('group-start')
  rootActivity.classList.add('boxed')
  rootActivity.setAttribute('radius', .25)
  rootActivity.setAttribute('scale', '1 1 1')

  let rootId = rootActivity.getAttribute('id');

  let rootPos = {x: -1, y: 0, z: 0};

  // goLive(rootActivity, rootPos, null, scale, boxed, box);
  goLive( rootActivity,
          rootPos,
          [source],  //sources to connect the activity, here null (automatic)
          scale,
          boxed,
          box)

  //loop branches
  for(let i=1; i<=numActivities; i++)
  {
    let activity = createDirectActivity({scale: scale, detachable: false//});
                                                     , dragndrop: false, clickable: true});
    // let activity = createDirect({scale: scale});
    activity.setAttribute('group', true);
    activity.setAttribute('group-branch',i);
    //activity.setAttribute('scale', scale);
    // activity.removeAttribute('dragndrop')
      

    goLive(
        activity,
        getNextParallelPosition(i,numActivities,0, boxed),
        [rootActivity],
        scale, 
        // null, 
        boxed,
        box); //parent entity
      
    activities.push(activity);

    //force connections to root activity except last iteration
    //(so that sub-sequent activities connect to closing activity)
    if(i != numActivities)
    {
        scene.setAttribute("lastCreated", rootActivity.id);
    }
  }

  let posClosing = {x: 1, y: 0, z: 0};


  //create closing activity
  var closeActivity = createActivity({type: typeEnd, scale: scale, detachable: false});
  closeActivity.removeAttribute('dragndrop')

  //these classes help parenting and redrawing links
  closeActivity.classList.add('group-end')
  closeActivity.classList.add('boxed')
  closeActivity.setAttribute('radius', .25)
  closeActivity.setAttribute('scale', '1 1 1')

  //we make the closing activity to shares ID with starting activity.
  //the difference between them is the suffix. Example: 'choice-1-start' 'choice-1-end'
  updateActivityId(closeActivity, rootId.split('start')[0]+"-end");


  //labels for Root activity
  var text = createText();
  rootActivity.appendChild(text);
  text.setAttribute('value', labelStart);
  text.setAttribute('color', 'white');
  // text.setAttribute('position', {x: -.06*(labelStart.length), y: 0, z: 0}); //centers label based on length
  text.setAttribute('align', 'center')
  text.setAttribute('side', 'double');

  //labels for End activity
  text = createText();
  closeActivity.appendChild(text);
  text.setAttribute('value', labelEnd);
  text.setAttribute('color', 'white');
  // text.setAttribute('position', {x: -.06*(labelEnd.length), y: 0, z: 0}); //centers lable based on length
  text.setAttribute('side', 'double');
  text.setAttribute('align', 'center')
  text.setAttribute('scale', '.8 .8 .8')

  goLive(closeActivity, posClosing, activities, scale, boxed, box);


  //only when a forward link existed, we attach it to the end of the group
  if(sourceFwdLink)
  {
    attachSourceToLink(closeActivity, sourceFwdLink);
  }

  box.setAttribute('group-start', rootActivity.id);
  box.setAttribute('group-end',   closeActivity.id);

  //is this necessary?
  scene.setAttribute('lastCreated', closeActivity.id);

  //somehow the link to the multicast is not accurate, need to redraw
  //anyone wants to review this?
  redrawLink(getBackwardsLink(rootActivity))

          // //experimental
          // box.setAttribute('detachable','')
  

  //we try to obtain enveloping frame (if there is one)
  let groupFrame = getActivityFrame(box)

  //if found, we have 'nested frames'
  if(groupFrame)
  {
    //we redimension the frame
    redrawBoxFrame(groupFrame)
  }

  return box;
}

//Creates a Multicast group of activities
function createMulticast(definition)
{
  //we're about to create multiple activities, so we stop streaming updates until we're done
  syncEditorEnabled = false;

  var multicast = createMulticastBox("multicast", "fork", "merge");

  if(definition)
  {
    //apply definition ID
    updateActivityId(multicast, definition.getAttribute('id'));          
  }

  //now we're done, we switch back on, and we sync.
  syncEditorEnabled = true;
  syncEditor();

  //key of multicast closing activity
  let queryKey = "#"+multicast.getAttribute('group-end')

  //return the closing activity
  return multicast.querySelectorAll(queryKey)[0]
}

      // NOW DEPRECATED
      //========================
      // function createChoice_v1(definition)
      // {
      //   //we're about to create multiple activities, so we stop streaming updates until we're done
      //   syncEditorEnabled = false;

      //   //create all choice elements (returns start activity)
      //   let start = createGroup("choice", false, "choice", "end");

      //   //obtain end activity (derived from start id)
      //   let end   = document.getElementById(start.id.replace('start', 'end'));

      //   if(definition)
      //   {
      //     //apply definition ID
      //     updateActivityId(start, definition.id);    
      //     updateActivityId(end,   definition.id.replace('start', 'end'));    
      //   }

      //   //update links to show correct condition labels
      //   var links = JSON.parse(start.getAttribute("links"));
      //   let otherwise = document.getElementById(links[links.length-1]);
      //   labels = otherwise.getElementsByTagName('a-text');
      //   labels[0].setAttribute('value','otherwise');
      //   labels[0].setAttribute('position','0 .5 0');
      //   otherwise.removeChild(labels[1]);
      //   otherwise.setAttribute('class', 'non-interactive');

      //   //now we're done, we switch back on, and we sync.
      //   syncEditorEnabled = true;
      //   syncEditor();
      // }

      //UNDER CONSTRUCTION
      //This is an effort to make a better CHOICE creator
      //the first one is too rigid, and mixed with MULTICAST
      //This one uses XML as input, and can create inner CHOICES
      function createChoice(definition)
      {
        if(!definition)
        {
          //default definition if not given
          definition = new DOMParser().parseFromString('<choice><when><simple>dummy = \'true\'</simple><to uri="direct:route1"/></when><otherwise><to uri="direct:route1"/></otherwise></choice>', 'application/xml').documentElement;
          
          //sample with NO otherwise
          // definition = new DOMParser().parseFromString('<choice><when><simple>dummy = \'true\'</simple><to uri="direct:route1"/></when></choice>', 'application/xml').documentElement;
          
          //sample 4 branches
          // definition = new DOMParser().parseFromString('<choice><when><simple>condition1</simple><to uri="direct:route1"/></when><when><simple>condition2</simple><to uri="direct:route1"/></when><when><simple>condition3</simple><to uri="direct:route1"/></when></choice>', 'application/xml').documentElement;
          
          //sample with LOG
          // definition = new DOMParser().parseFromString('<choice id="myid"><when><simple>dummy = \'true\'</simple><log message="my message"/></when></choice>', 'application/xml').documentElement;
        }

        //if <otherwise> doesn't exist, we append the default one
        if(definition.getElementsByTagName('otherwise').length == 0)
        {
          let otherwise = new DOMParser().parseFromString('<otherwise><to uri="direct:route1"/></otherwise>', 'application/xml').documentElement;
          definition.appendChild(otherwise)
        }

        //we're about to create multiple activities, so we stop streaming updates until we're done
        syncEditorEnabled = false;

        //keep reference of activity that CHOICE has to follow
        let activityBeforeChoice = getActiveActivity()
        
        refPosition = getPositionInScene(activityBeforeChoice)

        // create CHOICE start activity
        let start = createActivity({type: 'choice-start', definition: definition, detachable: false});

        //We create CHOICE end activity
        //We need to provide a specific ID for the end activity (with format: "[startId]-end")
        //Updating the ID from the source definition causes the following error:
        //  [The document has mutated since the result was returned]
        //Cloning the object causes the same error.
        //The workaround is to unmarshal/marshal (passing a whitelist filter of the fields to keep)
        let definitionUpdate = JSON.parse(JSON.stringify(definition, ["id", "tagName"]))

        // and then update the ID
        definitionUpdate.id = start.id+"-end"

        //then we can create the end activity with the given ID
        let end   = createActivity({type: 'choice-end', definition: definitionUpdate, detachable: false});

        //align choice to preceding activity
        //this is particularly important to maintain flow in Y coordinate 
        start.object3D.position.set(
          refPosition.x,
          refPosition.y,
          refPosition.z,
        )

        //align choice to preceding activity
        end.object3D.position.set(
          refPosition.x,
          refPosition.y,
          refPosition.z,
        )

        //labels for Root activity
        var text = createText();
        start.appendChild(text);
        text.setAttribute('value', 'choice');
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
        let orphanLink = detachForwardLink(activityBeforeChoice)

        //insert Start
        insertActivity(start)

        //connect Start to preceding activity
        linkActivities(activityBeforeChoice, start)


        //collection of branch end activities
        //they all need to be connected to the choice-end activity
        //var branchEndActivities = [];

        //obtain all choice branches
        let choiceNodes = definition.children;

        //Y axis where branches need to be positioned
        let axisY = start.object3D.position.y+choiceNodes.length - 1

        for(let i=0; i < choiceNodes.length; i++)
        {
          //obtain steps of the choice branch
          let steps = Array.from(choiceNodes[i].children)

          //default value for <otherwise> (no expression)
          let expression = null;

          if(choiceNodes[i].tagName == 'when')
          {
            //we extract the first element, which is the expression
            expression = steps.shift();
          }

// setConfigSelector(start)

          //we process the remaining steps 
          let last = createChoiceBranch(expression, start, steps, axisY)

          //shift for next iteration
          axisY-=2

          //keep last
          //branchEndActivities.push(last)

          linkActivities(last, end)

          //do this only once
          if(i==0)
          {
            //if Choice was injected in between activities
            //we attach the choice-end to the orphan link
            if(orphanLink)
            {
              attachSourceToLink(end, orphanLink);
            }

            //insert End Choice
            insertActivity(end)
          }
        }

        //the insert operation upsets the END Y position
        //we realign START and END activities
        end.object3D.position.set(
          end.object3D.position.x,
          start.object3D.position.y,
          end.object3D.position.z
        )

        setConfigSelector(end)
        redrawAllLinks()

        //now we're done, we switch back on, and we sync.
        syncEditorEnabled = true;
        syncEditor();

        //we return the 'end' activity
        //this is necessary to process nested choices (or an inner choice)
        return end
      }

      //Attaches (links) a source activity to a destination activity
      //Visually the result will be a sphere connected to another sphere via a cylinder
      function linkActivities(source, destination)
      {
        let sourcePosition = source.object3D.position

        //if activities are at different levels
        if(source.parentNode != destination.parentNode)
        {
          //this is important when source is in a box (e.g. multicast)
          sourcePosition = getPositionInScene(source)
        }

        //Automatic repositioning, the destination always after the source
        if(destination.object3D.position.x <= sourcePosition.x)
        {
          destination.object3D.position.set(
                sourcePosition.x + 2,
                sourcePosition.y,
                sourcePosition.z
              )
        }

        //creates the physical link between the two
        var newLink = createLink(source , destination);

        //adds link to the scene
        //when the source is a group start activity
        if(source.getAttribute('processor-type').endsWith('-start'))
        {
          //we determine the parent that should own the link
          let linkParent = determineLinkParent(source, destination)
          linkParent.appendChild(newLink)
        }
        //when the source is end-of-group, link is owned by box's parent
        else if(source.classList.contains('group-end')){
          source.parentNode.parentNode.appendChild(newLink) 
        }
        else
        {
          //for all other cases we default to the source's parent
          source.parentNode.appendChild(newLink);
        }

        return newLink
      }

      //Creates a sequence of linked activities (steps)
      function createChoiceBranch(expression, refStart, steps, axisY)
      {
        //collection of activities created:
        var branch = []

        setConfigSelector(refStart)

        let lastActivity;

        for(let i=0; i<steps.length; i++)
        {
          console.log("step: "+ steps[i].tagName)
          // if(steps[i].tagName == 'when')
          // {
          //   let steps = branch[i].children
          // }
          lastActivity = createActivityFromSource(steps[i].tagName, null, {definition: steps[i]})

          // lastActivity = createDirectActivity();


          lastActivity.setAttribute('group', true);
          // lastActivity.setAttribute('group-branch',i);



          // lastActivity = createDirect();

          //reposition 1st activity
          if(i==0)
          {
            lastActivity.object3D.position.set(
              refStart.object3D.position.x+2,
              axisY,
              lastActivity.object3D.position.z,
            )
          }

          //insertActivity(lastActivity)
          //linkActivities(refStart, lastActivity)
          //setConfigSelector(lastActivity)


          //add to collection
          branch.push(lastActivity);
        }

        //Add Choice expression
        createChoiceBranchExpression(expression, branch[0])
        
        //return lastActivity;
        //return last activity created
        return branch[branch.length-1]
      }

      function createChoiceBranchExpression(expression, activity)
      {
        //obtains the 3D link where the expression needs to be rendered
        let cylinder = getBackwardsLink(activity)

        //label containing expression
        let label;

        let text = createText();
        cylinder.appendChild(text);

        //when
        if(expression)
        {
          text.setAttribute('value', "when");
          text.setAttribute('position', {x: 0.32, y: 0.3, z: 0});
        }
        //otherwise
        else
        {
          text.setAttribute('value', "otherwise");
          text.setAttribute('position', {x: 0, y: 0.5, z: 0});
        }

        text.setAttribute('rotation', {x: 0, y: 0, z: -90});
        text.setAttribute('side', 'double');

        //This part only intended for <when> branches
        if(expression)
        {
          //Needed since A-FRAME v1.0.0
          // cylinder.setAttribute('class', 'interactive');
          cylinder.classList.add('interactive')
          cylinder.classList.add('configurable')

          //animation to suggest it's editable
          // cylinder.setAttribute('dragndrop', '');
          cylinder.setAttribute('clickable', '');
          cylinder.setAttribute('choice-expression', '')
          cylinder.setAttribute('animation', {startEvents:'mouseenter',pauseEvents:'mouseleave', property: 'scale', dir: 'alternate', dur: '500', to: '1.1 1.1 1.1', loop: 5});
          cylinder.setAttribute('animation__2', {startEvents:'mouseleave', property: 'scale', dur: '500', to: '1.0 1.0 1.0'}); 

          //label set to the expression value
          label = expression.textContent;

          text = createText();
          cylinder.appendChild(text);
          text.setAttribute('value', label);
          text.setAttribute('rotation', {x: 0, y: 0, z: -90});
          text.setAttribute('side', 'double');
          text.setAttribute('scale', '.7 .7 .7');
          text.setAttribute('align', 'center');
        }
      }

      //A link connects 2 ends
      //Its shape will consist on an invisible cylinder with a child visible line
      //This shape allows interaction not possible with the line alone.
      function createLink(src, dst, staticLink, handleRewires)
      {
        //if destination is boxed (follows a boxed source, except end of group)
        // if(isBoxed(src) && !src.id.endsWith('-end'))
        // {
        //   srcPos = src.object3D.position
        //   dstPos = dst.object3D.position
        // }
        // else
        // {
        //   srcPos = getPositionInScene(src);
        //   dstPos = getPositionInScene(dst);
        // }


        staticLink = staticLink || false;

        //flag to control whether or not 'createLink' takes care of the use case of
        //activities been injected between 2 others. Enabled by default.
        handleRewires = handleRewires || true;

        // console.log("createLink...");
        // printActivityLinks(src);
        // printActivityLinks(dst);

        //gather data to compose conditions
        if(handleRewires)
        {
          //handleForwardLinks(src, dst, srcPos, dstPos)
          handleForwardLinks(src, dst)
        }

        //Unique ID
        var linkId = getUniqueID("link");

        var link;

        if(staticLink)
        {
          link = getStaticLink(src, dst)
        }
        else
        {
          link = createEditableLink(src, dst)
        }

        //ID
        link.setAttribute('id', linkId);

        //Event listener needs this attribute
        link.setAttribute(linkId, '');

        //References
        link.setAttribute('source',      src.id);
        link.setAttribute('destination', dst.id);


                        //link.setAttribute('aabb-collider', "objects: .testsphere; debug: true");

        // //Visible line
        // var testline = document.createElement('a-entity');
        // cilinder.appendChild(testline);

        addLink(src, linkId);
        addLink(dst, linkId);

        return link;
      }


//this function does the following:
//   A is the.........'source'
//   B is the (to be) 'destination'
//   X is the activity to which A is currently attached to
//   L-1 connects A and X 
//                                  L-1
//   given these connections:  A ========> X
//   L-1 is rewired for B:     B ========> X
//
//this use case fits when creating new activities mid flow
function handleForwardLinks(src, dst, srcPos, dstPos)
{
  //detach from source its forward link
  let link = detachForwardLink(src);

  //if one was detached
  if(link)
  {
    //re-attach the link to the given destination
    attachSourceToLink(dst, link)
  }
}

//detaches the activity from its forward link and returns it
//returns null if no link forward was found
function detachForwardLink(activity)
{
  if(activity.localName == "a-box")
  {
    activity = activity.querySelector('[processor-type=multicast-end]')
  }

  //variable preparations
  let activityType = activity.getAttribute('processor-type')
  var forwardLink  = null;

  //We only look forward links for non-group starter activities
  if(activityType != 'choice-start' && activityType != 'multicast-start') //filters out groups
  {
    // forwardLink = getForwardLink(activity);
    forwardLink = getForwardLink(activity);
  }

  //obtain all link references the activity has
  let refLinks = JSON.parse(activity.getAttribute("links"));

  //if a forward link exists and is not a FROM activity
  if(  forwardLink )
    //&& refLinks                           //filters out FROM activities
    //&& refLinks.length > 1)               //filters out FROM activities with a connection
  {
    //we remove (detach) it from the activity
    refLinks.splice(refLinks.indexOf(forwardLink.id),1)[0];

    //we update the activity (with forward link stripped out)
    activity.setAttribute("links", JSON.stringify(refLinks));
  }

  return forwardLink;
}

//detaches the activity from its backwards link and returns it
//returns null if no link forward was found
// function detachBackwardsLink(activity)
function detachBackwardsLink(activity, link)
{
  if(activity.localName == "a-box")
  {
    activity = activity.querySelector('[processor-type=multicast-start]')
  }

  //variable preparations
  // let activityType = activity.getAttribute('processor-type')
  // var backwardsLink  = null;

  var backwardsLink  = link || getBackwardsLink(activity)

  //We only look forward links for non-group starter activities
  // if(!activityType.endsWith('-start')) //filters out groups
  // {
    // backwardsLink = getBackwardsLink(activity);
  // }

  //obtain all link references the activity has
  let refLinks = JSON.parse(activity.getAttribute("links"));

  //if a forward link exists and is not a FROM activity
  if( backwardsLink)
  {
    //we remove (detach) it from the activity
    refLinks.splice(refLinks.indexOf(backwardsLink.id),1)[0];

    //we update the activity (with forward link stripped out)
    activity.setAttribute("links", JSON.stringify(refLinks));
  }

  return backwardsLink;
}


//replaces the 'source' reference in the link provided with the given one
function attachSourceToLink(source, link)
{
  //obtain source position
  let srcPos = source.object3D.position;
  
  //we update the link 'source' reference to use the new given source
  link.setAttribute('source', source.id);
  link.setAttribute('srcPos', srcPos);

  //obtain destination activity
  let destination = document.getElementById(link.getAttribute('destination'))

  //we add the given link reference to the given source
  addLink(source, link.id);

  //redimension link after changes
  // resetLink(link, srcPos, getPositionInScene(destination));
  resetLink(link, getPositionInScene(source), getPositionInScene(destination));

  // console.log("after split...");
  // printActivityLinks(src);
  // printActivityLinks(dst);
}

//replaces the 'destination' reference in the link provided with the given one
function attachDestinationToLink(destination, link)
{
  //obtain source position
  // let srcPos = source.object3D.position;
  
  //we update the link 'destination' reference to use the new given source
  link.setAttribute('destination', destination.id);
  // link.setAttribute('srcPos', srcPos);

  //obtain source activity
  let source = document.getElementById(link.getAttribute('source'))

  //we add the given link reference to the given destination
  addLink(destination, link.id);

  //redraw link after changes
  resetLink(link, getPositionInScene(source), getPositionInScene(destination));
}


function deleteConfigActivity2()
{
  let toDelete = getActiveActivity();

  let next     = getNextActivity(toDelete);
  let previous = getPreviousActivity(toDelete);

  let toDeleteWasLastCreated = (toDelete.id == toDelete.parentNode.getAttribute("lastCreated"))

  //ignore command when:
  //   - previous is a group
  //   - previous is a FROM activity
  //TODO: these are to prevent glitches, to be fixed.
  if(   isGroup(previous)
    )//  || previous.hasAttribute('start'))
  {
    return;
  }

  if(next)
  {
    if(toDeleteWasLastCreated) //this check is needed to allow Camera Focus to have a target
    {
      toDelete.parentNode.setAttribute("lastCreated", next.id);
    }
    switchConfigPaneByActivity(next);
  }
  else
  {
    if(toDeleteWasLastCreated) //this check is needed to allow Camera Focus to have a target
    {
      toDelete.parentNode.setAttribute("lastCreated", previous.id);
    }
    switchConfigPaneByActivity(previous);
  }

  let linkBackwards = detachForwardLink(previous);
  let linkForward   = detachForwardLink(toDelete)

  if(linkForward)
  {
    attachSourceToLink(previous, linkForward);
  }

  toDelete.parentNode.removeChild(toDelete);
  linkBackwards.parentNode.removeChild(linkBackwards);

  syncEditor();
}


function deleteConfigActivity()
{
  let toDelete = getActiveActivity();

  //not allowed to delete multicast activities
  // if(isBoxed(toDelete))
  if(isMulticast(toDelete.parentNode))
  {
    return;
  }

  //get activity that follows
  let next = getNextActivity(toDelete);
  let previous = getPreviousActivity(toDelete)

  //not allowed to delete last activity in choice branch
  if(previous.getAttribute('processor-type') == 'choice-start' && next.getAttribute('processor-type') == 'choice-end')
  {
    return
  }

  let linkForward = null

  if(next)
  {
    if(next.getAttribute('processor-type') == 'choice-end')
    {
      linkForward = getForwardLink(toDelete)
    }

    // linkForward = detachBackwardsLink(next);    
    linkForward = detachBackwardsLink(next, linkForward);    
  }

  let linkBackwards = detachBackwardsLink(toDelete)

  //if there is an activity that follows
  if(next)
  {
      //we rewire
      attachDestinationToLink(next, linkBackwards);

      redrawLink(linkBackwards)
  }
  else
  {
    //otherwise delete link as well
    detachForwardLink(previous)
    // detachForwardLink(previous, linkBackwards)
    toDelete.parentNode.removeChild(linkBackwards)
  }

  if(linkForward)
  {
    toDelete.parentNode.removeChild(linkForward)
  }

  toDelete.parentNode.removeChild(toDelete)

  switchConfigPaneByActivity(previous);

  syncEditor();
}