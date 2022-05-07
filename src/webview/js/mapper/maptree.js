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

        //when initialising mappings, some target map-entries are dynamically created
        //they need to be initialised asynchronously
        //this variable holds childs with pending mappings to complete
        this.pendingChildMapping = {}        
        
        this.childcount = 0

        //maptree creates a tree of child elements (data entries)
        //because they initialise asynchronously we listen for completion events until all are done
        //then we can initialise mappings (if any)
        this.initCounter = 0
        this.el.addEventListener('mapentry-init-complete', function(e){
            this.initCounter--
            if(this.initCounter == 0 && !this.data.istarget){
                this.el.closest('[mapping]').components.mapping.initialiseMappings()
            }

            //obtain (if any) pending mapping
            let pending = this.pendingChildMapping[e.srcElement.id]

            //if found a pending one
            if(pending){
                //prepare arguments
                let target      = e.srcElement
                let source      = pending.mapsource
                let camelsource = pending.camelsource

                //create the pending mapping
                this.el.closest('[mapping]').components.mapping.createMapping(source, target, camelsource)

                //remove from list
                delete this.pendingChildMapping[target.id]
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

        let root

        if(this.type == 'json'){
            this.targetmodel = JSON.parse(this.data.tree)
            this.tree = this.targetmodel.datamodel
            // let rootLabel = Object.keys(this.tree)[0]
            let rootLabel = this.targetmodel.name
            // this.createBranch(this.tree, this.el, rootLabel)
            // this.createBranch(this.tree[rootLabel], this.el, rootLabel)
            root = this.createBranch(this.tree, this.el, rootLabel)
            
            // this.createLeaf(this.el, "}", "}")

        }
        else if(this.type == 'xml'){

            //parse source code
            this.tree = new DOMParser().parseFromString(this.data.tree, 'application/xml');
    
            root = this.createBranch(this.tree.firstChild, this.el, this.tree.firstChild.localName)
        }
        else{
            return
        }

        //when this maptree is the target data
        if(this.data.istarget){
            //create a close view buttong
            closeButton = document.createElement('a-button')
            closeButton.setAttribute("value", "Close mapping view")
            closeButton.setAttribute("width", "2")
            closeButton.setAttribute("position", "1 .5 0")
            closeButton.onclick = function(event){       
                this.el.closest('[mapping]').components.mapping.closeMappingView(event)  
            }.bind(this);
            root.appendChild(closeButton)
        }

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
    createLeaf: function(parent, field, value, ismappable, childbuttonrecursive, childprefix){


        //for every child we create we increment the counter
        this.initCounter++

        if(this.type == 'xml'){
            value = field
        }

        if(childprefix){
            field += "-" + (++this.childcount) 
            value += "-" + (  this.childcount) 
        }

        let mapentry = document.createElement('a-map-entry')
        mapentry.setAttribute("position",".2 -.5 0")
        mapentry.setAttribute("field", field)
        mapentry.setAttribute("value", value)
        mapentry.setAttribute("width", .4)
        mapentry.setAttribute("ismappable", ismappable)
        mapentry.setAttribute("istarget", this.data.istarget)
        mapentry.id = this.el.id + "-" + field

        if(childbuttonrecursive){
            mapentry.setAttribute("childbutton",    true)
            mapentry.setAttribute("childprefix",    childprefix)
            mapentry.setAttribute("childrecursive", childbuttonrecursive)
        }
        else if(this.targetmodel.custom[field]){
            mapentry.setAttribute("childbutton",    true)
            mapentry.setAttribute("childprefix",    this.targetmodel.custom[field].prefix)
            mapentry.setAttribute("childrecursive", this.targetmodel.custom[field].recursive)
        }

        if(this.data.processvars && parent.attributes.field){
  
            if(parent.attributes.field.value == "exchange")
                mapentry.setAttribute("vartype", "body")
            else
                mapentry.setAttribute("vartype", parent.attributes.field.value)
        }

        parent.appendChild(mapentry)

        return mapentry  
    },


    // createLeaf: function(parent, field, icon){
    createLeafFromCode: function(mapsource, camelsource){

        if(this.data.istarget){

            if(this.targetmodel.custom.headers && camelsource.nodeName == 'setHeader'){
                let mapentry = this.el.querySelector('a-map-entry[value=headers]')

                let newchild = mapentry.components.mapentry.createChild(camelsource.attributes.name.nodeValue)

                //we register the child with a pending mapping to complete
                this.pendingChildMapping[newchild.id] = {
                        mapsource: mapsource,
                        camelsource: camelsource
                    }

                return newchild
            }
        }
    },
    


    removeLeaf: function(mapentry){

        let parent = mapentry.parentElement
        parent.removeChild(mapentry)
        this.redraw()
    },

    redraw: function(){

        let topMapperButton = this.el.firstChild

        let all = Array.from(topMapperButton.querySelectorAll('a-map-entry'))
        all.forEach(button => {
            button.components.mapentry.redraw(all)
        });            
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
