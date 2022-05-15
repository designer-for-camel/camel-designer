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
        // mapButton.setAttribute("opacity", "1")
        mapButton.setAttribute("value", "Inputs")
        mapButton.setAttribute("position", "0 1 0")
        mapButton.setAttribute("onclick", "this.parentEl.components.mapping.enableMapperView(event)")
        this.el.appendChild(mapButton)
        this.buttonMapper = mapButton
           
        // let mapTree = {
        //     "Content-Type": "",
        //     Accept: "",
        //     Authorization: "",
        // }
        let mapTree = this.data.datatarget


        this.mapping = document.createElement('a-entity')
        this.mapping.id = this.el.id + "-map"
        this.mapping.setAttribute("position", "2 "+mapperPosition+" 1") // we place X=2 to create a smooth camera movent event for Route/Mapping transitions
        this.el.appendChild(this.mapping)

        //this action will ensure there is a default source data tree
        //we create source tree first to allow target tree initialisation to find source elements
        this.refreshProcessContext()

        let map = document.createElement('a-map-tree')
        map.setAttribute("tree", JSON.stringify(mapTree))
        map.setAttribute("istarget", true)
        // map.setAttribute("type", "headers")
        map.setAttribute("processvars", true)
        map.setAttribute("position", "1 2 0")
        this.mapping.appendChild(map)
    
        this.targetTree = map

        // map = document.createElement('a-map-tree')
        // map.setAttribute("tree", JSON.stringify(mapTree))
        // map.setAttribute("istarget", false)
        // map.setAttribute("position", "-3 2 0")
        // this.mapping.appendChild(map)


        // //this action will ensure there is a default source data tree
        // this.refreshProcessContext()


        this.textarea = document.createElement('a-textarea')
        this.textarea.setAttribute("cols", 20)
        this.textarea.setAttribute("rows", 1)
        this.textarea.setAttribute("scale", "2.5 2.5 2.5")
        // this.textarea.setAttribute("disabled", true)
        this.mapping.appendChild(this.textarea)


        // <!-- <a-entity camera="active: false" camrender="cid: cam2" position="0 1.6 5" rotation="0 0 0">
        // </a-entity> -->


        let assets = document.querySelector('a-assets')
    
        let camCanvas = document.createElement('canvas')
        camCanvas.id = "cam-preview-"+this.el.id
        assets.appendChild(camCanvas)

        this.previewCamera = document.createElement('a-entity')
        this.previewCamera.setAttribute("camera", {active: false})
        // this.previewCamera.setAttribute("camrender", {cid: "cam2"})
        this.previewCamera.setAttribute("camrender", {cid: camCanvas.id})
        this.previewCamera.setAttribute("position", "6 3 7")
        this.mapping.appendChild(this.previewCamera)


        this.preview = document.createElement('a-plane')
        this.preview.setAttribute("position", "0 1.08 0")
        this.preview.setAttribute("width", "16.1")
        this.preview.setAttribute("height", "9.1")
        this.preview.setAttribute("scale", ".2 .2 .2")
        // this.el.appendChild(this.preview)
        this.preview.setAttribute("visible", "false")
        this.buttonMapper.appendChild(this.preview)

        this.previewRender = document.createElement('a-plane')
        this.previewRender.setAttribute("position", "0 0 0.01")
        this.previewRender.setAttribute("width", "16")
        this.previewRender.setAttribute("height", "9")
        // this.previewRender.setAttribute("material", "src:#cam2; opacity: .95")
        // this.previewRender.setAttribute("material", "src:#cam2;")
        this.previewRender.setAttribute("material", "src:#"+camCanvas.id)
        this.previewRender.setAttribute("canvas-updater", "")
        this.preview.appendChild(this.previewRender)

        // let lblpreview = document.createElement('a-text')
        // lblpreview.setAttribute("value","preview")
        // lblpreview.setAttribute("scale", "3 3 3")
        // lblpreview.setAttribute("align", "center")
        // lblpreview.setAttribute("position", ".55 2.8 0")
        // this.mapping.appendChild(lblpreview)

        // <a-plane position="0 -4 -2" rotation="0 0 0" width="4" height="3"
        // material="src:#cam2; opacity: .95" canvas-updater></a-plane> -->
  


// back.setAttribute('animation', {  startEvents:'mouseenter',
//                                 pauseEvents:'mouseleave',
//                     

        this.el.addEventListener('mouseenter', function(){this.preview.setAttribute("visible", "true")}.bind(this))
        this.el.addEventListener('mouseleave', function(){this.preview.setAttribute("visible", "false")}.bind(this))

    },

    //Actions when closing the Mapping View
    closeMappingView: function(event)
    {
        this.enableRouteView(event)

        let fs = new THREE.Vector3()
        let ft = new THREE.Vector3()
        let ls = new THREE.Vector3()
        let lt = new THREE.Vector3()
        
        this.datasource.object3D.getWorldPosition(fs)
        this.targetTree.object3D.getWorldPosition(ft)

        let lastsource = this.datasource.querySelectorAll('a-map-entry')
        // lastsource = lastsource[lastsource.length-1]    
        let lasttarget = this.targetTree.querySelectorAll('a-map-entry')   
        // lasttarget = lasttarget[lasttarget.length-1]

        lastsource[lastsource.length-1].object3D.getWorldPosition(ls)
        lasttarget[lasttarget.length-1].object3D.getWorldPosition(lt)

        let centerx = (ft.x + ls.x)/2
        let centery = (ft.y + ls.y)/2

        let center = new THREE.Vector3(
            centerx,
            centery,
            0
        )

        let refPos = Utils.getRelativePosition(this.mapping, center)

        this.previewCamera.object3D.position.set(
           refPos.x + 6,
           refPos.y + 1.5,
           7
        )
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
        // let mappings = this.initMappings
        mappings = this.initMappings

        //loop over the mappings
        for (let i = 0; i < mappings.length; i++) {
            const element = mappings[i];
            
            //helper variable
            let target

            //if element is body setter
            if(element.nodeName == "setBody"){
                target = this.targetTree.querySelector('a-map-entry[field="body"] > a-map-entry')
            }
            else{
                //TEMP: assumed element is 'setHeader'
                let field = element.attributes.name.value

                //obtain target map entry
                target = this.targetTree.querySelector('a-map-entry[field="'+field+'"] > a-plane.interactive')
            }

            this.createMapping(null, target, element)
        }

        //this marks the mapping as initialised (should run only once)
        this.initMappings = null
    },

    // createMapping: function(source, target, code)
    createMapping: function(source, target, code)
    {
        //if the target is not provided and we have the source code, we might want to guess the mapping
        // if(source && !target && code){
        if(!target && code){

            //create dynamically the target map entry.
            //because initialisation is asynchronous, the mapping needs to be postponed
            //the call automatically schedules the mapping to be created when ready
            this.targetTree.components.maptree.createLeafFromCode(source, code)

            //do not continue, the mapping needs to be postponed
            return
        }

        if(!source && target){
            //if not the mapentry element, we assume it's a child, and ensure we pick the root (parent)
            if(target.localName != 'a-map-entry'){
                target = target.parentElement
            }

            target.components.mapentry.setMappingExpression(null, code)
        }    
        else if(source && target){

            //if not the mapentry element, we assume it's a child, and ensure we pick the root (parent)
            if(source.localName != 'a-map-entry'){
                source = source.parentElement
            }

            //if not the mapentry element, we assume it's a child, and ensure we pick the root (parent)
            if(target.localName != 'a-map-entry'){
                target = target.parentElement
            }

            //create the mapping
            let rope = document.createElement('a-rope')
            rope.setAttribute("start", source.querySelector('a-box').id) //the ID of the connecting box (in the mapentry)
            rope.setAttribute("end",   target.querySelector('a-box').id) //the ID of the connecting box (in the mapentry)
            rope.setAttribute("attached", true)
            target.appendChild(rope)

            //set the expression
            target.components.mapentry.setMappingExpression(rope, code)
        }
        else{
            console.warn('failed to initialise mapping for: ' + code.outerHTML)
        }
    },
    
    getSourceMapEntry: function(language, expression)
    {
        let source = null
        
        if(language == "simple"){

            if(expression.startsWith("${body")){
                source = this.datasource.querySelector('a-map-entry[value="body"] > a-plane.interactive')
            }
            else if(expression.includes('${header.')){
                let header = expression.split('.')[1].split('}')[0]
                source = this.datasource.querySelector('a-map-entry[field="'+header+'"] > a-plane.interactive')
            }
            else if(expression.includes('${exchangeProperty.')){
                let property = expression.split('.')[1].split('}')[0]
                source = this.datasource.querySelector('a-map-entry[field="'+property+'"] > a-plane.interactive')
            }
        }
        else if(language == "constant"){
            //do nothing
        }
        //we assume here other languages evaluate against the body
        else{
            source = this.datasource.querySelector('a-map-entry[value="body"] > a-plane.interactive')
        }


        if(source){
            source = source.parentElement
        }

        return source
    },
    
    processCamelRendering: function(tabulation)
    {
        let mappings = this.targetTree.querySelectorAll('a-map-entry[ismapped]')

        // let renderPipeline = (mappings.length > 0)
        let renderPipeline = false

        let code = ""

        // if(renderPipeline){
        //     code += tabulation+'<pipeline id="'+this.el.id+'-pipeline">\n'
        // }

        for (let i = 0; i < mappings.length; i++) {
            const element = mappings[i];

            let expr = element.components.mapentry.getMappingExpression()
            
            let attributes = ""
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

            //populate object's parameters
            for (const [key, value] of Object.entries(expr.parameters)) {
                console.log(`${key}: ${value}`);
                attributes += ' '+key+'="'+value+'"'
            }

            expression = expr.expression

            switch(expr.target.type) {
/*                
                case 'properties':
                    code += tabulation+'  <setProperty '+getCamelAttributePropertyName()+'="'+expr.target.value+'" id="'+element.id+'">\n'+
                            // tabulation+'    '+'<simple>'+expression+'</simple>'+'\n'+
                            tabulation+'    '+'<'+expr.language+attributes+'>'+expression+'</'+expr.language+'>'+'\n'+
                            tabulation+'  </setProperty>\n'
                    break;
                case 'parameters':
                    code += tabulation+'  <setHeader '+getCamelAttributeHeaderName()+'="'+expr.target.value+'" id="'+element.id+'">\n'+
                            tabulation+'    '+'<'+expr.language+attributes+'>'+expression+'</'+expr.language+'>'+'\n'+
                            tabulation+'  </setHeader>\n'
                    break;
*/

                case 'headers':
                    renderPipeline = true
                    code += tabulation+'  <setHeader '+getCamelAttributeHeaderName()+'="'+expr.target.field+'" id="'+element.id+'">\n'+
                            tabulation+'    '+'<'+expr.language+attributes+'>'+expression+'</'+expr.language+'>'+'\n'+
                            tabulation+'  </setHeader>\n'
                    break;
                // case 'body':
                case 'payload':
                    renderPipeline = true
                    code += tabulation+'  <setBody id="'+element.id+'">\n'+
                            tabulation+'    '+'<'+expr.language+attributes+'>'+expression+'</'+expr.language+'>'+'\n'+
                            tabulation+'  </setBody>\n'
                    break;
            }
        }

        //helper variable
        let activity = this.el

        //obtain URI
        let uri = activity.components.uri.getValue()

        //regular expression to find variables
        const containsVariable = new RegExp('\\${.*}');
        
        //if variables found the URI is dynamic
        let dynamic = containsVariable.test(uri)

        //we assume the activity is an endpoint (<to>) and has URI
        let too = dynamic ? "<toD" : "<to"
        // let too = activity.hasAttribute("dynamic") ? "<toD" : "<to"

        //render as pipeline if it contains non trivial mappings
        if(renderPipeline){
            code  = tabulation+'<pipeline id="'+this.el.id+'-pipeline">\n' + code
            code += tabulation+'  '+too+' uri="'+activity.components.uri.getValue()+'" id="'+activity.id+'"/>\n'
            code += tabulation+'</pipeline>\n'
        }
        else{
            //no extra indentation
            code += tabulation+too+' uri="'+activity.components.uri.getValue()+'" id="'+activity.id+'"/>\n'
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




// Credit to:
// https://jgbarah.github.io/aframe-playground/components/#camrender
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