// References:
// Resources on how to obtain A-Frame canvas dimensions:
//   - https://stackoverflow.com/questions/44974596/how-to-fit-a-plane-to-the-a-canvas
//   - http://irfu.cea.fr/Projets/PYMSES/_images/pymses_pespective_camera.png
//   - https://jsfiddle.net/cpg890nm/1/


//Global variable
var customConfiguredConsumers = []
var customConfiguredProducers = []


//This function creates a text label
//and is attached to a given parent
function appendLabel(parent, text, count){

    let wrapCount = count || 10

    if(!count && text.length > 10){
        wrapCount = text.length
    }

    let label = createText()
    label.setAttribute('value', text);
    label.setAttribute('width', parent.getAttribute('width'));
    label.setAttribute('wrap-count', wrapCount);
    label.setAttribute('color', 'lightgray');
    label.setAttribute('align', 'center');
    label.setAttribute('side', 'double');
    label.setAttribute('position', '0 0 .01');
    parent.appendChild(label)
}

function createMenuButton(menu, configuration)
{
    //create button entity
    let groupButton = document.createElement('a-box')
    groupButton.id = 'menu-main'

    //add classes
    groupButton.classList.add(menu.class)
    groupButton.classList.add('menu-button')

    //enable/disable as per configuration
    setButtonEnabled(groupButton, menu.enabled)

    groupButton.setAttribute('depth', '.05')
    groupButton.setAttribute('width', '1')
    groupButton.setAttribute('height', '.3')
    groupButton.setAttribute('animation__scale',         {property: 'opacity', dur: 0, to: '.6', startEvents: 'mouseenter'});
    groupButton.setAttribute('animation__scale_reverse', {property: 'opacity', dur: '0', to: '.4',   startEvents: 'mouseleave'});

    //set label to menu button
    appendLabel(groupButton, menu.name)

    //create menu options in a container
    let menuContainer = document.createElement('a-entity')
    menuContainer.id = menu.name
    menuContainer.setAttribute('position', '0 -.3 0')
    menuContainer.setAttribute('visible', false)

    //Create each menu option
    for (var item in menu.menu) {
        createMenuOption(menuContainer, menu.menu[item])
    }

    //Create extra options (if configured)
    for (var item in configuration) {
        createMenuOption(menuContainer, configuration[item])
    }

    //attach options to menu button
    groupButton.appendChild(menuContainer)

    //menu event listener
    groupButton.addEventListener('mouseenter', function(){

        let container = document.getElementById(menu.name)

        container.setAttribute('visible', 'true')

        for(option of container.children){
            option.classList.add('interactive')
        }
    });

    //menu event listener
    groupButton.addEventListener('mouseleave', function(e){

        let container = document.getElementById(menu.name)

        for(option of container.children){
            option.classList.remove('interactive')
        }

        container.setAttribute('visible', false)
    });

    return groupButton
}

function createMenuOption(container, menu, axisX)
{
    let count = container.children.length
    let position = -.3 * count

    axisX = axisX || 0

    let menuItem = document.createElement('a-box')
    menuItem.setAttribute('depth', '.05')
    menuItem.setAttribute('width', '1')
    menuItem.setAttribute('height', '.3')
    menuItem.setAttribute('color', 'grey')
    menuItem.setAttribute('opacity', '.4')
    menuItem.setAttribute('animation__stickout',         {property: 'position', dur: 0, to: axisX+' '+position+' .05', startEvents: 'mouseenter'});
    menuItem.setAttribute('animation__stickout_reverse', {property: 'position', dur: 0, to: axisX+' '+position+' 0',   startEvents: 'mouseleave'});    
    menuItem.setAttribute('position', '0 '+position+' 0')

    if(menu.class){
        menuItem.classList.add(menu.class)
        menuItem.classList.add('menu-button')
    }

    //if the menu has a function
    if(menu.function){

        //mark with label
        appendLabel(menuItem, menu.label, menu.labelWrapCount)

        //register custom consumers/producers
        if(menu.function == "createCustomEndpointFrom"){
            let scheme = menu.arguments[0].split(":")[0]
            customConfiguredConsumers.push(scheme)
        }
        else if(menu.function == "createCustomEndpointTo"){
            let scheme = menu.arguments[0].split(":")[0]
            customConfiguredProducers.push(scheme)
        }
        
        //event listener for menu option
        menuItem.addEventListener('click', function(){         
            if(menu.arguments)
                window[menu.function](menu.arguments)
            else
                window[menu.function]()    
        });
    
    }
    else{
        appendLabel(menuItem, menu.label)
    }

    //add option to container
    container.appendChild(menuItem)

    //if option is a submenu
    if(menu.submenu){

        let menuId = 'menu-'+menu.label

        //create sub-container for submenu options
        let subContainer = document.createElement('a-entity')
        subContainer.id = menuId
        subContainer.setAttribute('position', '1 0 0')
        subContainer.setAttribute('visible', false)
    
        //create submenu options
        for (option in menu.submenu) {
            createMenuOption(subContainer, menu.submenu[option])
        }

        //add submenu option to container
        menuItem.appendChild(subContainer)

        //event listener for submenu option
        menuItem.addEventListener('mouseenter', function(){
            let container = document.getElementById(menuId)
    
            container.setAttribute('visible', 'true')
    
            for(option of container.children){
                option.classList.add('interactive')
            }
        });
    
        //event listener for submenu option
        menuItem.addEventListener('mouseleave', function(e){
            let container = document.getElementById(menuId)
    
            for(option of container.children){
                option.classList.remove('interactive')
            }
    
            container.setAttribute('visible', false)
        });
    }
}


//This function creates a 3D interactive Menu
//The challenge is that it attaches to the camera and needs to be positioned where visible.
//Different users will have different browser window dimensions.
//A-Frame does not provide an easy way to obtain the visible dimensions from a browser window.
//This function calculates the viewable dimensions
//
//References:
//Resources on how to obtain A-Frame canvas dimensions:
//   - https://stackoverflow.com/questions/44974596/how-to-fit-a-plane-to-the-a-canvas
//   - http://irfu.cea.fr/Projets/PYMSES/_images/pymses_pespective_camera.png
//   - https://jsfiddle.net/cpg890nm/1/
function createMenu3D(configuration)
{
/*
    //comment/uncomment for testing
    //this block simulates the configuration the User can customise in 
    //settings.json in VSCode (see package.json > configuration)
    configuration = configuration ||    { 
                                            "consumers": [
                                                {
                                                    "label":    "ftp-custom-code",
                                                    "function": "createFtpStart"                
                                                },

                                                {
                                                    "label":    "netty http",
                                                    "function": "createCustomEndpointFrom",
                                                    "arguments": ['netty-http:myPath?myOption=myValue']
                                                },
                                                
                                            ],
                                            "producers": [
                                                {
                                                    "label":    "log-test",
                                                    "function": "createLog"                
                                                },
                                                {
                                                    "label":    "my component",
                                                    "function": "createCustomEndpointTo",
                                                    "arguments": ['custom1:myPath?myOption=myValue']
                                                },
                                                {
                                                    "label":    "netty http",
                                                    "function": "createCustomEndpointTo",
                                                    "arguments": ['netty-http:myPath?myOption=myValue']
                                                },
                                                {
                                                    "label":    "test HTTP",
                                                    "function": "createCustomEndpointTo",
                                                    "arguments": ['test-http:localhost:10000?option1=value1']
                                                },
                                                {
                                                    "label":    "Sergio HTTP",
                                                    "function": "createCustomEndpointTo",
                                                    "arguments": ['test-http:sergioserver:8888?option1=value1']
                                                },
                                            ]
                                        }
*/

    let defMenuFrom = 
    {
        name: 'from...',
        class: 'consumer',
        enabled: true,
        menu: [
            {
                label:    'direct',
                function: 'createDirectStart',                
            },
            {
                label:    'timer',
                function: 'createTimer',                
            },
            {
                label:    'kafka',
                function: 'createKafkaStart',                
            },
            {
                label:    'file',
                function: 'createFileStart',                
            },
            {
                label:    'ftp',
                function: 'createFtpStart',                
            },
        ]
    }

    let defMenuSet  = 
    {
        name: 'set...',
        class: 'setter', 
        enabled: false, 
        menu: [
            {
                label:    'header',
                function: 'createHeader',                
            },
            {
                label:    'property',
                function: 'createProperty',                
            },
            {
                label:    'body',
                function: 'createBody',                
            },
        ]
    }

    let defMenuEIP  = 
    {
        name: 'eip...',
        class: 'producer', 
        enabled: false, 
        menu: [
            {
                label:    'log',
                function: 'createLog',                
            },
            {
                label:    'call (direct)',
                function: 'createDirect',                
            },
            {
                label:    'choice',
                function: 'createChoice',                
            },
            {
                label:    'try-catch',
                function: 'createTryCatch',                
            },
            {
                label:    'split',
                function: 'createSplit',                
            },
            {
                label:    'dataformat >',
                submenu: [
                    {
                        label:    'base64',
                        function: 'createDataformatWith',
                        arguments: ['base64']            
                    },
                    {
                        label:    'xml/java',
                        function: 'createDataformatWith',
                        arguments: ['jacksonxml']            
                    },
                    {
                        label:    'json/java',
                        function: 'createDataformatWith',
                        arguments: ['json-jackson']            
                    },
                ]             
            },
            {
                label:    'parallel',
                function: 'createMulticast',                
            },
        ]
    }

    let defMenuTo  = 
    {
        name: 'to...',
        class: 'producer', 
        enabled: false, 
        menu: [
            {
                label:    'call (direct)',
                function: 'createDirect',                
            },
            {
                label:    'kafka',
                function: 'createKafka',                
            },
            {
                label:    'file',
                function: 'createFile',                
            },
            {
                label:    'ftp',
                function: 'createFTP',                
            },
            {
                label:    'pdf',
                function: 'createPDF',                
            },
        ]
    }


    let defMenuKit  = 
    {
        name: 'kit...',
        class: 'producer', 
        enabled: false, 
        menu: [
            {
                label:    'json > xml\n(xpath)',
                labelWrapCount: 16,
                function: 'createPredefinedSetWithId',                
                arguments: 'xpath-json-to-xml',
            },
            {
                label:    'xml > json\n(xpath)',
                labelWrapCount: 16,
                function: 'createPredefinedSetWithId',                
                arguments: 'xpath-xml-to-json',
            },
            {
                label:    'json > xml\n(dataformat)',
                labelWrapCount: 16,
                function: 'createPredefinedSetWithId',                
                arguments: 'df-json-to-xml',
            },
            {
                label:    'xml > json\n(dataformat)',
                labelWrapCount: 16,
                function: 'createPredefinedSetWithId',                
                arguments: 'df-xml-to-json',
            },
        ]
    }

    let defMenuREST  = 
    {
        name: 'rest...',
        class: 'rest', 
        enabled: false, 
        menu: [
            {
                class: 'rest', 
                label:    'new group...',
                function: 'createRestGroup',
            },
            {
                class: 'rest', 
                label:    'GET',
                function: 'createRestMethod',
                arguments: {method: 'get'}
            },
            {
                class: 'rest', 
                label:    'POST',
                function: 'createRestMethod',
                arguments: {method: 'post'}
            },
            {
                class: 'rest', 
                label:    'PUT',
                function: 'createRestMethod',
                arguments: {method: 'put'}
            },
        ]
    }

    //keep reference to camera
    var camera = document.getElementById("main-camera");

    //obtain camera component
    let cam = camera.components.camera.camera; 

    //define the distance where the menu will be placed
    //and calculate viewable height and width in browser window 
    let distance = 4
    var height = 2 * distance * Math.tan(cam.fov / 2 / 180 * Math.PI);
    var width = height * cam.aspect;

    //calculate percentage position where the menu will be placed
    height = height * .6
    width = width * .8

    // console.log("frame dimensions: " + height +" "+width);

    //Create the menu handler (grabber to drag'n'drop)
    let handle = document.createElement('a-cylinder')
    handle.id = 'handle'
    handle.setAttribute('color', '#454545')
    handle.setAttribute('radius', '.15')
    handle.setAttribute('height', '.051')
    handle.setAttribute('position', -width/2+' '+height/2+' -4')

    //make interactive
    handle.classList.add('interactive')
    handle.classList.add('clickable')
    handle.setAttribute('dragndrop','')

    //extract configuration (or default to empty)
    let consumers = (configuration && configuration.consumers) ? configuration.consumers : []
    let producers = (configuration && configuration.producers) ? configuration.producers : []

    //create all menus
    let menuFrom = createMenuButton(defMenuFrom, consumers)
    menuFrom.setAttribute('position', '.5 0 0')

    let menuSet = createMenuButton(defMenuSet)
    menuSet.setAttribute('position', '1.5 0 0')

    let menuEIP = createMenuButton(defMenuEIP)
    menuEIP.setAttribute('position', '2.5 0 0')

    let menuTo = createMenuButton(defMenuTo, producers)
    menuTo.setAttribute('position', '3.5 0 0')

    let menuKit = createMenuButton(defMenuKit)
    menuKit.setAttribute('position', '4.5 0 0')

    let menuREST = createMenuButton(defMenuREST)
    menuREST.setAttribute('position', '5.5 0 0')

    //create menu container
    let menu3D = document.createElement("a-entity")
    menu3D.appendChild(menuFrom)
    menu3D.appendChild(menuSet)
    menu3D.appendChild(menuEIP)
    menu3D.appendChild(menuTo)
    menu3D.appendChild(menuKit)
    menu3D.appendChild(menuREST)

    //rotate handle, and counter-rotate menu (to compensate parent's rotation)
    handle.setAttribute('rotation', '90 0 0')
    menu3D.setAttribute('rotation', '-90 0 0')

    //attach menu to grabber
    handle.appendChild(menu3D)

    //create hint for handler
    let hint = document.createElement("a-entity")
    hint.setAttribute('hint', 'message: Drag the menu from the round shape')
    hint.setAttribute('rotation', '-90 0 0')
    hint.setAttribute('scale', '.5 .5 .5')
    handle.appendChild(hint)

    //attach menu to camera
    camera.appendChild(handle)
}

function createCustomEndpointFrom(uri)
{
    definition = new DOMParser().parseFromString(`<from uri="${uri}"/>`, "text/xml").documentElement
    // return createGenericEndpointFrom({definition: definition})
    return createGenericEndpointFrom(definition)
}

function createCustomEndpointTo(uri)
{
    definition = new DOMParser().parseFromString(`<to uri="${uri}"/>`, "text/xml").documentElement
    return createGenericEndpointTo({definition: definition})
}

function setButtonEnabled(button, enabled){
    if(enabled){
        button.classList.add('interactive')
        button.setAttribute('color', 'grey')
        button.setAttribute('opacity', '.4')
    }
    else{
        button.classList.remove('interactive')
        button.setAttribute('color', '#181818')
        button.setAttribute('opacity', '.6')
    } 
}