AFRAME.registerComponent('button', {
    schema: {
        //menu: {}
        value: { type: "string", default: "" },
        width: { type: "number", default: 1 },
        wrapcount: { type: "number" },
        enabled: { type: "boolean", default: true }
    },
    init: function () {

        let menu = this.data.menu

        // let menuCount = Object.entries(menu.menu).length

        //create button entity
        let button = document.createElement('a-box')    
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
        }
        else{
            button.setAttribute('visible', false)
        }
        button.object3D.position.setZ(button.object3D.position.z+0.05)
    

        //set label to menu button
        // appendLabel(groupButton, menu.name)
        let label = appendLabel(button, this.data.value, this.data.wrapcount)
        // label.object3D.position.set(0,0,5)
        label.setAttribute('position', "0 0 .049")

        //event listener for menu option
        button.addEventListener('mousedown', function(){
            button.object3D.position.setZ(button.object3D.position.z-0.05)
        });
    
        //event listener for menu option
        button.addEventListener('mouseup', function(){       
            button.object3D.position.setZ(button.object3D.position.z+0.05)
        });

        this.el.appendChild(button)
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
  
  AFRAME.registerPrimitive('a-button', {
    defaultComponents: {
      button: {}
    },
    mappings: {
        // menu: "dropdown.menu"
        value: "button.value",
        width: "button.width",
        wrapcount: "button.wrapcount",
        enabled: "button.enabled"
    }
  });