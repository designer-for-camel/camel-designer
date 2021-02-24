
//Registers listeners for mouse actions to set entity states
//A-Frame emits events when entities have states added/removed
//We add/remove the state 'dragging' to indicate if the entity can be dragged
AFRAME.registerComponent("clickable", {
    init: function() {
        
        //activate dragging when mouse button is pressed
        this.mousedownHandler = e => {
                                        if (this.el.is("cursor-hovered")) {

                                            // let t = this.target

                                            if(this.el.localName == 'a-plane' && e.target.localName == 'a-plane' && this.el != e.target){
                                                // e.stopPropagation()
                                                return
                                            }

                                            //activate dragging
                                            this.el.addState("dragging");

                                            //SHIFT + CLICK = DETACH
                                            if(this.el.components.detachable && this.el.components.detachable.shiftPressed)
                                            {
                                                this.el.components.detachable.detach()
                                            }
                                        }
                                    }

        //deactivate dragging when button is released
        this.mouseupHandler = e =>  {
                                        if (this.el.is("dragging")) {
                                            this.el.removeState("dragging");
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

                                    //This is a global variable
                                    //We should do better
                                    // configObj = this.el

                                    switchConfigPaneByActivity(this.el);
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
    init: function() {

        // this.range = 0;
        // this.dist = 0;
        
        this.isGroupFrame = this.el.classList.contains('dnd-handler')
        
        //we keep a reference to the frame
        //if the activity is dragged out of bounds we need to resize the frame
        if(!this.isGroupFrame){
            this.groupFrame = getActivityFrame(this.el)
        }

        //used to set the new position where to move the entity 
        this.newposition= {x: 0, y: 0, z: 0}

        //The center of an entity (in a sphere, the core central point) is the point that defines its position
        //When clicking on an entity, the user rarely hits the bull's eye (the center), so we need to calculate the
        //translation vector to the center. This will help smooth the Drag'n'Drop effect
        // A-SPHERE:
        //|-----------------O-------------.---|
        //                center        click
        //                  |-translation-|
        this.translation= {x: 0, y: 0}
        
        //we register a listener to react to the event 'stateadded'
        this.el.addEventListener("stateadded", e => {

            //if the dragging state has been just added we initialise variables
            if (e.detail == "dragging") {
                // this.range = 0;
                // this.dist = this.el.object3D.position
                // .clone()
                // .sub(this.el.sceneEl.camera.el.object3D.position)
                // .length();
                
                //when it is in a group and has a frame
                if(this.groupFrame)
                {
                    //we keep its original height
                    this.originalHeight = this.groupFrame.getAttribute('height')
                    this.originalPosY   = this.groupFrame.object3D.position.y
                }


                //we obtain the Raycaster's direction vector
                this.updateDirection()
                
                // let camera = this.el.sceneEl.camera.el
                
                //We use the concept of 'similar triangles' to calculate the new coordinates
                //The Z axis helps us to obtain the factor to use to calculate X and Y
                let relation = -(this.el.sceneEl.camera.el.object3D.position.z / this.direction.z)

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

        //we initialise variables
        this.direction = new AFRAME.THREE.Vector3();
        this.target = new AFRAME.THREE.Vector3();
    },


    //Keeps the value of the Raycaster's vector
    updateDirection: function() {
        this.direction.copy(this.el.sceneEl.getAttribute("raycaster").direction);
    },

    //Updates the entity's position
    updateTarget: function() {
        
        //Recalculate the relationship factor
        let relation = -(this.el.sceneEl.camera.el.object3D.position.z / this.direction.z)
        
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
        
        //keep newly calculated entity's position
        this.target.set(
            this.newposition.x + this.translation.x - childShift.x,
            this.newposition.y + this.translation.y - childShift.y,
            this.newposition.z,
            )
        
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
            if(!this.el.hasAttribute('rest-dsl')){
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


});