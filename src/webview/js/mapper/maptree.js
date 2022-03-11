AFRAME.registerComponent('maptree', {
    schema: {
        tree:        { type: "string"},
        // rootname:    { type: "string",  default: "{JSON}"},
        istarget:    { type: "boolean", default: false},
        type:        { type: "string",  default: "json"},
        processvars: { type: "boolean", default: false}, 
    },

    init: function () {
        console.log('maptree init')

        //maptree creates a tree of child elements (data entries)
        //because they initialise asynchronously we listen for completion events until all are done
        //then we can initialise mappings (if any)
        this.initCounter = 0
        this.el.addEventListener('mapentry-init-complete', function(){
            this.initCounter--
            if(this.initCounter == 0 && !this.data.istarget){
                this.el.closest('[mapping]').components.mapping.initialiseMappings()
            }
        }.bind(this));


        this.el.id = this.data.istarget ? this.el.parentEl.id + "-target" : this.el.parentEl.id + "-source"

        this.el.setAttribute("handgrip", "")

        this.type = this.data.type

        // let rootLabel = "{json}"

        // let rootLabel = this.data.rootname

        // if(!this.data.istarget && this.data.processvars){
        //     rootLabel = "exchange"
        // }

        // if(this.data.istarget && this.type == 'headers'){
        //     rootLabel = "headers"
        //     this.type = "json"
        // }

        if(this.type == 'json'){
            this.tree = JSON.parse(this.data.tree)
            let rootLabel = Object.keys(this.tree)[0]
            // this.createBranch(this.tree, this.el, rootLabel)
            this.createBranch(this.tree[rootLabel], this.el, rootLabel)
            
            // this.createLeaf(this.el, "}", "}")

        }
        else if(this.type == 'xml'){

            //parse source code
            this.tree = new DOMParser().parseFromString(this.data.tree, 'application/xml');
    
            this.createBranch(this.tree.firstChild, this.el, this.tree.firstChild.localName)
        }
        else{
            return
        }




        // for (const key in this.data.tree) {
        //     if (Object.hasOwnProperty.call(this.data.tree, key)) {
        //         // const element = object[key];

        //         if(objectypeof)

        //         this.createNode(root, key)
        //     }
        // }

    },

    createBranch: function(branch, parent, field){


        // let root = this.createLeaf(parent, field)
        let root


        if(this.type == 'xml'){
            branch = branch.children
        }

        if(this.type == 'json'){
            root = this.createLeaf(parent, field, field, false)
          
            for (const key in branch) {

                if(typeof(branch[key]) == 'object'){
                    this.createBranch(branch[key],root,key)
                    // this.createBranch(branch[key],parent,key)
                    
                }
                else{
                    // this.createLeaf(root, key, key)
                    this.createLeaf(root, key, branch[key])
                    // this.createLeaf(parent, key, key)
                }
            }
            // this.createLeaf(parent, "}","}")

        }
        else{

            root = this.createLeaf(parent, field, field)

            for (let key = 0; key < branch.length; key++) {
            // for (const key in branch) {

                // if(typeof(branch[key]) == 'object'){
                if(branch[key].childElementCount > 0){
                    this.createBranch(branch[key],root,branch[key].localName)
                    
                }
                else{
                    this.createLeaf(root, branch[key].localName, branch[key].textContent)
                }
            }   
        }

        return root
    },

    // createLeaf: function(parent, field, icon){
    createLeaf: function(parent, field, value, ismappable){

        // if(!mappable){
        //     mappable = mappable
        // }
        // else{
        //     mappable = true
        // }
        



        //for every child we create we increment the counter
        this.initCounter++

        //element clicked
        //the event originates at the top level mapper button
        //we take the parent because the physical element is the box, child of the mapper button.

        // let value = icon || "{"

        if(this.type == 'xml'){
            value = field
        }

        let enabled = false

        if(this.data.istarget && field == "headers"){
            enabled = true
        }

        let childMapButton = document.createElement('a-map-entry')
        childMapButton.setAttribute("position",".2 -.5 0")
        childMapButton.setAttribute("field", field)
        childMapButton.setAttribute("value", value)
        childMapButton.setAttribute("width", .4)
        childMapButton.setAttribute("enabled", enabled)
        childMapButton.setAttribute("ismappable", ismappable)
        childMapButton.setAttribute("istarget", this.data.istarget)
        childMapButton.id = this.el.id + "-" + field

        if(this.data.processvars && parent.attributes.field){
  
            if(parent.attributes.field.value == "exchange")
                childMapButton.setAttribute("vartype", "body")
            else
                childMapButton.setAttribute("vartype", parent.attributes.field.value)

            // if(parent.attributes.value.value == 'headers'){
            //     childMapButton.setAttribute("expr-simple", "${header."+value+"}")
            // }
            // else if(parent.attributes.value.value == 'properties'){
            //     childMapButton.setAttribute("expr-simple", "${exchangeProperty."+value+"}")
            // }
            // else if(value == 'body'){
            //     childMapButton.setAttribute("expr-simple", "${body}")
            // }
        }

        parent.appendChild(childMapButton)

        return childMapButton
    
    },

    setTree: function (tree) {

        if(!this.tree){
            this.tree = tree
        }
    },
    update: function (oldData) {

        console.log("update")


        //at creation time there is no data, so we ignore the invocation
        if(Object.keys(oldData).length === 0){
            return
        }

        //if 'enabled' did change        
        // if(this.data.enabled != oldData.enabled){
        // }
    },
    tick: function () {},
    remove: function () {},
    pause: function () {},
    play: function () {}
  });
  
  AFRAME.registerPrimitive('a-map-tree', {
    defaultComponents: {
        'maptree': {}
    },
    mappings: {
        tree: "maptree.tree",
        // rootname: "maptree.rootname",
        istarget: "maptree.istarget",
        type: "maptree.type",
        processvars: "maptree.processvars"
    }
  });




  function testMapTreeJson(){

    console.log("in test map tree JSON")

    let map = document.createElement('a-map-tree')
    console.log('maptree element created in code')

    document.querySelector('a-scene').appendChild(map)
    console.log('maptree added to scene')

    let mapTree = {
        field1: "value1",
        field2: {
            field3: "value3",
            field4: "value4",
            field5: {
                field6: "value6",
                field7: "value7",
            },
        },
        field8: "value8",
    }

    map.setAttribute("tree", JSON.stringify(mapTree))

    console.log('maptree access to component')
  }

  function testMapTreeXml(){

    console.log("in test map tree XML")


    // var xml = "<book><title>Harry Potter</title></book>"
    // var xml = "<book><title>Harry Potter</title></book>"
    // var doc = new dom().parseFromString(xml)
    // var title = xpath.select("//title/text()", doc).toString()
    // console.log(title)



    //parse source code
    // var xmlDoc = new DOMParser().parseFromString(xml, 'application/xml');
    
    //obtain all route definitions with 'from' element (discard REST inner routes as they don't have 'from')
    // var iterator = xmlDoc.evaluate('fn:xml-to-json(.)', xmlDoc, null, XPathResult.ANY_TYPE, null);
    
    // var thisNode = iterator.iterateNext();


    let map = document.createElement('a-map-tree')
    console.log('maptree element created in code')

    document.querySelector('a-scene').appendChild(map)
    console.log('maptree added to scene')

    // var xml = "<book><title>Harry Potter</title></book>"
    let mapTree = `
        <book>
            <title>Harry Potter</title>
            <author>Harry Potter</author>
            <otherTitles>
                <title>Harry Potter</title>
                <title>James Bond</title>
                <title>Peter Pan</title>                    
            </otherTitles>
        </book>
    `
    // let mapTree = {
    //     field1: "value1",
    //     field2: {
    //         field3: "value3",
    //         field4: "value4",
    //         field5: {
    //             field6: "value6",
    //             field7: "value7",
    //         },
    //     },
    //     field8: "value8",
    // }

    // map.setAttribute("tree", JSON.stringify(mapTree))
    map.setAttribute("tree", mapTree)
    map.setAttribute("istarget", true)
    map.setAttribute("type", "xml")

  }
