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
        istarget: { type: "boolean", default: false},
        childbutton: { type: "boolean", default: false },
        childprefix: { type: "string", default: "field" },
        childrecursive: { type: "boolean", default: false },
        childcount: { type: "number", default: 0 },
    },
    init: function () {

        let textWidth = this.data.field.length / 10 + .5
        // let textWidth = this.data.field.length / 15 + .5

        //components.text.currentFont.widthFactor
        //object3D.children[0].scale
        //object3D.children[0].geometry.layout.glyphs.length


        // let sharedId = +(new Date()).getTime()
        // let sharedId = mapEntryId++

        // let menu = this.data.menu

        // this.el.setAttribute("mappable","")


        // let menuCount = Object.entries(menu.menu).length

        //this box allows the user to create new child map entries
        let button = document.createElement('a-box')
        // button.id = "mapentry-button-" + sharedId
        // button.id = this.el.parentElement.id + "-" + this.data.value
        button.setAttribute('opacity', '.3')
        button.setAttribute('depth', '.1')
        // button.setAttribute('width', '1')
        button.setAttribute('width', this.data.width)
        button.setAttribute('height', '.3')
        // button.setAttribute('animation__scale',         {property: 'opacity', dur: 0, to: '.6', startEvents: 'mouseenter'});
        // button.setAttribute('animation__scale_reverse', {property: 'opacity', dur: '0', to: '.4',   startEvents: 'mouseleave'});
        button.setAttribute('animation__scale',         {property: 'opacity', dur: 0, to: '.6', startEvents: 'mousedown'});
        button.setAttribute('animation__scale_reverse', {property: 'opacity', dur: 0, to: '.4', startEvents: 'mouseup'});
        
        // if(this.data.enabled){
        if(this.data.childbutton){
            button.classList.add('interactive')
            // this.el.classList.add('interactive')
        }
        else{
            button.setAttribute('visible', false)
            // this.el.setAttribute('visible', false)
        }
        
        button.object3D.position.setX(textWidth)
        button.object3D.position.setZ(button.object3D.position.z+0.05)
        // button.setAttribute("onclick", "this.components.mapentry.trigger(event)")
        this.childCount = this.data.childcount
        button.onclick = function(){       
            this.createChild()            
        }.bind(this);


        //set label to menu button
        // let label = appendLabel(button, this.data.field, this.data.wrapcount)
        let label = appendLabel(button, "+", this.data.wrapcount)
        label.setAttribute('position', "0 0 .049")
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
                                            to: false
                                            })

            if(this.data.istarget){
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
                    v1.x += 1.25
                    v1.z += .01


                    textarea.components.textarea.setInputMode(this.parentElement.getAttribute("field"), 14, function(text){
                        console.log("got the text: "+text)
                        this.parentElement.setAttribute("field", text)
                    }.bind(this))
                    textarea.components.textarea.focus()

                    textarea.object3D.position.copy(v1)
                });


            

                // let del = document.createElement("a-plane")
                // del.id = this.el.id + "-" + "plane"
                // del.setAttribute("width", .2)        
                // del.setAttribute("height",".3")
                // del.setAttribute("opacity",".5")
                // del.object3D.position.x = textWidth - .4
                // del.object3D.position.z = -.01
                // back.appendChild(del)
/*
                this.labelvalue = document.createElement('a-text')
                // this.labelvalue.setAttribute("value",this.getPath(sourceEntry))
                this.labelvalue.setAttribute("position","3 0 0")
                // this.labelvalue.setAttribute("width","5")
                this.el.appendChild(this.labelvalue)
                // document.getElementById('thescene').appendChild(this.labelvalue)

                back = document.createElement("a-plane") 
                back.setAttribute("width", 5) //last add is more space for the delete button       
                back.setAttribute("height",".3")
                back.setAttribute("opacity","0")
                back.object3D.position.x = 3+2.5
                back.object3D.position.z = -.01
                this.el.appendChild(back)
*/
                
                this.labelvalue = document.createElement('a-text')
                // this.labelvalue.setAttribute("value",this.getPath(sourceEntry))
                this.labelvalue.setAttribute("position","2 0 0")
                // this.labelvalue.setAttribute("width","5")
                this.el.appendChild(this.labelvalue)


                back = document.createElement("a-plane") 
                back.setAttribute("width", 5)     
                back.setAttribute("height",".3")
                back.setAttribute("opacity",".5")
                back.setAttribute("visible",false)
                back.object3D.position.x = 2 + (5/2) // position + width/2 
                // back.object3D.position.z = -.01
                this.el.appendChild(back)


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
    
                    // v1.x += textarea.components.textarea.background.components.geometry.data.width / 2 -.2//textarea.components.textarea.background.object3D.scale
                    v1.x += 1.25 +2
                    v1.z += .01
        
                    textarea.object3D.position.copy(v1)
        
                    textarea.components.textarea.setInputMode(this.labelvalue.getAttribute("value"), null, function(text){
                        console.log("got the text: "+text)
                        this.labelvalue.setAttribute("value", text)
                        // this.labelvalue.setAttribute('text', 'value', text)

                        // this.labelvalue.setAttribute("value", "super duper super duper super duper super duper super duper super duper super duper super duper super duper super duper super duper super duper super duper super duper super duper super duper ")
                    }.bind(this))
                    textarea.components.textarea.focus()
    
                }.bind(this));


            }


        }

        // let del = document.createElement("a-plane")
        // del.id = this.el.id + "-" + "delete"
        // del.setAttribute("width", .3)        
        // del.setAttribute("height",".3")
        // del.setAttribute("opacity",".5")

        // del.setAttribute("text","{value: '-'}")

        // del.object3D.position.x =  - back.object3D.position.x - .2
        // del.object3D.position.z = -.01
        // back.appendChild(del)
        // del.classList.add('interactive')


        this.el.closest('a-map-tree').components.maptree.redraw()
            // if(this.el.parentElement.localName == "a-map-entry"){
            //     let topMapperButton = this.el.parentElement

            //     while(topMapperButton.parentElement.localName == "a-map-entry"){
            //         topMapperButton = topMapperButton.parentElement
            //     }

            //     let all = Array.from(topMapperButton.querySelectorAll('a-map-entry'))
            //     all.forEach(button => {
            //         button.components.mapentry.redraw(all)
            //     });            
            // }
            

        //needs to execute this code asynchronously as
        //we're invoking the component before it's ready (ongoing initialisation)
        // const promise1 = new Promise((resolve, reject) => {
        //     let all = Array.from(document.querySelectorAll('a-map-entry'))
        //     all.forEach(button => {
        //         button.components.mapentry.redraw(all)
        //     });
        // });

        // this.el.setAttribute("scale", "2 2 2")

        this.el.emit('mapentry-init-complete');
    },

    // setFieldName: function(name){
    //     this.fieldlabel.setAttribute("value", name)
    // },

    getMappingExpression: function(){
        return this.expression
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

    setMappingExpression: function(mapping){

        let element = mapping 

        // let code = ""

            let source = document.getElementById(element.getAttribute('start'))
            
            let sourceEntry = source.closest('a-map-entry')
            let targetEntry = this.el

            // let sourceField = sourceEntry.attributes.value.value
            // let targetField = targetEntry.attributes.value.value

            // let varType    = sourceEntry.attributes.vartype.value
            // let setterType = targetEntry.attributes.vartype.value

            if(!this.expression){
                this.expression = {
                    language: "simple",
                    sources:[],
                    target:{
                        type: targetEntry.attributes.vartype.value,
                        field: targetEntry.attributes.field.value,
                        value: targetEntry.attributes.value.value
                    }
                }
            }

            this.expression.sources.push({
                type: sourceEntry.attributes.vartype.value,
                field: sourceEntry.attributes.field.value
                // field: sourceEntry.attributes.value.value
            })

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

        this.el.setAttribute("ismapped", true)



        let valueMapping = this.labelvalue.getAttribute("value")
        if(!valueMapping){
            this.labelvalue.setAttribute("value",this.getPath(sourceEntry))
            // this.labelvalue.setAttribute('text', 'value', this.getPath(sourceEntry))
        }
        else{
            this.labelvalue.setAttribute("value",valueMapping+",\n"+this.getPath(sourceEntry))
            // this.labelvalue.setAttribute('text', 'value', valueMapping+",\n"+this.getPath(sourceEntry))
        }
    },

    //creates a child map-entry node  
    createChild: function(){

        let newheader = this.data.childprefix

        this.el.closest('a-map-tree').components.maptree.createLeaf(
            this.el, 
            newheader, 
            newheader, 
            true, 
            this.data.childrecursive,
            this.data.childprefix)
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
        istarget: "mapentry.istarget",
        childbutton: "mapentry.childbutton",
        childprefix: "mapentry.childprefix",
        childrecursive: "mapentry.childrecursive",
        childcount: "mapentry.childcount",
    }
  });
