
/*
* This (a-frame) component adheres URI manipulation functionality to activities (a-entity)
* URIs are defined as: 'scheme:target?options' (e.g. uri="file:directory?fileName=sample")
* The component creates a visible label with [target] and loads the [options] as component attributes
*/
AFRAME.registerComponent('uri', {
    schema: {
        position: {type: 'string'},
        configMethod: []
    },
    init: function () {

        // let defaultValue = this.defaultExpression || "hello world";

        //label to display the expression value set for the activity
        this.label = createText();
        this.el.appendChild(this.label);
        this.label.setAttribute('value', this.defaultUri);
        this.label.setAttribute('color', 'white');
        this.label.setAttribute('align', 'center');
        this.label.setAttribute('position', this.attrValue.position);
        this.label.setAttribute('side', 'double');

        //as init() runs asynchronously, it might run after the panel was loaded
        //config info needs to be reloaded
        this.attrValue.configMethod[0](this.el)


        // this.attributes        = {}

    },

    setDefinition: function(definition) {

        //defaults
        this.attributes        = {}
        this.defaultUri        = "target1";

        if(definition)
        {
            let uri = definition.attributes.uri.value.split(":")

            // if(uri.length == 2){
                this.scheme = uri[0]
            // }
            // else{
            //     this.scheme = uri[0]+":"+uri[1]
            // }

            //remove 'scheme' and keep remaining
            // this.defaultUri = uri[1]
            this.defaultUri = uri[uri.length - 1]

            this.schemeSpecificPart = ''

            if(uri.length>2){
                // this.defaultUri += ":"+uri[2]
                //set scheme-specific-part
                //ref: https://datatracker.ietf.org/doc/html/rfc2718#section-1
                for(let i=1; i<uri.length-1; i++){
                    this.schemeSpecificPart += uri[i]
                    if(i < uri.length-2){
                        this.schemeSpecificPart += ':'
                    }
                }
            }


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

    getTarget: function () {
        //only if component has initialised we can return a value
        //because the component loads asynchronously, the config panel may first attempt to get the value before the component is ready 
        if(this.label)
        {
            return this.label.getAttribute('value')
        }

        //otherwise return default one (init might not have yet run)
        return this.defaultUri
    },

    setTarget: function (uri) {
        if(this.label)
        {
            this.label.setAttribute('value', uri)
        }
        else
        {
            //init() might not have executed, so we set value as default
            this.defaultUri = uri
        }
    },

    getOptions: function () {
        return this.attributes
    },

    setOption: function(name, value){
        if(value && (value.length > 0))
        {
            this.attributes[name] = value
        }
        else
        {
            delete this.attributes[name]
        }
    },

    getSchemeSpecificPart: function () {
        return this.schemeSpecificPart
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
        let options = new URLSearchParams(this.attributes).toString();

        //XML escape string
        if(options.length > 0)
        {
            options = "?"+options.replace(/&/g,"&amp;")
        }
        
        if(this.schemeSpecificPart != ''){
            return this.scheme+":"+this.schemeSpecificPart+":"+target+options
        }

        return this.scheme+":"+target+options
    },

    // update: function () {},
    // tick: function () {},
    // remove: function () {},
    // pause: function () {},
    // play: function () {}
});