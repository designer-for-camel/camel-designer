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

        //make all activities static
        for(entity of activity.parentNode.children) {
            if(entity != activity)
                entity.setAttribute('class', 'not-clickable')
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
            //reactivate all activities
            for(entity of activity.parentNode.children) {
                if(entity != activity)
                    entity.setAttribute('class', 'clickable')
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
    
    
            // let copy = activity.cloneNode(true)
            // activity.parentNode.removeChild(activity)
            // source.parentNode.appendChild(copy)
    
            //restore material attributes
            activity.setAttribute('opacity', detachable.opacityDefault)
            activity.setAttribute('color', detachable.colorDefault)
            link.removeAttribute('color')

            let newLink

            //obtain endpoint of link
            let destination = activity.parentNode.querySelector('#'+link.getAttribute('destination'))

            //when reattaching a box (multicast)
            if(activity.localName == "a-box")
            {
                let boxStart = activity.querySelector('[processor-type=multicast-start]')
                let boxEnd   = activity.querySelector('[processor-type=multicast-end]')

                //we keep link reference.
                let reusableLink = detachBackwardsLink(destination, link)

                //create new link
                newLink = createLink(boxEnd, destination, false, false)

                //attach end of link to start of box
                attachDestinationToLink(boxStart, reusableLink)
            }
            else
            {
                //we keep link reference.
                let reusableLink = detachBackwardsLink(destination, link)

                //create new link
                newLink = createLink(activity, destination, false, false)

                //attach end of link to activity
                attachDestinationToLink(activity, reusableLink)
            }

            //add link to scene
            activity.parentNode.appendChild(newLink);
    
            // let copy = activity.cloneNode(true)
            // activity.parentNode.removeChild(activity)
            // source.parentNode.appendChild(copy)
            // activity.after(source);
            // insertActivity(activity, source)

            //reset variables
            detachable.linkDetected = null
            detachable.detached = false

            syncEditor()
        }
    }

    // update: function () {},
    // tick: function () {},
    // remove: function () {},
    // pause: function () {},
    // play: function () {}
});