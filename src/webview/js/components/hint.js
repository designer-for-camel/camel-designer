
AFRAME.registerComponent('hint', {
    schema: {
        message: {type: 'string'}
    },
    init: function () {

        //helper
        var activity = this.el

        //hint pointer
        var arrow = document.createElement('a-triangle');
        activity.appendChild(arrow);
        arrow.setAttribute("vertex-a","0 .8 0")
        arrow.setAttribute("vertex-b","-.25 1.3 0")
        arrow.setAttribute("vertex-c",".25 1.3 0")
        arrow.setAttribute("color","grey")
        arrow.setAttribute('side', 'double');

        //hint label
        var text = createText();
        activity.appendChild(text);
        text.setAttribute('value', this.data.message);
        text.setAttribute('color', 'grey');
        text.setAttribute('position', {x: .3, y: .9, z: 0});
        text.setAttribute('side', 'double');

        //hint animation    
        //since A-Frame v1.0.0 it seems animations work as attributes, not as childs.
        arrow.setAttribute('animation', {property: 'position', dur: '500', to: '0 -0.25 0', loop: true, dir: 'alternate'});
    }

    // update: function () {},
    // tick: function () {},
    // remove: function () {},
    // pause: function () {},
    // play: function () {}
});