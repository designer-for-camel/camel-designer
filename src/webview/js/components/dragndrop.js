
//Registers listeners for mouse actions to set entity states
//A-Frame emits events when entities have states added/removed
//We add/remove the state 'dragging' to indicate if the entity can be dragged
AFRAME.registerComponent("clickable", {
    init: function() {
        

        this.el.addEventListener('raycaster-intersected', evt => {
            this.raycaster = evt.detail.el.getAttribute('raycaster');
            // console.log('raycaster intersected:'+this.el.id)
          });
          this.el.addEventListener('raycaster-intersected-cleared', evt => {
            this.raycaster = null;
            // console.log('raycaster cleared: '+this.el.id)
        });


        //activate dragging when mouse button is pressed
        this.mousedownHandler = e => {
                                        // if (this.el.is("cursor-hovered")) {
                                        // if (this.el.is("raycaster-intersected")) {

                                            if(e.target != this.el) {return;}

                                            if (!this.raycaster) { return; }
                                            


                                            // let t = this.target

                                            if(this.el.localName == 'a-plane' && e.target.localName == 'a-plane' && this.el != e.target){
                                                // e.stopPropagation()
                                                return
                                            }

                                            //activate dragging
                                            if(this.el.components.dragndrop){
                                                this.el.addState("dragging");
                                            }

                                            //SHIFT + CLICK = DETACH
                                            if(this.el.components.detachable && this.el.components.detachable.shiftPressed)
                                            {
                                                this.el.components.detachable.detach()
                                            }
                                        // }
                                    }

        //deactivate dragging when button is released
        this.mouseupHandler = e =>  {
                                        if (this.el.is("dragging")) {
                                            this.el.removeState("dragging");

                                            if(!this.el.components.dragndrop.data.standalone){
                                                //special case for choice activities:
                                                //repositioning first choice activity may change the order of conditions in the code
                                                let preceding = getPreviousActivity(this.el)
                                                if(preceding && preceding.getAttribute('processor-type') == 'choice-start'){
                                                    syncEditor()
                                                }
                                            }
                                            syncMetadata()
                                        }
                                    }

        //select configuration panel
        this.clickHandler = e => {
                                    //REST groups
                                    if(this.el.hasAttribute('rest-dsl')){
                                        selectRestGroup(this.el);
                                        return;    
                                    }

                                    //REST methods/directs should stop propagation as their parent also react to clicks
                                    if(this.el.hasAttribute('method') || this.el.hasAttribute('rest-direct')){
                                        e.stopPropagation()
                                    }

                                    //ignore event if event originates in a mapper
                                    //this prevents camera movement from the command below.
                                    if(e.target.closest('a-map-tree')){
                                        return
                                    }

                                    //This check prevents an error thrown when detaching/reattaching activities
                                    //When reattaching, we let the 'detachable' component to pick the config panel (not here)
                                    //the click event was sourced on the original activity
                                    //but when reattaching the source activity is replaced with its clone, and no longer usable
                                    if(document.body.contains(this.el)){
                                        switchConfigPaneByActivity(this.el);
                                    }
                                }

        //set up event listeners
        this.el.addEventListener("mousedown", this.mousedownHandler)
        this.el.addEventListener("mouseup",   this.mouseupHandler)
        if(this.el.classList.contains('configurable')){
            this.el.addEventListener("click", this.clickHandler)
        }

        // this.el.addEventListener("dblclick", e => {

        //     console.log("DOUBLE CLICK 1")

        //     if (this.el.is("dragging")) {
        //         console.log("DOUBLE CLICK 2")

        //         // this.el.removeState("dragging");
        //         // switchConfigPaneByActivity(this.el);

        //     }
        // })

    },

    remove: function () {
        //clean event listeners
        this.el.removeEventListener("mousedown", this.mousedownHandler)
        this.el.removeEventListener("mouseup",   this.mouseupHandler)
        this.el.removeEventListener("click",     this.clickHandler)
    }
});
  
//Drag'n'Drop moves an entity (sphere, box, etc) when the user clicks on it and drags it.
//A-Frame redraws the scene on every 'tick'. While Drag'n'Drop is activated we can change
//the entity's position on every tick.
//All entities are only positioned in the X and Y coordinates while Z=0 is always maintained.
//To calculate the new position of the entity we use:
// - The raycaster's direction vector (the raycaster travels from the camera's viewpoint to infinity where the mouse points)
// - the Camera's Z coordinate (distance from camera to 0)
// - and we use the concept of 'similar triangles' to calculate the new coordinates X and Y
AFRAME.registerComponent("dragndrop", {
    dependencies: ["clickable"],
    
    schema: {
        standalone: {default: false}
        // standalone: {type: 'boolean', default: false}
      },

    init: function() {

        //drag'n'drop elements are set interactive by default
        this.el.classList.add('interactive')

        // this.range = 0;
        // this.dist = 0;

        //is this entity attached to the camera?
        //Normally entities are not attached to the camera, but 3D menus are.
        //this helps with calculations to move the entity
        this.isCameraChild = (this.el.parentElement == document.getElementById('main-camera'))

        //Groups have a frame (a-plane) as background
        //the frame helps visualise the group and helps the dnd the entire group
        this.isGroupFrame = this.el.classList.contains('dnd-handler')
        
        //we keep a reference to the frame
        //if the activity is dragged out of bounds we need to resize the frame
        if(!this.isGroupFrame){
            this.groupFrame = getActivityFrame(this.el)
        }

        //variable where to calculate the new position where to move the entity 
        //Z coordinate: for process actions z=0, for 3D menus (attached to camera) z!=0 
        this.newposition= {x: 0, y: 0, z: this.el.object3D.position.z}

        //The center of an entity (in a sphere, the core central point) is the point that defines its position
        //When clicking on an entity, the user rarely hits the bull's eye (the center), so we need to calculate the
        //translation vector to the center. This will help smoothing the Drag'n'Drop effect
        // A-SPHERE:
        //|-----------------o-------------.---|
        //                center        click
        //                  |-translation-|
        this.translation= {x: 0, y: 0}
        

        //select configuration panel
        this.stateHandler = e => {

            //if the dragging state has been just added we initialise variables
            if (e.detail == "dragging") {
                
                //when it is in a group and has a frame
                if(this.groupFrame)
                {
                    //we keep its original height
                    this.originalHeight = this.groupFrame.getAttribute('height')
                    this.originalPosY   = this.groupFrame.object3D.position.y
                }

                //we obtain the Raycaster's direction vector
                this.updateDirection()
                
                //We use the concept of 'similar triangles' to calculate the new coordinates
                //The Z axis helps us to obtain the factor to use to calculate X and Y
                let relation
                if(this.isCameraChild){
                    relation = this.el.object3D.position.z / this.direction.z
                }
                else{

                    if(this.el.sceneEl.is('vr-mode')){

                        let controllerPosition = new THREE.Vector3()
                        document.getElementById('myvrcontroller').object3D.getWorldPosition(controllerPosition)

                        // relation = -(controllerPosition.z / this.direction.z)

                        let targetWorldPosition = new THREE.Vector3()
                        this.el.object3D.getWorldPosition(targetWorldPosition)

                        relation = Math.abs((controllerPosition.z-targetWorldPosition.z) / this.direction.z)
                    }
                    else{
                        // relation = -(this.el.sceneEl.camera.el.object3D.position.z / this.direction.z)
                        // relation = -(this.el.sceneEl.camera.el.parentElement.object3D.position.z / this.direction.z)

                        let cameraWorldPosition = new THREE.Vector3()
                        let targetWorldPosition = new THREE.Vector3()
                        this.el.sceneEl.camera.el.object3D.getWorldPosition(cameraWorldPosition)
                        this.el.object3D.getWorldPosition(targetWorldPosition)
        
                        relation = Math.abs((cameraWorldPosition.z-targetWorldPosition.z) / this.direction.z)

                    }
                }

                //variable to take in consideration inner coordinates (entities inside entities)
                let childShift = {x: 0, y: 0}
                
                //if entity is a child of a parent entity 
                if(this.el.parentNode.tagName == "A-BOX")
                {
                    //we add up the parent's coordinates
                    childShift.x = this.el.parentNode.object3D.position.x
                    childShift.y = this.el.parentNode.object3D.position.y
                }
             
                //the resulting translation is calculated from the starting coordinates to the new coordinates + SHIFT
                this.translation.x = this.el.object3D.position.x - (this.direction.x * relation) + childShift.x
                this.translation.y = this.el.object3D.position.y - (this.direction.y * relation) + childShift.y
            }
        }
        //we register a listener to react to the event 'stateadded'
        this.el.addEventListener("stateadded", this.stateHandler)


/*
        //we register a listener to react to the event 'stateadded'
        this.el.addEventListener("stateadded", e => {

            //if the dragging state has been just added we initialise variables
            if (e.detail == "dragging") {
                
                //when it is in a group and has a frame
                if(this.groupFrame)
                {
                    //we keep its original height
                    this.originalHeight = this.groupFrame.getAttribute('height')
                    this.originalPosY   = this.groupFrame.object3D.position.y
                }

                //we obtain the Raycaster's direction vector
                this.updateDirection()
                
                //We use the concept of 'similar triangles' to calculate the new coordinates
                //The Z axis helps us to obtain the factor to use to calculate X and Y
                let relation
                if(this.isCameraChild){
                    relation = this.el.object3D.position.z / this.direction.z
                }
                else{

                    if(this.el.sceneEl.is('vr-mode')){

                        let controllerPosition = new THREE.Vector3()
                        document.getElementById('myvrcontroller').object3D.getWorldPosition(controllerPosition)


                        // relation = -(document.getElementById('myvrcontroller').object3D.position.z / this.direction.z)
                        relation = -(controllerPosition.z / this.direction.z)
                    }
                    else{
                        // relation = -(this.el.sceneEl.camera.el.object3D.position.z / this.direction.z)
                        relation = -(this.el.sceneEl.camera.el.parentElement.object3D.position.z / this.direction.z)
                    }
                }

                //variable to take in consideration inner coordinates (entities inside entities)
                let childShift = {x: 0, y: 0}
                
                //if entity is a child of a parent entity 
                if(this.el.parentNode.tagName == "A-BOX")
                {
                    //we add up the parent's coordinates
                    childShift.x = this.el.parentNode.object3D.position.x
                    childShift.y = this.el.parentNode.object3D.position.y
                }
             
                //the resulting translation is calculated from the starting coordinates to the new coordinates + SHIFT
                this.translation.x = this.el.object3D.position.x - (this.direction.x * relation) + childShift.x
                this.translation.y = this.el.object3D.position.y - (this.direction.y * relation) + childShift.y
            }
        })
*/
        //we initialise variables
        this.direction = new AFRAME.THREE.Vector3();
        this.target = new AFRAME.THREE.Vector3();
    },


    //Keeps the value of the Raycaster's vector
    updateDirection: function() {
        // this.direction.copy(this.el.sceneEl.getAttribute("raycaster").direction);
        // if(this.raycaster)
        // this.direction.copy(this.el.components.clickable.raycaster.direction)
        // else
        // this.direction.copy(this.el.sceneEl.getAttribute("raycaster").direction);


        if(this.el.sceneEl.is('vr-mode')){
            // this.direction.copy(document.getElementById("myvrcontroller").getAttribute("raycaster").direction)

            // var point = new THREE.Vector3(0, 0, -1);
            // let controller = document.getElementById("myvrcontroller")
            // controller.object3D.localToWorld(point);
            // this.direction.copy(point.sub(controller.object3D.position);


            let rotation = document.getElementById("myvrcontroller").getAttribute("rotation")

            this.direction = {
                x: Math.cos(rotation.x * (Math.PI / 180)) * Math.sin(rotation.y * (Math.PI / 180)),
                //    x: Math.cos(rotation.x * (Math.PI / 180)) * Math.cos(rotation.y * (Math.PI / 180)),
                y: - Math.sin(rotation.x * (Math.PI / 180)),
                z: Math.cos(rotation.x * (Math.PI / 180)) * Math.cos(rotation.y * (Math.PI / 180)),
                //    z: Math.cos(rotation.x * (Math.PI / 180)) * Math.sin(rotation.y * (Math.PI / 180)),
            }
        }
 
        else
 
        {
            this.direction.copy(this.el.sceneEl.getAttribute("raycaster").direction);

        }

    },

    //Updates the entity's position
    updateTarget: function() {
        
        //Recalculate the relationship factor
        let relation
        if(this.isCameraChild){
            relation = this.el.object3D.position.z / this.direction.z
        }
        else{

            if(this.el.sceneEl.is('vr-mode')){
                let controllerPosition = new THREE.Vector3()
                document.getElementById('myvrcontroller').object3D.getWorldPosition(controllerPosition)
                // relation = -(controllerPosition.z / this.direction.z)

                let targetWorldPosition = new THREE.Vector3()
                this.el.object3D.getWorldPosition(targetWorldPosition)

                relation = Math.abs((controllerPosition.z-targetWorldPosition.z) / this.direction.z)
            }
            else{
                // relation = -(this.el.sceneEl.camera.el.object3D.position.z / this.direction.z)
                // relation = -(this.el.sceneEl.camera.el.parentElement.object3D.position.z / this.direction.z)

                let cameraWorldPosition = new THREE.Vector3()
                let targetWorldPosition = new THREE.Vector3()
                this.el.sceneEl.camera.el.object3D.getWorldPosition(cameraWorldPosition)
                this.el.object3D.getWorldPosition(targetWorldPosition)

                relation = Math.abs((cameraWorldPosition.z-targetWorldPosition.z) / this.direction.z)
            }


            // relation = -(this.el.sceneEl.camera.el.object3D.position.z / this.direction.z)
        }

        //Calculate the new coordinates
        this.newposition.x = this.direction.x * relation
        this.newposition.y = this.direction.y * relation

        //shift variable
        let childShift = {x: 0, y: 0}
        
        //if is child, keep shift coordinates
        if(this.el.parentNode.tagName == "A-BOX")
        {
            childShift.x = this.el.parentNode.object3D.position.x
            childShift.y = this.el.parentNode.object3D.position.y
        }
        
        let posX = this.newposition.x + this.translation.x - childShift.x
        let posY = this.newposition.y + this.translation.y - childShift.y
        
        if(isBoxed(this.el)){

            let end = document.getElementById(this.el.parentNode.getAttribute("group-end"))

            //end activities are allowed to resize width
            if(this.el == end){
                posY = 0

            }
            else if(!this.el.components.detachable || !this.el.components.detachable.detached){
                //check for X-axis boundaries:
                //if it reaches a boundary we stop dragging
                if(posX < 0){
                    posX = 0
                    // this.el.removeState("dragging");
                }
                else if(posX > end.object3D.position.x){
                    posX = end.object3D.position.x
                    // this.el.removeState("dragging");
                }
            }
        }

        //keep newly calculated entity's position
        this.target.set(
            posX,
            posY,
            this.newposition.z
            )

        //redraw frame (if not detached)
        if(!this.el.components.detachable || !this.el.components.detachable.detached){
            //moving a boxed activity might require to resize its frame
            let frame = getActivityFrame(this.el)

            //if there is a frame then redraw
            if(frame){
                redrawBoxFrame(frame)
            }
        }
        //this.target.copy(
        //  camera.object3D.position
        //    .clone()
        //    .add(this.direction.clone().multiplyScalar(this.dist + this.range))
        //);
    },

    //sets the new entity's position
    tick: function() {
        //only when dragging
        if (this.el.is("dragging")) {
            this.updateDirection();
            this.updateTarget();

            //when this is the frame, we don't move the frame...
            //we move its parent box (which contains all)
            if(this.isGroupFrame)
            {
                //reposition parent
                this.el.parentNode.object3D.position.set(
                    this.target.x + this.el.parentNode.object3D.position.x - this.el.object3D.position.x,
                    this.target.y + this.el.parentNode.object3D.position.y - this.el.object3D.position.y,
                    0 //we keep Z=0 (nested frames may not be in Z=0)
                );

                //if this is a TRY-CATCH group, we also drag the CATCH statement
                let boxCatch = document.getElementById(this.el.parentNode.getAttribute('box-catch'))
                if(boxCatch){
                    boxCatch.object3D.position.set(
                        this.target.x + boxCatch.object3D.position.x - this.el.object3D.position.x,
                        this.target.y + boxCatch.object3D.position.y - this.el.object3D.position.y,
                        this.target.z + boxCatch.object3D.position.z - this.el.object3D.position.z
                    );

                    //we also drag the FINALLY statement (if there is one)
                    let boxFinally = document.getElementById(boxCatch.getAttribute('box-finally'))
                    if(boxFinally){
                        boxFinally.object3D.position.set(
                            this.target.x + boxFinally.object3D.position.x - this.el.object3D.position.x,
                            this.target.y + boxFinally.object3D.position.y - this.el.object3D.position.y,
                            this.target.z + boxFinally.object3D.position.z - this.el.object3D.position.z
                        );
                    }
                }


            }
            else{
                this.el.object3D.position.copy(this.target);
            }

            //if not a REST component (they don't have links to update)
            // if( ! this.el.hasAttribute('rest-dsl')){
            if( !this.data.standalone && ! this.el.hasAttribute('rest-dsl')){
                this.adjustLinks();
            }
        }
    },


    adjustLinks: function() {

        let movingObj = this.el

        if(this.isGroupFrame){
            movingObj = this.el.parentNode
        }

        //obtain links to other activities
        var links = JSON.parse(movingObj.getAttribute("links"));

        //ATTENTION: need this to move MULTICAST BOXES
        var objectInGroup = movingObj.localName == "a-box";

        //THIS DOES NOT WORK FOR MULTICAST BOXES
        //var objectInGroup = isBoxed(movingObj)
        
        if(objectInGroup)
        {
            //helper
            links = []

            //get link going back
            let linkBack = getBackwardsLink(movingObj)

            //if exists, include
            if(linkBack)
                links.push(linkBack.id)

            //get link going forward
            let linkForward = getForwardLink(movingObj)

            //if exists, include
            if(linkForward)
                links.push(linkForward.id)

        }//end of if(objectInGroup)

        //iterate links
        for (var i in links) {

            //obtain link
            // var link = document.querySelector("#"+links[i]);
            var link = document.getElementById(links[i])

            // we only want to update EDITABLE links (cylinders).
            // Groups contain link lines (NON-EDITABLE links) that must stay static
            if(link.localName == "a-cylinder")
            {
                redrawLink(link)
            }
        }//end FOR loop
    },

    // resizeFrame: function() {
    //     if(groupFrame){
    //         if(this.el.object3D.position.y > this.originalPosY){
    //             groupFrame.
    //         }
    //     }        
    // }

    
    remove: function () {
        //clean event listeners
        this.el.removeEventListener("stateadded", this.stateHandler)
    },


});