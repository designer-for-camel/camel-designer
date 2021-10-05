AFRAME.registerComponent('form', {
    schema: {
      active: { type: "boolean", default: false },

    },
    init: function () {

      this.interactiveElements = Array.from(this.el.querySelectorAll('.interactive'))
      this.setActive(this.data.active)
    },

    setActive: function(active){
      if(active){
        this.interactiveElements.forEach(element => {
          element.classList.add('interactive')
        });
      }
      else{
        this.interactiveElements.forEach(element => {
          element.classList.remove('interactive')
        });
      }
      this.el.setAttribute('visible', active)
    },

    // setInteractive: function(interactive)

    configure: function(activity) {

      this.currentActivity = activity

      let definition = activity.components.definition.getDefinition()

      this.el.setAttribute('active',true)

      //get UI elements
      let list   = this.el.querySelector('a-dropdown')
      let saxon   = this.el.querySelector('a-checkbox')
      let inputs = Array.from(this.el.querySelectorAll('a-input'))

      //get language
      let language = definition.firstElementChild.firstElementChild.tagName

      //set UI checkbox
      saxon.setAttribute('visible', (language == "xpath"))
      saxon.setAttribute('checked', activity.components.expression.getLanguageAttributes().saxon == "true")

      //set UI language
      list.setAttribute('value', language)

      //set UI actions on dropdown selection
      list.onclick = function(){
        let language = list.getAttribute('value')
        
        //update language
        activity.components.expression.setLanguage(language)
        
        //show/hide checkbox
        list.nextElementSibling.setAttribute('visible', language == 'xpath')
      }

      //set UI actions checkbox selection
      saxon.onclick = function(){
        //is it checked
        let checked = saxon.getAttribute('checked') == "true"

        //update activity parameter
        activity.components.expression.setLanguageAttribute('saxon', checked)
      }

      //set UI correlation expression
      inputs[0].setAttribute('value', definition.firstElementChild.firstElementChild.textContent)
      inputs[0].components.input.linkLabel(activity.children[2])

      //set UI attributes
      // inputs[1].setAttribute('value', definition.getAttribute('strategyRef'))
      inputs[1].setAttribute('value', activity.components.definition.getAttributes().strategyRef)
      inputs[1].components.input.setFunctionOnUpdate(function(){
        console.log('strategy action')      
        activity.components.definition.setAttribute('strategyRef', inputs[1].getAttribute('value'))
      })

      inputs[2].setAttribute('value', definition.getAttribute('completionSize'))
    },

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