AFRAME.registerComponent('button', {
    schema: {
        //menu: {}
    },
    init: function () {

        let menu = this.data.menu

        // let menuCount = Object.entries(menu.menu).length

        //create button entity
        let button = document.createElement('a-box')    
        button.setAttribute('opacity', '.3')
        button.setAttribute('depth', '.1')
        button.setAttribute('width', '1')
        button.setAttribute('height', '.3')
        // button.setAttribute('animation__scale',         {property: 'opacity', dur: 0, to: '.6', startEvents: 'mouseenter'});
        // button.setAttribute('animation__scale_reverse', {property: 'opacity', dur: '0', to: '.4',   startEvents: 'mouseleave'});
        button.setAttribute('animation__scale',         {property: 'opacity', dur: 0, to: '.6', startEvents: 'mousedown'});
        button.setAttribute('animation__scale_reverse', {property: 'opacity', dur: 0, to: '.4', startEvents: 'mouseup'});
        button.classList.add('interactive')
        button.object3D.position.setZ(button.object3D.position.z+0.05)
    

        //set label to menu button
        // appendLabel(groupButton, menu.name)
        let label = appendLabel(button, "done")
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
    update: function () {
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
    }
  });