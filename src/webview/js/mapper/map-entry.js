var mapEntryId = 0

AFRAME.registerComponent('map-entry', {
    schema: {
        //menu: {}
        value: { type: "string", default: "" },
        width: { type: "number", default: 1 },
        wrapcount: { type: "number" },
        enabled: { type: "boolean", default: true },
        istarget: { type: "boolean", default: false},
    },
    init: function () {

        // let sharedId = +(new Date()).getTime()
        let sharedId = mapEntryId++

        // let menu = this.data.menu

        // this.el.setAttribute("mappable","")


        // let menuCount = Object.entries(menu.menu).length

        //create button entity
        let button = document.createElement('a-box')
        button.id = "map-entry-button-" + sharedId
        button.setAttribute('opacity', '.3')
        button.setAttribute('depth', '.1')
        // button.setAttribute('width', '1')
        button.setAttribute('width', this.data.width)
        button.setAttribute('height', '.3')
        // button.setAttribute('animation__scale',         {property: 'opacity', dur: 0, to: '.6', startEvents: 'mouseenter'});
        // button.setAttribute('animation__scale_reverse', {property: 'opacity', dur: '0', to: '.4',   startEvents: 'mouseleave'});
        button.setAttribute('animation__scale',         {property: 'opacity', dur: 0, to: '.6', startEvents: 'mousedown'});
        button.setAttribute('animation__scale_reverse', {property: 'opacity', dur: 0, to: '.4', startEvents: 'mouseup'});
        
        if(this.data.enabled){
            button.classList.add('interactive')
            // this.el.classList.add('interactive')
        }
        else{
            button.setAttribute('visible', false)
            // this.el.setAttribute('visible', false)
        }
        button.object3D.position.setZ(button.object3D.position.z+0.05)
    

        //set label to menu button
        // appendLabel(groupButton, menu.name)
        let label = appendLabel(button, this.data.value, this.data.wrapcount)
        // label.object3D.position.set(0,0,5)
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
        leaf.setAttribute("value",this.data.value)
        // leaf.setAttribute("width",width*5)
        // leaf.setAttribute("color","red")
        this.el.appendChild(leaf)


        // let field = document.createElement('a-textarea')    
        // field.setAttribute('cols', 10)
        // field.setAttribute('rows', 1)
        // field.setAttribute("position",".8 0 0")
        // this.el.appendChild(field)

        //this is only an approximation calculation
        //text width is a hard thing to obtain
        let textWidth = this.data.value.length / 10 + .5
        let posMapPoint = textWidth

        if(this.data.istarget){
            posMapPoint = -.2
        }

        let mapPoint = document.createElement('a-box')    
        mapPoint.setAttribute('opacity', '.3')
        mapPoint.setAttribute('depth', '.01')
        // button.setAttribute('width', '1')
        mapPoint.setAttribute('width', .1)
        mapPoint.setAttribute('height', .1)
        mapPoint.setAttribute("mappable","")
        // mapPoint.setAttribute("position","1.5 0 0")
        mapPoint.setAttribute("position", posMapPoint + " 0 0")
        mapPoint.setAttribute("mappable","")
        mapPoint.classList.add("interactive")
        mapPoint.id = "map-entry-link-point-" + sharedId
        this.el.appendChild(mapPoint)


        let back = document.createElement("a-plane")
        back.id = "map-entry-plane-" + sharedId
        back.setAttribute("width",textWidth - .2)        
        back.setAttribute("height",".3")
        back.setAttribute("opacity","0")
        back.object3D.position.x = textWidth/2 - .2
        back.object3D.position.z = -.01
        this.el.appendChild(back)

        back.classList.add('interactive')

  back.setAttribute('animation', {  startEvents:'mouseenter',
                                  pauseEvents:'mouseleave',
                                  property: 'opacity',
                                  dur: '0',
                                  from: 0,
                                  to: .5,
                                })

  back.setAttribute('animation__2',{
                                  startEvents:'mouseleave',
                                  property: 'opacity',
                                  dur: '0',
                                  to: 0})




        if(this.el.parentElement.localName == "a-map-entry"){
            let topMapperButton = this.el.parentElement

            while(topMapperButton.parentElement.localName == "a-map-entry"){
                topMapperButton = topMapperButton.parentElement
            }

            let all = Array.from(topMapperButton.querySelectorAll('a-map-entry'))
            all.forEach(button => {
                button.components['map-entry'].redraw(all)
            });            
        }

        //needs to execute this code asynchronously as
        //we're invoking the component before it's ready (ongoing initialisation)
        // const promise1 = new Promise((resolve, reject) => {
        //     let all = Array.from(document.querySelectorAll('a-map-entry'))
        //     all.forEach(button => {
        //         button.components['map-entry'].redraw(all)
        //     });
        // });

        // this.el.setAttribute("scale", "2 2 2")
    },

    trigger: function(event){
        // event.stopPropagation()
        console.log('trigger function invoked')

        // if(event.target.parentEl != this.el){
        // if(event.target.parentEl != this.el){
        //     return
        // }

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
        // childMapButton.setAttribute("onclick", "this.components['map-entry'].trigger(event)")
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
        //     button.components['map-entry'].redraw(all)
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

        // this.hierarchy = this.parentEl.components['map-entry'].hierarchy + 1
        // if(this.el.parentEl.localName == 'a-map-entry'){
        //     this.hierarchy = this.el.parentEl.components['map-entry'].hierarchy + 1
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

        //topButton.components['map-entry'].


    },


    update: function (oldData) {

        //at creation time there is no data, so we ignore the invocation
        if(Object.keys(oldData).length === 0){
            return
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
        'map-entry': {}
    },
    mappings: {
        // menu: "dropdown.menu"
        value: "map-entry.value",
        width: "map-entry.width",
        wrapcount: "map-entry.wrapcount",
        enabled: "map-entry.enabled",
        istarget: "map-entry.istarget",
    }
  });
