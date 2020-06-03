
AFRAME.registerComponent('keyboardlistener', {
    // schema: {
    //     position: {type: 'string'},
    //     configMethod: []
    // },
    init: function () {

        console.log("init keyboard-listener" + this.el);

        document.addEventListener('keydown', this.notify);
        document.addEventListener('keyup', this.notify);
    },

    notify: function(event) {
        if(event.code == "ShiftRight" || event.code == "ShiftLeft")
        {
            console.log("shift: "+event.type+"/"+event.key)

            let pressed = (event.type == "keydown")

            this.querySelectorAll('[detachable]').forEach(function(activity){
                activity.components.detachable.keypressed(pressed) // .setAttribute('position', '0 0 0');
            });
        }   
    }

    // update: function () {},
    // tick: function () {},
    // remove: function () {},
    // pause: function () {},
    // play: function () {}
});