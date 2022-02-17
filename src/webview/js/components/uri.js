
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
        if(this.attrValue.configMethod[0])
        {
            this.attrValue.configMethod[0](this.el)
        }
        
        // this.attributes        = {}
    },


    setDefinition: function(definition) {

        //defaults
        this.attributes        = {}
        this.defaultUri        = "target1";

        if(definition)
        {
            //helper variable
            let uri = definition.attributes.uri.value

            //set scheme
            this.scheme = uri.split(":",1)

            //set specific part
            //as in:
            //https://datatracker.ietf.org/doc/html/rfc2396#section-3
            let schemeSpecificPart = uri.substring(uri.indexOf(':') + 1)

            //helper variable
            let splits = schemeSpecificPart.split("?")
                
            //keep options
            if(splits.length > 1){

                //split options
                let options = splits[1].split("&");

                //loops over options
                for(let i=0; i<options.length; i++)
                {
                    let option = options[i].split("=")

                    //adds uri option to component
                    this.attributes[option[0]] = option[1]
                }
            }

            //depending on the scheme, the scheme-specific-part is handled differently
            //references:
            // - https://datatracker.ietf.org/doc/html/rfc2396#section-3
            // - https://o.quizlet.com/gqkLbD7xAh6QHGPysKPw6A.png
            if(this.scheme == "dataformat"){

                let path = splits[0]

                splits = path.split(":")

                this.dataFormatType   = splits[0]
                this.dataFormatAction = splits[1]
                this.defaultUri       = this.dataFormatAction; 
            }
            else{
                let hierarchicalPart  = splits[0]
                this.defaultUri       = hierarchicalPart;
            }
        }
    },

    getDefinition: function () {
      return this.definition
    },

    getDataFormat: function () {
        return this.dataFormatType
    },

    getTarget: function () {
        //only if component has initialised we can return a value
        //because the component loads asynchronously, the config panel may first attempt to get the value before the component is ready 
        if(this.label)
        {
            return this.label.getAttribute('value')
        }

        //for dataformats we return the action (marshal/unmarshal)
        if(this.scheme == "dataformat"){
            return this.dataFormatAction
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
        // let options = new URLSearchParams(this.attributes).toString();
        let options = ""

        for (var key in this.attributes){

            //'saxon' attribute only when language is xpath
            // if(key == "saxon" && this.language != "xpath"){
            //     continue
            // }
            if(options.length > 0){
                options+="&amp;"
            }

            options += key+'='+this.attributes[key] 

            // attributesXml+= ' '+key+'="'+this.attributes[key]+'"'
        }


        //XML escape string
        if(options.length > 0)
        {
            // options = "?"+options.replace(/&/g,"&amp;")
            options = "?"+options
        }
        
        if(this.scheme == 'dataformat'){
            return this.scheme+":"+this.dataFormatType+":"+target+options
        }

        return this.scheme+":"+target+options
    },

    // update: function () {},
    // tick: function () {},
    // remove: function () {},
    // pause: function () {},
    // play: function () {}
});