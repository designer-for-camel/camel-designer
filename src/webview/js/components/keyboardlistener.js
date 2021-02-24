
AFRAME.registerComponent('keyboardlistener', {
    // schema: {
    //     position: {type: 'string'},
    //     configMethod: []
    // },
    init: function () {

        console.log("init keyboard-listener" + this.el);

        document.addEventListener('keydown', this.notify);
        document.addEventListener('keyup', this.notify);

        this.altpressed = false;
    },

    //ATTENTION:
    //when this function executes', 'this' references DOCUMENT
    //to update component variables, first the component needs to be found
    notify: function(event) {
        // if(event.code == "ShiftRight" || event.code == "ShiftLeft")
        if(event.key == "Shift")
        {
            console.log("shift: "+event.type+"/"+event.key)

            let pressed = (event.type == "keydown")

            //we look for the component
            this.querySelectorAll('[detachable]').forEach(function(activity){
                activity.components.detachable.keypressed(pressed)
            });
        }
        else if(event.key == "Alt")
        {
            console.log("alt: "+event.type+"/"+event.key)

            let pressed = (event.type == "keydown")

            //we look for the component
            this.querySelectorAll('[keyboardlistener]').forEach(function(entity){
                entity.components.keyboardlistener.altpressed = pressed
            });
        }      
    }
    

    // update: function () {},
    // tick: function () {},
    // remove: function () {},
    // pause: function () {},
    // play: function () {}
});