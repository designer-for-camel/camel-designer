
AFRAME.registerComponent('definition', {
    schema: {
        element: []
    },
    init: function () {

/*
        this.attributes        = {}

        // if(definition)
        // {
            //obtain language
            // this.language = this.expressionElement.tagName

            //obtains definition attributes
            let defAttributes = this.data.element.attributes

            //loops over attributes
            for(let i=0; i<defAttributes.length; i++)
            {
                //adds definition attribute to component
                this.attributes[defAttributes[i].name] = defAttributes[i].value
            }

            // //for some languages, expressions are loaded from attributes
            // if(this.language == "tokenize"){
            //     this.defaultExpression = this.attributes.token
            // }
            // else{
            //     //default expression
            //     this.defaultExpression = this.expressionElement.innerHTML;
            // }
        // }

*/
        
        //as init() runs asynchronously, it might run after the panel was loaded
        //config info needs to be reloaded
        // this.attrValue.configMethod[0](this.el)
        // UiInput.setValue(this.attributes["strategyRef"])
    },
    setDefinition: function(definition) {

        this.definition = definition

        this.attributes        = {}

        //obtains definition attributes
        let defAttributes = definition.attributes

        //loops over attributes
        for(let i=0; i<defAttributes.length; i++)
        {
            //adds definition attribute to component
            this.attributes[defAttributes[i].name] = defAttributes[i].value
        }
    },

    /*
    setDefinition: function(definition) {

        //defaults
        this.language          = "simple"
        this.attributes        = {}
        this.defaultExpression = "hello world"
        this.expressionElement = definition.firstElementChild

        //special case for aggregations (the expression is 1 level deeper)
        if(definition.tagName == 'aggregate'){
            this.expressionElement = definition.firstElementChild.firstElementChild
        }

        if(definition)
        {
            //obtain language
            this.language = this.expressionElement.tagName

            //obtains definition attributes
            let defAttributes = this.expressionElement.attributes

            //loops over attributes
            for(let i=0; i<defAttributes.length; i++)
            {
                //adds definition attribute to component
                this.attributes[defAttributes[i].name] = defAttributes[i].value
            }

            //for some languages, expressions are loaded from attributes
            if(this.language == "tokenize"){
                this.defaultExpression = this.attributes.token
            }
            else{
                //default expression
                this.defaultExpression = this.expressionElement.innerHTML;
            }
        }
    },
*/       
    getDefinition: function () {
    //   return this.data.element
      return this.definition
    },

    setValue: function (expression) {
        if(this.label)
        {
            this.label.setAttribute('value', '"'+expression+'"')
            
            if(this.language == "tokenize"){
                this.attributes.token = expression
            }
        }
        else
        {
            //init() might not have executed, so we set value as default
            this.defaultExpression = expression
        }
      },

    getValue: function (parameter) {
        //only if component has initialised we can return a value
        //because the component loads asynchronously, the config panel may first attempt to get the value before the component is ready 
        // if(this.label)
        // {
        //     return this.label.getAttribute('value').slice(1, -1);  //slice -> gets rid of double quotes at start/end
        // }

        //otherwise return default one (init might not have yet run)
        // return this.defaultExpression
        return this.attributes[parameter]
    },

    getAttributes: function () {
        return this.attributes
    },

    setAttribute: function(name, value){
        if(value)
        {
            this.attributes[name] = value
        }
        else
        {
            delete this.attributes[name]
        }
    },



    /*
    getLanguage: function () {
        return this.language
      },

    setLanguage: function (language) {
        this.language = language
    },

    getLanguageAttributes: function (language) {
        return this.attributes
    },

    setLanguageAttribute: function(name, value){
        if(value)
        {
            this.attributes[name] = value
        }
        else
        {
            delete this.attributes[name]
        }
    },
*/
    getXmlParameters: function(){

        let attributesXml = ""

        //constructs a list of XML attributes (helper to render Camel XML)
        for (var key in this.attributes){

            //ignore ID (may be included when parsing code)
            if(key == 'id'){
                continue
            }

            attributesXml+= ' '+key+'="'+this.attributes[key]+'"'
        }

        return attributesXml
    }

    // update: function () {},
    // tick: function () {},
    // remove: function () {},
    // pause: function () {},
    // play: function () {}
});