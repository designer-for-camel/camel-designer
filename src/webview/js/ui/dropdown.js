AFRAME.registerComponent('dropdown', {
    schema: {
        //menu: {}
        value: { type: "string", default: "" },
        width: { type: "number", default: 1 },
        menu: {
            default: [],
            parse: function (value) {
                console.log("parse: value: "+value)
              return JSON.parse(value)
            },
            stringify: function (value) {
              return JSON.stringify(value)
            }
          }
    },
    init: function () {

        let menu = this.data.menu

        this.setMenu(menu)
    },
    setMenu: function (menu) {

        //if the dropdown was already pre-populated, we reset
        if(this.el.firstChild)
        {
            this.el.removeChild(this.el.firstChild)
        }

        //let menu = this.data.menu

        let menuCount = Object.entries(menu.menu).length

        //create button entity
        let groupButton = document.createElement('a-box')
        // groupButton.id = 'menu-main'
        groupButton.id = 'menu-'+ menu.name
    
        //add classes
        groupButton.classList.add(menu.class)
        groupButton.classList.add('menu-button')
    
        //enable/disable as per configuration
        setButtonEnabled(groupButton, menu.enabled)
    
        groupButton.setAttribute('depth', '.05')
        // groupButton.setAttribute('width', '1')
        groupButton.setAttribute('width', this.data.width)
        groupButton.setAttribute('height', '.3')
        groupButton.setAttribute('animation__scale',         {property: 'opacity', dur: 0, to: '.6', startEvents: 'mouseenter'});
        groupButton.setAttribute('animation__scale_reverse', {property: 'opacity', dur: '0', to: '.4',   startEvents: 'mouseleave'});
    
        // let atlasmapActivity = getActiveActivity()

        // let ddlabel = menu.menu[0].label

        // if(atlasmapActivity){
        //     ddlabel = getActiveActivity().components.uri.getTarget()
        // }

        //set label to menu button
        // appendLabel(groupButton, menu.name)
        let label = appendLabel(groupButton, menu.menu[0].label)
        // let label = appendLabel(groupButton, ddlabel)
        label.setAttribute('color', 'white')

        //create menu options in a container
        let menuContainer = document.createElement('a-entity')
        menuContainer.id = menu.name
        menuContainer.setAttribute('position', '0 -.3 0')
        menuContainer.setAttribute('visible', false)
    
        let menuBackdrop = document.createElement('a-plane')
        menuBackdrop.setAttribute('height', menuCount*.3+.3)
        menuBackdrop.setAttribute('position', '0 '+(-(menuCount*.3/2))+' -0.0')
        menuBackdrop.id = menu.name + '-backdrop'   

        //Create each menu option
        for (var itemIndex in menu.menu) {
            // createMenuOption(menuContainer, menu.menu[item])

            let item = menu.menu[itemIndex]

            let count = menuContainer.children.length
            let position = -.3 * count
        
            // axisX = axisX || 0
            let axisX = 0

            let menuItem = document.createElement('a-box')
            menuItem.setAttribute('depth', '.05')
            menuItem.setAttribute('width', this.data.width)
            menuItem.setAttribute('height', '.3')
            menuItem.setAttribute('color', 'grey')
            // menuItem.setAttribute('opacity', '.9')
            menuItem.setAttribute('animation__stickout',         {property: 'position', dur: 0, to: axisX+' '+position+' .05', startEvents: 'mouseenter'});
            menuItem.setAttribute('animation__stickout_reverse', {property: 'position', dur: 0, to: axisX+' '+position+' 0',   startEvents: 'mouseleave'});    
            menuItem.setAttribute('position', '0 '+position+' 0')
            menuItem.id = 'menu-button-'+item.label       

            if(menu.class){
                menuItem.classList.add(item.class)
                menuItem.classList.add('menu-button')
            }

            //mark with label
            let label = appendLabel(menuItem, item.label, item.labelWrapCount)
            label.setAttribute('position', '0 0 .03')
            
            //event listener for menu option
            menuItem.addEventListener('click', function(e){       
                
                // e.stopPropagation()

                let dropdown = this.parentEl.parentEl.parentEl

                //we set the value to the dropdown element
                dropdown.setAttribute('value',this.firstElementChild.getAttribute('value'))
                dropdown.components.dropdown.setWrapCount(this.firstElementChild.getAttribute('wrap-count'))

            });

/*
            //if the menu has a function
            if(item.function){
        
                //mark with label
                let label = appendLabel(menuItem, item.label, item.labelWrapCount)
                label.setAttribute('position', '0 0 .03')

                //register custom consumers/producers
                // if(menu.function == "createCustomEndpointFrom"){
                //     let scheme = menu.arguments[0].split(":")[0]
                //     customConfiguredConsumers.push(scheme)
                // }
                // else if(menu.function == "createCustomEndpointTo"){
                //     let scheme = menu.arguments[0].split(":")[0]
                //     customConfiguredProducers.push(scheme)
                // }
                
                //event listener for menu option
                menuItem.addEventListener('click', function(){       
                    
                    let dropdown = this.parentEl.parentEl.parentEl

                    //this.parentEl.parentEl.firstElementChild.setAttribute('value', this.firstElementChild.getAttribute('value'))
                    //we set the value to the dropdown element
                    dropdown.setAttribute('value',this.firstElementChild.getAttribute('value'))

                    // if(item.arguments)
                    //     window[menu.function](item.arguments)
                    // else
                    //     window[item.function]()
                });
            
            }
            else{
                appendLabel(menuItem, item.label)
            }
        */
            //add option to container
            menuContainer.appendChild(menuItem)


        }
    
        //Create extra options (if configured)
        // for (var item in configuration) {
        //     createMenuOption(menuContainer, configuration[item])
        // }
    
        //attach options to menu button
        groupButton.appendChild(menuContainer)
    
        //menu event listener
        groupButton.addEventListener('raycaster-intersected', function(e){
    
            if(this != e.target) {return}
    
            console.log('raycaster-intersected: this: '+this.id+ ' target: '+e.target.id)
    
            let container = document.getElementById(menu.name)
    
            container.setAttribute('visible', 'true')
    
            for(option of container.children){
                option.classList.add('interactive')
            }
        });
    
    
        //menu event listener
        groupButton.addEventListener('raycaster-intersected-cleared', function(e){
            
            console.log('raycaster-intersected-cleared: this:'+this.id+ ' target: '+e.target.id)
                
            let intersectedEls = e.detail.el.components.raycaster.intersectedEls
    
            if(intersectedEls.length != 0 &&
                (
                    e.target.contains(intersectedEls[0]) || 
                    intersectedEls[0].contains(e.target) ||
                    ( e.target.parentElement == intersectedEls[0].parentElement)
                )
            ) {return}
    
    
            let container = document.getElementById(menu.name)
    
            for(option of container.children){
                option.classList.remove('interactive')
            }
    
            container.setAttribute('visible', false)
        });
    
        //we force menu buttons to have different parents
        //this helps handling the different menu activations
        // let menuRootEntity = document.createElement('a-entity')
        // menuRootEntity.appendChild(groupButton)
    
        // return groupButton
        //return menuRootEntity

        // this.el.appendChild(menuRootEntity)
        this.el.appendChild(groupButton)
        // menuContainer.setAttribute('visible', false)


    },

    getMenuEntries: function() {

        let entries = this.el.querySelectorAll("a-entity > a-box > a-text")

        let menu = []

        for(let i=0; i<entries.length; i++){
            menu[i]=entries[i].getAttribute('value')
        }

        return menu
    },

    update: function (oldData) {
        //at creation time there is no data, so we ignore the invocation
        if(Object.keys(oldData).length === 0){

            //exception for value
            //value might have been set before component has been fully set
            this.setValue(this.data.value)

            return
        }
    
        if(this.data.value != oldData.value){
          this.setValue(this.data.value)
        //   return
        }

        // if(this.data.menu != oldData.menu){
        //     this.setMenu(this.data.menu)
        //     return
        // }

    },

    setValue: function(value){
        // this.parentEl.parentEl.firstElementChild.setAttribute('value', this.firstElementChild.getAttribute('value'))
        let labelSelectedOption = this.el.firstChild.firstChild
        labelSelectedOption.setAttribute('value', value)
    },

    setWrapCount: function(value){
        // this.parentEl.parentEl.firstElementChild.setAttribute('value', this.firstElementChild.getAttribute('value'))
        let labelSelectedOption = this.el.firstChild.firstChild
        labelSelectedOption.setAttribute('wrap-count', value)
    },


    tick: function () {},
    remove: function () {},
    pause: function () {},
    play: function () {}
  });
  
  AFRAME.registerPrimitive('a-dropdown', {
    defaultComponents: {
      dropdown: {}
    },
    mappings: {
        value: "dropdown.value",
        width: "dropdown.width",
        menu: "dropdown.menu"
    }
  });