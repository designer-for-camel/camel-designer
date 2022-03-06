//========================
AFRAME.registerComponent('inputlistener', {
    // schema: {
    //     position: {type: 'string'},
    //     configMethod: []
    // },
    init: function () {

        console.log("init input-listener " + this.el.id);

        // document.addEventListener('keydown', this.notify);
        // document.addEventListener('keyup', this.notify);

        //TO DO: 'keypress' is deprecated, should be updated with 'keydown'
        document.addEventListener('keypress', this.notify); //keypress registers character values (e.g. arrow keys don't trigger keypress)
        document.addEventListener('keydown', this.backspace);

        this.that = this

        setInterval(this.blinkerTick,500, this);
    },

    blinkerTick: function(){
        let input = UiInput.getActiveElement()

        if(input){
            // input.blinkerTick()
            input.components.input.blinkerTick()
        }
    },

    focus: function(element){
        UiInput.focus(element)
        UiInput.setValue(UiInput.value+" ")
    },
    unfocus: function(element){

        // UiInput.focus(element)
        UiInput.setValue(UiInput.getValue().slice(0, -1))
    },

    //ATTENTION:
    //when this function executes', 'this' references DOCUMENT
    //to update component variables, first the component needs to be found
    notify: function(event) {

        //user might be pressing keys without having focussed on any 3D input box
        if(UiInput.getActiveElement() == null){
            return
        }

        console.log("inputlistener: "+event.type+"/"+event.key)
        console.log("element with focus: "+UiInput.activeElement.tagName)

        let value = UiInput.getValue()

        if(event.key == "Enter"){

            // let newRouteId = UiInput.value.slice(0, -1)

            //remove blinker
            UiInput.setValue(value.slice(0, -1))

            //trigger events
            UiInput.submitValue()

            //restore blinker
            UiInput.setValue(value)

            // entityEl.emit('physicscollided', {collidingEntity: anotherEntityEl}, false);

            // renameActiveRoute(newRouteId)

            return
        }

        // if(value.length < 13){
            UiInput.setValue(value+event.key)
        // }
    },
    

    backspace: function(event) {

        console.log("inputlistener backspace: "+event.type+"/"+event.key)

        //user might be pressing keys without having focussed on any 3D input box
        if(UiInput.getActiveElement() == null){
            return
        }

        if(event.key == "Backspace"){
            let el = UiInput.getActiveElement()
            let value = UiInput.getValue()
            value = value.slice(0, -1)
            UiInput.setValue(value)
        }
        else if(event.key == "Escape"){
            UiInput.unfocus()
        }


    },



    // update: function () {},
    // tick: function () {},
    remove: function () {
            // window.removeEventListener('keydown', this.notify);
            // window.removeEventListener('keyup', this.notify);
            window.removeEventListener('keydown', this.notify);
            window.removeEventListener('keypress', this.backspace);
    }
    // pause: function () {},
    // play: function () {}
});