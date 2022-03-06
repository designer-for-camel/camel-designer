AFRAME.registerComponent('map-tree', {
    schema: {

        tree: { type: "string"},
        // source: { type: "string"},
        istarget: { type: "boolean", default: false},

        // tree: {
        //     default: [],
        //     parse: function (value) {
        //       return JSON.parse(value)
        //     },
        //     stringify: function (value) {
        //       return JSON.stringify(value)
        //     }
        //   },
        type: { type: "string", default: "json" },

        // type: { type: "string", default: "json" },
         
    },
    init: function () {
        console.log('map-tree init')

        this.el.setAttribute("handgrip", "")

        this.type = this.data.type

        let rootLabel = "{json}"

        if(this.type == 'headers'){
            rootLabel = "headers"
            this.type = "json"
        }

        if(this.type == 'json'){
            this.tree = JSON.parse(this.data.tree)
            this.createBranch(this.tree, this.el, rootLabel)
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

        if(this.type == 'xml'){
            branch = branch.children
        }

        if(this.type == 'json'){
            let root = this.createLeaf(parent, field, field)
          
            for (const key in branch) {

                if(typeof(branch[key]) == 'object'){
                    this.createBranch(branch[key],root,key)
                    // this.createBranch(branch[key],parent,key)
                    
                }
                else{
                    this.createLeaf(root, key, key)
                    // this.createLeaf(parent, key, key)
                }
            }
            // this.createLeaf(parent, "}","}")

        }
        else{

            let root = this.createLeaf(parent, field, field)

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

    },

    // createLeaf: function(parent, field, icon){
    createLeaf: function(parent, field, value){


        //element clicked
        //the event originates at the top level mapper button
        //we take the parent because the physical element is the box, child of the mapper button.

        // let value = icon || "{"

        if(this.type == 'xml'){
            value = field
        }

        let childMapButton = document.createElement('a-map-entry')
        childMapButton.setAttribute("position",".2 -.5 0")
        childMapButton.setAttribute("value", value)
        childMapButton.setAttribute("width", .4)
        childMapButton.setAttribute("enabled", false)
        childMapButton.setAttribute("istarget", this.data.istarget)

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
        'map-tree': {}
    },
    mappings: {
        tree: "map-tree.tree",
        istarget: "map-tree.istarget",
        type: "map-tree.type",
    }
  });




  function testMapTreeJson(){

    console.log("in test map tree JSON")

    let map = document.createElement('a-map-tree')
    console.log('map-tree element created in code')

    document.querySelector('a-scene').appendChild(map)
    console.log('map-tree added to scene')

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

    console.log('map-tree access to component')
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
    console.log('map-tree element created in code')

    document.querySelector('a-scene').appendChild(map)
    console.log('map-tree added to scene')

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
