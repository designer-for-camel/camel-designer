//========================
AFRAME.registerComponent('inputlistener', {
    // schema: {
    //     position: {type: 'string'},
    //     configMethod: []
    // },
    init: function () {

        // onFocus = this.el

        console.log("init input-listener " + this.el.id);

        // this.el.setAttribute('value', this.el.getAttribute('value')+" ")

        // document.addEventListener('keydown', this.notify);
        // document.addEventListener('keyup', this.notify);
        document.addEventListener('keypress', this.notify);
        document.addEventListener('keydown', this.backspace);


        this.altpressed = false;
        this.blinker = true;
        this.blinkerFirst = true;
        setInterval(this.blink,500, this);
    },

    focus: function(element){
        UiInput.focus(element)
        UiInput.setValue(UiInput.value+" ")
    },

    //ATTENTION:
    //when this function executes', 'this' references DOCUMENT
    //to update component variables, first the component needs to be found
    notify: function(event) {

        console.log("inputlistener: "+event.type+"/"+event.key)

        console.log("element with focus: "+UiInput.activeElement.tagName)

        /*
        let input = this.querySelectorAll('[inputlistener]')[0]
        let value = input.getAttribute('value')

        value += event.key

        input.setAttribute('value', value)
        */

        // let el = UiInput.getActiveElement()
        // let value = el.getAttribute('value')

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



        // if(UiInput.value.length < 13){
        if(value.length < 13){
            value = value.slice(0, -1)
            // el.setAttribute('value', value+event.key+" ")
            UiInput.setValue(value+event.key+" ")


            //UiInput.setValue(UiInput.value.slice(0, -1))
            //UiInput.setValue(UiInput.value+event.key+" ")
        }
    },
    
    backspace: function(event) {

        console.log("inputlistener backspace: "+event.type+"/"+event.key)

        if(event.key == "Backspace"){
            // let input = this.querySelectorAll('[inputlistener]')[0]
            // let value = input.getAttribute('value')

            // value = value.slice(0, -1)

            // input.setAttribute('value', value)

            let el = UiInput.getActiveElement()
            let value = el.getAttribute('value')

            value = value.slice(0, -2)
            el.setAttribute('value', value+" ")

            // UiInput.setValue(UiInput.value.slice(0, -2)+" ")
        }

    },

    blink: function(component){

        console.log("blink")

        if(component.blinkerFirst){
            UiInput.setValue(UiInput.getValue()+' ')
            component.blinkerFirst = false
        }

        if(!component.blinker) {
            UiInput.setValue(UiInput.getValue().slice(0, -1)+"|")
        }
        else {
            UiInput.setValue(UiInput.getValue().slice(0, -1)+" ")
        }    

        component.blinker = !component.blinker
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