
AFRAME.registerComponent('definition', {
    schema: {
        element: []
    },
    init: function () {

        //As init() is invoked asynchronously, early access to definition values might return null/empty
        //Best to follow the steps below:
        //  1) set component
        //  2) manually invoke setDefinition()
        //  3) access definition values
        
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