      //Switch to stream edit updates
      var syncEditorEnabled = true;
      var syncStartUpEnabled = false;
      
      //Camera default position in axis
      var cameraY = 0;
      var cameraZ = 7;

      // var routes = ["route1", "route2"];
      var routes = ["route1"];
      // var routes = [];
      var routeNum = 1;

      var startActivityPos = -5;
      var stepPos = 2;
      //var sceneFlag = false;
      var setGreen = false;
      
      //counter to generate new Unique IDs
      var uidCounter = 0;
      //deprecated: var logId = 0;
      //deprecated: var linkCounter = 0;
      
      var moving = false;
      var movingObj = null;
      var movingObjX = null;
      var movingObjY = null;
      var event1X = null;
      var event1Y = null;

      // var lastCreated = null;
      var configObj = null;

      var currentConfigPane = "introconfig";

      var timestampFirstClick = Date.now();

      var hintDirectPending = true; 
      // var hintDirectPending = false; 

      var flagTestEnabled = false;


      //THIS BLOCK OF VARIABLES are meant for Camelv2/Camelv3 handling
      var CAMEL_ATTRIBUTE_HEADER_NAME;
      var CAMEL_ATTRIBUTE_PROPERTY_NAME;

      //Sets Camel v2 values
      function setCamelVersion2()
      {
        CAMEL_ATTRIBUTE_HEADER_NAME   = "headerName";
        CAMEL_ATTRIBUTE_PROPERTY_NAME = "propertyName";
      }

      //Sets Camel v3 values
      function setCamelVersion3()
      {
        CAMEL_ATTRIBUTE_HEADER_NAME   = "name";
        CAMEL_ATTRIBUTE_PROPERTY_NAME = "name";
      }

      // var callDirectEnabled = false;

        // Handle the message inside the webview
        window.addEventListener('message', event => {

          const message = event.data; // The JSON data our extension sent

          switch (message.command) {
              case 'setFocus':
                  console.log("got focus command"+ message.id);
                  let activity = document.getElementById(message.id);

                  //let isRest = activity.getAttribute("processor-type").startsWith("rest");
                  let isRest = isRestElement(activity);

                  //if(tag == "rest" || tag == "get" || tag == "post" || tag == "put" || tag == "delete")
                  if(isRest) {
                    viewRestDefinitions();
                    selectRestActivity(activity);
                    break;
                  }
                  else {
                    viewRouteDefinitions();
                  }
                  // setCameraFocus(activity);
                  //setConfigSelector(activity);
                  switchConfigPaneByActivity(activity);
                  break;
              case 'importCamelDefinition':
                  console.log("got source code: "+ message.source);
                  syncStartUpEnabled = true;
                  loadSourceCode(message.source);
                  loadMetadata(message.metadata);
                  syncStartUpEnabled = false;
                  //syncEditor();
                  break;
          }
        });


      //needs revision
      addPulse('whatever');
                 

      function enableToButtons(enabled)
      {
          let opacity;

          if(enabled)
          {
            opacity = .5;
          }
          else
          {
            opacity = .2;
          }

          //UX buttons for consumers are disabled to start with
          //When first 'from' activity is created, we enable consumer buttons
          var element = document.getElementsByClassName("consumer");
          for(let i=0; i<element.length; i++) {
            element[i].style.opacity = opacity;
            element[i].firstChild.disabled = !enabled;
          }

          //UX buttons for consumers are disabled to start with
          //When first 'from' activity is created, we enable consumer buttons
          var element = document.getElementsByClassName("setter");
          for(let i=0; i<element.length; i++) {
            element[i].style.opacity = opacity;
            element[i].firstChild.disabled = !enabled;
          }

          // enableCallDirect(callDirectEnabled);
      }

      function enableFromButtons(enabled)
      {
          let opacity;

          if(enabled)
          {
            opacity = .5;
          }
          else
          {
            opacity = .2;
          }

          //UX buttons for consumers are disabled to start with
          //When first 'from' activity is created, we enable consumer buttons
          var element = document.getElementsByClassName("producer");
          for(let i=0; i<element.length; i++) {
            element[i].style.opacity = opacity;
            element[i].firstChild.disabled = !enabled;
          }
      
      }

      function enableRestButtons(enabled)
      {
          let opacity;

          if(enabled)
          {
            opacity = .5;
          }
          else
          {
            opacity = .2;
          }

          let restIsEmpty = (document.getElementById('rest-definitions').children.length == 0)

          //toggles buttons ON/OFF
          var element = document.getElementsByClassName("rest");
          for(let i=0; i<element.length; i++) {
            
            //Mechanism to keep REST methods disable until a REST group has been created.
            //(i=0 is the label, i=1 is the group button, i>1 are the methood buttons)
            if(restIsEmpty && i>1)
            {
              break;
            }

            element[i].style.opacity = opacity;
            element[i].firstChild.disabled = !enabled && !restIsEmpty;
          }
      }

      function enableCallDirect(enabled)
      {
          let opacity;

          if(enabled)
          {
            opacity = .5;
          }
          else
          {
            opacity = .2;
          }

          var element = document.getElementsByClassName("direct")[0];

          element.style.opacity = opacity;
          element.firstChild.disabled = !enabled;
      }



      function tests()
      {
        // console.log("initiating testcollidable")

        // entity = document.getElementById('testsphere');
        // entity.setAttribute('testcollidable','');
        // entity.setAttribute('class', 'clickable');

        // document.querySelector('a-scene');


        // var scene = document.getElementById(routes[0]);
        // var mys = document.createElement('a-sphere');
        // mys.setAttribute('material', {color: '#52F40C', transparent: true, opacity: 0.5});
        // scene.appendChild(mys);

        // var text = document.createElement('a-text');
        // // var text = document.createElement('a-entity');
        // // text.setAttribute('text', "value: test; height: 10");
        // // text.setAttribute('primitive', "a-text");
        // text.setAttribute('value', "test");
        // // text.text = "color: white; align: center; value: Animating color; width: 1.5";
        // mys.appendChild(text);
        // mys.appendChild(text);

        // var camera = document.getElementById("main-camera");
        // camera.setAttribute('animation', {property: 'position', dur: '2500', to: {x: 0, y: 0, z: 10}, loop: false});
      }


      function init()
      {
        tests();
        setCamelVersion3();
        initPanes();
        resetCameraToDefault();
        initCamelGenerator();

        // initCameraFocus();
        // addDebugGrid();
        importSourceCode();
      }

      //intended to be invoked to VS-code at start-up time
      function importSourceCode()
      {
        //was
        //when it runs in VSCode
        // if ( top !== self ) { // we are in the iframe
        //   vscode.postMessage({
        //       command: 'importCamelDefinition'
        //   })
        // }
        vscodePostMessage('importCamelDefinition');
      }

      function resetCameraToDefault()
      {
        var camera = document.getElementById("main-camera");
        
        // camera.setAttribute("position", "0 0 7");

        //Since A-Frame v1.0.0 the camera angle seems different, so we have adjusted
        // let cameraPosition = {x: 0, y: cameraY, z: cameraZ};
        camera.setAttribute("position", {x: 0, y: cameraY, z: cameraZ});
        // camera.setAttribute("position", "0 "+cameraY+" "+cameraZ);
      }

      function newRoute(routeId)
      {
        initPanes();

        //was
        //var routeId = "route"+(++routeNum);
        routeNum++;
        routeId = routeId || "route"+routeNum;

        // var scene = document.querySelector('a-scene');
        var scene = document.getElementById('route-definitions');
        var newRoute = document.createElement('a-entity');
        newRoute.setAttribute('class','not-clickable');
        newRoute.setAttribute('id', routeId);
        newRoute.setAttribute('route', '');
        newRoute.setAttribute('position','0 0 0');
        scene.appendChild(newRoute);

          //we add new route in position 2 (index 1) deactivated.
          routes.splice(1,0,routeId);

          //switching to next route will select the new route 
          nextRoute(routeId);
      }

      function initPanes()
      {
          //enableToButtons(true);
          enableFromButtons(true);
          enableToButtons(false);
          // var element = document.getElementById("newDirect");
          // var routeSelected = element.getElementsByTagName("input")[0].value;

          // var element = document.getElementsByClassName("consumer");
          // for(let i=0; i<element.length; i++) {
          //   element[i].style.opacity = .2;
          //   element[i].firstChild.disabled = true;
          // }

          switchConfigPane("introconfig");

          document.getElementsByTagName("routenav")[1].innerHTML = routes[0];
      }

      function viewRestDefinitions()
      {
          enableFromButtons(false);
          enableToButtons(false);
          enableRestButtons(true);

          document.getElementById(routes[0]).setAttribute('visible', false)
          document.getElementById(routes[0]).setAttribute('class', 'not-clickable')
          document.getElementById(routes[0]).setAttribute('position','0 100 0');


          document.getElementById('rest-definitions').setAttribute('visible', true)
          document.getElementById('rest-definitions').setAttribute('class', 'clickable')
          document.getElementById('rest-definitions').setAttribute('position','0 0 0');

          switchConfigPane("introconfig");

          setCameraFocus(getSelectedRestGroup());
          //document.getElementsByTagName("routenav")[1].innerHTML = routes[0];
      }

      //obtains the current Route being worked on
      function getSelectedRoute()
      {
        return document.getElementById(routes[0]);
      }

      //returns true if the route has no activities
      function isRouteEmpty(route)
      {
        return (route.children.length == 0);
      }

      //Switch to the Route Designer view
      function viewRouteDefinitions()
      {
        //only activate FROM buttons if 'start' is missing
        var activeRoute = getSelectedRoute();
        var isFromMissing = (0 == activeRoute.querySelectorAll("a-sphere[start]").length);
        enableFromButtons(isFromMissing);
        
        //other buttons
        enableToButtons(!isRouteEmpty(activeRoute));
        enableRestButtons(false);

        //show Routes definitions
        document.getElementById(routes[0]).setAttribute('visible', true)
        document.getElementById(routes[0]).setAttribute('class', 'clickable')
        document.getElementById(routes[0]).setAttribute('position','0 000 0');

        //hide REST definitions
        document.getElementById('rest-definitions').setAttribute('visible', false)
        document.getElementById('rest-definitions').setAttribute('class', 'not-clickable')
        document.getElementById('rest-definitions').setAttribute('position','0 100 0');
      }

      //Updates the activity with the configuration settings
      function submitLogConfig()
      {
        //obtain user input
        var element = document.getElementById("loginput");
        var logText = element.getElementsByTagName("input")[0].value;

        var text = configObj.getElementsByTagName("a-text")[0].firstChild;

        //display new value
        text.setAttribute('value', '"'+logText+'"');
      }

      //Updates the activity with the configuration settings
      function submitConfigNameValuePair()
      {
        //obtain user input
        var element = document.getElementById("name-value-pair");
        var fieldName = element.getElementsByTagName("input")[0].value;
        var fieldValue = element.getElementsByTagName("input")[1].value;

        var textName = configObj.getElementsByTagName("a-text")[0].firstChild;
        var textValue = configObj.getElementsByTagName("a-text")[0].lastChild;

        //display new value
        textName.setAttribute('value', fieldName+':');
        textValue.setAttribute('value', '"'+fieldValue+'"');
      }

      //Updates the activity with the configuration settings
      function submitConfigBody()
      {
        //obtain user input
        var element = document.getElementById("set-body");
        var body = element.getElementsByTagName("input")[0].value;

        //obtain activity label
        var text = configObj.getElementsByTagName("a-text")[0].firstChild;

        //display new value
        text.setAttribute('value', '"'+body+'"');
      }

      //Updates the activity with the configuration settings
      function submitConfigChoice()
      {
        //obtain user input
        var element = document.getElementById("config-choice-when");
        var condition = element.getElementsByTagName("input")[0].value;

        //obtain activity label
        var text = configObj.getElementsByTagName("a-text")[1];

        //display new value
        text.setAttribute('value', condition);
      }

      function nextRoute(routeId)
      {
        //viewRouteDefinitions();
        //if not given, we rotate the list from the end (so that it starts from first)
        routeId = routeId || routes[routes.length-1];

              // console.log("Routes content: ");

              // routes.forEach(item => {
              //   console.log(item);
              // });

              // console.log("got label: "+routeId);
              // console.log("before: "+ routes[0]);

        document.getElementById(routes[0]).setAttribute('visible', false)
        document.getElementById(routes[0]).setAttribute('class', 'not-clickable')
        document.getElementById(routes[0]).setAttribute('position','0 100 0');

        //document.getElementById(routes[0]).classList.toggle('clickable');

              // console.log("index of: "+ routes.indexOf(routeId));
              // console.log("index of route[0]: "+ routes.indexOf(routes[0]));
              // console.log("routes.length: "+ routes.length);

        var tempRoute =  routes.splice(routes.indexOf(routeId),1);
        routes.unshift(tempRoute[0]);

              // console.log("tempRoute: "+ tempRoute);
              // console.log("routes[0]: "+ routes[0]);
              // console.log("routes.length: "+ routes.length);

        document.getElementById(routes[0]).setAttribute('visible', true)
        document.getElementById(routes[0]).setAttribute('class', 'clickable')
        document.getElementById(routes[0]).setAttribute('position','0 000 0');



// showAll()
        document.getElementsByTagName("routenav")[1].innerHTML = routes[0];


  var defaultActivity = document.getElementById(routes[0]).getAttribute("lastCreated");

// scene.setAttribute("lastCreated", to.id);
// setConfigSelector(activity);

        switchConfigPaneByActivity(document.getElementById(defaultActivity));
        // resetCameraToDefault();
        
        //was
        //setCameraFocus(document.getElementById(defaultActivity), true);
        viewRouteDefinitions();

      }

      function triggerRouteSwitch(activity)
      {
        // reference to camera
        var camera = document.getElementById("main-camera");

        //add listener for animation end
        camera.addEventListener('animationcomplete', function cleaner() {

          //delete listener
          this.removeEventListener('animationcomplete', cleaner);

          //delete animation
          this.removeAttribute('animation');

          //we change position of camera from low Y-coordinate to high Y-coordinate
          //this will give the impression target Route will come from bottom when focus is set
          //was
          // camera.setAttribute("position", {
          //     x: camera.components.position.data.x,
          //     y: 10, 
          //     z: camera.components.position.data.z
          // });
          camera.object3D.position.set(
            camera.object3D.position.x,
            10, 
            camera.object3D.position.z
          );

          //switch route
          nextRoute(getActivityRoute(activity).id);
        });

        //we give impression current Route disappears upwards by giving camera low Y-coordinate
        let target = {
            x: camera.object3D.position.x,
            y: -10, 
            z: camera.object3D.position.z}

        //animation starts from this moment
        camera.setAttribute('animation', {property: 'position', dur: '500', to: target, loop: false});
      }


      function reloadRoutes(list)
      {
          //clean list
          while (list.firstChild) {
            list.removeChild(list.firstChild);
          }

          //populate default option
          let option;// = document.createElement('option');
          // option.value = "[new Route]";   
          // option.innerHTML = item;   
          // list.appendChild(option);

    // var iterator = document.evaluate('//a-entity[@id="'+routeId+'"]//a-sphere[@start and @processor-type = "direct-s"]', document, null, XPathResult.ANY_TYPE, null);
    let directs = document.evaluate('//a-sphere[@start and @processor-type = "direct"]', document, null, XPathResult.ANY_TYPE, null);

    let thisNode = directs.iterateNext();
    let allDirects = [];

          while(thisNode) {
            allDirects.push(thisNode.parentNode.id);
            thisNode = directs.iterateNext();
          };

          // while(thisNode) {
          allDirects.forEach(item => {

            option = document.createElement('option');
            option.value = item;
            option.innerHTML = item;   
            list.appendChild(option);

          });

          // //populate available routes
          // routes.forEach(item => {
          //   option = document.createElement('option');
          //   option.value = item;
          //   option.innerHTML = item;   
          //   list.appendChild(option);
          // });
      }





      // TODO clean this, and give function a good name
      //THIS IS LABEL of DIRECT activity
      function updateConfigDirect(label, activity)
      {
        activity = activity || configObj;

console.log("running update: " +label);
          //obtain dialog
          var element = document.getElementById("newDirect");
          // var routeSelected = element.getElementsByTagName("input")[0].value;
          var list = element.getElementsByTagName("select")[0];
          // var routeSelected = list.value;

reloadRoutes(list)


        if(label == null)
        {
// console.log("label is null");

          list.value = activity.querySelector("#routeLabel").getAttribute('value');
        }
        else
        {
// console.log("select value: " + list.value);

          let routeLabel = activity.querySelector("#routeLabel");

          //The route might not have been configured yet
          if(routeLabel){ 
          list.value = label;
            activity.querySelector("#routeLabel").setAttribute('value',label); 
          }

        }

        if(list.value.length == 0)
        {
          // document.getElementById("hint-direct-config").style.visibility = "visible";
          // alert("needs configuration")

          // let hint = "To configure the call, ensure a Route exists with a 'Direct' starting activity. Then select from the drop down list the target route to call.";

          // let hintLabel = document.createElement('label');
          // hintLabel.value = hint;
          // element.appendChild(hintLabel);
        }
        else
        {
          document.getElementById("hint-direct-config").style.visibility = "hidden";

        }
      }



      function getNextSequencePosition(scene, shiftX, isGroup)
      {
        shiftX = shiftX || 0;
        isGroup = isGroup || false;
          // if(shiftX == null)

          let refActivity;

          if(isGroup) //for groups we keep reference of last activity created
          {
            refActivity = document.getElementById(scene.getAttribute("lastCreated"));
          }
          else // for anything else new positions are given from
          {
            refActivity = getActiveActivity();
          }

          let lastInGroup = isBoxed(refActivity);

          var refPos;

          if(lastInGroup)
          {
            let parentPos = refActivity.parentNode.object3D.position;
            refPos = {x: parentPos.x+1, y: parentPos.y, z:0}
          }
          else
          {
            // refPos = document.getElementById(scene.getAttribute("lastCreated")).getAttribute('position');
            
            //was
            //refPos = refActivity.getAttribute('position');
            refPos = refActivity.object3D.position;
          }



var nextPos = refPos.x+2+shiftX;


          // var scene = document.getElementById(routes[0]);
          // var nextPos = parseInt(scene.getAttribute("nextPos"))+shiftX;

          // scene.setAttribute("nextPos", nextPos+stepPos);

          return {x: nextPos, y: refPos.y, z: 0};
          // return {x: nextPos, y: 0, z: 0};
      }

      function getNextParallelPosition(scene, current, total, shiftX, boxed)
      {
        shiftX = shiftX || 0;

        let baseY = 0;
        let gap = 2;

        if(boxed)
        {
          gap = 1;
        }

        let posY = ((current-1)*gap) - (total*gap/2) + gap/2;// + (baseY);
        posY = -posY + baseY;

          // var scene = document.getElementById(routes[0]);
          // var nextPos = parseInt(scene.getAttribute("nextPos")-shiftX);

          //scene.setAttribute("nextPos", nextPos+stepPos);

          if(boxed)
          {
            return {x: 0, y: posY, z: 0};
          }

          var position = getNextSequencePosition(scene, shiftX, true);

          position.y += posY;

          return position;

          // return {x: nextPos, y: posY, z: 0};
          // return {x: 0, y: posY, z: 0};
          // return {x: posY, y: posY, z: 0};
      }




      function setConfigSelector(activity)
      {
        //it might be a new route that was created or a route switch.
        //we reset camera to default
        if(activity == null)
        {
          resetCameraToDefault();
          return;
        }

        //An activity from a different route may have been selected
        if(getActivityRoute(activity).id != getActiveRoute().id)
        {
          //in that case we need to switch to the activity's Route
          triggerRouteSwitch(activity);
          return;
        }

        // console.log("setConfigSelector");

        let ring = document.querySelector("#selector");

        // console.log("ring: "+ ring.getAttribute('id'));

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
        ring.setAttribute('id', 'selector');
        ring.setAttribute('side', 'double');
        ring.setAttribute('color', 'yellow');
        ring.setAttribute('radius-inner', .7);
        ring.setAttribute('radius-outer', .71);
      
        console.log("ring created on: "+activity.id);
        //console.log("ring id: "+activity.);

        setCameraFocus(activity);
      }


      function setCameraFocus(activity, strict)
      {
        //if nowhere to go, no point to continue
        if(activity == null)
        {
          return;
        }

          strict = strict || false;

          // temporary hack, ignore focus on DIRECT as it conflicts with Jump-to animation
          if(   !strict
              && activity.getAttribute('processor-type') == "direct")
          {
              //return;
          }

          var camera = document.getElementById("main-camera");

          //listens animation end
          camera.addEventListener('animationcomplete', function scrollFocus() {

              //delete listener
              this.removeEventListener('animationcomplete', scrollFocus);

              //delete animation
              this.removeAttribute('animation__focus');
          });


          let posActivity = getPositionInScene(activity);
          // let posCamera = camera.getAttribute('position');

        //   let target = {
        //         x: posActivity.x,
        //         y: 0,
        //         z: 7}

          //Since A-Frame v1.0.0 the camera angle seems different, so we have adjusted
          let target = {
            x: posActivity.x,
            y: cameraY,
            z: cameraZ}

          camera.setAttribute('animation__focus', {property: 'position', dur: '1000', to: target, loop: false, easing: "easeInOutQuad"});
      }

      
      function createDirectHint(activity)
      {
        //inactivate hints on new direct activities
        hintDirectPending = false;

        console.log("creating arrow on top");

        //hint pointer
        var arrow = document.createElement('a-triangle');
        activity.appendChild(arrow);
        arrow.setAttribute("vertex-a","0 .8 0")
        arrow.setAttribute("vertex-b","-.25 1.3 0")
        arrow.setAttribute("vertex-c",".25 1.3 0")
        arrow.setAttribute("color","grey")
        arrow.setAttribute('side', 'double');

        //hint label
        // var text = document.createElement('a-text');
        var text = createText();
        activity.appendChild(text);
        text.setAttribute('value', "double-click \n to open route");
        text.setAttribute('color', 'grey');
        text.setAttribute('position', {x: .3, y: .9, z: 0});
        text.setAttribute('side', 'double');

        //hint animation
        // var animation = document.createElement('a-animation');
        // animation.setAttribute('attribute','position');
        // animation.setAttribute('dur','500');
        // animation.setAttribute('to','0 -0.25 0');
        // animation.setAttribute('repeat','indefinite');
        // animation.setAttribute('direction','alternate');
        // arrow.appendChild(animation);

        //since A-Frame v1.0.0 it seems animations work as attributes, not as childs.
        arrow.setAttribute('animation', {property: 'position', dur: '500', to: '0 -0.25 0', loop: true, dir: 'alternate'});
      }


      //Logs (for Debug) all links of an activity
      function printActivityLinks(activity)
      {
        // we look at the links the source has
        var links = JSON.parse(activity.getAttribute("links"));
        console.log("analysing: "+ activity.id);
        
        if(links)
        {
          for(let i=0; i< links.length; i++)
          {
            console.log("  "+activity.id+"-"+i+": "+links[i]);

            let link = document.getElementById(links[i]);

            console.log("    ->"+link.id+"-source: "+link.getAttribute('source'));
            console.log("    ->"+link.id+"-destination: "+link.getAttribute('destination'));
          }
        }

      }

      //Creates a link and connects 2 ends
      //Its shape will consist on an invisible cylinder with a child visible line
      //This shape allows interaction not possible with the line alone.
      function createEditableLink(src, dst)
      {
        srcPos = getPositionInScene(src);
        dstPos = getPositionInScene(dst);

        var radius = .2;
        var opacity = 0.2;

        //create shape cylinder
        var cylinder = document.createElement('a-cylinder');

        //3D properties
        cylinder.setAttribute('material','opacity: '+opacity);
        cylinder.setAttribute('radius',radius);

        //Visible line
        var line = document.createElement('a-entity');
        cylinder.appendChild(line);

        //Calculate Link 3D positioning
        resetLink(cylinder, srcPos, dstPos);

        return cylinder;
      }

      // A static link connects 2 ends 
      // Its shape is a 3 segments elbow line
      // they are not editable, no activities can be injected
      //function getStaticLink(src, dst, srcPos, dstPos)
      function getStaticLink(src, dst)
      {
        srcPos = src.object3D.position;
        dstPos = dst.object3D.position;

        var line = document.createElement('a-entity');
        src.parentNode.appendChild(line);

        if(src.getAttribute('processor-type').startsWith("multicast"))
        {
          // 3 segment elbow lines
          line.setAttribute('line__1', {start: {x: srcPos.x+.25,  y: srcPos.y, z: 0}});
          line.setAttribute('line__1', {  end: {x: srcPos.x+.5,   y: srcPos.y, z: 0}});

          line.setAttribute('line__2', {start: {x: srcPos.x+.5,   y: srcPos.y, z: 0}});
          line.setAttribute('line__2', {  end: {x: srcPos.x+.5,   y: dstPos.y, z: 0}});

          line.setAttribute('line__3', {start: {x: srcPos.x+.5,   y: dstPos.y, z: 0}});
          line.setAttribute('line__3', {  end: {x: dstPos.x-.25,  y: dstPos.y, z: 0}});
        }
        else if (src.getAttribute('processor-type') == "direct")
        {
          // 3 segment elbow lines
          line.setAttribute('line__1', {start: {x: srcPos.x+.25,  y: srcPos.y, z: 0}});
          line.setAttribute('line__1', {  end: {x: srcPos.x+.5,   y: srcPos.y, z: 0}});

          line.setAttribute('line__2', {start: {x: srcPos.x+.5,   y: srcPos.y, z: 0}});
          line.setAttribute('line__2', {end:   {x: dstPos.x-.5,   y: dstPos.y, z: 0}});

          line.setAttribute('line__3', {start: {x: dstPos.x-.5,   y: dstPos.y, z: 0}});
          line.setAttribute('line__3', {end:   {x: dstPos.x-.25,  y: dstPos.y, z: 0}});
        }

        return line;
      }

      //Redraws the link
      //The link includes information about the start/end activities
      function redrawLink(link)
      {
        var source      = document.getElementById(link.getAttribute('source'));
        var destination = document.getElementById(link.getAttribute('destination'));

        var srcShiftX = 0;
        var dstShiftX = 0;

        if(isBoxed(source))
        {
          source = source.parentNode;
          srcShiftX += 1;
        }

        if(isBoxed(destination))
        {
          destination = destination.parentNode;
          dstShiftX -= 1;
        }

        sourcePos = {
          x: source.object3D.position.x+srcShiftX,
          y: source.object3D.position.y,
          z: source.object3D.position.z
        }

        destPos = {
          x: destination.object3D.position.x+dstShiftX,
          y: destination.object3D.position.y,
          z: destination.object3D.position.z
        }

        resetLink(link, sourcePos, destPos);
      }

      //Redraws the link, given the new start/end positions
      function resetLink(cilinder, srcPos, dstPos)
      {

// console.log("resetLink...(srcPos/dstPos)")
// console.log(srcPos);
// console.log(dstPos);

        //calculate Hypotenuse
        var hypo = Math.sqrt(Math.pow(dstPos.x-srcPos.x, 2) + Math.pow(dstPos.y-srcPos.y, 2));

        //calculate tilt between activities
        var angle = Math.asin((dstPos.y-srcPos.y)/Math.abs(hypo));

        //Height of link cilinder (-1 because of twice half-sphere from src and dst)
        var height = hypo -1;

        var linedistance = height / 2;

        //default rotation set to horizontal (90 degrees)
        var rotation = 90;

        if((dstPos.x-srcPos.x) > 0) {
          rotation += (angle * (180/Math.PI));
        }
        else {
          rotation -= (angle * (180/Math.PI));
        } 

        //set size and tilt
        cilinder.setAttribute('height',   height);
        cilinder.setAttribute('rotation', {z: rotation});

        //set position
        cilinder.setAttribute('position', {
            x: srcPos.x+((dstPos.x-srcPos.x)/2),
            y: srcPos.y+((dstPos.y-srcPos.y)/2),
            z: 0
        });
      }

      //updates the activity to include the new link ID
      function addLink(activity, linkId)
      {
        var links = JSON.parse(activity.getAttribute("links"));

        if(links == null)
        {
          links = [];
        }

        links.push(linkId);
        activity.setAttribute("links", JSON.stringify(links));
      }
      
      function addPulse(name)
      {
        AFRAME.registerComponent("pulse", {
          init: function () {
            


            //for 'Drag&Drop' effect, when mousedown is detected
            //we add a 'mousemove' listener to follow mouse movement
            this.el.addEventListener('mousedown', function(){
                  
              movingObj = this;
            

              //discard links for dragNdrop functionality
              if(this.nodeName.toLowerCase() != "a-cylinder")
              {
              document.onmousemove = function(event){
                  if(movingObjX == null)
                  {
                    event1X = event.clientX;
                    event1Y = event.clientY;
                    movingObjX = movingObj.object3D.position.x;
                    movingObjY = movingObj.object3D.position.y;
                  }
        
                  //map mouse to screen movement
                  var vectorX = ((event1X-event.clientX)/-80) + movingObjX;
                  var vectorY = ((event1Y-event.clientY)/80)  + movingObjY;
                
                  //update activity position
                  movingObj.setAttribute('position', {x: vectorX, y: vectorY, z: movingObj.object3D.position.z});

                  //no special handling for REST components, just select it
                  if(movingObj.getAttribute('processor-type') == "rest-group")
                  {
                    // selectRestGroup(movingObj);
                    return;
                  }

                  //obtain links to other activities
                  var links = JSON.parse(movingObj.getAttribute("links"));

                  var objectInGroup = movingObj.nodeName.toLowerCase() == "a-box";
// console.log("checking entity: "+movingObj.nodeName);

                  // if(movingObj.nodeName.toLowerCase() == "a-box")
                  if(objectInGroup)
                  {
// console.log("is box");
// console.log("movingObj.firstChild: " +movingObj.firstChild.nodeName);
// console.log("movingObj.firstChild.id: " +movingObj.firstChild.id);

                    // links = JSON.parse(movingObj.firstChild.getAttribute("links"));
                    links = JSON.parse(document.getElementById(movingObj.getAttribute("group-start")).getAttribute("links"));
// console.log("movingObj.id: " + movingObj.id);
// console.log("movingObj.firstChild.id: " + movingObj.firstChild.id);
// // console.log("linksStart nodeName: " + links.nodeName);
// console.log("linksStart nodeName: " + links.nodeName);
// console.log("linksStart id: " + links.id);
// console.log("linksStart length: " + links.length);
// console.log("linksStart: " + links);

//                 console.log("moving obj end: " + movingObj.getAttribute("group-end"));
//                 console.log("moving obj end: " + document.getElementById(movingObj.getAttribute("group-end")).id);

                    var linksEnd = document.getElementById(movingObj.getAttribute("group-end")).getAttribute("links");

// console.log("linksEnd length: " + linksEnd.length);
// console.log("linksEnd: " + linksEnd);

                    links = links.concat(
                              // JSON.parse(document.getElementById(movingObj.getAttribute("group-end")).getAttribute("links"))
                              JSON.parse(linksEnd)
                            );
                  }//end of if(objectInGroup)

                  //iterate links
                  for (var i in links) {

                    //obtain link
                    var link = document.querySelector("#"+links[i]);

// console.log("link type: "+ link.nodeName)

                    // we only want to update EDITABLE links (cylinders).
                    // Groups contain link lines (NON-EDITABLE links) that must stay static
                    if(link.nodeName.toLowerCase() == "a-cylinder")
                    {

                      let src = document.querySelector('#'+link.getAttribute('source'))
                      let dst = document.querySelector('#'+link.getAttribute('destination'))

                      let srcNotInGroup = !isBoxed(src);
                      let dstNotInGroup = !isBoxed(dst);

                      //obtain source and destination activities coordinates
                      var srcPos;
                      var dstPos;

                      //resolution of src position
                      if(srcNotInGroup)
                      {
                        //was
                        //srcPos = src.getAttribute("position");
                        srcPos = src.object3D.position;
                      }
                      else
                      {
                        //was
                        //srcPos = src.parentNode.getAttribute("position");
                        srcPos = src.parentNode.object3D.position;

                        srcPos = {
                            //was
                            //x: srcPos.x+src.getAttribute('position').x,
                            x: srcPos.x+src.object3D.position.x,
                            y: srcPos.y,//+dst.parentNode.getAttribute('position').y,
                            z: srcPos.z }
                      }

                      //resolution of dst position
                      if(dstNotInGroup)
                      {
                        //was
                        //dstPos = dst.getAttribute("position");
                        dstPos = dst.object3D.position;
                      }
                      else
                      {
                        //was
                        //dstPos = dst.parentNode.getAttribute("position");
                        dstPos = dst.parentNode.object3D.position;

                        dstPos = {
                            //was
                            //x: dstPos.x+dst.getAttribute('position').x,
                            x: dstPos.x+dst.object3D.position.x,
                            y: dstPos.y,//+dst.parentNode.getAttribute('position').y,
                            z: dstPos.z }
                      }

                      //adjust link
                      resetLink(link, srcPos, dstPos);
                    }
                  }//end FOR loop

                }; //end [document.onmousemove]

                moving = true;
                } // end of link filter
            }) // end of ==> this.el.addEventListener('mousedown', function(){



            // when [mouseup] is detected we remove 'mousemove' tracking to stop drag'n'drop effect
            this.el.addEventListener('mouseup', function(){                      
              document.onmousemove = null;
              movingObj = null;
              movingObjX = null;

              //when moving dragging objects, positions change
              //so we update metadata info
              syncMetadata();
            })
            
            //we use click event to highlight activity clicked
            this.el.addEventListener('click', function(evt){
                 
              //no further handling for REST groups, we just select the group and return
              if(this.getAttribute('processor-type') == "rest-group")
              {
                //this situation can be tricky
                //click events on REST may be chained
                //if you click on a method, 2 events are fired, 1 for the method, and 1 for the group
                //we only select the REST group if it's not a chained event
                if(event.srcElement.getAttribute('processor-type') != "rest-group")
                {
                  //if the source event is not the group itself, then we ignore
                  return;
                }
                
                selectRestGroup(this);
                return;
              }


              var now = Date.now();
              let notGroup = this.nodeName.toLowerCase() != "a-box";

              //user's double clicks are used to jump to a different route 
              var isDoubleClick = 300 > (now - timestampFirstClick);

              timestampFirstClick = now;

              if(isDoubleClick)
              {
                //alert(isDoubleClick);
              }

              // only highlight/configure activities, and ignore groups (boxes)
              if(notGroup)
              {
                configObj = this;
              }

              // console.log("this.nodeName");
              // console.log(this.nodeName);

              //is this condition needed?
              //if(this.getAttribute('processor-type') == "log")
              //{
              //  switchConfigPaneByActivity(this);
              //}
              //else 
              if(this.getAttribute('processor-type') == "direct")
              {
                //this code is not intended for FROM elements
                if(this.hasAttribute('start'))
                {
                  return;
                }

                //don't jump if activity not configured yet
                let isConfigured = (configObj.querySelector("#routeLabel").getAttribute('value').length > 0)

                if(isDoubleClick && notGroup && isConfigured)
                {
                  // var camera = document.getElementsByTagName("a-camera");
                  var camera = document.getElementById("main-camera");

                // configObj = this;

                  // // console.log(this.nodeName);
                  // // console.log(this.getAttribute('position'));

                  //listens animation end
                  camera.addEventListener('animationcomplete', function enterDirect() {

                    //delete listener
                    this.removeEventListener('animationcomplete', enterDirect);

                    //delete animation
                    this.removeAttribute('animation');

                    //switch route
                    nextRoute(configObj.querySelector("#routeLabel").getAttribute('value'));

                    //reset camera position
                    // resetCameraToDefault();
                  });

                //let target = this.getAttribute('position').object3D.position;
                //was
                //let target = this.components.position.data;
                //let target = this.object3D.position;
                
                //somehow, if you pass directly 'object3D.position' the animation breaks Three.js
                //so we create the structure manually with x/y/z
                let target = {
                  x: this.object3D.position.x,
                  y: this.object3D.position.y, 
                  z: this.object3D.position.z
                }

                //let target = this.getAttribute('position');
                    console.log("target: "+target);
                    console.log("target.x: "+target.x);
                    //console.log("target.value: "+target.value);

                //   let campos = camera.getAttribute('position');

                  //if activity is encapsulated in group we need to add parent/child coordinates
                  if(isBoxed(this))
                  {
                    //was
                    // target = {
                    //     x: target.x+this.parentNode.getAttribute('position').x,
                    //     y: target.y+this.parentNode.getAttribute('position').y, 
                    //     z: target.z}
                    target = {
                      x: target.x+this.parentNode.object3D.position.x,
                      y: target.y+this.parentNode.object3D.position.y, 
                      z: target.z
                    }
                  }
                  //animation starts from this moment
                //   var tcamera = document.getElementById("main-camera");
                // target = {x: -3, y: 0, z: 0};
                  
                  //let testfrom = {x: -3, y: -7, z: 0};
                  //let testto = {x: target.x, y: target.y, z: target.z};
                  //camera.setAttribute('animation', {property: 'position', dur: '1500', to: target, loop: false});
                  camera.setAttribute('animation', {property: 'position', dur: '1500', to: target, loop: false});


                //   camera.setAttribute('animation', {property: 'position', dur: '1500', from: {x: 0, y: 0, z: 7}, to: target, loop: false});
                
                //   var camera = document.getElementById("main-camera");
                //   camera.setAttribute('animation', {property: 'position', dur: '2500', to: {x: 0, y: 0, z: 10}, loop: false});
                // camera.setAttribute('animation', {property: 'position', dur: '1500', to: {x: -3, y: 0, z: 0}, loop: false});
          
                }
                else//if not double-click
                {
                  switchConfigPaneByActivity(this);

                  // updateLabel();
                }
              }
              else if(this.nodeName.toLowerCase() == "a-box")
              {
                //do nothing
              }
              else
              {
                // console.log("it's unknown");

                switchConfigPaneByActivity(this);
              }

            }); //end on mouse [click]

          }// end of init()

        }); //end of AFRAME.registerComponent

      } //end of pulse()
      
      function addGrid(parent)
      {
                  movingObj = parent;
                  var grid = document.createElement('a-plane');
                  grid.setAttribute('grid','');
                  grid.setAttribute('position', {x: 0, y: 0, z: 0})
                  grid.setAttribute('height','20');
                  
                  grid.setAttribute('width','20');
        //grid.setAttribute('parent',parent);
                  //parent.appendChild(grid);
        var scene = document.getElementById(routes[0]);
        scene.appendChild(grid);
        
        AFRAME.registerComponent('grid', {
          init: function () {
            
                  this.el.addEventListener('click', function(evt){
                    
                    
                    console.log("im the grid !!");
                    console.log(evt.detail.intersection.point);
                    
                    console.log(this);
                    
                    console.log(movingObj);
                    
                         //var parent = this.getAttribute('parent');
                    //var parent = this.parentElement;
                         
                        //was
                        //movingObj.setAttribute('position', {x: evt.detail.intersection.point.x, y: evt.detail.intersection.point.y, z: evt.detail.intersection.point.z});
 
                        movingObj.object3D.position.set(
                            evt.detail.intersection.point.x,
                            evt.detail.intersection.point.y,
                            evt.detail.intersection.point.z
                        )

                    movingObj = null;
                    moving = false;
                  });
          }
        });        
        
        

      }
      
//       AFRAME.registerComponent('myplane', {
//           init: function () {
            
//                   this.el.addEventListener('click', function(evt){
//                     dependencies: ['raycaster']
                    
//                          //var parent = this.getAttribute('parent');
//                     //var parent = this.parentElement;
//                          console.log(evt.detail.intersection.point);
//                   });
//           }
//         }); 
      
      function switchConfigPane(newConfigPane)
      {
        let pane = document.getElementById(currentConfigPane);
        pane.style.visibility = "hidden";

        currentConfigPane = newConfigPane;

        pane = document.getElementById(currentConfigPane);
        pane.style.visibility = "visible";

        return pane;
      }

      function switchConfigPaneByActivity(activity)
      {
        //REST elements have their own switch (to better manage different Designer views)
        if(isRestElement(activity))
        {
          selectRestActivity(activity);
          return;
        }

        setConfigSelector(activity);

        if(activity == null)
        {
          switchConfigPane("introconfig");
          return;
        }

        let newConfigPane = "introconfig";
        let type     = activity.getAttribute('processor-type');

        //prepare conditions to enable/disable buttons
        let isChoice = (type == 'choice-start')
        let isFork   = isBoxed(activity) && (type != "multicast-end");
        let isFrom   = activity.hasAttribute('start');

        if(   (isChoice)
           || (isFork)
           || (isFrom && activity.hasAttribute('links')))
        {
          enableToButtons(false);
        }
        else
        {
          enableToButtons(true);
        }


        switch(type) {
          case 'log':
              newConfigPane = "loginput";
              updateConfigLog();
              break;
          case 'direct':
              if(!activity.hasAttribute('start')){ //filter out start activity
                updateConfigDirect(null,activity);
                newConfigPane = "newDirect";
              }
              break;
          case 'property':
              newConfigPane = "name-value-pair";
              updateConfigNameValuePair();
              break;
          case 'header':
              newConfigPane = "name-value-pair";
              updateConfigNameValuePair();
              break;
          case 'body':
              newConfigPane = "set-body";
              updateConfigBody();
              break;
          default:
              //code block
        }

        // if(type == 'direct')
        // {
        //   newConfigPane = "newDirect";
        // }
        // else if(type == 'log')
        // {
        //   newConfigPane = "loginput";
        //   updateConfigLog();
        // }

        if(activity.nodeName.toLowerCase() == "a-cylinder")
        {
          newConfigPane = "config-choice-when";
          updateConfigChoice();
        }

        switchConfigPane(newConfigPane);
      }

      //Sets Configuration Panel with Activity configuration
      function updateConfigLog()//activity)
      {
        //obtain user input
        var element = document.getElementById("loginput");
        var logText = element.getElementsByTagName("input")[0].value;

        //obtain 3D label
        // var text = configObj.getElementsByTagName("a-text")[0].firstChild;
        var text = getActiveActivity().getElementsByTagName("a-text")[0].firstChild;

        //if null it gets created
        if(text == null)
        {
          element.getElementsByTagName("input")[0].value = "";
        }
        else
        {
          element.getElementsByTagName("input")[0].value = text.getAttribute('value').slice(1, -1); //gets rid of double quotes at start/end
        }
      }

      //Sets Configuration Panel with Activity configuration
      function updateConfigNameValuePair()//activity)
      {
        //obtains panel elements
        var element = document.getElementById("name-value-pair");
        var fieldName = element.getElementsByTagName("input")[0];
        var fieldValue = element.getElementsByTagName("input")[1];

        //obtain 3D labels
        var textName = getActiveActivity().getElementsByTagName("a-text")[0].firstChild;
        var textValue = getActiveActivity().getElementsByTagName("a-text")[0].lastChild;

        //replace panel values using activity values
        fieldName.value = textName.getAttribute('value').slice(0, -1); //gets rid of tail character ':'
        fieldValue.value = textValue.getAttribute('value').slice(1, -1); //gets rid of double quotes at start/end
      }

      //Sets Configuration Panel with Activity configuration
      function updateConfigBody()//activity)
      {
        //obtains panel elements
        var element = document.getElementById("set-body");
        var configBody = element.getElementsByTagName("input")[0];

        //obtain 3D labels
        var text = getActiveActivity().getElementsByTagName("a-text")[0].firstChild;

        //replace panel values using activity values
        configBody.value = text.getAttribute('value').slice(1, -1); //gets rid of start/end double quotes
      }

      //Sets Configuration Panel with Activity configuration
      function updateConfigChoice()//activity)
      {
        //obtains panel elements
        var element = document.getElementById("config-choice-when");
        var condition = element.getElementsByTagName("input")[0];

        //obtain 3D labels
        var text = getActiveActivity().getElementsByTagName("a-text")[1];

        //replace panel values using activity values
        condition.value = text.getAttribute('value');//.slice(1, -1); //gets rid of start/end double quotes
      }

      // function showAll()
      // {
        
      //   //var sceneEl = document.querySelector('a-scene');
      //   var sceneEl = document.getElementById(routes[0]);
        
      //   var all = sceneEl.querySelectorAll('a-text');
        
      //   var text = routes[0]+"<br/>";
        
      //   for (var i = 0; i < all.length; i++) {
      //     text = text + all[i].getAttribute('value')+"<br/>";
      //   }
      //           document.getElementById("camel").innerHTML = text;
      //   // var camel = document.querySelector('camel');
      //   // camel.value="update";
      // }
      

      function addDebugGrid()
      {
        
        var sceneEl = document.querySelector('a-scene');
        // var sceneEl = document.getElementById(routes[0]);
        
        for (var i = -3; i <= 3; i++) {

          var testline = document.createElement('a-entity');
          sceneEl.appendChild(testline);

          // 3 segment elbow lines
          testline.setAttribute('line__x'+i, {start: {x: i,  y: -3, z: 0}});
          testline.setAttribute('line__x'+i, {  end: {x: i,   y: 3, z: 0}});


          testline.setAttribute('line__y'+i, {start: {x: -3,  y: i, z: 0}});
          testline.setAttribute('line__y'+i, {  end: {x: 3,   y: i, z: 0}});

        }    



        var all = sceneEl.querySelectorAll('a-text');
        
        var text = routes[0]+"<br/>";
        
        for (var i = 0; i < all.length; i++) {
          text = text + all[i].getAttribute('value')+"<br/>";
        }
                // document.getElementById("camel").innerHTML = text;
        // var camel = document.querySelector('camel');
        // camel.value="update";
      }
      
      
      
      