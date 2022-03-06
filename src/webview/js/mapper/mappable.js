
//Registers listeners for mouse actions to set entity states
//A-Frame emits events when entities have states added/removed
//We add/remove the state 'dragging' to indicate if the entity can be dragged
AFRAME.registerComponent("mappable", {
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
                                            
                                        console.log("mappable mouse down: "+this.el.id)


                        //when the visual connector (the rope) is created, we endpoint is unknown, the user needs to drag'n'drop
                        //on the meantime we create a mock endpoint
                        let target = document.createElement('a-entity')
                        target.id = "temp-target-1"
                        this.el.parentElement.appendChild(target)

                        //the mouse at this stage is pointing to the source, so we place the target in same coordinates
                        target.object3D.position = this.el.object3D.position.clone()
                        // this.el.object3D.getWorldDirection(target.ob)
                        
                        this.tempTarget = target
                
                        let rope = document.createElement('a-rope')
                        rope.setAttribute("start", this.el.id)
                        rope.setAttribute("end", target.id)
                        this.el.parentElement.appendChild(rope)
                        this.tempRope = rope


                        //needed for tracking coordinates
                        {
                            let vTemp = new THREE.Vector3()
                            this.el.object3D.getWorldPosition(vTemp)

                            let camera = new THREE.Vector3()

                            // document.querySelector('#map-camera').object3D.getWorldPosition(camera)
                            document.querySelector('#rig').object3D.getWorldPosition(camera)

                            //variable where to calculate the new position where to move the entity 
                            //Z coordinate: for process actions z=0, for 3D menus (attached to camera) z!=0 
                            // this.newposition= {x: 0, y: 0, z: this.el.object3D.position.z}
                            // this.newposition= {x: 0, y: 0, z: vTemp.z}
                            this.newposition= {x: camera.x, y: camera.y, z: vTemp.z}
                
                            //The center of an entity (in a sphere, the core central point) is the point that defines its position
                            //When clicking on an entity, the user rarely hits the bull's eye (the center), so we need to calculate the
                            //translation vector to the center. This will help smoothing the Drag'n'Drop effect
                            // A-SPHERE:
                            //|-----------------o-------------.---|
                            //                center        click
                            //                  |-translation-|
                            this.translation= {x: camera.x, y: camera.y}

                            //we initialise variables
                            this.direction = new AFRAME.THREE.Vector3();
                            this.target = new AFRAME.THREE.Vector3();
                
                            this.updateDirection()
                        }


                                            //activate dragging
                                            this.el.addState("dragging");

                                    }

        //deactivate dragging when button is released
        this.mouseupHandler = e =>  {
                                        console.log("mappable mouse up "+this.el.id)

                                        if (this.el.is("dragging")) {
                                            this.el.removeState("dragging");

                                            let intersectedEls = e.detail.cursorEl.components.raycaster.intersectedEls
                                            console.log("intersected: "+intersectedEls)

                                            if(intersectedEls.length>0 && intersectedEls[0].localName == 'a-plane'){
                                                let linkPoint = intersectedEls[0].previousElementSibling
                                                linkPoint.object3D.position.x = -.2

                                                // this.tempRope.setAttribute("end", intersectedEls[0].id)
                                                this.tempRope.setAttribute("end", linkPoint.id)
                                            }
                                            else{
                                                this.tempRope.parentElement.removeChild(this.tempRope)
                                            }

                                            //we delete the simulated target since we have the real one
                                            this.tempTarget.parentElement.removeChild(this.tempTarget)

                                            //we reset temp variables for reuse
                                            this.tempTarget = null
                                            this.tempRope = null
                                        }
                                    }

        //select configuration panel
        // this.clickHandler = e => {
  
        //                         }

        //set up event listeners
        this.el.addEventListener("mousedown", this.mousedownHandler)
        this.el.addEventListener("mouseup",   this.mouseupHandler)
        // if(this.el.classList.contains('configurable')){
        //     this.el.addEventListener("click", this.clickHandler)
        // }



    },



    //Keeps the value of the Raycaster's vector
    updateDirection: function() {

        if(this.el.sceneEl.is('vr-mode')){

            let rotation = document.getElementById("myvrcontroller").getAttribute("rotation")

            this.direction = {
                x: Math.cos(rotation.x * (Math.PI / 180)) * Math.sin(rotation.y * (Math.PI / 180)),
                y: - Math.sin(rotation.x * (Math.PI / 180)),
                z: Math.cos(rotation.x * (Math.PI / 180)) * Math.cos(rotation.y * (Math.PI / 180)),
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
        // if(this.isCameraChild){
        //     relation = this.el.object3D.position.z / this.direction.z
        // }
        // else{

            if(this.el.sceneEl.is('vr-mode')){
                let controllerPosition = new THREE.Vector3()
                document.getElementById('myvrcontroller').object3D.getWorldPosition(controllerPosition)
                relation = -(controllerPosition.z / this.direction.z)
            }
            else{
                // relation = -(this.el.sceneEl.camera.el.parentElement.object3D.position.z / this.direction.z)

                let cameraWorldPosition = new THREE.Vector3()
                let targetWorldPosition = new THREE.Vector3()
                this.el.sceneEl.camera.el.object3D.getWorldPosition(cameraWorldPosition)
                this.el.object3D.getWorldPosition(targetWorldPosition)

                relation = Math.abs((cameraWorldPosition.z-targetWorldPosition.z) / this.direction.z)
            }
        // }

        //Calculate the new coordinates
        this.newposition.x = this.direction.x * relation
        this.newposition.y = this.direction.y * relation

        //shift variable
        let childShift = {x: 0, y: 0}
                
        let posX = this.newposition.x + this.translation.x - childShift.x
        let posY = this.newposition.y + this.translation.y - childShift.y
        


        //keep newly calculated entity's position
        this.target.set(
            posX,
            posY,
            this.newposition.z
            )
    },

    //sets the new entity's position
    tick: function() {
        //only when dragging
        if (this.el.is("dragging")) {
            this.updateDirection();
            this.updateTarget();

            // this.tempTarget.object3D.getWorldPosition(this.target)

            var tempWp = new THREE.Vector3()
            this.tempTarget.object3D.getWorldPosition(tempWp)

            var direction = new THREE.Vector3();
            direction.subVectors( this.target, tempWp) ;
            
            // this.tempTarget.object3D.position.copy(this.target);
            this.tempTarget.object3D.position.add(direction);
        }
    },


    remove: function () {
        //clean event listeners
        this.el.removeEventListener("mousedown", this.mousedownHandler)
        this.el.removeEventListener("mouseup",   this.mouseupHandler)
        // this.el.removeEventListener("click",     this.clickHandler)
    }
});
  