
AFRAME.registerComponent('expression', {
    schema: {
        position: {type: 'string'},
        configMethod: []
    },
    init: function () {

        // let defaultValue = this.defaultExpression || "hello world";

        //label to display the expression value set for the activity
        this.label = createText();
        this.el.appendChild(this.label);
        this.label.setAttribute('value', '"'+this.defaultExpression+'"');
        this.label.setAttribute('color', 'white');
        this.label.setAttribute('align', 'center');
        this.label.setAttribute('position', this.attrValue.position);
        this.label.setAttribute('side', 'double');

        //as init() runs asynchronously, it might run after the panel was loaded
        //config info needs to be reloaded
        this.attrValue.configMethod[0](this.el)
    },

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
              
    getDefinition: function () {
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

    getValue: function () {
        //only if component has initialised we can return a value
        //because the component loads asynchronously, the config panel may first attempt to get the value before the component is ready 
        if(this.label)
        {
            return this.label.getAttribute('value').slice(1, -1);  //slice -> gets rid of double quotes at start/end
        }

        //otherwise return default one (init might not have yet run)
        return this.defaultExpression
    },

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

    getXml: function(){

        let attributesXml = ""

        //constructs a list of XML attributes (helper to render Camel XML)
        for (var key in this.attributes){
            attributesXml+= ' '+key+'="'+this.attributes[key]+'"'
        }

        if(this.language == "tokenize"){
            //xml expression (i.e. <tokenize token="tkn"/>)
            return '<'+this.language+attributesXml+'/>'
        }
        else{
            //xml expression (i.e. <xpath saxon="true">/data</xpath>)
            return '<'+this.language+attributesXml+'>'+this.getValue()+'</'+this.language+'>'
        }

    }

    // update: function () {},
    // tick: function () {},
    // remove: function () {},
    // pause: function () {},
    // play: function () {}
});