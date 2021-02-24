      // //Switch to stream edit updates
      // var syncEditorEnabled = true;
      // var syncStartUpEnabled = false;
      
      // //Camera default position in axis
      // var cameraY = 0;
      // var cameraZ = 7;

      // // var routes = ["route1", "route2"];
      // var routes = ["route1"];
      // // var routes = [];
      // var routeNum = 1;

      // var startActivityPos = -5;
      // var stepPos = 2;
      // //var sceneFlag = false;
      // var setGreen = false;
      
      // //counter to generate new Unique IDs
      // var uidCounter = 0;
      // //deprecated: var logId = 0;
      // //deprecated: var linkCounter = 0;
      
      // var moving = false;
      // var movingObj = null;
      // var movingObjX = null;
      // var movingObjY = null;
      // var event1X = null;
      // var event1Y = null;

      // // var lastCreated = null;
      // var configObj = null;

      // var currentConfigPane = "introconfig";

      // var timestampFirstClick = Date.now();

      // var hintDirectPending     = true;
      // var hintDetachablePending = true;

      // var flagTestEnabled = false;

      //Camel constants
      const CAMEL2_ATTRIBUTE_HEADER_NAME   = "headerName"
      const CAMEL2_ATTRIBUTE_PROPERTY_NAME = "propertyName"
      const CAMEL3_ATTRIBUTE_HEADER_NAME   = "name"
      const CAMEL3_ATTRIBUTE_PROPERTY_NAME = "name"
      const CAMEL_RELEASE = {
        v2: 2,
        v3: 3
      };
      const CAMEL_NAMESPACE = {
        none:      '',
        spring:    'xmlns="http://camel.apache.org/schema/spring"',
        blueprint: 'xmlns="http://camel.apache.org/schema/blueprint"'
      };
      const CAMEL_SOURCE_ENVELOPE = {
        camelContext: "camelContext",
        routeContext: "routeContext",
        camelK: "routes"
      };

      //helper variables
      var camelVersion;
      var camelNamespace;
      var camelSourceEnvelope;

      //initialises with default Camel settings
      function setCamelDefaults()
      {
        setCamelVersion3();
        setCamelNamespaceSpring();
        camelSourceEnvelope = CAMEL_SOURCE_ENVELOPE.camelContext
      }

      function getCamelSourceEnvelope()
      {
        return camelSourceEnvelope
      }

      //returns the attribute name to use of setHeader
      function getCamelAttributeHeaderName()
      {
        if(camelVersion == CAMEL_RELEASE.v2)
        {
          return CAMEL2_ATTRIBUTE_HEADER_NAME
        }
        
        return CAMEL3_ATTRIBUTE_HEADER_NAME
      }

      //returns the attribute name to use of setProperty
      function getCamelAttributePropertyName()
      {
        if(camelVersion == CAMEL_RELEASE.v2)
        {
          return CAMEL2_ATTRIBUTE_PROPERTY_NAME
        }
        
        return CAMEL3_ATTRIBUTE_PROPERTY_NAME
      }

      //Sets Camel v2
      function setCamelVersion2()
      {
        console.info("... now using Camel v2 syntax.")
        camelVersion = CAMEL_RELEASE.v2
      }

      //Sets Camel v3
      function setCamelVersion3()
      {
        console.info("... now using Camel v3 syntax.")
        camelVersion = CAMEL_RELEASE.v3
      }

      //Switches between Camel versions
      function switchCamelVersion()
      {
        if(camelVersion = CAMEL_RELEASE.v3)
        {
          setCamelVersion2()
        }
        else
        {
          setCamelVersion3()
        }
      }

      //sets Blueprint namespace
      function setCamelNamespaceBlueprint()
      {
        console.info("... now using Blueprint XML namespace.")
        camelNamespace = CAMEL_NAMESPACE.blueprint
      }

      //sets Spring namespace
      function setCamelNamespaceSpring()
      {
        console.info("... now using Spring XML namespace.")
        camelNamespace = CAMEL_NAMESPACE.spring
      }

      //returns namespace in use
      function getCamelNamespace()
      {
        return camelNamespace
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
                  //console.log("got source code: "+ message.source);

                  //attempt to detect Camel settings to use
                  autoDetectCamelSettings(message.source)

                  //While building the Visual elements, TextEditor<=>VisualEditor comms need to stop, 
                  syncStartUpEnabled = true;
                  loadSourceCode(message.source);
                  loadMetadata(message.metadata);
                  syncStartUpEnabled = false;

                  //Once finished, we need to sync the changes, (new ID values may have been applied)
                  syncEditor();
                  break;

              case 'tracing-activate-poller':
                  
                  //obtain tracing component
                  var tracing = document.getElementById('route-definitions').components.tracing

                  //enable trace poller
                  tracing.enableCamelTracingPoller()

                  break;

              case 'tracing-poll-traces-response':
              
                  //obtain tracing component
                  var tracing = document.getElementById('route-definitions').components.tracing

                  //enable trace poller
                  tracing.digestTraces(message.payload)

                  break;

              case 'tracing-enable-failed':
            
                  //obtain tracing component
                  setTracingUserAlert(message.payload, true)

                  break;
          }
        });


      //needs revision
      addPulse('whatever');

      function enableNavigationButtons(enabled)
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

          //toggle active/inactive UX buttons for navigation
          var element = document.getElementsByClassName("prev");
          element[0].style.opacity = opacity;
          element[0].firstChild.disabled = !enabled;
          
          element = document.getElementsByClassName("next");
          element[0].style.opacity = opacity;
          element[0].firstChild.disabled = !enabled;

          element = document.getElementsByClassName("new");
          element[0].style.opacity = opacity;
          element[0].firstChild.disabled = !enabled;

          element = document.getElementsByClassName("bRest");
          element[0].style.opacity = opacity;
          element[0].firstChild.disabled = !enabled;
      }

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
            element[i].firstElementChild.disabled = !enabled;
          }

          //UX buttons for consumers are disabled to start with
          //When first 'from' activity is created, we enable consumer buttons
          var element = document.getElementsByClassName("setter");
          for(let i=0; i<element.length; i++) {
            element[i].style.opacity = opacity;
            element[i].firstElementChild.disabled = !enabled;
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
            element[i].firstElementChild.disabled = !enabled;
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
        var element = document.querySelector(".rest").firstElementChild
        element.parentElement.style.opacity = opacity;
        element.disabled = !enabled

        if(enabled)
        {
          for(let i=0; i<element.length-3; i++) {
            
            //Mechanism to keep REST methods disabled until a REST group has been created.
            //(i=0 is the label, i=1 is the group button, i>1 are the method buttons)
            if(i<2)
            {
              continue;
            }

            element[i].disabled = restIsEmpty;
          }
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
        resetDesigner()
        tests();
        setCamelDefaults();
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

        //empty string not a valid route ID
        if(routeId == ""){
          routeId == null
        }

        //set Route ID
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
          enableRestButtons(false);
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

let configObj = getActiveActivity()

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
        //var fieldValue = element.getElementsByTagName("input")[1].value;

let configObj = getActiveActivity()

        var textName = configObj.getElementsByTagName("a-text")[0].firstChild;
        //var textValue = configObj.getElementsByTagName("a-text")[0].lastChild;

        //display new value
        textName.setAttribute('value', fieldName+':');
        //textValue.setAttribute('value', '"'+fieldValue+'"');
      }

      //Updates the activity with the configuration settings
      // function submitConfigBody()
      // {
      //   //obtain user input
      //   var element = document.getElementById("set-body");
      //   var body = element.getElementsByTagName("input")[0].value;

      //   //obtain activity label
      //   var text = configObj.getElementsByTagName("a-text")[0].firstChild;

      //   //display new value
      //   text.setAttribute('value', '"'+body+'"');
      // }

      //Updates the activity with the configuration settings
      function submitConfigChoice()
      {
        //obtain user input
        var element = document.getElementById("config-choice-when");
        var condition = element.getElementsByTagName("input")[0].value;

        //we should obtain the link with the expression configuration
        let expressionLink = getActiveActivity()

        //obtain activity label
        // var text = configObj.getElementsByTagName("a-text")[1];
        var text = expressionLink.getElementsByTagName("a-text")[1];

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


      // function reloadRoutes(list)
      function populateWithDirectStarters(list)
      {
          //clean list
          list.options.length = 0;

          //populate default option
          let option;

          // obtail all 'from direct' activities
          let directs = document.evaluate('//a-sphere[@start and @processor-type = "direct"]', document, null, XPathResult.ANY_TYPE, null);

          //helpers
          let allDirects = [];
          let thisNode = directs.iterateNext();

          while(thisNode) {
            allDirects.push(thisNode.querySelector('.uri').getAttribute('value'));
            thisNode = directs.iterateNext();
          };

          //populate options with directs
          allDirects.forEach(item => {
            option = document.createElement('option');
            option.value = item;
            option.innerHTML = item;   
            list.appendChild(option);
          });
      }

      // TODO clean this, and give function a good name
      //THIS IS LABEL of DIRECT activity
      function updateConfigDirect(label, activity)
      {
        activity = activity || getActiveActivity();
        
        //obtain dialog
        var element = document.getElementById("newDirect");

        //obtain list of options
        var list = element.getElementsByTagName("select")[0];

        //populate list
        populateWithDirectStarters(list)


        if(label == null)
        {
          list.value = activity.querySelector(".uri").getAttribute('value');
        }
        else
        {
          let routeLabel = activity.querySelector(".uri");

          //The route might not have been configured yet
          if(routeLabel){ 
            list.value = label;
            activity.querySelector(".uri").setAttribute('value',label); 
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


      //Predicts which should be the next positional coordinate
      //for a new activity (to be created) relative to the currently selected activity
      function getNextSequencePosition()
      {
        //obtain the currently selected activity
        let source = getActiveActivity()

        //this covers the case for activities ending a group (group-end ---> new-activity)
        if(source.classList.contains('group-end')){
          return {
              x: source.parentNode.object3D.position.x + source.object3D.position.x + 2, 
              y: source.parentNode.object3D.position.y + source.object3D.position.y,
              z: 0
          }
        }
        //for all other use cases X+2 is enough
        else{
          return {
              x: source.object3D.position.x + 2, 
              y: source.object3D.position.y,
              z: 0
          }
        }
      }

      //Method used to position parallel activities
      function getNextParallelPosition(current, total, shiftX, boxed)
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

        if(boxed)
        {
          return {x: 0, y: posY, z: 0};
        }

        var position = getNextSequencePosition();
        position.x += shiftX

        position.y += posY;

        return position;
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
            // y: cameraY,
            y: posActivity.y,
            z: cameraZ}

          camera.setAttribute('animation__focus', {property: 'position', dur: '1000', to: target, loop: false, easing: "easeInOutQuad"});
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
        // srcPos = getPositionInScene(src);
        // dstPos = getPositionInScene(dst);

        let srcPos 
        let dstPos

        if(isBoxed(src) && !src.id.endsWith('-end'))
        {
          srcPos = src.object3D.position
          dstPos = dst.object3D.position
        }
        else
        {
          srcPos = getPositionInScene(src);
          dstPos = getPositionInScene(dst);
        }


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

        //============================

        let sourcePos = source.object3D.position
        let destPos   = destination.object3D.position


  //this covers the case for same level activities, or activities of the same group
  if(source.parentNode == destination.parentNode)
  {
    sourcePos = source.object3D.position
    destPos   = destination.object3D.position    
  }
  //this covers the case for links connecting 2 different groups (group-end ---> group-start)
  else if(source.classList.contains('group-end') && destination.classList.contains('group-start'))
  {
    sourcePos = source.object3D.position.clone()
                .add(source.parentNode.object3D.position)

    destPos = destination.object3D.position.clone()
              .add(destination.parentNode.object3D.position)
  }
  //this covers the case for links connecting a group to an activity (group-end ---> activity)
  else if(source.classList.contains('group-end') && !destination.classList.contains('group-start'))
  {
    sourcePos = source.object3D.position.clone()
                .add(source.parentNode.object3D.position)
  }
  //this covers when destination is boxed and source isn't
  //this covers the case for links connecting an activity to a group (activity ---> group-start)
  else if(!source.classList.contains('group-end') && destination.classList.contains('group-start'))
  {
    destPos = destination.object3D.position.clone()
              .add(destination.parentNode.object3D.position)
  }



        //============================



/*
        if(isBoxed(source))
        {
          source = source.parentNode;

          //we need to obtain the position of the box's ending activity
          dstShiftX = document.getElementById(destination.getAttribute('group-end')).object3D.position.x;

          //was
          //srcShiftX += 1;
        }

        if(isBoxed(destination))
        {
          destination = destination.parentNode;

          //we need to obtain the position of the box's starting activity
          dstShiftX = document.getElementById(destination.getAttribute('group-start')).object3D.position.x;

          //was
          //dstShiftX -= 1
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
*/
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
        // cilinder.setAttribute('position', {
        //     x: srcPos.x+((dstPos.x-srcPos.x)/2),
        //     y: srcPos.y+((dstPos.y-srcPos.y)/2),
        //     z: 0
        // });
        cilinder.object3D.position.set(
          srcPos.x+((dstPos.x-srcPos.x)/2),
          srcPos.y+((dstPos.y-srcPos.y)/2),
          0
        )

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
                  
              // event.stopPropagation()

              movingObj = this;
            
              //SHIFT + CLICK = DETACH
              if(movingObj.components.detachable && movingObj.components.detachable.shiftPressed)
              {
                movingObj.components.detachable.detach()
              }

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

                  //check if this is a detached object
                  if(movingObj.components.detachable && movingObj.components.detachable.detached)
                  {
                    //if so, no need to recalculate positions
                    return 
                  }

                  //no special handling for REST components, just select it
                  if(movingObj.getAttribute('processor-type') == "rest-group")
                  {
                    // selectRestGroup(movingObj);
                    return;
                  }

                  //obtain links to other activities
                  var links = JSON.parse(movingObj.getAttribute("links"));

                  // var objectInGroup = movingObj.nodeName.toLowerCase() == "a-box";
                  var objectInGroup = movingObj.localName == "a-box";

                  if(objectInGroup)
                  {
                    //helper
                    links = []

                    //include link going back
                    links.push(getBackwardsLink(movingObj).id)

                    //get link going forward
                    let linkForward = getForwardLink(movingObj)

                    //if exists, include
                    if(linkForward)
                      links.push(getForwardLink(movingObj).id)

                  }//end of if(objectInGroup)

                  //iterate links
                  for (var i in links) {

                    //obtain link
                    var link = document.querySelector("#"+links[i]);

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
                 

                if(this.getAttribute('detached') == "true")
                {
                  return
                }


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

              if(this.getAttribute('processor-type') == "direct")
              {
                //don't jump if activity not configured yet
                let isConfigured = (configObj.querySelector(".uri").getAttribute('value').length > 0)

                if(isDoubleClick && notGroup && isConfigured)
                {
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
                    let targetUri = configObj.querySelector(".uri").getAttribute('value')
                    let routeId = findRouteIdFromDirectUri(targetUri)

                    //jump to route
                    nextRoute(routeId);
                  });

                  //obtain the absolute position to provide a target for the camera
                  let target = getPositionInScene(this)

                  //animation starts from this moment
                  camera.setAttribute('animation', {property: 'position', dur: '1500', to: target, loop: false});
                }
                else//if not double-click
                {
                  switchConfigPaneByActivity(this);
                }
              }
              else if(this.nodeName.toLowerCase() == "a-box")
              {
                //do nothing
              }
              else if(getActiveRoute().parentElement.components.keyboardlistener.altpressed == true)
              {
                console.log("ALT down");
                // evt.stopPropagation()
                setGroupSelector(this)
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
        // setConfigSelector(activity);

        // if(activity == null)
        // {
        //   switchConfigPane("introconfig");
        //   return;
        // }



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

        if(activity.components.detachable && activity.components.detachable.detached)
        {
          //ignore when activity is detached
          return
        }

        let newConfigPane = "introconfig";
        let type     = activity.getAttribute('processor-type');

        //prepare conditions to enable/disable buttons
        let isChoice = (type == 'choice-start') || activity.hasAttribute('choice-expression')
        // let isFork   = isBoxed(activity) && (type != "multicast-end");
        let isFork   = activity.parentNode.id.startsWith('multicast') && (type != "multicast-end");
        //let isFrom   = activity.hasAttribute('start');

        if(   (isChoice)
           || (isFork) || (type == 'catch-end') || (type == 'finally-end')
          )// || (isFrom && activity.hasAttribute('links')))
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

case 'split-start':
    newConfigPane = "set-body";
    updateConfigBody();
    break;
case 'catch-start':
    newConfigPane = "config-catch";
    updateConfigCatch();
    break;
    
          case 'to':
              newConfigPane = "config-endpoint-to";
              updateConfigEndpointTo(activity);
              break;
          case 'from':
              newConfigPane = "config-endpoint-to";
              updateConfigEndpointTo(activity);
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

        //prepare select (with expression variables)
        populateExpressionVariables(element.getElementsByClassName('expression')[0])
      }

      //Sets Configuration Panel with Activity configuration
      //on situations where there is execution concurrency (e.g. components being initialised asynchronously)
      //the activity should be given
      function updateConfigNameValuePair(activity)
      {
        //obtain worked activity
        var activity = activity || getActiveActivity()

        //obtains panel elements
        var element = document.getElementById("name-value-pair");

        //prepare panel elements
        loadExpressionConfiguration(element, activity)

        var fieldName = element.getElementsByTagName("input")[0];
        var fieldValue = element.getElementsByClassName("expression")[0].getElementsByTagName("input")[0];

        //obtain 3D labels
        var textName = activity.getElementsByTagName("a-text")[0].firstChild;

        //replace panel values using activity values
        fieldName.value = textName.getAttribute('value').slice(0, -1); //gets rid of tail character ':'
        fieldValue.value = activity.components.expression.getValue()

        //prepare select (with expression variables)
        populateExpressionVariables(element.getElementsByClassName('expression')[0])
      }

      //Sets Configuration Panel with Activity configuration
      //on situations where there is execution concurrency (e.g. components being initialised asynchronously)
      //the activity should be given
      function updateConfigBody(activity)
      {
        //obtain worked activity
        var activity = activity || getActiveActivity()

        if(activity.getAttribute('processor-type') != 'body')
        {
          return
        }

        //obtains panel elements
        var element = document.getElementById("set-body");

        //prepare panel elements
        loadExpressionConfiguration(element, activity)

        //obtain reference to input
        var expressionConfig = element.getElementsByClassName("expression")[0].getElementsByTagName("input")[0];

        //replace input value using activity values
        expressionConfig.value = activity.components.expression.getValue()
      }

      //===============================================
      //PENDING COMPLETION
      //===============================================
      //COPIED from 'updateConfigBody'.
      //It may still be reusing elements from 'setBody'
      //===============================================
      function updateConfigSplit(activity)
      {
        //obtain worked activity
        var activity = activity || getActiveActivity()

        if(activity.getAttribute('processor-type') != 'split-start')
        {
          return
        }

        //obtains panel elements
        var element = document.getElementById("set-body");

        //prepare panel elements
        loadExpressionConfiguration(element, activity)

        //obtain reference to input
        var expressionConfig = element.getElementsByClassName("expression")[0].getElementsByTagName("input")[0];

        //replace input value using activity values
        expressionConfig.value = activity.components.expression.getValue()
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
      
      
      
      