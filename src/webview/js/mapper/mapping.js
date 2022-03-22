// Global variable
mapperPosition = 0

AFRAME.registerComponent('mapping', {
    schema: {
        value: { type: "string", default: "" },
        width: { type: "number", default: 1 },
        wrapcount: { type: "number" },
        enabled: { type: "boolean", default: true },
        istarget: { type: "boolean", default: false},
        datatarget: {
            parse: function (value) {
              return JSON.parse(value);
            },
            stringify: function (value) {
              return JSON.stringify(value);
            }
          }
    },

    init: function () {

        mapperPosition += 100

        let mapButton = document.createElement('a-button')
        mapButton.setAttribute("value", "Mapper")
        mapButton.setAttribute("position", "0 1 0")
        mapButton.setAttribute("onclick", "this.parentEl.components.mapping.enableMapperView(event)")
        this.el.appendChild(mapButton)
           
        // let mapTree = {
        //     "Content-Type": "",
        //     Accept: "",
        //     Authorization: "",
        // }
        let mapTree = this.data.datatarget


        this.mapping = document.createElement('a-entity')
        this.mapping.id = this.el.id + "-mapping"
        this.mapping.setAttribute("position", "2 "+mapperPosition+" 1") // we place X=2 to create a smooth camera movent event for Route/Mapping transitions
        this.el.appendChild(this.mapping)

        let map = document.createElement('a-map-tree')
        map.setAttribute("tree", JSON.stringify(mapTree))
        map.setAttribute("istarget", true)
        // map.setAttribute("type", "headers")
        map.setAttribute("processvars", true)
        map.setAttribute("position", "1 2 0")
        this.mapping.appendChild(map)
    
        this.targetTree = map

            mapButton = document.createElement('a-button')
            mapButton.setAttribute("value", "Close")
            mapButton.setAttribute("position", "0 3 0")
            mapButton.setAttribute("onclick", "this.parentEl.parentEl.components.mapping.enableRouteView(event)")
            this.mapping.appendChild(mapButton)

        // map = document.createElement('a-map-tree')
        // map.setAttribute("tree", JSON.stringify(mapTree))
        // map.setAttribute("istarget", false)
        // map.setAttribute("position", "-3 2 0")
        // this.mapping.appendChild(map)


        //this action will ensure there is a default source data tree
        this.refreshProcessContext()


        this.textarea = document.createElement('a-textarea')
        this.textarea.setAttribute("cols", 20)
        this.textarea.setAttribute("rows", 1)
        this.textarea.setAttribute("scale", "2.5 2.5 2.5")
        // this.textarea.setAttribute("disabled", true)
        this.mapping.appendChild(this.textarea)

    },

    //Adds a new DataModel source to the Mapping element
    // - datamodel: data structure to construct
    // - processVariables: indicates if the data model describes Camel variables (headers, properties, etc)
    addDataModelSource: function(datamodel, processVariables)
    {
        processVariables = processVariables || false

        let position = new THREE.Vector3(-4, 2, 0)

        if(this.datasource){
            position = this.datasource.object3D.position.clone()
            this.mapping.removeChild(this.datasource)
        }

        let map = document.createElement('a-map-tree')
        map.setAttribute("tree", JSON.stringify(datamodel))
        map.setAttribute("istarget", false)
        map.setAttribute("processvars", processVariables)
        // map.setAttribute("position", "-3 2 0")
        this.mapping.appendChild(map)
        map.object3D.position.copy(position)

        this.datasource = map
    },

    

    //sets the mappings to construct during component initialisation
    //init() runs asynchronously. This function sets the mappings to use during init()
    setInitMappings: function(mappings)
    {
        this.initMappings = mappings
    },

    
    initialiseMappings: function()
    {
        if(!this.initMappings){
            return
        }

        //obtain mappings to initialise
        let mappings = this.initMappings

        //loop over the mappings
        for (let i = 0; i < mappings.length; i++) {
            const element = mappings[i];
            
            //TEMP: element here is 'setHeader'
            let field = element.attributes.name.value

            //get language used and expression
            let language = element.firstElementChild.localName
            let expression = element.firstElementChild.textContent

            //obtain source and target entries
            let source,target
            if(expression.includes('${body}')){
                source = this.datasource.querySelector('a-map-entry[value="body"] > a-plane.interactive')            
                target = this.targetTree.querySelector('a-map-entry[value="'+field+'"] > a-plane.interactive')
                
                this.createMapping(source, target, element)
            }

            if(expression.includes('${header.')){

                let header = expression.split('.')[1].split('}')[0]

                source = this.datasource.querySelector('a-map-entry[field="'+header+'"] > a-plane.interactive')            
                target = this.targetTree.querySelector('a-map-entry[value="'+field+'"] > a-plane.interactive')            
     
                this.createMapping(source, target, element)
            }
        }

        //this marks the mapping as initialised (should run only once)
        this.initMappings = null
    },

    createMapping: function(source, target, code)
    {
        if(source && target){

            let mapEntry = target.parentElement

            //create the mapping
            let rope = document.createElement('a-rope')
            rope.setAttribute("start", source.previousElementSibling.id)
            rope.setAttribute("end", target.previousElementSibling.id)
            rope.setAttribute("attached", true)
            mapEntry.appendChild(rope)

            mapEntry.components.mapentry.setMappingExpression(rope)

        }
        else{
            console.warn('failed to initialise mapping for: ' + code.outerHTML)
        }
    },
    
    processCamelRendering: function(tabulation)
    {
        let mappings = this.targetTree.querySelectorAll('a-map-entry[ismapped]')

        let code = ""

        for (let i = 0; i < mappings.length; i++) {
            const element = mappings[i];

            let expr = element.components.mapentry.getMappingExpression()
            
            let expression = ""

            for (let i = 0; i < expr.sources.length; i++) {
                const src = expr.sources[i];

                // let src = expr.sources[0]

                switch(src.type) {
                    case 'properties':
                        expression += '${exchangeProperty.'+src.field+'} '
                        break
                    case 'headers':
                        expression += '${header.'+src.field+'} '
                        break;
                    case 'body':
                        expression += '${body} '
                        break;
                    case 'literal':
                        expression += src.field + " "
                        break;
                }
            }

            //we eliminate trailing space added in for-loop
            expression = expression.slice(0, -1)

            switch(expr.target.type) {
                case 'properties':
                    code += tabulation+'  <setProperty '+getCamelAttributePropertyName()+'="'+expr.target.value+'" id="'+element.id+'">\n'+
                            tabulation+'    '+'<simple>'+expression+'</simple>'+'\n'+
                            tabulation+'  </setProperty>\n'
                    break;
                case 'parameters':
                    code += tabulation+'  <setHeader '+getCamelAttributeHeaderName()+'="'+expr.target.value+'" id="'+element.id+'">\n'+
                            tabulation+'    '+'<simple>'+expression+'</simple>'+'\n'+
                            tabulation+'  </setHeader>\n'
                    break;
                case 'headers':
                    code += tabulation+'  <setHeader '+getCamelAttributeHeaderName()+'="'+expr.target.value+'" id="'+element.id+'">\n'+
                            tabulation+'    '+'<simple>'+expression+'</simple>'+'\n'+
                            tabulation+'  </setHeader>\n'
                    break;
                case 'body':
                    code += tabulation+'  <setBody id="'+element.id+'">\n'+
                            tabulation+'    '+'<simple>'+expression+'</simple>'+'\n'+
                            tabulation+'  </setBody>\n'
                    break;
            }
        }

        return code
    },


    refreshProcessContext: function()
    {
        let vars = findExpressionVariables()

        //sets up datamodel
        let datamodel = {
            headers: {},
            properties: {},
            body: "body"
        }

        //populates data with headers/properties
        for (let index = 0; index < vars.length; index++) {
           const element = vars[index];

            if(element.startsWith("header")){
                datamodel.headers[element.split('.')[1]] = ""
            }
            else if(element.startsWith("exchangeProperty")){
                datamodel.properties[element.split('.')[1]] = ""
            }
        }

        let targetModel = {
            name: "exchange",
            datamodel: datamodel,
            custom:{}
        } 

        // this.addDataModelSource(datamodel, true)
        this.addDataModelSource(targetModel, true)
    },




    enableMapperView: function(event)
    {
        //this prevents the activity from triggering the ring selector process
        event.stopPropagation()

        switchConfigPaneByActivity(this.el)

        //process data variables may have changed, we refresh before showing mapper
        this.refreshProcessContext()

        //obtain camera viewpoint
        let camera = document.querySelector('#rig')

        //We place the camera at the Y level in preparation for a smooth X axis movement animation
        camera.object3D.position.y = this.mapping.object3D.position.y

        //obtain world position of mapping
        let centerPoint = new THREE.Vector3()
        this.mapping.object3D.getWorldPosition(centerPoint)

        //trigger smooth movement animation to Mapping
        setCameraPosition(centerPoint)
    },  
  
    enableRouteView: function(event)
    {
        //this prevents the activity from triggering the ring selector process
        event.stopPropagation()
    
        //obtain main camera
        let camera = document.querySelector('#rig')

        //We place the camera at the Y level in preparation for a smooth X axis movement animation
        camera.object3D.position.y = 0
        
        //center view on current activity
        setCameraFocus(getActiveActivity())
    },

    update: function (oldData) {

        //at creation time there is no data, so we ignore the invocation
        if(Object.keys(oldData).length === 0){
            return
        }


    },
    tick: function () {},
    remove: function () {},
    pause: function () {},
    play: function () {}
  });
  
  
//   AFRAME.registerPrimitive('a-map-entry', {
//     defaultComponents: {
//         'mapentry': {}
//     },
//     mappings: {
//         // menu: "dropdown.menu"
//         value: "mapentry.value",
//         width: "mapentry.width",
//         wrapcount: "mapentry.wrapcount",
//         enabled: "mapentry.enabled",
//         istarget: "mapentry.istarget",
//     }
//   });



AFRAME.registerComponent('camrender',{
    'schema': {
       // desired FPS
       fps: {
            type: 'number',
            default: 90.0
       },
       // Id of the canvas element used for rendering the camera
       cid: {
            type: 'string',
            default: 'camRenderer'
       },
       // Height of the renderer element
       height: {
            type: 'number',
            default: 300
       },
       // Width of the renderer element
       width: {
            type: 'number',
            default: 400
       }
    },
    'update': function(oldData) {
        var data = this.data
        if (oldData.cid !== data.cid) {
            // Find canvas element to be used for rendering
            var canvasEl = document.getElementById(this.data.cid);
            // Create renderer
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                canvas: canvasEl
            });
            // Set properties for renderer DOM element
            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.domElement.crossorigin = "anonymous";
        };
        if (oldData.width !== data.width || oldData.height !== data.height) {
            // Set size of canvas renderer
            this.renderer.setSize(data.width, data.height);
            this.renderer.domElement.height = data.height;
            this.renderer.domElement.width = data.width;
        };
        if (oldData.fps !== data.fps) {
            // Set how often to call tick
            this.tick = AFRAME.utils.throttleTick(this.tick, 1000 / data.fps , this);
        };
    },
    'tick': function(time, timeDelta) {
        this.renderer.render( this.el.sceneEl.object3D , this.el.object3DMap.camera );
    }
});

AFRAME.registerComponent('canvas-updater', {
    dependencies: ['geometry', 'material'],

    tick: function () {
        var el = this.el;
        var material;

        material = el.getObject3D('mesh').material;
        if (!material.map) { return; }
        material.map.needsUpdate = true;
    }
});