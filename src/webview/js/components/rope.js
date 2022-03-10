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


    // this.posStart = start.object3D.position.clone()
    // this.posEnd = end.object3D.position.clone()

    let vStart = new THREE.Vector3()
    let vEnd = new THREE.Vector3()

    start.object3D.getWorldPosition(vStart)
    end.object3D.getWorldPosition(vEnd)

    this.posStart = vStart
    this.posEnd   = vEnd
    
    // ref: https://cubic-bezier.com/#.42,0,.57,1
    // const curve = new THREE.CubicBezierCurve3(
    //     new THREE.Vector3( -4.5, 0, 0 ),
    //     new THREE.Vector3( -2, 0, 0 ),
    //     new THREE.Vector3( 2, 3, 0 ),
    //     new THREE.Vector3( 5, 3, 0 )
    // );
    

    // let vStart = new THREE.Vector3()
    // let vEnd = new THREE.Vector3()
    // this.start.object3D.getWorldPosition(vStart)
    // this.end.object3D.getWorldPosition(vEnd)

    // let cp1X = this.start.object3D.position.x + (this.end.object3D.position.x - this.start.object3D.position.x)/4
    // let cp1Y = this.start.object3D.position.y

    // let cp2X = this.end.object3D.position.x - (this.end.object3D.position.x - this.start.object3D.position.x)/4
    // let cp2Y = this.end.object3D.position.y

    let cp1X = vStart.x + (vEnd.x - vStart.x)/4
    let cp1Y = vStart.y

    let cp2X = vEnd.x - (vEnd.x - vStart.x)/4
    let cp2Y = vEnd.y



    // this.curve = new THREE.CubicBezierCurve3(
    //     this.start.object3D.position,
    //     new THREE.Vector3( cp1X, cp1Y, 0 ),
    //     new THREE.Vector3( cp2X, cp2Y, 0 ),
    //     this.end.object3D.position,
    // );

    this.curve = new THREE.CubicBezierCurve3(
      vStart,
      new THREE.Vector3( cp1X, cp1Y, 0 ),
      new THREE.Vector3( cp2X, cp2Y, 0 ),
      vEnd,
  );

    /*
    this.geometry = new THREE.TubeGeometry(this.curve, 50, this.data.radius, 20, false);
    this.material = new THREE.MeshBasicMaterial({
                                                    color:  this.data.color,
                                                    opacity: this.data.opacity,
                                                    transparent: !this.data.visible
                                                })
    var line = new THREE.Mesh(this.geometry, this.material);
       
    this.el.setObject3D(this.attrName, line)
    */
   this.remesh()
  },

  remesh: function(){
    // this.curve = new THREE.CubicBezierCurve3(
    //                     this.start.object3D.position,
    //                     new THREE.Vector3( -2, 0, 0 ),
    //                     new THREE.Vector3( 2, 3, 0 ),
    //                     this.end.object3D.position,
    //                   );

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


    let vStart = new THREE.Vector3
    let vEnd   = new THREE.Vector3
    this.start.object3D.getWorldPosition(vStart)
    this.end.object3D.getWorldPosition(vEnd)


    // if(this.posStart.equals(this.start.object3D.position) && this.posEnd.equals(this.end.object3D.position)){
    // if(this.posStart.equals(vStart) && this.posEnd.equals(vEnd)){
    if(this.curve.v1.equals(vStart) && this.curve.v3.equals(vEnd)){
        //if start/end didn't change, no need to re-mesh
        return
    }
    else{
        //ref: https://stackoverflow.com/questions/49266456/update-three-tubegeometry-path-on-the-fly

        // this.posEnd = this.end.object3D.position




        // let cp1X = this.start.object3D.position.x + Math.abs((this.end.object3D.position.x - this.start.object3D.position.x))/2
        // let cp1Y = this.start.object3D.position.y
    
        // let cp2X = this.end.object3D.position.x - Math.abs((this.end.object3D.position.x - this.start.object3D.position.x))/2
        // let cp2Y = this.end.object3D.position.y

        let cp1X = vStart.x + Math.abs((vEnd.x - vStart.x))/2
        // let cp1Y = vStart.y
    
        let cp2X = vEnd.x - Math.abs((vEnd.x - vStart.x))/2
        // let cp2Y = vEnd.y



        let p1 = this.curve.v0.clone()
        // p1.x += 4
        p1.x = cp1X

        let p2 = this.curve.v3.clone()
        // p2.x -= 4
        p2.x = cp2X

        // let p0 = this.start.object3D.position.clone()
        // p0.x+=.5
        // let p3 = this.end.object3D.position.clone()
        // p3.x-=.5

        let p0 = new THREE.Vector3()
        this.start.object3D.getWorldPosition(p0)
        // p0.subVectors(p0,this.start.object3D.position)
        // p0.x+=.5
        // vStart.negate()

        // let v1 = vStart.clone().negate()
        // let v2 = this.start.object3D.position.clone()
        // p0.add(v1)
        // p0.add(v2)


        // p0 = this.start.object3D.position.clone().negate().add(vStart.negate())

        let p3 = new THREE.Vector3()
        this.end.object3D.getWorldPosition(p3)
        // p3.subVectors(p3,this.end.object3D.position)
        // p3.x-=.2

        // let v3 = vEnd.clone().negate()
        // let v4 = this.end.object3D.position.clone()
        // p3.add(v3)
        // p3.add(v4)
        // p3.add(v1)

        // this.curve.v1 = p1
        // this.curve.v2 = p2
        this.curve.v0 = p0
        this.curve.v1 = p1
        this.curve.v2 = p2
        this.curve.v3 = p3
    

        this.remesh()


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
      }
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