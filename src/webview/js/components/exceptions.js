
/*
* This (a-frame) component adheres URI manipulation functionality to activities (a-entity)
* URIs are defined as: 'scheme:target?options' (e.g. uri="file:directory?fileName=sample")
* The component creates a visible label with [target] and loads the [options] as component attributes
*/
AFRAME.registerComponent('exceptions', {
    schema: {
        position: {type: 'string'},
        configMethod: []
    },
    init: function () {

        // let defaultValue = this.defaultExpression || "hello world";

        // //label to display the expression value set for the activity
        // this.label = createText();
        // this.el.appendChild(this.label);
        // this.label.setAttribute('value', this.defaultUri);
        // this.label.setAttribute('color', 'white');
        // this.label.setAttribute('align', 'center');
        // this.label.setAttribute('position', this.attrValue.position);
        // this.label.setAttribute('side', 'double');

        //as init() runs asynchronously, it might run after the panel was loaded
        //config info needs to be reloaded
        this.attrValue.configMethod[0](this.el)


        // this.exceptions = {}

    },

    setDefinition: function(definition) {

        //defaults
        this.defaultUri        = "target1";

        if(definition)
        {
            let uri = definition.attributes.uri.value.split(":")

            this.scheme = uri[0]

            //remove 'scheme' and keep remaining
            this.defaultUri = uri[1]

            //look at options
            let options = this.defaultUri.split("?")

            //if there are options
            if(options.length > 1)
            {
                //keep path value (before question mark)
                this.defaultUri = options[0]

                //split options
                options = options[1].split("&");

                //loops over options
                for(let i=0; i<options.length; i++)
                {
                    let option = options[i].split("=")

                    //adds uri option to component
                    this.attributes[option[0]] = option[1]
                }
            }
        }
    },
              
    getDefinition: function () {
      return this.definition
    },

    getExceptions: function () {
        return this.exceptions
    },

    setExceptions: function (exArray) {

        this.exceptions = {}

        for(let i=0; i<exArray.length; i++){
            this.setException(i, exArray[i].textContent)
        }
    },


    setException: function(name, value){
        if(value && (value.length > 0))
        {
            this.exceptions[name] = value
        }
        else
        {
            delete this.exceptions[name]
        }
    },

    getValue: function () {

        //set target to default value
        let target = this.defaultUri

        //only if component has initialised we can return the label value
        //because the component loads asynchronously, the config panel may first attempt to get the value before the component is ready 
        if(this.label)
        {
            target = this.label.getAttribute('value')
        }

        //get options
        let options = new URLSearchParams(this.exceptions).toString();

        //XML escape string
        if(options.length > 0)
        {
            options = "?"+options.replace(/&/g,"&amp;")
        }
        
        return this.scheme+":"+target+options
    },

    // update: function () {},
    // tick: function () {},
    // remove: function () {},
    // pause: function () {},
    // play: function () {}
});