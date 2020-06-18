//====================== TRACE MESSAGES VIA JOLOKIA

// reference:
    // https://access.redhat.com/documentation/en-us/red_hat_fuse/7.6/html/managing_fuse/manage-monitor-fuse-springboot#fuse-console-access-springboot1

// Need to include in SpringBoot:

//POM:
    // <dependency>
    //   <groupId>io.hawt</groupId>
    //   <artifactId>hawtio-springboot-1</artifactId>
    // </dependency>

// application.properties
//========================
    // management.port=10001
    // # enable management endpoints for healthchecks and hawtio
    // endpoints.enabled = false
    // endpoints.hawtio.enabled = true
    // endpoints.jolokia.enabled = true
    // endpoints.health.enabled = true
    // management.health.defaults.enabled=false
    // camel.health.enabled=false
    // camel.health.indicator.enabled=true
    // endpoints.jolokia.sensitive=false
    // endpoints.hawtio.sensitive=false
    // hawtio.authenticationEnabled=false



AFRAME.registerComponent('tracing', {
    schema: {
        url: {type: 'string'},
        showBody: {type: 'boolean'},
        showHeaders: {type: 'boolean'},
    },
    init: function () {

        console.log("config: " + JSON.stringify(this.data))

        //helper variables
        this.ids = {}
        this.traces = null
        this.tracingTimer = null

        this.enableCamelTracing(true)
    },

    //signals Camel to enable tracing
    enableCamelTracingPoller: function()
    {
        console.log("tracing poller is now active.")

        //we setup a repeating task to poll traces
        this.tracingTimer = setInterval(this.getTraces, 2000, this);
    },

    //signals Camel to enable tracing
    //if successful, it polls Camel for new traces (check frequency)
    //if not, it informs the user and disables tracing
    // enableCamelTracing: async function(enabled)
    enableCamelTracing: function(enabled)
    {
        ///////////////////////////////////////////////////////
        // when it runs in VSCode, http in/out is delegated, as the webview has restrictions
        ///////////////////////////////////////////////////////
        if ( top !== self && !syncStartUpEnabled)
        { // we are in the iframe
            vscode.postMessage({
                command: 'tracing-enable',
                url: this.data.url,
                payload: enabled
            })

            return
        }

        ///////////////////////////////////////////////////////
        // when it runs in a browser, we do the http in/out
        ///////////////////////////////////////////////////////
        let tracing = this

        fetch(this.data.url+"/?maxDepth=7&maxCollectionSize=50000&ignoreErrors=true&canonicalNaming=false", {
            "headers": {
            },
            "body": "{\"type\":\"write\",\"mbean\":\"org.apache.camel:context=MyCamel,type=tracer,name=BacklogTracer\",\"attribute\":\"Enabled\",\"value\":"+enabled+"}",
            "method": "POST"
        })
        .then(function(response) {
            response.json().then(function(data) {

                console.log("got: " + data.value)
            
                if(enabled)
                {
                    //we setup a repeating task to poll traces
                    tracing.enableCamelTracingPoller()
                }
            });
        })
        .catch(function(response) {

            let disableTracing = enabled

            setTracingUserAlert("Tracing error, could not talk to Jolokia: " + response.message, disableTracing)
        });
    },

    //sends a request to Camel asking for traces
    getTraces: async function (tracing) {
        console.log('query for traces...')
    

        ///////////////////////////////////////////////////////
        // when it runs in VSCode, http in/out is delegated, as the webview has restrictions
        ///////////////////////////////////////////////////////
        if ( top !== self && !syncStartUpEnabled)
        { // we are in the iframe
            vscode.postMessage({
                command: 'tracing-poll-traces',
                url: tracing.data.url
            })

            return
        }

        ///////////////////////////////////////////////////////
        // when it runs in a browser, we do the http in/out
        ///////////////////////////////////////////////////////
        let response = await fetch(tracing.data.url+"/?maxDepth=7&maxCollectionSize=50000&ignoreErrors=true&canonicalNaming=false", {
            "headers": {
            },
            "body": "[{\"type\":\"exec\",\"mbean\":\"org.apache.camel:context=MyCamel,type=tracer,name=BacklogTracer\",\"operation\":\"dumpAllTracedMessagesAsXml()\",\"ignoreErrors\":true,\"arguments\":[],\"config\":{}}]",
            "method": "POST"
        });
    
        // if HTTP-status is 200-299
        if (response.ok) {
    
            // get the response body (the method explained below)
            let json = await response.json();

            // console.log("got: " + json[0].value)
    
            tracing.digestTraces(json[0].value)
        
        } else {
            console.error("getTraces HTTP-Error, Jolokia request failed: " + response.status);
        }
    },

    // parses the response from Jolokia and processes the information
    digestTraces: function (camelTraces) {

        //helper variable
        let tracing = this

        //document with traces
        let newTraces = new DOMParser().parseFromString(camelTraces, 'application/xml')//.documentElement

        if(tracing.traces == null)
        {
            // tracing.traces = newTraces.documentElement
            tracing.traces = newTraces
        }
        else
        {
            //we clone the new traces
            let topElement = newTraces.documentElement.cloneNode(true)
            while(topElement.firstElementChild)
            {
                //we artificially add an attribute to the node, this helps when running queries
                //'removeExchangeId' needs to find all traces for a given exchangeId
                //it seems the query selector does not have the ability to search by node value 
                let element = topElement.firstElementChild
                let exchangeId = element.getElementsByTagName('exchangeId')[0]
                exchangeId.setAttribute("value", exchangeId.textContent)

                //this operations moves the node from the cloned collection to the 'traces' collection
                tracing.traces.documentElement.appendChild(topElement.firstElementChild)
            }
        }

        // obtain all unique TraceIDs
        // As DOM only supports XPATH v1.0, we use a workaround for function 'distinct-values'
        // var iteratorTraces = traces.evaluate('distinct-values(/*/backlogTracerEventMessage/exchangeId)', traces, null, XPathResult.ANY_TYPE, null);
        var iteratorTraces = newTraces.evaluate('/*/backlogTracerEventMessage[not(./exchangeId = preceding-sibling::backlogTracerEventMessage/exchangeId)]/exchangeId', newTraces, null, XPathResult.ANY_TYPE, null);
    
        //iterate to populate container
        var id = iteratorTraces.iterateNext();
    
        while(id)
        {
            //for the given unique ID, we obtain all its traces
            // var idTraces = tracing.traces.evaluate('/*/backlogTracerEventMessage[exchangeId="'+id.textContent+'"]', tracing.traces, null, XPathResult.ANY_TYPE, null);
            var idTraces = newTraces.evaluate('/*/backlogTracerEventMessage[exchangeId="'+id.textContent+'"]', newTraces, null, XPathResult.ANY_TYPE, null);

            tracing.addExchangeId(id.textContent)
            tracing.ids[id.textContent] = idTraces
            // ids.push(id: id.textContent, traces: idTraces)
            id = iteratorTraces.iterateNext()
        }
    },

    // Create a new list item when clicking on the "Add" button
    addExchangeId: function (newId) {
        
        //create list entry
        var li = document.createElement("li");
        var t = document.createTextNode(newId);
        li.appendChild(t);

        //add entry to list
        document.getElementById("myUL").appendChild(li);
        
        //create the close button
        var span = document.createElement("SPAN");
        var txt = document.createTextNode("\u00D7");
        span.className = "close";
        span.appendChild(txt);
        li.appendChild(span);

        //add 'close' event actions
        span.onclick = function() {
            var item = this.parentElement;

            var routes = document.getElementById('route-definitions')

            //if the exchangeId to delete is the selected one
            if(item.className == "checked")
            {
                routes.components.tracing.traceClearTraceLinks()
            }

            //remove the X button (otherwise it appends 'x' in the exchangeId below)
            item.removeChild(item.lastChild)

            //get exchangeId
            let exchangeId = item.textContent

            //remove item from list
            item.parentElement.removeChild(item)

            //remove all traces for the given exchangeId
            routes.components.tracing.removeExchangeId(exchangeId)
        }
    },

    //removes all traces for the given exchangeId from the current 'traces' collection
    removeExchangeId: function (exchangeId) {

        //this query finds all trace messages for the given exchangeID
        let nodes = this.traces.querySelectorAll('exchangeId[value="'+exchangeId+'"]')

        for(let i=0; i<nodes.length; i++)
        {
            //remove the entry from the 'traces' collection
            this.traces.documentElement.removeChild(nodes[i].parentElement)
        }
    },


    //
    //   (trace node-1)             (trace node-2)
    //  ----------------> (node-1) ---------------->  (node-2) 
    //
    //note: the trace of a nodeId (activity) contains input data (before node execution)
    //      in the graph above, trace-1 is input data of node-1
    //      and trace-2 is output data of node-1 and input data for node-2
    //
    //      this method will map the trace data to the 3D link between the two 3D activities involved
    //      in the graph above, trace 2 will be mapped to the 3D link between 3d-activity-1 and 3d-activity-2
    // 
    showTrace: function (traceId)
    {
        this.traceClearTraceLinks()

        //obtains all traces for the given exchangeId
        var idTraces = this.traces.evaluate('//backlogTracerEventMessage[exchangeId="'+traceId+'"]', this.traces, null, XPathResult.ANY_TYPE, null);
    
        //iterate traces
        var trace = idTraces.iterateNext();
        while(trace)
        {
            //obtain trace identifiers
            let routeId = trace.getElementsByTagName('routeId')[0].textContent
            let nodeId  = trace.getElementsByTagName('toNode')[0].textContent
    
            //the first trace (routeId == nodeId) can be ignored, it is the ROUTE/FROM trace when the message comes in
            //and contains the same data as the first nodeId trace
            if (routeId != nodeId)
            {
                //obtain the 3D link that leads to the node (3D activity)
                let link = document.querySelector('a-cylinder[destination="'+nodeId+'"]')
    
                //if found
                if(link)
                {
                    //obtain its activity
                    activity = document.getElementById(nodeId)
    
                    //also obtain activity that follows
                    let next = getNextActivity(activity)

                    //special case: choice-end's are 3D visual helpers, Camel does not generate traces for choice-end's
                    //this handles the link that connects to choice-end
                    // if(next && next.getAttribute('processor-type') == 'choice-end')
                    while(next && next.getAttribute('processor-type') == 'choice-end')
                    {
                        //obtain link to end
                        let endLink = getForwardLink(activity)

                        //highlight
                        endLink.setAttribute('color', 'yellow')
                        endLink.setAttribute('opacity', '.5')
                        endLink.setAttribute('isTraced', '')

                        //we look at the activity that follows to process next while iteration
                        activity = next
                        next = getNextActivity(next)
                    }
    
                    let elements   = trace.getElementsByTagName('header')
                    let headers    = ""

                    for(let i=0; i<elements.length; i++)
                    {
                        headers += elements[i].getAttribute('key')+": "+elements[i].textContent+"\n"
                    }
                    // //crate 3D label with body
                    // var text = createText();
                    // text.setAttribute('value', headers);
                    // text.setAttribute('color', 'orange');
                    // text.setAttribute('align', 'left');
                    // text.setAttribute('position', {x: 5, y: 0, z: 0});
                    // text.setAttribute('rotation', {x: 0, y: 0, z: -90});
                    // text.setAttribute('side', 'double');
                    // text.setAttribute('visible', 'false')
                    // link.appendChild(text)

                    //obtain body data
                    let body  = trace.getElementsByTagName('body')[0].textContent
    
                    let traceData = ""
                    if(this.data.showHeaders)
                    {
                        traceData += headers+"\n"
                    }
                    if(this.data.showBody)
                    {
                        traceData += body
                    }

                    //crate 3D label with body
                    text = createText();
                    text.setAttribute('value', traceData);
                    text.setAttribute('color', 'yellow');
                    // text.setAttribute('align', 'center');
                    text.setAttribute('align', 'left');
                    text.setAttribute('position', {x: -1, y: 0, z: 0.3});
                    text.setAttribute('rotation', {x: 0, y: 0, z: -90});
                    text.setAttribute('side', 'double');
                    text.setAttribute('visible', 'false')
                    link.appendChild(text)

                    link.setAttribute('class', 'clickable');
                    link.setAttribute('isTraced', '')
    
                    //apply mouse hover behavior
                    link.addEventListener('mouseenter', this.traceMouseEnter);

                    //apply mouse hover behavior
                    link.addEventListener('mouseleave', this.traceMouseLeave);

                    //highlight
                    link.setAttribute('color', 'yellow')
                    link.setAttribute('opacity', '.5')
                }
            }

            //obtain next trace
            trace = idTraces.iterateNext();
        }
    },

    //when user hovers over a 3D link, the trace is made visible
    traceMouseEnter: function (evt) {
        // console.log("link mouseenter");
        this.lastChild.setAttribute('visible', 'true')
        this.lastChild.previousElementSibling.setAttribute('visible', 'true')
    },

    //when mouse leaves, the trace is made hidden
    traceMouseLeave: function (evt) {
        // console.log("link mouseleaave");
        this.lastChild.setAttribute('visible', 'false')
        this.lastChild.previousElementSibling.setAttribute('visible', 'false')
    },

    //clears all traces from links
    traceClearTraceLinks: function () {

        //obtain all links with Tracing
        var traceLinks = document.getElementById('route-definitions').querySelectorAll('a-cylinder[isTraced]')

        if(traceLinks)
        {
            for(let i=0; i<traceLinks.length; i++)
            {
                //clear highlight
                traceLinks[i].setAttribute('color', '')
                traceLinks[i].setAttribute('opacity', '.2')
                traceLinks[i].removeAttribute('isTraced',)

                //remove event listeners
                traceLinks[i].removeEventListener('mouseenter',this.traceMouseEnter)
                traceLinks[i].removeEventListener('mouseleave',this.traceMouseLeave)

                //if there is a child (choice-end don't)
                if(traceLinks[i].lastChild)
                {
                    //remove trace text
                    traceLinks[i].removeChild(traceLinks[i].lastChild)
                }
            }
        }
    },

    //actions when tracing functionality is disabled
    remove: function () {

        //remove Jolokia trace poller
        clearInterval(this.tracingTimer)

        //disable Camel Tracer
        this.enableCamelTracing(false)

        //clear traced links
        this.traceClearTraceLinks()

        console.log('Tracing disabled')
    },

    // update: function () {},
    // tick: function () {},
    // remove: function () {},
    // pause: function () {},
    // play: function () {}
});