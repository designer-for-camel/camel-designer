function createFrom(processorType)
{
  // give name/id
  var elementName = processorType+"-"+(++logId);
 
  //activity creation
  var from = document.createElement('a-sphere');


  // from.setAttribute('class', 'clickable');

  from.setAttribute(elementName,'');
  from.setAttribute('id', elementName);
  from.setAttribute('start', '');
  from.setAttribute('processor-type', processorType);
  from.setAttribute('material', {color: '#52F40C', transparent: true, opacity: 0.5});
// from.setAttribute('position', fromPos);

  from.setAttribute('radius', .5);
  from.setAttribute('pulse', '');
  from.setAttribute('animation', {
                                  startEvents:'mouseenter',
                                  pauseEvents:'mouseleave', 
                                  property: 'scale', 
                                  dir: 'alternate', 
                                  dur: '500', 
                                  to: '1.1 1.1 1.1', 
                                  loop: 1});
  from.setAttribute('animation__2', {
                                  startEvents:'mouseleave',
                                  property: 'scale',
                                  dur: '500',
                                  to: '1.0 1.0 1.0'});

  var text = document.createElement('a-text');
  from.appendChild(text);
  // text.setAttribute('value', 'Timer');
  text.setAttribute('value', processorType);


  
  text.setAttribute('color', '#f49b42');
  //text.setAttribute('material', {color: 'yellow'});
  //text.setAttribute('position', {x: -0.3, y: 0, z: 0});
  text.setAttribute('position', {x: -0.3, y: 0, z: 0});
  text.setAttribute('side', 'double');

  return from;
}

function createTimer()
{
  let timer = createFrom("timer");

  //create clock hands
  var minutes = document.createElement('a-triangle');
  minutes.setAttribute("vertex-a","0 .4 0")
  minutes.setAttribute("vertex-b","-.02 0 0")
  minutes.setAttribute("vertex-c",".02 0 0")
      // var animation = document.createElement('a-animation');
      // animation.setAttribute('rotation','');
      // animation.setAttribute('dur','20000');
      // animation.setAttribute('easing','linear');
      // animation.setAttribute('to','0 0 -360');
      // animation.setAttribute('repeat','indefinite');
      // minutes.appendChild(animation);

      //since A-Frame v1.0.0 it seems animations work as attributes, not as child nodes.
      minutes.setAttribute('animation', {property: 'rotation', dur: '20000', to: '0 0 -360', loop: true, easing: 'linear'});


  var hours = document.createElement('a-triangle');
  hours.setAttribute("vertex-a","0 .25 0")
  hours.setAttribute("vertex-b","-.02 0 0")
  hours.setAttribute("vertex-c",".02 0 0")
      // var animation = document.createElement('a-animation');
      // animation.setAttribute('rotation','');
      // animation.setAttribute('dur','240000');
      // animation.setAttribute('easing','linear');
      // animation.setAttribute('to','0 0 -360');
      // animation.setAttribute('repeat','indefinite');
      //hours.appendChild(animation);

      //since A-Frame v1.0.0 it seems animations work as attributes, not as child nodes.
      hours.setAttribute('animation', {property: 'rotation', dur: '240000', to: '0 0 -360', loop: true, easing: 'linear'});


  timer.appendChild(minutes);
  timer.appendChild(hours);

  goLive(timer);
}


function createDirectStart()
{
  let direct = createFrom("direct");

  goLive(direct);

  // callDirectEnabled = true;
}

      
// function createTo(processorType, givenPos, sources, scale, staticLink, parent)
function createTo(processorType, scale)
{
    scale = scale || {x: 1, y: 1, z: 1}

    enableFromButtons(true);

    var toID = processorType+"-"+(++logId);
  
    var opacity = 0.5;

    if(processorType == "direct")
    {
      opacity = 0.2;
    }


// //Solution for Creating Entities.
// var scene = document.getElementById(routes[0]);
// var nextPos = parseInt(scene.getAttribute("nextPos"));

// //obtain reference to attach (wire) to
// sources = sources || [ getActiveActivity() ];



            var to = document.createElement('a-sphere');

            configObj = to;


// var position;

// if(givenPos != null)
// {
//   position = givenPos;
// }
// else
// {
//   position = getNextSequencePosition(scene);
// }

            // scene.setAttribute("nextPos", nextPos+stepPos);

            //Needed since A-FRAME v1.0.0
            to.setAttribute('class', 'clickable');

            to.setAttribute('processor-type', processorType);
            to.setAttribute('id',toID);

        //is this necessary?    
        to.setAttribute(toID.toLowerCase(),'');

            to.setAttribute('material', {color: '#ACF5F5', transparent: true, opacity: opacity});

// //it seems setting attribute does ops async and may unsettle fast code execution
// //we use both settings (3D object and attribute) which seems works
// to.setAttribute('position', position);
// to.object3D.position.set(position.x, position.y, position.z);

        
            var animatedScale = {x: scale.x+.1, y: scale.y+.1, z: scale.z+.1};

            to.setAttribute('radius', .5);
            to.setAttribute('scale', scale);


            to.setAttribute('pulse', '');
            to.setAttribute('animation', {  startEvents:'mouseenter',
                                            pauseEvents:'mouseleave',
                                            property: 'scale',
                                            dir: 'alternate',
                                            dur: '500',
                                            to: animatedScale,
                                            loop: 5});
            to.setAttribute('animation__2',{
                                            startEvents:'mouseleave',
                                            property: 'scale',
                                            dur: '500',
                                            to: scale});


            if(processorType == "direct")
            {
              var disc = document.createElement('a-ring');
              to.appendChild(disc);
              disc.setAttribute('side', 'double');
              disc.setAttribute('src', '#routeThumbnail');
              disc.setAttribute('radius-inner', 0.00001);
              disc.setAttribute('radius-outer', 0.5);

              if(hintDirectPending)
              {
                createDirectHint(to);
              }
            }
            else if (processorType == "log")
            {
              var text = document.createElement('a-text');
              to.appendChild(text);
              text.setAttribute('value', toID);
              text.setAttribute('color', 'white');
              // text.setAttribute('position', {x: -0.3, y: 0, z: 0});
              text.setAttribute('align', 'center');
              text.setAttribute('side', 'double');

              let defaultMessage = "demo trace "+logId;

              let label = document.createElement('a-text');
              // to.firstChild.appendChild(label);
              text.appendChild(label);
              // to.appendChild(label);
              label.setAttribute('value', '"'+defaultMessage+'"');
              label.setAttribute('color', 'white');
              label.setAttribute('align', 'center');
              // label.setAttribute('position', {x: -.035*(defaultMessage.length), y: -.7, z: 0});
              label.setAttribute('position', {x: 0, y: -.7, z: 0});
              label.setAttribute('side', 'double');
            }

          // goLiveTo(to);

          return to;
      }



function createLog()
{
  let log = createTo('log');

  goLive(log);

}

function createProperty()
{
  createNameValuePair('property');
}

function createHeader()
{
  createNameValuePair('header');
}

function createNameValuePair(setterType)
{
  let activity = createTo(setterType);

  var text = document.createElement('a-text');
  activity.appendChild(text);
  text.setAttribute('value', setterType);
  text.setAttribute('color', 'white');
  text.setAttribute('align', 'center');
  text.setAttribute('side', 'double');

  //defaults
  let defaultName = "name";
  let defaultValue = "dummy";

  //label for field name
  let label = document.createElement('a-text');
  text.appendChild(label);
  label.setAttribute('value', defaultName+':');
  label.setAttribute('color', 'grey');
  label.setAttribute('align', 'center');
  label.setAttribute('position', {x: 0, y: -.7, z: 0});
  label.setAttribute('side', 'double');

  //label for field value
  label = document.createElement('a-text');
  text.appendChild(label);
  label.setAttribute('value', '"'+defaultValue+'"');
  label.setAttribute('color', 'white');
  label.setAttribute('align', 'center');
  label.setAttribute('position', {x: 0, y: -1, z: 0});
  label.setAttribute('side', 'double');

  goLive(activity);
}


function createBody()
{
  let activity = createTo('body');

  //this is the label inside the geometry (activity descriptor)
  var text = document.createElement('a-text');
  activity.appendChild(text);
  text.setAttribute('value', 'body');
  text.setAttribute('color', 'white');
  text.setAttribute('align', 'center');
  text.setAttribute('side', 'double');

  //defaults
  let defaultValue = "hello world";

  //label to display the value set for the activity
  let label = document.createElement('a-text');
  text.appendChild(label);
  label.setAttribute('value', '"'+defaultValue+'"');
  label.setAttribute('color', 'white');
  label.setAttribute('align', 'center');
  label.setAttribute('position', {x: 0, y: -.7, z: 0});
  label.setAttribute('side', 'double');

  goLive(activity);
}

      // function directCreate()
      function createDirect(givenPos, activities, scale, staticLink, parent)//, sources)
      {
          // sources = sources || null;   

          //create activity
          if(givenPos != null)
          {  
            // configObj = createTo("direct", givenPos, activities, scale, staticLink, parent);
            configObj = createTo("direct", scale);//, sources);
          }
          else 
          {  
            // configObj = createTo("direct", null, activities, scale, staticLink, parent);
            configObj = createTo("direct", scale);
          }
          //obtain dialog
          var element = document.getElementById("newDirect");

          //make visible
          // element.style.visibility = "visible";

          //obtain list
          // var list = element.getElementsByTagName("datalist")[0];
          var list = element.getElementsByTagName("select")[0];

reloadRoutes(list)

          if(routes.length > 1)
          {
            list.value = routes[1];
          }
          else
          {
            list.value = routes[0];
          }


          var text = document.createElement('a-text');
          configObj.appendChild(text);
        //}

        //display new value
        text.setAttribute('id', 'routeLabel');
        text.setAttribute('value', list.value);
        text.setAttribute('color', 'white');
        text.setAttribute('align', 'center');
        // text.setAttribute('position', {x: -.035*(list.value.length), y: -.7, z: 0});
        text.setAttribute('position', {x: 0, y: -.7, z: 0});
        text.setAttribute('side', 'double');

          // element.getElementsByTagName("input")[0].focus();
          // element.getElementsByTagName("input")[0].click();

          // var event = new MouseEvent('mousedown');
// element.getElementsByTagName("input")[0].dispatchEvent(event);
      //    directConfig();

        // goLiveTo(configObj);
        goLive(configObj, givenPos, activities, scale, staticLink, parent);

        return configObj;
      }




// Includes the activities into the scene
function goLive(activity, givenPos, sources, scale, staticLink, parent, handleRewires)
{
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
  switchConfigPaneByActivity(activity);

  syncEditor();
}

//Updates VSCode editor with the changes
function syncEditor()
{
  //only when it runs in VSCode
  if ( top !== self ) { // we are in the iframe
    if(syncEditorEnabled) {
      getCamelSource();
    }
  }
}


function goLiveFrom(from)
{
  var scene = document.getElementById(routes[0]);

  //get all FROM activities (using XPATH expression)
  var fromList = scene.querySelectorAll("a-sphere[start]");
  var numFroms = fromList.length;

  //Hack to position new FROM activities vertically
  var fromPos = {x: startActivityPos, y: 0-numFroms, z: 0};
  from.setAttribute('position', fromPos);

  //when first FROM activity is created no links exist
  //FROM button is disabled until first TO gets created and links exist
  //this prevents a confusing scenario and buggy behaviour
  if(numFroms == 0)
  {
    enableFromButtons(false);
  }

  // Multiple start activities are allowed
  // First TO element needs to connect to all FROMs
  if(numFroms != 0)
  {
    // var srcPos = document.querySelector('#activity').getAttribute('position');
    // console.log("test pos 1: "+position.x);
    // var srcPos = lastCreated.getAttribute('position');
    var preFrom = fromList[fromList.length-1];
    var linkIds = JSON.parse(preFrom.getAttribute("links"));
    var link = scene.querySelector("#"+linkIds[0]);
    var toId = link.getAttribute('destination');
    var to = scene.querySelector("#"+toId);
    var toPos = to.getAttribute('position');

    scene.appendChild(createLink(from, to, fromPos, toPos));//, srcPos, position));
  }

  scene.setAttribute("lastCreated", from.id);
  scene.appendChild(from);
  configObj = from;
}


// function createTo(processorType, givenPos, sources, scale, staticLink, parent)
// function goLiveTo(to)
function goLiveTo(to, givenPos, sources, staticLink, parent, handleRewires)
{
  // parent.appendChild(to);

  // switchConfigPaneByActivity(to);


  let processorType = to.getAttribute('processor-type');

  //Solution for Creating Entities.
  var scene = document.getElementById(routes[0]);

  //obtain reference to attach (wire) to
  sources = sources || [ getActiveActivity() ];

  //scene as default parent if not given
  parent = parent || scene;



  var position;

  if(givenPos != null)
  {
    position = givenPos;
  }
  else
  {
    position = getNextSequencePosition(scene);
  }


  //it seems setting attribute does ops async and may unsettle fast code execution
  //we use both settings (3D object and attribute) which seems works
  to.setAttribute('position', position);
  to.object3D.position.set(position.x, position.y, position.z);


  parent.appendChild(to);

  // switchConfigPaneByActivity(to);

  // forEach
  sources.forEach(item => {

// console.log("creating link for: "+to.id)
// console.log("source: "+item.id)

      var srcPos = item.getAttribute('position');
      // var srcPos = {x: item.object3D.position.x,
      //               y: item.object3D.position.y, 
      //               z: item.object3D.position.z }
      // item.object3D.position;

      // hack/HACK for issue/problem with async position settings
      // at the time of creating links, it seems there on-the-fly positions still unset/refreshed
      // this causes the source position to contain a misleading coordinate that gets updated too late
      // to solve this we hardcode to known value 
      if(item.getAttribute("processor-type") == "multicast-start")
      {
        srcPos = {x: -1,y: 0, z: 0}

          // posParent = item.parentNode.getAttribute('position');

          //   srcPos = { x: posParent.x-1,
          //              y: posParent.y, 
          //              z: 0};


      }

      // if(processorType == "multicast-end")
      // if(item.getAttribute("processor-type") == "multicast-end")
      // if(parent == null && item.getAttribute("processor-type") == "multicast-end")
      if(item.getAttribute("processor-type") == "multicast-end")
      {
        // if(parent != null)
          // position = {x: 1,y: 0, z: 0}
          let posParent = item.parentNode.getAttribute('position');

            srcPos = { x: posParent.x+1,
                       y: posParent.y, 
                       z: 0};
      }

    // console.log("srcPos")
    // console.log(srcPos)
    // console.log("position")
    // console.log(position)

    var link;

    if(processorType == 'multicast-start')
    {
        // // let posParent = parent.getAttribute('position');
        // let posParent = parent.components.position.attrValue;


        // let boxStartPos = { x: posParent.x-1,
        //                     y: posParent.y, 
        //                     z: 0};

        let posInScene = getPositionInScene(to);
                            

      link = createLink(item, to, srcPos, posInScene, staticLink, handleRewires);

    }
    else
    {
      // var link = createLink(item, to, srcPos, position, staticLink);
      link = createLink(item, to, srcPos, position, staticLink, handleRewires);
    }



      if(parent == null || processorType == "multicast-start")
      { // || processorType == "multicast-start")
        scene.appendChild(link);//, srcPos, position));
      }
      else
      {
        parent.appendChild(link);
      }


  }); // END FOR


  // parent.appendChild(to);

  switchConfigPaneByActivity(to);

  scene.setAttribute("lastCreated", to.id);
}



      //returns Start activity, or box if 'boxed'
      function createGroup(groupName, boxed, labelStart, labelEnd)
      {
        var numActivities = 2;
        var activities = [];
        var scale = {x: .5, y: .5, z: .5};

        if(!boxed)
        {
          scale = null;
        }

        var typeStart = groupName + "-start";
        var typeEnd   = groupName + "-end";

        var scene = document.getElementById(routes[0]);

        var box = null;

if(boxed)
{
        box = document.createElement('a-box')

        //Needed since A-FRAME v1.0.0
        box.setAttribute('class', 'clickable');

        // rootActivity.appendChild(box);
        box.setAttribute('id', "multicast-box")
        box.setAttribute('opacity', .1)
        box.setAttribute('transparent', true)
        // box.setAttribute('position', {x: 2, y: 1, z: -0.5})
        // box.setAttribute('position', getNextSequencePosition(scene, 1, true))
        box.setAttribute('position', getNextSequencePosition(scene, 1, false))
        // box.setAttribute('position', {x: parseInt(scene.getAttribute("nextPos"))+1, y: 0, z: 0,})

        box.setAttribute('height', numActivities)
        box.setAttribute('width', 2)
        box.setAttribute('depth', 0.00001)
        // box.setAttribute('scale', scale)
        box.setAttribute('pulse', '')


        var text = document.createElement('a-text');
        box.appendChild(text);
        text.setAttribute('value', "parallel  execution\n(camel multicast)");
        text.setAttribute('color', 'grey');
        text.setAttribute('position', {x: -.85, y: -numActivities/2-.3, z: 0});
        text.setAttribute('side', 'double');


        scene.appendChild(box);
}

      //get reference of activity to attach to.
      // sources = [ getActiveActivity() ];
      source = getActiveActivity();



//we keep referece.
let sourceFwdLink = detachForwardLink(source)

      //function createTo(processorType, scale)
        let rootActivity = createTo( 
                              typeStart,
                              scale);

        let rootPos;

        if(boxed)
        {
          rootPos = {x: -1, y: 0, z: 0};
        }
        else
        {
          // rootPos = getNextSequencePosition(scene, 0, true);
          rootPos = getNextSequencePosition(scene, 0, false);
        }


        // goLive(rootActivity, rootPos, null, scale, boxed, box);
        goLive( rootActivity,
                rootPos,
                // null,  //sources to connect the activity, here null (automatic)
                [source],  //sources to connect the activity, here null (automatic)
                scale,
                null, //staticLink. Null in this case defaults to not-static.
                box)//,
                // handleRewires); //we disable rewiring of links, for groups we handle manually.
                //false); //we disable rewiring of links, for groups we handle manually.


        // var scene = rootActivity.parentNode;


        // box.appendChild(rootActivity);
        // box.pause();

        // box.parentNode.setAttribute('raycaster', 'recursive: false');
        // box.setAttribute('')
        // box.setAttribute('', 3)


        for(let i=1; i<=numActivities; i++)
        {
          activities.push(createDirect(
                getNextParallelPosition(scene,i,numActivities,0, boxed),
                [rootActivity],
                scale, 
                // null, 
                boxed,
                box)); //parent entity

          //force connections to root activity except last iteration
          //(so that sub-sequent activities connect to closing activity)
          if(i != numActivities)
          {
              scene.setAttribute("lastCreated", rootActivity.id);
          }
        }

let posClosing;

if(boxed)
{
  posClosing = {x: 1, y: 0, z: 0};
}
else
{
  // posClosing = { x: rootActivity.getAttribute('position').x + 4,
  posClosing = { x: rootPos.x + 4,
                 y: rootPos.y, 
                 z: 0};


}


        var closeActivity = createTo(
                typeEnd,
                scale);

        //closeActivity.setAttribute('position', {x: 1, y: 0, z: 0})//.y = 0;


        var text = document.createElement('a-text');
        rootActivity.appendChild(text);
        text.setAttribute('value', labelStart);
        text.setAttribute('color', 'white');
        text.setAttribute('position', {x: -.06*(labelStart.length), y: 0, z: 0}); //centers lable based on length
        text.setAttribute('side', 'double');

        text = document.createElement('a-text');
        closeActivity.appendChild(text);
        text.setAttribute('value', labelEnd);
        text.setAttribute('color', 'white');
        text.setAttribute('position', {x: -.06*(labelEnd.length), y: 0, z: 0}); //centers lable based on length
        text.setAttribute('side', 'double');

        goLive(closeActivity, posClosing, activities, scale, boxed, box);


        //only when a forward link existed, we attach it to the end of the group
        if(sourceFwdLink)
        {
          attachSourceToLink(closeActivity, sourceFwdLink);
        }

        if(boxed)
        {
          box.setAttribute('group-start', rootActivity.id);
          box.setAttribute('group-end',   closeActivity.id);
        }

        scene.setAttribute('lastCreated', closeActivity.id);

        if(boxed)
        {
          return box;
        }
        else
        {
          return rootActivity;
        }
      }

      function createMulticast()
      {
        //we're about to create multiple activities, so we stop streaming updates until we're done
        syncEditorEnabled = false;

        createGroup("multicast", true, "fork", "merge");

        //now we're done, we switch back on, and we sync.
        syncEditorEnabled = true;
        syncEditor();
      }

      function createChoice()
      {
        //we're about to create multiple activities, so we stop streaming updates until we're done
        syncEditorEnabled = false;

        let start = createGroup("choice", false, "choice", "end");

        //update links to show correct condition labels
        var links = JSON.parse(start.getAttribute("links"));
        let otherwise = document.getElementById(links[links.length-1]);
        labels = otherwise.getElementsByTagName('a-text');
        labels[0].setAttribute('value','otherwise');
        labels[0].setAttribute('position','0 .5 0');
        otherwise.removeChild(labels[1]);
        otherwise.setAttribute('class', 'non-clickable');

        //now we're done, we switch back on, and we sync.
        syncEditorEnabled = true;
        syncEditor();
      }




      //A link connects 2 ends
      //Its shape will consist on an invisible cylinder with a child visible line
      //This shape allows interaction not possible with the line alone.
      function createLink(src, dst, srcPos, dstPos, staticLink, handleRewires)
      {
        staticLink = staticLink || false;

        //flag to control whether or not 'createLink' takes care of the use case of
        //activities been injected between 2 others. Enabled by default.
        handleRewires = handleRewires || true;

// var radius = .2;
// // var opacity = 0.2;
// var opacity = 0;

          console.log("createLink...");
          printActivityLinks(src);
          printActivityLinks(dst);

        //gather data to compose conditions
        if(handleRewires)
        {
          handleForwardLinks(src, dst, srcPos, dstPos)
        }


        //there seems to be an issue/bug in version 0.8.0 related to 'get position'
        //for now, we take them as parameters IN
        // var srcPos = src.getAttribute('position');
        // var dstPos = dst.getAttribute('position');

        // //helpers
        // var linkId = ("link-"+src.id+"-"+dst.id).toLowerCase();
        var linkId = "link-"+(linkCounter++);

// //create shape cylinder
// var cilinder = document.createElement('a-cylinder');

// //3D properties
// cilinder.setAttribute('material','opacity: '+opacity);
// cilinder.setAttribute('radius',radius);

        var link;

        if(staticLink)
        {
          link = getStaticLink(src, dst, srcPos, dstPos)
        }
        else
        {
          link = getEditableLink(src, dst, srcPos, dstPos)
        }
        // var link = getEditableLink(src, dst, srcPos, dstPos)
        // var link = getStaticLink(src, dst, srcPos, dstPos)

        //ID
        // cilinder.setAttribute('id', linkId);
        link.setAttribute('id', linkId);


// cilinder.setAttribute('pulse', '');
// cilinder.setAttribute('animation', {startEvents:'mouseenter',pauseEvents:'mouseleave', property: 'scale', dir: 'alternate', dur: '500', to: '1.1 1.1 1.1', loop: 5});
// cilinder.setAttribute('animation__2', {startEvents:'mouseleave', property: 'scale', dur: '500', to: '1.0 1.0 1.0'});



        //Event listener needs this attribute
        link.setAttribute(linkId, '');

        //References
        link.setAttribute('source',      src.id);
        link.setAttribute('destination', dst.id);

        //Connected activities coordinates
        link.setAttribute('srcPos', srcPos);
        link.setAttribute('dstPos', dstPos);

// //Visible line
// var testline = document.createElement('a-entity');
// cilinder.appendChild(testline);


        addLink(src, linkId);
        addLink(dst, linkId);

        return link;
      }


//this function does the following:
//   A is the 'source'
//   B is the 'destination'
//   X is a previous existing activity
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
    // temp hack to move upwards new activity
    dstPos.y += 2; 

    //re-attach the link to the given destination
    attachSourceToLink(dst, link)
  }
}

//detaches the activity from its forward link and returns it
//returns null if no link forward was found
function detachForwardLink(activity)
{
  //variable preparations
  let activityType = activity.getAttribute('processor-type')
  var forwardLink  = null;

  //We only look forward links for non-group starter activities
  if(!activityType.endsWith('-start')) //filters out groups
  {
    forwardLink = getForwardLink(activity);
  }

  //obtain all link references the activity has
  let refLinks = JSON.parse(activity.getAttribute("links"));

  //if a forward link exists and is not a FROM activity
  if(  forwardLink
    && refLinks                           //filters out FROM activities
    && refLinks.length > 1)               //filters out FROM activities with a connection
  {
    //we remove (detach) it from the activity
    refLinks.splice(refLinks.indexOf(forwardLink.id),1)[0];

    //we update the activity (with forward link stripped out)
    activity.setAttribute("links", JSON.stringify(refLinks));
  }

  return forwardLink;
}


//replaces the 'source' reference in the link provided with the given one
function attachSourceToLink(source, link)
{

// dstPos.y += 2; 

  //obtain source position
  let srcPos = source.components.position.attrValue;;

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



function deleteConfigActivity()
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
     || previous.hasAttribute('start'))
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