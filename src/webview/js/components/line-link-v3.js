/* global THREE */
// var registerComponent = require('../core/component').registerComponent;

// module.exports.Component = registerComponent('line', {
AFRAME.registerComponent('linelink', {

  schema: {
    start: {type: 'vec3', default: {x: 0, y: 1, z: 0}},
    end: {type: 'vec3', default: {x: 2, y: 0, z: -5}},
    color: {type: 'color', default: '#74BEC1'},
    opacity: {type: 'number', default: 1},
    visible: {default: true}
  },

  multiple: true,

  init: function () {

    //reference: 
    // - http://jsbin.com/hazudebiba/edit?html,js,output


    //ref: https://cubic-bezier.com/#.42,0,.57,1
    const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3( -4.5, 0, 0 ),
        new THREE.Vector3( -2, 0, 0 ),
        new THREE.Vector3( 2, 3, 0 ),
        new THREE.Vector3( 5, 3, 0 )
    );

    // const points = curve.getPoints( 50 );
    // const geometry = new THREE.BufferGeometry().setFromPoints( points );
    // const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    // let line = new THREE.Line( geometry, material );
    
    
    // var geometry = new THREE.TubeGeometry(curve, 50, 0.5, 20, false);
    var geometry = new THREE.TubeGeometry(curve, 50, 0.05, 20, false);
    // var material = new THREE.MeshNormalMaterial({
    var material = new THREE.MeshBasicMaterial({
                                                    color:  0xff0000,
                                                    // opacity: 0.9,
                                                    // transparent: true
                                                })
    var line = new THREE.Mesh(geometry, material);

    
    
    this.el.setObject3D('linelink', line)

  },


  remove: function () {
    this.el.removeObject3D('line', this.line);
  }
});

function isEqualVec3 (a, b) {
  if (!a || !b) { return false; }
  return (a.x === b.x && a.y === b.y && a.z === b.z);
}

AFRAME.registerPrimitive('a-linelink', {
    defaultComponents: {
        linelink: {}
    },
    mappings: {
    }
});