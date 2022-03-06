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
    //var data = this.data;
    
    let curve = new THREE.SplineCurve( [
        // new THREE.Vector2( -10, 0 ),
        // new THREE.Vector2( -5, 5 ),
        // new THREE.Vector2( 0, 0 ),
        // new THREE.Vector2( 5, -5 ),
        // new THREE.Vector2( 10, 0 )

        new THREE.Vector2( -5, 0 ),
        new THREE.Vector2( -3, 0 ),
        // new THREE.Vector2( 0, 0 ),
        new THREE.Vector2( 3, 3 ),
        new THREE.Vector2( 5, 3 )

    ] );
    let curvepoints = curve.getPoints( 500 );

    let geometry = new THREE.BufferGeometry().setFromPoints( curvepoints );
    
    let material = new THREE.LineBasicMaterial({
                            //   color: 0x0000ff,
                            color: 'white',
                        });


    let line = new THREE.Line( geometry, material );
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