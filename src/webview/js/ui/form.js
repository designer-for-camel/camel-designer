AFRAME.registerComponent('form', {
    schema: {
      active: { type: "boolean", default: false },

    },
    init: function () {

      let height = this.el.firstElementChild.getAttribute("height")
      let scale = this.el.children[1].getAttribute("scale")
      let scaley = this.el.firstElementChild.object3D.scale.y

      let helpButton = document.createElement('a-button')
      helpButton.setAttribute("scale", scale)
      helpButton.setAttribute("value", "?")
      helpButton.setAttribute("width", ".3")
      helpButton.setAttribute("wrapcount", "2")
      // helpButton.setAttribute("position", ".35 " + ((height*scaley)-.3) + " 0")
      helpButton.setAttribute("position", ".1 " + ((height)-.1) + " 0")
      helpButton.setAttribute("onclick", "openDocumentation()")
      helpButton.setAttribute("enabled", "false")

      //we append it to the round-plane
      this.el.children[0].appendChild(helpButton)   

//<a-button value="?" width=".3" wrapcount="2" position=".35 1.8 0" onclick="openDocumentation()"></a-button>
            
      //keep record of all interactive elements
      //this.interactiveElements = Array.from(this.el.querySelectorAll('.interactive'))
      //this.setActive(this.data.active)
    },

    setActive: function(active){
      if(active){
        this.interactiveElements.forEach(element => {
          element.classList.add('interactive')
        });

        //hack: make '?' (help) button also to be interactive
        //on initialisation, the query to find interactive elements does not find the help button
        //so we ensure on activation it always is interactive
        this.el.children[0].firstElementChild.setAttribute("enabled", "true")
      }
      else{

        //keep record of all interactive elements
        this.interactiveElements = Array.from(this.el.querySelectorAll('.interactive'))

        //while inactive, ensure elements are not interactive
        this.interactiveElements.forEach(element => {
          element.classList.remove('interactive')
        });
        //ensure any editing on inputs are done
        UiInput.unfocus()
      }
      this.el.setAttribute('visible', active)

      //if form has a handgrip we should activate/deactivate
      if(this.el.components.handgrip){
        this.el.setAttribute("handgrip", {active: active})
      }
    },

    configure: function(activity) {

      this.currentActivity = activity

      // this.el.setAttribute('active',true)

      this.configurator.configure.call(activity, this.el)
    },

    setConfigurator: function(configurator) {

      if(this.configurator)
        return

      this.configurator = configurator
    },

/*
    configure_DEPRECATED: function(activity) {

      this.currentActivity = activity

      this.el.setAttribute('active',true)

      //get UI elements
      let list   = this.el.querySelector('a-dropdown')
      let saxon   = this.el.querySelector('a-checkbox')
      let inputs = Array.from(this.el.querySelectorAll('a-input'))

      //get language
      let language = activity.components.expression.getLanguage()

      //set UI checkbox
      saxon.setAttribute('visible', (language == "xpath"))
      saxon.setAttribute('checked', activity.components.expression.getLanguageAttributes().saxon == true)

      //set UI language
      list.setAttribute('value', language)

      //set UI actions on dropdown selection
      list.onclick = function(){
        let language = list.getAttribute('value')
        
        //update language
        activity.components.expression.setLanguage(language)
        
        //show/hide checkbox
        list.nextElementSibling.setAttribute('visible', language == 'xpath')

        syncEditor()
      }

      //set UI actions checkbox selection
      saxon.onclick = function(){
        //is it checked
        let checked = saxon.getAttribute('checked') == "true"

        //update activity parameter
        activity.components.expression.setLanguageAttribute('saxon', checked)

        syncEditor()
      }

      //set UI correlation expression
      inputs[0].setAttribute('value', activity.components.expression.getValue())
      inputs[0].components.input.setFunctionOnUpdate(function(){
        activity.components.expression.setValue(inputs[0].getAttribute('value'))
      })

      //set UI attributes
      inputs[1].setAttribute('value', activity.components.definition.getAttributes().strategyRef)
      inputs[1].components.input.setFunctionOnUpdate(function(){
        console.log('strategy action')      
        activity.components.definition.setAttribute('strategyRef', inputs[1].getAttribute('value'))
      })

      inputs[2].setAttribute('value', activity.components.definition.getAttributes().completionSize)
      inputs[2].components.input.setFunctionOnUpdate(function(){
        console.log('strategy action')      
        activity.components.definition.setAttribute('completionSize', inputs[2].getAttribute('value'))
      })
    },
*/


    update: function () {
      console.log('form update')
      this.setActive(this.data.active)
    },
    
    tick: function () {},
    remove: function () {},
    pause: function () {},
    play: function () {}
  });
  
  AFRAME.registerPrimitive('a-form', {
    defaultComponents: {
      form: {}
    },
    mappings: {
      active: "form.active"
    }
  });