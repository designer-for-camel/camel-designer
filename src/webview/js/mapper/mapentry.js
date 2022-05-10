// var mapEntryId = 0

AFRAME.registerComponent('mapentry', {
    schema: {
        //menu: {}
        field: { type: "string", default: "" },
        value: { type: "string", default: "" },
        width: { type: "number", default: 1 },
        wrapcount: { type: "number" },
        enabled: { type: "boolean", default: true },
        ismappable: { type: "boolean", default: true },
        iseditable: { type: "boolean", default: false },
        istarget: { type: "boolean", default: false},
        childbutton: { type: "boolean", default: false },
        childprefix: { type: "string", default: "field" },
        childrecursive: { type: "boolean", default: false },
        childcount: { type: "number", default: 0 },
        notify: { type: "string", default: "" },
    },
    init: function () {

        let textWidth = this.data.field.length / 10 + .5
 

        //this button allows the user to create new child map entries
        let button = document.createElement('a-plane')
        // button.id = "mapentry-button-" + sharedId
        // button.id = this.el.parentElement.id + "-" + this.data.value
        button.setAttribute('opacity', '.3')
        // button.setAttribute('depth', '.05')
        // button.setAttribute('width', '1')
        // button.setAttribute('width', this.data.width)
        button.setAttribute('width', .3)
        button.setAttribute('height', '.3')
        button.setAttribute('animation__scale',         {property: 'opacity', dur: 0, to: '.6', startEvents: 'mousedown'});
        button.setAttribute('animation__scale_reverse', {property: 'opacity', dur: 0, to: '.3', startEvents: 'mouseup'});
        
        // if children are allowed
        if(this.data.childbutton){
            button.classList.add('interactive')
        }
        else{
            button.setAttribute('visible', false)
        }
        
        // button.object3D.position.setX(textWidth)
        button.object3D.position.setX(2.2)
        this.childCount = this.data.childcount
        button.onclick = function(){       
            this.createChild(null, true)            
        }.bind(this);

        //set label to add child button
        let label = appendLabel(button, "+", this.data.wrapcount)
        label.setAttribute('scale', '4 4 4')

        //event listener for menu option
        button.addEventListener('mousedown', function(){
            button.object3D.position.setZ(button.object3D.position.z-0.05)
        });
    
        //event listener for menu option
        button.addEventListener('mouseup', function(){       
            button.object3D.position.setZ(button.object3D.position.z+0.05)
        });

        this.el.appendChild(button)


                            // let label = appendLabel(this.el, this.data.value, this.data.wrapcount)
                            let leaf = document.createElement('a-text')
                            leaf.setAttribute("value",this.data.field)
                            // leaf.setAttribute("width", 2.7)
                            // leaf.setAttribute("width", 5)
                            // leaf.setAttribute("width",width*5)
                            // leaf.setAttribute("color","red")
                            this.el.appendChild(leaf)
                            this.fieldlabel = leaf



            // let leaf = document.createElement('a-entity')
            // leaf.setAttribute("geometry", "primitive: plane; height: auto; width: auto")
            // leaf.setAttribute("material", "color: black")
            // // leaf.setAttribute("text", "width: 5; ")
            // leaf.setAttribute("text", {width: 5, value: this.data.field} )

            // // back.setAttribute("position","4.5 0 0")
            // this.el.appendChild(leaf)
            // this.labelvalue = leaf

            // if(this.data.ismappable){
            //     leaf.setAttribute("mappable","")
            // }


        // let field = document.createElement('a-textarea')    
        // field.setAttribute('cols', 10)
        // field.setAttribute('rows', 1)
        // field.setAttribute("position",".8 0 0")
        // this.el.appendChild(field)

        //this is only an approximation calculation
        //text width is a hard thing to obtain
        // let textWidth = this.data.field.length / 10 + .5
        let posMapPoint = textWidth

        if(this.data.istarget){
            posMapPoint = -.2
        }

        //This box represents the source/target link point for the visual mapping
        let mapPoint = document.createElement('a-box')    
        mapPoint.setAttribute('opacity', '.3')
        mapPoint.setAttribute('depth', '.01')
        // button.setAttribute('width', '1')
        mapPoint.setAttribute('width', .1)
        mapPoint.setAttribute('height', .1)
        // mapPoint.setAttribute("mappable","")
        // mapPoint.setAttribute("position","1.5 0 0")
        mapPoint.setAttribute("position", posMapPoint + " 0 0")
        // mapPoint.setAttribute("mappable","")
        // mapPoint.classList.add("interactive")
        // mapPoint.id = "mapentry-link-point-" + sharedId
        mapPoint.id = this.el.id + "-" + "link-point"
        this.el.appendChild(mapPoint)

                        //Create background interactive plane to edit map entry
                        let back = document.createElement("a-plane")
                        back.id = this.el.id + "-" + "plane"    
                        back.setAttribute("width", 2)     
                        back.setAttribute("height",".3")
                        back.setAttribute("opacity",".5")
                        back.setAttribute("visible",false)
                        if(this.data.ismappable){
                            back.setAttribute("mappable","")
                        }
                        back.object3D.position.x = 1 
                        back.object3D.position.z = -.01
                        this.el.appendChild(back)


                        if(this.el.parentElement.getAttribute('childbutton') == "true"){
                            //Create interactive button to delete map entry
                            let del = document.createElement('a-plane')
                            let lbl = appendLabel(del, "X")
                            lbl.object3D.position.z+=.01
                            del.setAttribute("width", .3)
                            del.setAttribute("height",".3")
                            del.setAttribute("color","#515A5A")
                            del.setAttribute("position",".85 0 .01")
                            del.classList.add('interactive')
                            back.appendChild(del)

                            del.addEventListener('click', function(event){
                                event.stopPropagation()
                                this.el.closest('a-map-tree').components.maptree.removeLeaf(this.el)
                            }.bind(this));
                        }

                        /*
                        let del = document.createElement('a-entity')
                        del.setAttribute("geometry", "primitive: plane; height: auto; width: .3")
                        del.setAttribute("material", "color: grey")
                        // back.setAttribute("text", "width: 5; align: center")
                        del.setAttribute("text", "value: x; wrap-count: 1; align center")
                        // back.setAttribute("geometry", "primitive: plane; height: auto; width: auto")
                        // del.setAttribute("position","1.8 0 0")
                        back.appendChild(del)
                        //this.labelvalue = back

                        this.el.appendChild(back)
*/


        back.classList.add('interactive')

        if(this.data.ismappable){

            back.setAttribute('animation', {  startEvents:'mouseenter',
                                            pauseEvents:'mouseleave',
                                            property: 'visible',
                                            dur: '0',
                                            from: false,
                                            to: true,
                                            })

            back.setAttribute('animation__2',{
                                            startEvents:'mouseleave',
                                            property: 'visible',
                                            dur: '0',
                                            to: false
                                            })

            if(this.data.istarget){
                //visual helper to isolate mappings for this map entry
                //when mouse over it, we disable other mappings and leave only the ones for this map entry
                back.addEventListener('mouseenter', function(){
                    //obtain mappings for this map entry
                    let list = this.el.querySelectorAll('a-rope')

                    //if none, we ignore
                    if(list.length == 0){
                        return
                    }

                    //we obtain all mappings for this map tree
                    let all = this.el.closest('[maptree]').querySelectorAll('a-rope')

                    //for simplicity, we make all mappings invisible...
                    for (let mapping of all) {
                        mapping.setAttribute('visible', false)
                    }

                    //... and we render visible only the local ones
                    for (let mapping of list) {
                        mapping.setAttribute('visible', true)
                    }
                }.bind(this));

                //visual helper to isolate mappings for this map entry
                //when mouse leaves, we restore the visibility of all the mappings
                back.addEventListener('mouseleave', function(){
                    //obtain mappings for this map entry
                    let list = this.el.querySelectorAll('a-rope')

                    //if none, we ignore
                    if(list.length == 0){
                        return
                    }
                  
                    //obtain all mappings for this map tree
                    let all = this.el.closest('[maptree]').querySelectorAll('a-rope')

                    //we restore visibility for all
                    for (let mapping of all) {
                        mapping.setAttribute('visible', true)
                    }
                }.bind(this));
            }


            if(this.data.istarget){

                if(this.data.iseditable)
                {
                    back.addEventListener('click', function(event){
                        event.stopPropagation()

                        let textarea = this.closest('[mapping]').querySelector('a-textarea')

                        let txtWP = new THREE.Vector3()
                        textarea.parentElement.object3D.getWorldPosition(txtWP)

                        let entryWP = new THREE.Vector3()
                        this.parentElement.object3D.getWorldPosition(entryWP)

                        let v1 = txtWP.clone().negate()
                        let v2 = entryWP

                        v1.add(v2)

                        // v1.x += textarea.components.textarea.background.components.geometry.data.width / 2 -.2//textarea.components.textarea.background.object3D.scale
                        v1.x += 1.15
                        v1.y += 0
                        v1.z += .01

                        textarea.components.textarea.setInputMode(this.parentElement.getAttribute("field"), 14, function(text){
                            console.log("got the text: "+text)

                            //obtain map entry
                            let mapentry = this.closest('[mapentry]').components.mapentry
                            let notify = mapentry.data.notify

                            //if configured to notify
                            if(notify){
                                //emit notification with update
                                this.emit(notify, {old: mapentry.data.field, new: text});                                
                            }

                            //update field name
                            this.parentElement.setAttribute("field", text)
                        }.bind(this))

                        //set focus
                        textarea.components.textarea.focus()

                        textarea.object3D.position.copy(v1)

                        setCameraFocus(this)
                    });
                }

                //this is the visual label containing the current map entry value
                //we don't set its default value just yet... as we need to initialise other map entry elements first
                //its defaut value is set at the very end
                this.labelvalue = document.createElement('a-text')
                this.labelvalue.setAttribute("position","2.4 0 0")
                this.el.appendChild(this.labelvalue)


                //this is the visual background
                back = document.createElement("a-plane") 
                back.setAttribute("width", 5)     
                back.setAttribute("height",".3")
                back.setAttribute("opacity",".5")
                back.setAttribute("visible",false)
                back.object3D.position.x = 2.4 + (5/2) // position + width/2 
                // back.object3D.position.z = -.01
                this.el.appendChild(back)

                //set default list if none passed (when there is no interaction with the VS extension)
                let langentries = [
                    {"label":"simple"},
                    {"label":"constant"},
                    {"label":"xpath"},
                    {"label":"jsonpath"}
                ]

                let langmenu = {
                    "name":"map-"+this.el.id,
                    "label":"atlasmapmenu",
                    "class":"ui",
                    "enabled":true,
                    "menu": langentries}

                //helper variable to create the dropdown
                const placeholder = document.createElement("div");

                //dynamic creation of dropdown
                placeholder.innerHTML = 
                    `<a-dropdown position="3 0 0" width="1"
                     menu='`+JSON.stringify(langmenu)+`' value="simple"></a-dropdown>`;

                //extract dropdown element
                this.language = placeholder.firstElementChild

                back.appendChild(this.language)

                //set UI actions on dropdown selection
                this.language.onclick = function(e){
                    e.stopPropagation()

                    if(!this.expression){
                        this.initExpression()
                    }

                    // if no expression is set or user switches to a different language
                    if( !this.expression.expression ||
                        this.expression.language != e.currentTarget.attributes.value.value){

                        //set expression from selected dropdown option
                        this.expression.language = e.currentTarget.attributes.value.value

                        //set the expression according to language selected
                        switch(this.expression.language){
                            case 'simple':
                                this.expression.expression = '${body}'
                                break;
            
                            case 'xpath':
                                this.expression.expression = "/your_xpath_expression"
                                this.createAttribute("saxon", "true")

                                //if source mapping is a header, create attribute
                                if(this.expression.sources.length == 1 && this.expression.sources[0].type == "headers"){
                                    this.createAttribute("headerName", this.expression.sources[0].field)
                                }
                                break;
                            
                            case 'jsonpath':
                                this.expression.expression = "$.your_jsonpath_expression"
                                break;
            
                            case 'constant':
                                this.expression.expression = "your constant expression"
                                break;
                        }

                        this.setVisualMappingExpression(this.expression.expression)
                    }
                    // activity.components.uri.setTarget(adm)

                    // syncEditor()
                }.bind(this)


                // back = document.createElement('a-entity')
                // back.setAttribute("geometry", "primitive: plane; height: auto; width: auto")
                // back.setAttribute("material", "color: black")
                // // back.setAttribute("text", "width: 5; align: center")
                // back.setAttribute("text", "width: 5;")
                // // back.setAttribute("geometry", "primitive: plane; height: auto; width: auto")
                // back.setAttribute("position","4.7 0 0")
                // this.el.appendChild(back)
                // this.labelvalue = back


                back.classList.add('interactive')
    
                // back.setAttribute('animation', {  startEvents:'mouseenter',
                //                                 pauseEvents:'mouseleave',
                //                                 property: 'opacity',
                //                                 dur: '0',
                //                                 from: 0,
                //                                 to: .5,
                //                                 })
    
                // back.setAttribute('animation__2',{
                //                                 startEvents:'mouseleave',
                //                                 property: 'opacity',
                //                                 dur: '0',
                //                                 to: 0})

                back.setAttribute('animation', {  startEvents:'mouseenter',
                                                pauseEvents:'mouseleave',
                                                property: 'visible',
                                                dur: '0',
                                                from: false,
                                                to: true,
                                                })
    
                back.setAttribute('animation__2',{
                                                startEvents:'mouseleave',
                                                property: 'visible',
                                                dur: '0',
                                                to: false})



                // back.setAttribute('animation', {  startEvents:'mouseenter',
                //                                 pauseEvents:'mouseleave',
                //                                 property: 'material.color',
                //                                 dur: '500',
                //                                 from: '#000000',
                //                                 to: '#808080',
                //                                 })
    
                // back.setAttribute('animation__2',{
                //                                 startEvents:'mouseleave',
                //                                 property: 'material.color',
                //                                 dur: '500',
                //                                 to:  "#000000"})
    
                back.addEventListener('click', function(event){
                    event.stopPropagation()
    
                    let textarea = this.el.closest('[mapping]').querySelector('a-textarea')
    
                    let txtWP = new THREE.Vector3()
                    textarea.parentElement.object3D.getWorldPosition(txtWP)
    
                    let entryWP = new THREE.Vector3()
                    this.el.object3D.getWorldPosition(entryWP)
    
                    let v1 = txtWP.clone().negate()
                    let v2 = entryWP
    
                    v1.add(v2)
    

                    // v1.x += 6.2
                    // v1.y += -.4
                    // v1.z += .01
                    v1.x += 5.7
                    v1.y += -.35
                    v1.z += .01
        
                    //position textarea
                    textarea.object3D.position.copy(v1)
        
                    //prompt the user to edit
                    textarea.components.textarea.setTextareaMode(this.labelvalue.getAttribute("value"), this.setVisualMappingExpression.bind(this))

                    //focus on textarea
                    textarea.components.textarea.focus()
                    setCameraFocus(textarea)
    
                }.bind(this));




                // BUTTON to add new attributes
                //this box allows the user to create new attribute entries
                button = document.createElement('a-plane')
                // button.id = "mapentry-button-" + sharedId
                // button.id = this.el.parentElement.id + "-" + this.data.value
                button.setAttribute('opacity', '.3')
                button.setAttribute('width', .3)
                button.setAttribute('height', '.3')
                button.setAttribute('attcreator', '')
                button.setAttribute('animation__scale',         {property: 'opacity', dur: 0, to: '.6', startEvents: 'mousedown'});
                button.setAttribute('animation__scale_reverse', {property: 'opacity', dur: 0, to: '.3', startEvents: 'mouseup'});
                button.classList.add('interactive')
                button.object3D.position.setX(3.7)

                //define action when clicked
                // - adds new attribute and prompts the user to enter a name/value pair
                button.onclick = function(e){   
                    console.log("Adding new attribute")
                    e.stopPropagation()

                    //obtain textarea to workwith
                    let textarea = this.closest('[mapping]').querySelector('a-textarea')

                    let txtWP = new THREE.Vector3()
                    textarea.parentElement.object3D.getWorldPosition(txtWP)

                    let entryWP = new THREE.Vector3()
                    button.object3D.getWorldPosition(entryWP)

                    let v1 = txtWP.clone().negate()
                    let v2 = entryWP

                    v1.add(v2)

                    v1.x += 1.15
                    v1.y += 0
                    v1.z += .01

                    textarea.components.textarea.setInputMode("enter_name", 14, function(text){
                        console.log("got the new attribute name: "+text)

                        let attName = text

                        textarea.components.textarea.setInputMode("enter_value", 14, function(text){
                            console.log("got the new attribute value: "+text)    
                            let attValue = text       
                            // this.components.mapentry.createAttribute(button, attName, attValue)    
                            this.components.mapentry.createAttribute(attName, attValue)    
                        }.bind(this), true)
                    }.bind(this), true)

                    textarea.components.textarea.focus()
                    textarea.object3D.position.copy(v1)
                    setCameraFocus(textarea)

                }.bind(this.el);

                //set label to menu button
                // let label = appendLabel(button, this.data.field, this.data.wrapcount)
                let label = appendLabel(button, "+", this.data.wrapcount)
                // label.setAttribute('position', "0 0 .049")
                label.setAttribute('scale', '4 4 4')

                //event listener for menu option
                button.addEventListener('mousedown', function(){
                    button.object3D.position.setZ(button.object3D.position.z-0.05)
                });
            
                //event listener for menu option
                button.addEventListener('mouseup', function(){       
                    button.object3D.position.setZ(button.object3D.position.z+0.05)
                });

                // this.el.appendChild(button)
                back.appendChild(button)
            }
        }

        //adding new map entries disrupts existing layout. We need to redraw the tree
        this.el.closest('a-map-tree').components.maptree.redraw()

        // set default mapping value if is target and mappable
        // if default value is not empty string, we create a mapping expression
        if(this.data.istarget && this.data.ismappable && this.data.value.length > 0){
            this.setVisualMappingExpression(this.data.value)
        }

        this.el.emit('mapentry-init-complete');
    },

    // setFieldName: function(name){
    //     this.fieldlabel.setAttribute("value", name)
    // },

    getMappingExpression: function(){
        return this.expression
    },

    setVisualMappingExpression: function(expression){

        //set internal variables
        this.setMappingExpression(null, null, expression)

        //set visual value
        this.labelvalue.setAttribute("value", expression)

        //update mappings
        this.updateMappings(expression)
    },

    updateMappings: function(expression){

        //helper variable
        let vars = {}

        //first phase: identify variables in expression
        if(this.expression.language == "simple"){

            if(expression.includes('${body')){
                // vars.push("${body}")
                vars["${body}"] = "body"
            }

            if(expression.includes('${header.')){

                let instances = expression.split('${header.')
               
                for(let i = 1; i<instances.length; i++){
                    let header = instances[i].split('}')[0]
                    // vars.push("${header."+header+"}")
                    vars["${header."+header+"}"] = "header"
                } 
            }

            if(expression.includes('${exchangeProperty.')){

                let instances = expression.split('${exchangeProperty.')
               
                for(let i = 1; i<instances.length; i+=2){
                    let property = instances[i].split('}')[0]
                    // vars.push("${header."+header+"}")
                    vars["${exchangeProperty."+property+"}"] = "property"
                } 
            }
        }
        else if(this.expression.language == "constant"){
            //do nothing
        }
        else if(this.expression.language == "xpath"){
            if(this.expression.expression.length > 0){
                if(this.expression.parameters.headerName){
                    vars[this.expression.parameters.headerName] = "header"

                    // this.createAttribute("headerName", this.expression.parameters.headerName)
                }
                else{
                    vars.body = "body"
                }
            }
        }
        else{ //we assume all other languages evaluate against the body
            vars.body = "body"
        }

        let current = this.expression.sources
        let filtered = []

        //second phase: clean up mappings with no matching variable
        for(let i = 0; i < current.length; i++){

            let sourceVar = ""

            if(this.expression.language == "simple"){
                if(current[i].type == "headers"){
                    sourceVar = "${header." + current[i].field + "}"
                }
                else if(current[i].type == "properties"){
                    sourceVar = "${exchangeProperty." + current[i].field + "}"
                }
                else if(current[i].type == "body"){
                    sourceVar = "${body}"
                }
            }
            else if(this.expression.language == "xpath"){
                sourceVar = "body"

                if(this.expression.parameters.headerName){
                    sourceVar = this.expression.parameters.headerName
                }
            }

            //if current source field not found in expression, we delete the mapping
            if(!vars[sourceVar]){
                var mapping = this.el.querySelector('a-rope[start='+current[i].id+']')
                this.el.removeChild(mapping)
            }
            else{
                //we retain the mapping in the new sources list
                filtered.push(current[i])

                //we remove from the expression var list, the variable processed
                delete vars[sourceVar]
            }
            
        }

        //keep only those mappings that still exist
        this.expression.sources = filtered


        //third phase: we look at the variables left in our list
        for(variable in vars){

            let source = this.el.closest('[mapping]').components.mapping.getSourceMapEntry(this.expression.language, variable)
            let target = this.el

            //create visual mapping if source entry found
            if(source){
                //create the mapping
                let rope = document.createElement('a-rope')
                rope.setAttribute("start", source.querySelector('a-box').id) //the ID of the connecting box (in the mapentry)
                rope.setAttribute("end",   target.querySelector('a-box').id) //the ID of the connecting box (in the mapentry)
                rope.setAttribute("attached", true)
                target.appendChild(rope)
                
                //register the source
                this.expression.sources.push({
                    type:  source.attributes.vartype.value,
                    field: target.attributes.field.value,
                    id:    rope.getAttribute("start")
                    // field: sourceEntry.attributes.value.value
                })
            }
        }

        console.log("dummy")
    },

    getPath: function(entry){

        const path = []; // To save the path of the node element that need to get to the root element
        let node = entry

        // Starting to get the path from bottom (nodeA) to top (rootA)
        while (node.localName != 'a-map-tree') {

            path.unshift(node.attributes.field.value)
            node = node.parentElement

            // Because we are going to start from the node element to the top then we need to know wich is the parent element of the node
            //const parent = node.parentElement; // getting the parent element of the node element 
    
            //const childrens = Array.from(parent.children); // Getting the childrens of the actual parent node in an Array (not in a HTMLCollection)
        
            //const nodeIndex = childrens.indexOf(node); // Check if the actual node is in the childrens array, if yes - then get the position where the node element was founded
    
            //path.push(nodeIndex); // Saving the position that the node element was founded into the path array
    

            //node = parent; // Now we're moving up so now the current node will be the parent node...and the process will be repeated
        }
    
        return path.join('.')
        // return path;
    },

    // setMappingExpression: function(mapping, expression){
    initExpression: function(){
        this.expression = {
            sources:[],
            language: this.el.querySelector('a-dropdown').getAttribute("value"), //default is Camel's simple language
            parameters: {},
            expression: null,
            target:{
                type:  this.el.attributes.vartype.value,
                field: this.el.attributes.field.value,
                value: this.el.attributes.value.value
            }
        }
    },

    // setMappingExpression: function(mapping, expression){
    setMappingExpression: function(mapping, camelsource, literal){

        if(!this.expression){
            this.initExpression()
        }

        if(mapping){

            let element = mapping 
            let source = document.getElementById(element.getAttribute('start'))
            let sourceEntry = source.closest('a-map-entry')

            this.expression.sources.push({
                type:  sourceEntry.attributes.vartype.value,
                field: sourceEntry.attributes.field.value,
                id:    mapping.getAttribute("start")
                // field: sourceEntry.attributes.value.value
            })

            let varType     = sourceEntry.attributes.vartype.value
            // let sourceField = sourceEntry.attributes.value.value
            let sourceField = sourceEntry.attributes.field.value

            if(this.expression.language == "simple"){
                switch(varType) {
                    case 'properties':
                        this.expression.expression = '${exchangeProperty.'+sourceField+'}'
                        break
                    case 'headers':
                        this.expression.expression = '${header.'+sourceField+'}'
                        break;
                    case 'body':
                        this.expression.expression = '${body}'
                        break;
                }
            }

/*            
            switch(this.expression.language){
                case 'simple':
                    switch(varType) {
                        case 'properties':
                            this.expression.expression = '${exchangeProperty.'+sourceField+'}'
                            break
                        case 'headers':
                            this.expression.expression = '${header.'+sourceField+'}'
                            break;
                        case 'body':
                            this.expression.expression = '${body}'
                            break;
                    }
                    break;

                case 'xpath':
                    this.expression.expression = "/your_xpath_expression"
                    break;
                
                case 'jsonpath':
                    this.expression.expression = "$.your_jsonpath_expression"
                    break;

                case 'constant':
                    this.expression.expression = "your constant expression"
                    break;
            }
*/


            // this.expression.expression = this.getPath(sourceEntry)
        }


        if(camelsource){
 
            //set expression's language
            this.expression.language = camelsource.firstElementChild.nodeName

            //set dropdown option to obtained language
            this.el.querySelector('a-dropdown').setAttribute("value", this.expression.language)
            // this.el.querySelector('a-dropdown').components.dropdown.setValue(this.expression.language)

            //obtain language parameters from source
            let attrs = camelsource.firstElementChild.attributes

            //populate object's parameters
            for(var i = attrs.length - 1; i >= 0; i--) {
                this.expression.parameters[attrs[i].name] = attrs[i].value

                //create visual attribute
                this.createAttribute(attrs[i].name, attrs[i].value)
            }

            //set the expression as is from the source code
            this.expression.expression = camelsource.firstElementChild.textContent
        }
        else if(literal != null){
            this.expression.expression = literal
        }
        // else{

        // }




        // let code = ""

            // let targetEntry = this.el

            // let sourceField = sourceEntry.attributes.value.value
            // let targetField = targetEntry.attributes.value.value

            // let varType    = sourceEntry.attributes.vartype.value
            // let setterType = targetEntry.attributes.vartype.value

            //if no expression existed
            // if(!this.expression){
            //     this.expression = {
            //         sources:[],
            //         language: camelsource.firstElementChild.nodeName,
            //         parameters: params,
            //         expression: camelsource.firstElementChild.textContent,
            //         target:{
            //             type:  this.el.attributes.vartype.value,
            //             field: targetEntry.attributes.field.value,
            //             value: targetEntry.attributes.value.value
            //         }
            //     }
            // }

        


/*
        if(expression){
            this.expression.sources.push({
                type:  "literal",
                field: expression
                // field: sourceEntry.attributes.value.value
            }) 

            this.el.setAttribute("ismapped", true)
        }
        else 
        */
/*        
        if(mapping){

            let element = mapping 
            let source = document.getElementById(element.getAttribute('start'))
            let sourceEntry = source.closest('a-map-entry')

            this.expression.sources.push({
                type:  sourceEntry.attributes.vartype.value,
                field: sourceEntry.attributes.field.value
                // field: sourceEntry.attributes.value.value
            })

            this.expression.expression = this.getPath(sourceEntry)
*/


            // switch(varType) {
            //     case 'properties':
            //         expression = '${exchangeProperty.'+sourceField+'}'
            //         break
            //     case 'headers':
            //         expression = '${header.'+sourceField+'}'
            //         break;
            //     case 'body':
            //         expression = '${body}'
            //         break;
            // }

            // switch(setterType) {
            //     case 'properties':
            //         code += tabulation+'  <setProperty '+getCamelAttributePropertyName()+'="'+targetField+'" id="'+targetEntry.id+'">\n'+
            //                 tabulation+'    '+'<simple>'+expression+'</simple>'+'\n'+
            //                 tabulation+'  </setProperty>\n'
            //         break;
            //     case 'headers':
            //         code += tabulation+'  <setHeader '+getCamelAttributeHeaderName()+'="'+targetField+'" id="'+targetEntry.id+'">\n'+
            //                 tabulation+'    '+'<simple>'+expression+'</simple>'+'\n'+
            //                 tabulation+'  </setHeader>\n'
            //         break;
            //     case 'body':
            //         code += tabulation+'  <setBody id="'+targetEntry.id+'">\n'+
            //                 tabulation+'    '+'<simple>'+expression+'</simple>'+'\n'+
            //                 tabulation+'  </setBody>\n'
            //         break;
            
        
            // this.expression = expression

            //flag the field as mapped
            this.el.setAttribute("ismapped", true)

            //obtain current mapping value
            let valueMapping = this.labelvalue.getAttribute("value")

            // this.labelvalue.setAttribute("value",this.expression.expression)


            //if a mapping does not exist
            if(!valueMapping){
                this.labelvalue.setAttribute("value",this.expression.expression)
            }
            //if one exists, we append the new mapping
            else{
                this.labelvalue.setAttribute("value",valueMapping+" "+this.expression.expression)
            }


        // }
    },

    //creates a child map-entry node  
    createChild: function(childname, editable){

        let newheader = childname || this.data.childprefix

        //obtain map tree
        let maptree = this.el.closest('a-map-tree').components.maptree

        // let child = this.el.closest('a-map-tree').components.maptree.createLeaf(
        let child = maptree.createLeaf(
                        this.el, 
                        newheader, 
                        newheader, 
                        true,
                        editable,//this.data.iseditable || this.data.field == "headers",
                        this.data.childrecursive,
                        childname ? null : this.data.childprefix) //if childname is not given, we prefix the header name

        //obtain data model custom configuration
        let customConfig = maptree.targetmodel.custom[this.data.field]
            
        //if configured to notify
        if(customConfig.notify){
            //emit notification with update
            this.el.emit(customConfig.notify, {
                option: child.attributes.field.value,
                value:  child.attributes.value.value,
            });                                
        }

        return child
    },

    //creates a child map-entry node  
    //createAttribute: function(addbutton, attName, attValue){
    createAttribute: function(attName, attValue){

        if(!this.expression){
            this.initExpression()
        }

        //ignore if attribute already exists
        if(this.expression.parameters[attName]){
            return
        }

        //obtain attribute creator button
        let addbutton = this.el.querySelector('[attcreator]')

        //width of attribute's editing box
        let width = 2
        let positionX = addbutton.object3D.position.x

        //attribute's parent
        let parent = addbutton.parentElement

        //This is the new attribute's background
        let back = document.createElement("a-plane")
        //back.id = this.el.id + "-" + "plane"    
        back.setAttribute("width", width)     
        back.setAttribute("height",".3")
        back.setAttribute("opacity",".5")
        back.setAttribute("visible",true)
        back.object3D.position.x =      positionX + width/2 - .15
        back.object3D.position.z = -.01
        // parent.appendChild(back)
        parent.insertBefore(back, addbutton)


        //This is the DELETE button (------X)
        let del = document.createElement('a-plane')
        let lbl = appendLabel(del, "X")
        lbl.object3D.position.z+=.01
        del.setAttribute("width", .3)
        del.setAttribute("height",".3")
        del.setAttribute("color","#515A5A")
        del.setAttribute("position",".85 0 .01")
        del.classList.add('interactive')
        back.appendChild(del)

        //add delete action
        del.addEventListener('click', function(event){
            event.stopPropagation()
            console.log("removing attribute...")

            //obtain attribute to delete
            let toDelete = event.target.parentElement

            //variable helpers
            let nextAttribute = toDelete.nextSibling
            let nextPos = toDelete.object3D.position.x
            let temp
            
            //we iterate over the attributes that follow to shift them left to fill the empty space left
            while(nextAttribute){
                //we keep next position
                temp = nextAttribute.object3D.position.x

                //we shift back the next attribute
                nextAttribute.object3D.position.x = nextPos

                //we keep the attribute's position for the next shift
                nextPos = temp

                //we look for the next sibling
                nextAttribute = nextAttribute.nextSibling
            }

            //we also shift left the + button 
            // addbutton.object3D.position.x = nextPos - width/2 + .15
            addbutton.object3D.position.x = nextPos - width -.05

            //obtain attribute name. the label includes a colon that needs to be ignored
            let delAttribute = toDelete.children[1].attributes.value.value.slice(0, -1)

            //remote attribute from list
            delete this.expression.parameters[delAttribute]

            //remove entire construct (background, plus-button, labels). It all roots from the background
            toDelete.parentElement.removeChild(toDelete)
        }.bind(this));


        back.classList.add('interactive')

        //Editing actions when attribute is clicked
        back.addEventListener('click', function(event){
            event.stopPropagation()
            console.log("Editing attribute...")

            //obtain the label to edit
            let lbl2edit = this.lastChild

            //obtain the textarea to use for edit
            let textarea = this.closest('[mapping]').querySelector('a-textarea')

            //calculate textarea's position for editing (over the label under edition)
                let txtWP = new THREE.Vector3()
                textarea.parentElement.object3D.getWorldPosition(txtWP)
                let entryWP = new THREE.Vector3()
                lbl2edit.object3D.getWorldPosition(entryWP)

                let v1 = txtWP.clone().negate()
                let v2 = entryWP

                v1.add(v2)

                v1.x += 1.15
                v1.y += 0
                v1.z += .01

            //set textarea position
            textarea.object3D.position.copy(v1)

            //set focus
            textarea.components.textarea.focus()
            setCameraFocus(this)
              
            //trigger textarea with callback
            textarea.components.textarea.setInputMode(lbl2edit.getAttribute("value"), 14, function(text){
                console.log("got the text: "+text)
                lbl2edit.setAttribute("value", text)

                //obtain attribute name. the label includes a colon that needs to be ignored
                let attributeName = lbl2edit.previousSibling.attributes.value.value.slice(0, -1)

                //update attribute's value
                this.closest('a-map-entry').components.mapentry.expression.parameters[attributeName] = text

            }.bind(this))            
        });

        //Attribute Name label
        let label = document.createElement('a-text')
        label.setAttribute("value",attName+":")
        label.setAttribute("position", -(width/2)+" .3 0")
        back.appendChild(label)

        //Attribute Value label
        label = document.createElement('a-text')
        label.setAttribute("value",attValue)
        label.setAttribute("position", -(width/2)+" 0 0")
        back.appendChild(label)

        //relocate the ADD button to the far right
        addbutton.object3D.position.setX(addbutton.object3D.position.x + width +.05)

        this.expression.parameters[attName] = attValue
    },

    trigger: function(event){
        // event.stopPropagation()
        console.log('trigger function invoked')

        //only the button should allowed to proceed
        if(event.srcElement.parentEl.localName == 'a-textarea'){
            return
        }

        //element clicked
        //the event originates at the top level mapper button
        //we take the parent because the physical element is the box, child of the mapper button.
        let source = event.srcElement.parentEl

        let childMapButton = document.createElement('a-map-entry')
        childMapButton.setAttribute("position",".2 -.5 0")
        childMapButton.setAttribute("value","eL")
        childMapButton.setAttribute("width", .4)
        // childMapButton.setAttribute("onclick", "this.components.mapentry.trigger(event)")
        //this.el.appendChild(childMapButton)
        source.appendChild(childMapButton)

        // let all = source.querySelectorAll('a-map-entry')
        // var xPathResult = document.evaluate('(//*/ancestor::* | //*/preceding::*) /count(./ancestor::*)', all[0], null, XPathResult.ANY_TYPE, null);
        // var xPathResult = document.evaluate('(.//a-map-entry/ancestor::a-map-entry | .//a-map-entry/preceding::a-map-entry)/count(./ancestor::a-map-entry)', all[0].parentNode, null, XPathResult.ANY_TYPE, null);
        // var xPathResult = document.evaluate('(.//a-map-entry//ancestor::a-map-entry | .//a-map-entry//preceding::a-map-entry)/count(./ancestor::a-map-entry)', all[0].parentNode, null, XPathResult.ANY_TYPE, null);
        // var thisNode = iterator.iterateNext();
        // var xPathResult = document.evaluate('(.//a-map-entry', all[0].parentNode, null, XPathResult.ANY_TYPE, null);


        // const hierarchies = [];
        // let node = xPathResult.iterateNext();
        // while (node) {
        //     hierarchies.push(node);
        //     node = xPathResult.iterateNext();
        // }

        // if(all[0] == this.el){
        //     this.hierarchy = 0
        // }

        // all.forEach(button => {
        //     button.components.mapentry.redraw(all)
        // });

    },

    redraw: function (all){//, detail){
        //xpath:
        //get all nodes:
        // - //*
        //get tabulations:
        //  (node by node, get all ancestors and predecessors, and get hierarchy position)
        // - (//*/ancestor::* | //*/preceding::*) /count(./ancestor::*)

        //let component = 

        // this.hierarchy = this.parentEl.components.mapentry.hierarchy + 1
        // if(this.el.parentEl.localName == 'a-map-entry'){
        //     this.hierarchy = this.el.parentEl.components.mapentry.hierarchy + 1
        // }

        console.log('redraw in action')
        // let all = document.querySelectorAll('a-map-entry')

        //let pos = Array.prototype.indexOf.call(all, this.el)


        let parentDescendents = Array.from(this.el.parentElement.querySelectorAll('a-map-entry'))



        let relativePos = 0

        if(this.el.parentEl.localName == 'a-map-entry'){
            relativePos = parentDescendents.indexOf(this.el) + 1
        }
/*
        if(this.el.parentEl.localName == 'a-map-entry'){

            let sameLevelButtons = Array.from(this.el.parentEl.children)

            // relativePos = Array.prototype.indexOf(sameLevelButtons, this.el)
            relativePos = sameLevelButtons.indexOf(this.el)

            relativePos = all.indexOf(this.el)
            // relativePos = Array.prototype.find(sameLevelButtons, this.el) - 1

            // relativePos = this.el.parentEl.children.length - 1  //(minus one because the parent also includes an a-box child, the visual button) 
        }
*/
        // this.el.object3D.position.y = - .4 * pos
        this.el.object3D.position.y = - .4 * relativePos

        //topButton.components.mapentry.


    },


    update: function (oldData) {

        //at creation time there is no data, so we ignore the invocation
        if(Object.keys(oldData).length === 0){
            return
        }

        //if 'enabled' did change        
        if(this.data.field != oldData.field){
            this.field = this.data.field
            this.el.setAttribute("value", this.data.field)
            // this.setFieldName(this.textarea.value)
            this.fieldlabel.setAttribute("value", this.data.field)

            if(this.expression){
                this.expression.target.field = this.data.field
                this.expression.target.value = this.data.field
                // this.expression.target.value = this.data.value
            }
        }

        //if 'enabled' did change        
        if(this.data.enabled != oldData.enabled){

            //enable interaction ON/OFF
            if(this.data.enabled){
                this.el.firstChild.classList.add('interactive')
            }
            else{
                this.el.firstChild.classList.remove('interactive')
            }

            //switch ON/OFF button's visibility
            this.el.firstChild.setAttribute('visible', this.data.enabled)
        }
    },
    tick: function () {},
    remove: function () {},
    pause: function () {},
    play: function () {}
  });
  
  AFRAME.registerPrimitive('a-map-entry', {
    defaultComponents: {
        'mapentry': {}
    },
    mappings: {
        // menu: "dropdown.menu"
        field: "mapentry.field",
        value: "mapentry.value",
        width: "mapentry.width",
        wrapcount: "mapentry.wrapcount",
        enabled: "mapentry.enabled",
        ismappable: "mapentry.ismappable",
        iseditable: "mapentry.iseditable",
        istarget: "mapentry.istarget",
        childbutton: "mapentry.childbutton",
        childprefix: "mapentry.childprefix",
        childrecursive: "mapentry.childrecursive",
        childcount: "mapentry.childcount",
        notify: "mapentry.notify",
    }
  });
