// Global variable
mapperPosition = 0

AFRAME.registerComponent('mapping', {
    schema: {
        value: { type: "string", default: "" },
        width: { type: "number", default: 1 },
        wrapcount: { type: "number" },
        enabled: { type: "boolean", default: true },
        istarget: { type: "boolean", default: false},
    },

    init: function () {

        mapperPosition += 100

        let mapButton = document.createElement('a-button')
        mapButton.setAttribute("value", "Mapper")
        mapButton.setAttribute("position", "0 1 0")
        mapButton.setAttribute("onclick", "this.parentEl.components.mapping.enableMapperView(event)")
        this.el.appendChild(mapButton)
           
        let mapTree = {
            "Content-Type": "",
            Accept: "",
            Authorization: "",
        }
    
        this.mapping = document.createElement('a-entity')
        this.mapping.setAttribute("position", "2 "+mapperPosition+" 1") // we place X=2 to create a smooth camera movent event for Route/Mapping transitions
        this.el.appendChild(this.mapping)

        let map = document.createElement('a-map-tree')
        map.setAttribute("tree", JSON.stringify(mapTree))
        map.setAttribute("istarget", true)
        map.setAttribute("type", "headers")
        map.setAttribute("position", "2 2 0")
        this.mapping.appendChild(map)
    
            mapButton = document.createElement('a-button')
            mapButton.setAttribute("value", "Close")
            mapButton.setAttribute("position", "0 3 0")
            mapButton.setAttribute("onclick", "this.parentEl.parentEl.components.mapping.enableRouteView(event)")
            this.mapping.appendChild(mapButton)

        map = document.createElement('a-map-tree')
        map.setAttribute("tree", JSON.stringify(mapTree))
        map.setAttribute("istarget", false)
        map.setAttribute("position", "-3 2 0")
        this.mapping.appendChild(map)
    },


    enableMapperView: function(event)
    {
        //this prevents the activity from triggering the ring selector process
        event.stopPropagation()
    
        //obtain camera viewpoint
        let camera = document.querySelector('#rig')

        //We place the camera at the Y level in preparation for a smooth X axis movement animation
        camera.object3D.position.y = this.mapping.object3D.position.y

        //obtain world position of mapping
        let centerPoint = new THREE.Vector3()
        this.mapping.object3D.getWorldPosition(centerPoint)

        //trigger smooth movement animation to Mapping
        setCameraPosition(centerPoint)
    },  
  
    enableRouteView: function(event)
    {
        //this prevents the activity from triggering the ring selector process
        event.stopPropagation()
    
        //obtain main camera
        let camera = document.querySelector('#rig')

        //We place the camera at the Y level in preparation for a smooth X axis movement animation
        camera.object3D.position.y = 0
        
        //center view on current activity
        setCameraFocus(getActiveActivity())
    },

    update: function (oldData) {

        //at creation time there is no data, so we ignore the invocation
        if(Object.keys(oldData).length === 0){
            return
        }


    },
    tick: function () {},
    remove: function () {},
    pause: function () {},
    play: function () {}
  });
  
  
//   AFRAME.registerPrimitive('a-map-entry', {
//     defaultComponents: {
//         'map-entry': {}
//     },
//     mappings: {
//         // menu: "dropdown.menu"
//         value: "map-entry.value",
//         width: "map-entry.width",
//         wrapcount: "map-entry.wrapcount",
//         enabled: "map-entry.enabled",
//         istarget: "map-entry.istarget",
//     }
//   });
