AFRAME.registerComponent('detachable', {
    // schema: {
    //     position: {type: 'string'},
    //     configMethod: []
    // },
    init: function () {
        console.log("init attachable" + this.el);

        this.shiftPressed = false

        this.colorDefault = this.el.getAttribute('color') || this.el.getAttribute('material').color
        this.colorHighlight = "yellow"

        this.opacityDefault  = this.el.getAttribute('opacity')|| this.el.getAttribute('material').opacity
        this.opacityDetached = 0.3
    },

    keypressed: function(pressed) {

        //keep shift status
        this.shiftPressed = pressed

        //if currently detached
        if(this.detached)
        {
            //no point to continue
            return
        }

        if(pressed && !this.isLastInChoiceBranch() && !this.followsFromAndIsLast())
        {
            this.el.setAttribute('color', this.colorHighlight)
        }
        else
        {
            if(this.colorDefault)
                this.el.setAttribute('color', this.colorDefault)
            else   
                this.el.removeAttribute('color')
        }
    },

    followsFromAndIsLast: function() {

        //get activity that follows
        let previous = getPreviousActivity(this.el)

        //if not following 'from' (starting activity)
        if(!previous.attributes.start)
        {
            //no need to continue
            return false
        }

        let next = getNextActivity(this.el);

        //if no activity follows
        if(next == null)
        {
            //then it meets the criteria
            return true
        }

        return false
    },

    isLastInChoiceBranch: function() {
        //get activity that follows
        let next = getNextActivity(this.el);
        let previous = getPreviousActivity(this.el)

        //not allowed to detach last activity in choice branch
        if(previous.getAttribute('processor-type') == 'choice-start' && next.getAttribute('processor-type') == 'choice-end')
        {
            return true
        }

        return false
    },

    detach: function () {

        //ignore if already detached
        if(this.detached)
        {
            return
        }

        //helper
        let activity = this.el

        //these rule checks do not allow the activity to be detached
        if(this.followsFromAndIsLast() || this.isLastInChoiceBranch())
        {
            return
        }

        //do not allow navigation and activity creation while moving objects
        enableNavigationButtons(false)
        enableToButtons(false)

        //flag
        this.detached = true

        let interactiveEntities = getActivityRoute(activity).querySelectorAll('.interactive')

        //make all activities static
        // for(entity of activity.parentNode.children) {
        for(entity of interactiveEntities) {
            if(entity != activity)
                // entity.setAttribute('class', 'interactive-frozen')
                entity.classList.replace('interactive', 'interactive-frozen')
        }

        //make look dimmer
        activity.setAttribute('opacity', this.opacityDetached)

        //add collision detection and event listenerss
        activity.setAttribute('aabb-collider', 'objects: a-cylinder')
        activity.addEventListener('hitclosest',      this.candidateHighlight);
        activity.addEventListener('hitclosestclear', this.candidateClear);


        let linkForward = null

        //get activity that follows
        let next = getNextActivity(activity);

        //if this is the last process activity
        if(next == null)
        {
            let previous = getPreviousActivity(activity);

            disposableLink = detachForwardLink(previous)

            detachBackwardsLink(activity)

            //delete backwards link
            disposableLink.parentNode.removeChild(disposableLink);

            //add listener to reattach
            activity.addEventListener('mouseup', this.reattach)

            syncEditor()
            return
        }


        if(next.getAttribute('processor-type') == 'choice-end')
        {
            linkForward = getForwardLink(activity)
        }

        //get links
        linkForward = detachBackwardsLink(next, linkForward);
        let linkBackwards = detachBackwardsLink(activity)


        //rewire
        if(linkBackwards)
        {
            attachDestinationToLink(next, linkBackwards);
            redrawLink(linkBackwards)
        }

        if(activity.localName == "a-box")
        {
            //obtain end
            let boxEnd = activity.querySelector('[processor-type=multicast-end]')

            //obtain all link references the activity has
            refLinks = JSON.parse(boxEnd.getAttribute("links"));

            //we remove the link (detach) from the activity
            refLinks.splice(refLinks.indexOf(linkForward.id),1)[0];

            //we update the activity (with link stripped out)
            boxEnd.setAttribute("links", JSON.stringify(refLinks))
        }
        else
        {
            //detached activity would be orphan with no links
            activity.setAttribute('links', "[]")
        }

        //delete backwards link
        linkForward.parentNode.removeChild(linkForward);

        //add listener to reattach
        activity.addEventListener('mouseup', this.reattach)

        syncEditor()
    },

    candidateHighlight: function (event) {
        // console.log('target cylinder: ' + event.detail.el)

        //if one previously existed, we reset color
        if(this.components.detachable.linkDetected)
        {
            this.components.detachable.linkDetected.removeAttribute('color')
        }

        event.detail.el.setAttribute('color', 'yellow')
        this.setAttribute('color', 'yellow')

        //candidate link in proximity
        this.components.detachable.linkDetected = event.detail.el

        console.log('candidateHighlight: ' + this.components.detachable.linkDetected.id)

    },
    candidateClear: function (event) {
        // console.log('target cylinder: ' + event.detail.el)
        event.detail.el.removeAttribute('color')
        this.setAttribute('color', '#ACF5F5')

        // clear candidate
        this.components.detachable.linkDetected = null
    },

    reattach: function ()
    {
        let detachable = this.components.detachable

        //ignore if not detached
        if(!detachable.detached)
        {
            return
        }

        //helper
        let activity = this
    
        //if candidate exists
        if(detachable.linkDetected)
        {
            let frozenEntities = getActivityRoute(activity).querySelectorAll('.interactive-frozen')

            //reactivate all activities
            // for(entity of activity.parentNode.children) {
            for(entity of frozenEntities) {
                // if(entity != activity)
                    // entity.setAttribute('class', 'interactive')
                    entity.classList.replace('interactive-frozen', 'interactive')

            }

            //allow again navigation and creation
            enableNavigationButtons(true)
            enableToButtons(true)

            //remove listeners
            activity.removeEventListener('mouseup', detachable.reattach);    
            activity.removeEventListener('hitclosest', detachable.joinHighlight);
            activity.removeEventListener('hitclosestclear', detachable.joinClear);

            //remove collision detectioon
            activity.removeAttribute('aabb-collider')
        
            //obtain necessray artifacts
            let link = detachable.linkDetected
            let source = document.getElementById(link.getAttribute('source'))
   
            //restore material attributes
            activity.setAttribute('opacity', detachable.opacityDefault)
            activity.setAttribute('color', detachable.colorDefault)
            link.removeAttribute('color')

            //reference to links manipulated
            let newLink
            let reusableLink

            //obtain endpoint of link
            // let destination = activity.parentNode.querySelector('#'+link.getAttribute('destination'))
            let destination = document.getElementById(link.getAttribute('destination'))

            //when reattaching a box (multicast)
            if(activity.localName == "a-box")
            {
                let boxStart = activity.querySelector('[processor-type=multicast-start]')
                let boxEnd   = activity.querySelector('[processor-type=multicast-end]')

                //we keep link reference.
                reusableLink = detachBackwardsLink(destination, link)

                //create new link
                newLink = createLink(boxEnd, destination, false, false)

                //attach end of link to start of box
                attachDestinationToLink(boxStart, reusableLink)
            }
            else
            {
                //we keep link reference.
                reusableLink = detachBackwardsLink(destination, link)

                //create new link
                newLink = createLink(activity, destination, false, false)

                //attach end of link to activity
                attachDestinationToLink(activity, reusableLink)
            }
    
            //reset variables
            detachable.linkDetected = null
            detachable.detached = false

            //====================================================
            // POSITION RECALCULATION (part 1/2):
            // An activity detached/reattached is subject to change is hierarchy position.
            // The strategy is: 
            //  - to translate its source position from its container position to its scene position
            //  - to translate its scene position to its destination container position
            // (the container could be the top level container [the route] or a group-box [split or try-catch, etc]) 
            //====================================================
            
            //reference to top level container
            let topEntity = activity.closest('[route]')

            //reference to source container
            let tempEntity = activity.parentNode

            //clone of original position
            let translation = activity.object3D.position.clone()

            //walk up the hierarchy while not at the same level
            while(tempEntity != topEntity){
                //add entity and parent entity vectors
                translation.add(tempEntity.object3D.position)

                //step 1 level up
                tempEntity = tempEntity.parentNode
            }
            //=====================================================


            //A-Frame does not support entities to move in the DOM tree
            //We need to make it happen manually by deleting the old entity and recreating it
            let clone = cloneActivity(activity)
            let parent = activity.parentNode
            parent.removeChild(activity)

            if(destination.classList.contains('group-start')){
                destination.parentNode.parentNode.insertBefore(clone, destination.parentNode)
                destination.parentNode.parentNode.appendChild(newLink);
            }
            else{
                destination.parentNode.insertBefore(clone, destination)
                destination.parentNode.appendChild(newLink);
            }

            //====================================================
            // POSITION RECALCULATION (part 2/2):
            // Read part 1/2 above.
            //====================================================

            //reference to destination container
            tempEntity = clone.parentNode

            //walk up the hierarchy while not at the same level
            while(tempEntity != topEntity){
                //substract entity and parent entity vectors
                translation.sub(tempEntity.object3D.position)

                //step 1 level up
                tempEntity = tempEntity.parentNode
            }

            //set translated coordinates
            clone.object3D.position.set(
                translation.x,
                translation.y,
                translation.z
            )
            //=====================================================

            //This ensures the links are visually correctly connected
            redrawLink(newLink)
            redrawLink(reusableLink)

            syncEditor()
        }
    }

    // update: function () {},
    // tick: function () {},
    // remove: function () {},
    // pause: function () {},
    // play: function () {}
});