
AFRAME.registerComponent('hint', {
    schema: {
        message: {type: 'string'},
        orientation: {type: 'string'},
        position: {type: 'string'},
        selfdestroy: {type: 'boolean', default: true},
    },
    init: function () {

        //helper
        var activity = this.el

        //hint container
        let container = document.createElement("a-entity")
        activity.appendChild(container);

        //hint pointer
        var arrow = document.createElement('a-triangle');
        container.appendChild(arrow);
        arrow.setAttribute("vertex-a","0 .8 0")
        arrow.setAttribute("vertex-b","-.25 1.3 0")
        arrow.setAttribute("vertex-c",".25 1.3 0")
        arrow.setAttribute("color","grey")
        arrow.setAttribute('side', 'double');
        arrow.classList.add('interactive')

        //hint label
        var text = createText();
        container.appendChild(text);
        text.setAttribute('value', this.data.message);
        text.setAttribute('wrap-count', 20);
        text.setAttribute('width', 2.5);
        text.setAttribute('color', 'grey');
        text.setAttribute('position', {x: .3, y: .9, z: 0});
        text.setAttribute('side', 'double');

        //hint 'remove' button
        var remove = document.createElement('a-plane')
        container.appendChild(remove);
        remove.setAttribute('width', 2.5);
        remove.setAttribute('height', .5);
        remove.setAttribute('visible', false);
        remove.setAttribute('color', '#303030');
        remove.setAttribute('text', 'value: remove hint; align: center; wrapCount: 15; color: gray');
        remove.setAttribute('position', {x: 1.5, y: .9, z: .01});
        remove.setAttribute('animation__visible',         {property: 'visible', dur: 0, to: true,  startEvents: 'mouseenter'});
        remove.setAttribute('animation__visible_reverse', {property: 'visible', dur: 0, to: false, startEvents: 'mouseleave'});    
        remove.classList.add('interactive')

        //keep references
        this.buttonRemove = remove
        this.container = container

        //point arrow up and rearrange elements
        if(this.data.orientation == "up"){
            container.setAttribute('rotation', '0 0 180');
            text.setAttribute('rotation', '0 0 180');
            text.setAttribute('position', {x: -.3, y: .9, z: 0});
            remove.setAttribute('rotation', '0 0 180');
            remove.setAttribute('position', {x: -1.5, y: .9, z: .01});
        }

        //set position if provided
        if(this.data.position){
            container.setAttribute('position', this.data.position);
        }

        //remove action when clicked
        // remove.addEventListener('click', function(event){
        //     event.stopPropagation()
        //     this.parentElement.parentElement.removeChild(this.parentElement)
        // },{ once: true });
        if(this.data.selfdestroy){
            container.addEventListener('mouseenter', this.removeHint.bind(this),{ once: true });
        }
        else{
            remove.addEventListener('click', this.removeHint.bind(this),{ once: true });
            // this.el.addEventListener('hint-remove', this.removeHint,{ once: true });
        }

        //hint animation    
        //since A-Frame v1.0.0 it seems animations work as attributes, not as childs.
        arrow.setAttribute('animation', {property: 'position', dur: '500', to: '0 -0.25 0', loop: true, dir: 'alternate'});
    },

    //used as a listener function to clean up
    removeHint: function(event){
        event.stopPropagation()

        //if(event.target == this.buttonRemove){
        if(event.target.closest('[hint]')){
            // this.parentElement.parentElement.removeChild(this.parentElement)
            this.el.removeAttribute('hint')
        }
        else{
            this.removeEventListener('hint-remove', this.removeHint);
            // this.closest('[hint]').removeAttribute('hint')
            this.removeAttribute('hint')
        }
    },

    //deletes elements from parent
    remove: function () {
        this.container.parentElement.removeChild(this.container)
    },


    // update: function () {},
    // tick: function () {},
    // remove: function () {},
    // pause: function () {},
    // play: function () {}
});