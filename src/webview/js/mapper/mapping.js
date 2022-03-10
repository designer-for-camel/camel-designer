// Global variable
mapperPosition = 0

AFRAME.registerComponent('mapping', {
    schema: {
        value: { type: "string", default: "" },
        width: { type: "number", default: 1 },
        wrapcount: { type: "number" },
        enabled: { type: "boolean", default: true },
        istarget: { type: "boolean", default: false},
    },

    init: function () {

        mapperPosition += 100

        let mapButton = document.createElement('a-button')
        mapButton.setAttribute("value", "Mapper")
        mapButton.setAttribute("position", "0 1 0")
        mapButton.setAttribute("onclick", "this.parentEl.components.mapping.enableMapperView(event)")
        this.el.appendChild(mapButton)
           
        let mapTree = {
            "Content-Type": "",
            Accept: "",
            Authorization: "",
        }
    
        this.mapping = document.createElement('a-entity')
        this.mapping.id = this.el.id + "-mapping"
        this.mapping.setAttribute("position", "2 "+mapperPosition+" 1") // we place X=2 to create a smooth camera movent event for Route/Mapping transitions
        this.el.appendChild(this.mapping)

        let map = document.createElement('a-map-tree')
        map.setAttribute("tree", JSON.stringify(mapTree))
        map.setAttribute("istarget", true)
        map.setAttribute("type", "headers")
        map.setAttribute("processvars", true)
        map.setAttribute("position", "2 2 0")
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

        // if(this.initMappings){
        //     this.initialiseMappings()
        // }
    },

    //Adds a new DataModel source to the Mapping element
    // - datamodel: data structure to construct
    // - processVariables: indicates if the data model describes Camel variables (headers, properties, etc)
    addDataModelSource: function(datamodel, processVariables)
    {
        processVariables = processVariables || false

        let position = new THREE.Vector3(-3, 2, 0)

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
                source = this.datasource.querySelector('a-map-entry[value="body"] > a-box.interactive')            
                target = this.targetTree.querySelector('a-map-entry[value="'+field+'"] > a-box.interactive')
                
                this.createMapping(source, target, element)
            }

            if(expression.includes('${header.')){

                let header = expression.split('.')[1].split('}')[0]

                source = this.datasource.querySelector('a-map-entry[value="'+header+'"] > a-box.interactive')            
                target = this.targetTree.querySelector('a-map-entry[value="'+field+'"] > a-box.interactive')            
     
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
            rope.setAttribute("start", source.id)
            rope.setAttribute("end", target.id)
            rope.setAttribute("attached", true)
            mapEntry.appendChild(rope)

            mapEntry.components['map-entry'].setMappingExpression(rope)

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

            let expr = element.components['map-entry'].getMappingExpression()
            
            // let source = document.getElementById(element.getAttribute('start'))
            // let target = document.getElementById(element.getAttribute('end'))
            
            // let sourceEntry = source.closest('a-map-entry')
            // let targetEntry = target.closest('a-map-entry')

            // let sourceField = sourceEntry.attributes.value.value
            // let targetField = targetEntry.attributes.value.value

            // let varType    = sourceEntry.attributes.vartype.value
            // let setterType = targetEntry.attributes.vartype.value

            let expression

            let src = expr.sources[0]

            switch(src.type) {
                case 'properties':
                    expression = '${exchangeProperty.'+src.field+'}'
                    break
                case 'headers':
                    expression = '${header.'+src.field+'}'
                    break;
                case 'body':
                    expression = '${body}'
                    break;
            }

            switch(expr.target.type) {
                case 'properties':
                    code += tabulation+'  <setProperty '+getCamelAttributePropertyName()+'="'+expr.target.field+'" id="'+element.id+'">\n'+
                            tabulation+'    '+'<simple>'+expression+'</simple>'+'\n'+
                            tabulation+'  </setProperty>\n'
                    break;
                case 'headers':
                    code += tabulation+'  <setHeader '+getCamelAttributeHeaderName()+'="'+expr.target.field+'" id="'+element.id+'">\n'+
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

        //code += tabulation+'</pipeline>\n'

        return code
    },

    processCamelRenderingV1: function(tabulation)
    {
        let mappings = this.el.querySelectorAll('a-rope')

        // let code = tabulation+'<pipeline id="'+this.el.id+'-pipeline">\n'
        let code = ""

        for (let i = 0; i < mappings.length; i++) {
            const element = mappings[i];

            let source = document.getElementById(element.getAttribute('start'))
            let target = document.getElementById(element.getAttribute('end'))
            
            let sourceEntry = source.closest('a-map-entry')
            let targetEntry = target.closest('a-map-entry')

            let sourceField = sourceEntry.attributes.value.value
            let targetField = targetEntry.attributes.value.value

            let varType    = sourceEntry.attributes.vartype.value
            let setterType = targetEntry.attributes.vartype.value

            let expression

            switch(varType) {
                case 'properties':
                    expression = '${exchangeProperty.'+sourceField+'}'
                    break
                case 'headers':
                    expression = '${header.'+sourceField+'}'
                    break;
                case 'body':
                    expression = '${body}'
                    break;
            }

            switch(setterType) {
                case 'properties':
                    code += tabulation+'  <setProperty '+getCamelAttributePropertyName()+'="'+targetField+'" id="'+targetEntry.id+'">\n'+
                            tabulation+'    '+'<simple>'+expression+'</simple>'+'\n'+
                            tabulation+'  </setProperty>\n'
                    break;
                case 'headers':
                    code += tabulation+'  <setHeader '+getCamelAttributeHeaderName()+'="'+targetField+'" id="'+targetEntry.id+'">\n'+
                            tabulation+'    '+'<simple>'+expression+'</simple>'+'\n'+
                            tabulation+'  </setHeader>\n'
                    break;
                case 'body':
                    code += tabulation+'  <setBody id="'+targetEntry.id+'">\n'+
                            tabulation+'    '+'<simple>'+expression+'</simple>'+'\n'+
                            tabulation+'  </setBody>\n'
                    break;
            }
        }

        //code += tabulation+'</pipeline>\n'

        return code
    },




    refreshProcessContext: function()
    {
        let vars = findExpressionVariables()

        //sets up datamodel
        let datamodel = {
            headers: {},
            properties: {},
            body: ""
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

        this.addDataModelSource(datamodel, true)
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
//         'map-entry': {}
//     },
//     mappings: {
//         // menu: "dropdown.menu"
//         value: "map-entry.value",
//         width: "map-entry.width",
//         wrapcount: "map-entry.wrapcount",
//         enabled: "map-entry.enabled",
//         istarget: "map-entry.istarget",
//     }
//   });
