/* global THREE */
// var registerComponent = require('../core/component').registerComponent;

// module.exports.Component = registerComponent('line', {
AFRAME.registerComponent('rope', {

  schema: {
    start: {type: 'string'},
    end:   {type: 'string'},
    color: {type: 'color', default: '#74BEC1'},
    radius: {type: 'number', default: 0.05},
    opacity: {type: 'number', default: 1},
    visible: {default: true},
    attached: {type: 'boolean', default: false},
  },

  //multiple: true,



  init: function () {

    //reference: 
    // - http://jsbin.com/hazudebiba/edit?html,js,output

    let start = document.getElementById(this.data.start)
    let end   = document.getElementById(this.data.end)

    if(!start || !end){
        console.warn('rope start|end undefined' )
        return
    }

    this.start = start
    this.end = end

    let vStart = new THREE.Vector3()
    let vEnd = new THREE.Vector3()

    start.object3D.getWorldPosition(vStart)
    end.object3D.getWorldPosition(vEnd)

    this.posStart = vStart
    this.posEnd   = vEnd
    
    let cp1X = vStart.x + Math.abs((vEnd.x - vStart.x))/2
    let cp1Y = vStart.y
    let cp1Z = vStart.z

    let cp2X = vEnd.x - Math.abs((vEnd.x - vStart.x))/2
    let cp2Y = vEnd.y
    let cp2Z = vEnd.z


    // ref: https://cubic-bezier.com/#.42,0,.57,1
    this.curve = new THREE.CubicBezierCurve3(
      vStart,
      new THREE.Vector3( cp1X, cp1Y, cp1Z ),
      new THREE.Vector3( cp2X, cp2Y, cp2Z ),
      vEnd,
    );

   this.remesh()
   this.shiftToRelativePosition(vStart, vEnd)

  },

  remesh: function(){

    this.geometry = new THREE.TubeGeometry(this.curve, 50, this.data.radius, 20, false);
    this.material = new THREE.MeshBasicMaterial({
                                          color:  this.data.color,
                                          opacity: this.data.opacity,
                                          transparent: !this.data.visible
                                      })
    var line = new THREE.Mesh(this.geometry, this.material);

    this.el.setObject3D(this.attrName, line)
  },

  
  update: function(oldData){

      //  //at creation time there is no data, so we ignore the invocation
      //  if(Object.keys(oldData).length === 0){
      //   return
      // }

    if(oldData && oldData.end){

            //this condition is TRUE when the user drags'n'drop and releases the mouse button.        
            if(this.data.end != oldData.end){

              //we obtain the endpoint element
              this.end = document.getElementById(this.data.end)

              //we keep its current position to detect changes of position
              // this.posEnd = this.end.object3D.position.clone()

              // this.posEnd = new THREE.Vector3()
              this.end.object3D.getWorldPosition(this.posEnd)

              // this.tick()
            }

    }
  },

  tick: function(){

    if(!this.posStart || !this.posEnd){
        return
    }
    
    //we always reset both ends. On datamodel reloads the start element changes
    this.start = document.getElementById(this.data.start)
    this.end   = document.getElementById(this.data.end)

    //sometimes activities are deleted (like setHeader/setProperty)
    //those may cause loss of mapping fields
    //on those cases we eliminate the rope (mapping)
    if(!this.start || !this.end){
      this.el.parentElement.removeChild(this.el)
      return
    }

    //obtain start/end world positions
    let vStart = new THREE.Vector3
    let vEnd   = new THREE.Vector3
    this.start.object3D.getWorldPosition(vStart)
    this.end.object3D.getWorldPosition(vEnd)


    if(this.curve.v0.equals(vStart) && this.curve.v3.equals(vEnd)){
        //if start/end didn't change, no need to re-mesh
        return
    }
    else{
        //ref: https://stackoverflow.com/questions/49266456/update-three-tubegeometry-path-on-the-fly

        let cp1X = vStart.x + Math.abs((vEnd.x - vStart.x))/2
        let cp2X = vEnd.x   - Math.abs((vEnd.x - vStart.x))/2

        let p1 = vStart.clone()
        p1.x = cp1X

        let p2 = vEnd.clone()
        p2.x = cp2X

        this.curve.v0 = vStart
        this.curve.v1 = p1
        this.curve.v2 = p2
        this.curve.v3 = vEnd
   
        this.remesh()
        this.shiftToRelativePosition(vStart, vEnd)
      }
  },

  shiftToRelativePosition: function (vStart, vEnd) {
    //As data links (ropes) can be at any hierarchy level and not centred in their coordinates system
    //we need to shift their position to visually match their parent's end's position
    this.start.object3D.getWorldPosition(this.posStart)      
    this.end.object3D.getWorldPosition(this.posEnd)      


    let v1,v2

    //when rope becomes fully attached (when source and target are mapped)
    if(this.data.attached){
      //we use
      v1 = vEnd.clone().negate()
      v2 = this.end.object3D.position.clone()
    }
    //when user is still dragging the rope to a target field (constructing)
    else{
      v1 = vStart.clone().negate()
      v2 = this.start.object3D.position.clone()
    }

    //add them
    v1.add(v2)
    
    //set rope's position at vector's
    this.el.object3D.position.set(v1.x, v1.y, v1.z)
  },


  remove: function () {
    this.el.removeObject3D(this.attrName, this.line);
  }
});

// function isEqualVec3 (a, b) {
//   if (!a || !b) { return false; }
//   return (a.x === b.x && a.y === b.y && a.z === b.z);
// }

AFRAME.registerPrimitive('a-rope', {
    defaultComponents: {
        rope: {}
    },
    mappings: {

        start: "rope.start",
        end: "rope.end",
        color: "rope.color",
        radius: "rope.radius",
        opacity: "rope.opacity",
        visible: "rope.visible",
        attached: "rope.attached",
        // width: "dropdown.width",
        // menu: "dropdown.menu"
    }
});