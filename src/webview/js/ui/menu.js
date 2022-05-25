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

    return label
}

function createMenuButton(menu, configuration)
{
    let menuCount = Object.entries(menu.menu).length

    //create button entity
    let groupButton = document.createElement('a-box')
    // groupButton.id = 'menu-main'
    groupButton.id = 'menu-'+ menu.name

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

    let menuBackdrop = document.createElement('a-plane')
    menuBackdrop.setAttribute('height', menuCount*.3+.3)
    menuBackdrop.setAttribute('position', '0 '+(-(menuCount*.3/2))+' -0.0')
    menuBackdrop.id = menu.name + '-backdrop'

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
    groupButton.addEventListener('raycaster-intersected', function(e){

        if(this != e.target) {return}

        console.log('raycaster-intersected: this: '+this.id+ ' target: '+e.target.id)

// this.emit("hint-remove")

        let container = document.getElementById(menu.name)

        container.setAttribute('visible', 'true')

        for(option of container.children){
            option.classList.add('interactive')
        }
    });


    //menu event listener
    groupButton.addEventListener('raycaster-intersected-cleared', function(e){
        
        console.log('raycaster-intersected-cleared: this:'+this.id+ ' target: '+e.target.id)
            
        let intersectedEls = e.detail.el.components.raycaster.intersectedEls

        if(intersectedEls.length != 0 &&
            (
                e.target.contains(intersectedEls[0]) || 
                intersectedEls[0].contains(e.target) ||
                ( e.target.parentElement == intersectedEls[0].parentElement)
            )
        ) {return}


        let container = document.getElementById(menu.name)

        for(option of container.children){
            option.classList.remove('interactive')
        }

        container.setAttribute('visible', false)
    });

    //we force menu buttons to have different parents
    //this helps handling the different menu activations
    let menuRootEntity = document.createElement('a-entity')
    menuRootEntity.appendChild(groupButton)

    // return groupButton
    return menuRootEntity
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
    menuItem.setAttribute('color', 'gray')
    // menuItem.setAttribute('color', '#454545')
    menuItem.setAttribute('opacity', '.4')
    // menuItem.setAttribute('opacity', '.9')
    menuItem.setAttribute('animation__stickout',         {property: 'position', dur: 0, to: axisX+' '+position+' .05', startEvents: 'mouseenter'});
    menuItem.setAttribute('animation__stickout_reverse', {property: 'position', dur: 0, to: axisX+' '+position+' 0',   startEvents: 'mouseleave'});    
    menuItem.setAttribute('position', '0 '+position+' 0')
    // menuItem.id = 'menu-button-'+menu.label
    menuItem.id = 'menu-button-'+container.id+'-'+menu.label

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

        // let menuId = 'menu-'+menu.label
        let menuId = 'menu-'+container.id+'-'+menu.label

        //create sub-container for submenu options
        let subContainer = document.createElement('a-entity')
        subContainer.id = menuId
        subContainer.setAttribute('position', '1 0 0')
        subContainer.setAttribute('visible', false)
    
        let subBackdrop = document.createElement('a-plane')
        subBackdrop.setAttribute('position', '1 0 0')
        subBackdrop.classList.add('interactive')

        //create submenu options
        for (option in menu.submenu) {
            createMenuOption(subContainer, menu.submenu[option])
        }

        //add submenu option to container
        menuItem.appendChild(subContainer)

        //event listener for submenu option
        menuItem.addEventListener('raycaster-intersected', function(e){
        
            let container = document.getElementById(menuId)
    
            container.setAttribute('visible', 'true')
    
            for(option of container.children){
                option.classList.add('interactive')
            }
        });
    
        //event listener for submenu option
        menuItem.addEventListener('raycaster-intersected-cleared', function(e){

            //when raycaster clears, we need to determine if we keep the menu container visible or not.
            //we should keep the sub-container active, only if the raycaster points to one of the sub-container's menu options.
            //so... when the raycaster points to something else...
            if(e.detail.el.components.raycaster.intersectedEls.length != 0) { 
                
                //we look at the item the laser is pointing at (first of the list if multiple)
                let laserAtItem = e.detail.el.components.raycaster.intersectedEls[0]

                //if indeed a genuine sub-option, we should keep the menu visible
                //(because: option > sub-container > sub-option)
                if(laserAtItem.parentElement.parentElement == this)
                {
                    //it's important to stop propagation
                    //otherwise this would be problematic on nested sub-menus
                    e.stopPropagation()

                    //do nothing (leave menu as is)
                    return
                }
            }
     
            //at this stage we consider the menu container should be deactivated (not visible/interactive)
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
            {
                label:    'google >',
                submenu: [

                    // PENDING
                    // {
                    //     label:    'drive',
                    //     function: 'createGoogleDriveStart'
                    // },


                    {
                        label:    'sheets',
                        function: 'createGoogleSheetsStart'
                    },
                ]             
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
            {
                label:    'clean headers',
                function: 'createRemoveHeaders',                
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
                label: 'transform >',
                submenu: [
                    {
                        label:    'AtlasMap',
                        function: 'createAtlasMap',                
                    },
                    // {
                    //     label:    'mock ADMs',
                    //     function: 'updateAtlasMapList',                
                    // },
                    // {
                    //     label:    'mock ADMs 2',
                    //     function: 'updateAtlasMapList2',                
                    // },

                    
                    {
                        label:    "map data",
                        function: "createMapData"                
                    },
                ]
            },

            {
                label: 'choice >',
                submenu: [
                    {
                        label:    '1 condition',
                        function: 'createChoiceWith',
                        arguments: ['1']
                    },
                    {
                        label:    '2 conditions',
                        function: 'createChoiceWith',
                        arguments: ['2']     
                    },
                    {
                        label:    '3 conditions',
                        function: 'createChoiceWith' ,
                        arguments: ['3']    
                    }
                ]   
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
                label:    'aggregate',
                function: 'createAggregator',                
            },
            {
                label:    'process',
                function: 'createProcess',                
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

/*
                    //These are for testing purposes
                    //These are sub-menus inside submenus to validate mouse navigation -
                    //displays correct visual behaviour
                    {
                        label:    '2-dataformat >',
                        submenu: [
                            {
                                label:    '2-base64',
                                function: 'createDataformatWith',
                                arguments: ['base64']            
                            },
                            {
                                label:    '2-xml/java',
                                function: 'createDataformatWith',
                                arguments: ['jacksonxml']            
                            },
                            {
                                label:    '2-json/java',
                                function: 'createDataformatWith',
                                arguments: ['json-jackson']            
                            },
                        ]             
                    },
                    {
                        label:    '3-dataformat >',
                        submenu: [
                            {
                                label:    '3-base64',
                                function: 'createDataformatWith',
                                arguments: ['base64']            
                            },
                            {
                                label:    '3-xml/java',
                                function: 'createDataformatWith',
                                arguments: ['jacksonxml']            
                            },
                            {
                                label:    '3-json/java',
                                function: 'createDataformatWith',
                                arguments: ['json-jackson']            
                            },
                        ]             
                    },
*/
                ]             
            },
            {
                label:    'parallel',
                function: 'createMulticast',                
            },

            // {
            //     label:    "pipeline",
            //     function: "createPipeline"                
            // }            
        ]
    }

    let defMenuTo  = 
    {
        name: 'to...',
        class: 'producer', 
        enabled: false, 
        menu: [
                // {
                //     label:    'AtlasMap',
                //     function: 'createAtlasMap',                
                // },
            {
                label:    'call (direct)',
                function: 'createDirect',                
            },
            {
                label:    "HTTP",
                function: "createHttp"                
            },            
            {
                label:    'kafka',
                function: 'createKafka',                
                // function: 'createMapKafka',                
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
            {
                label:    'mail >',
                submenu: [
                    {
                        label:    'smtp',
                        function: 'createSMTP'
                        // function: 'createMapMailSMTP'         
                    },
                ]             
            },
            {
                label:    'google >',
                submenu: [
                    {
                        label:    'drive',
                        function: 'createGoogleDrive'         
                    },
                    {
                        label:    'sheets',
                        function: 'createGoogleSheets'         
                    },
                ]             
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

/*
            //These are options to test VR mode
            {
                label:    'enter/exit VR',
                function: 'tempVR'
            },
            {
                label:    'reset RIG',
                function: 'tempResetCamera'
            },
*/
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

    //MENU POSITIONING:
    //    (see comments on head of function)
    //References:
    //Resources on how to obtain A-Frame canvas dimensions:
    //   - https://stackoverflow.com/questions/44974596/how-to-fit-a-plane-to-the-a-canvas
    //   - http://irfu.cea.fr/Projets/PYMSES/_images/pymses_pespective_camera.png
    //   - https://jsfiddle.net/cpg890nm/1/

    //keep reference to camera
    var camera = document.getElementById("main-camera");

    //Create the menu handler (grabber to drag'n'drop)
    let handle = document.createElement('a-cylinder')
    handle.id = 'handle'
    handle.setAttribute('color', '#454545')
    handle.setAttribute('radius', '.15')
    handle.setAttribute('height', '.051')
    // handle.setAttribute('position', -width/2+' '+height/2+' -4')
    setUiItemLocation(handle, .75, .95)

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
    // menuFrom.setAttribute('hint', 'message: Start your ride\n"from..." here; orientation: up; position: 0 .3 0')
    menuFrom.setAttribute('hint', "message: Start 'from...' here; orientation: up; position: 0 .3 0; selfdestroy: true")


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
    // let hint = document.createElement("a-entity")
    // hint.setAttribute('hint', 'message: Drag the menu from the round shape')
    // hint.setAttribute('rotation', '-90 0 0')
    // hint.setAttribute('scale', '.5 .5 .5')
    // handle.appendChild(hint)

    //attach menu to camera
    camera.appendChild(handle)
}

// Places the UI item in the screen
// The screen is divided in 4 regions, separated by the X and Y axis.
// - heighFactor: (1 to -1) indicates where in the Y-axis the item is placed
// - widthFactor: (1 to -1) indicates where in the X-axis the item is placed
function setUiItemLocation(item, heightFactor, widthFactor){

    //MENU POSITIONING:
    //    (see comments on head of function)
    //References:
    //Resources on how to obtain A-Frame canvas dimensions:
    //   - https://stackoverflow.com/questions/44974596/how-to-fit-a-plane-to-the-a-canvas
    //   - http://irfu.cea.fr/Projets/PYMSES/_images/pymses_pespective_camera.png
    //   - https://jsfiddle.net/cpg890nm/1/

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
    height = height * heightFactor
    width = width * widthFactor

    // console.log("frame dimensions: " + height +" "+width);

    //set item's position as per calculated coordinates
    // item.setAttribute('position', -width/2+' '+height/2+' -4')
    item.object3D.position.set(
        -width /2,
        height /2,
        -4
    )
}

function createCustomEndpointFrom(uri)
{
    definition = new DOMParser().parseFromString(`<from uri="${uri}"/>`, "text/xml").documentElement
    return createGenericEndpointFrom({definition: definition})
    // return createGenericEndpointFrom(definition)
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

//for VR testing
function tempResetCamera(){
    document.getElementById('rig').setAttribute('position', '0 0 8')
}

//for VR testing
function tempVR(){

    let scene = document.getElementById('thescene')
    
    if(scene.is('vr-mode')){
        scene.exitVR()
    }
    else{
        scene.enterVR()
        // tempResetCamera()
    }
}

//===========================================================
//===========================================================

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
function createMenu3Dcontrol()
// function createMenu3Dcontrol(configuration)
{
    let defMenuRoutes = 
    {
        name: 'control...',
        class: 'control',
        enabled: true,
        menu: [

            {
                label:    'route >',
                submenu: [


                    {
                        label:    'edit >',
                        submenu: [
                            {
                                label:    'new',
                                function: 'newRoute'
                            },
                            // {
                            //     label:    'delete',
                            //     function: 'deleteRoute'   
                            // },
                            {
                                label:    'rename',
                                function: 'editRouteName'
                            }
                        ]             
                    },

                    {
                        label:    'select >',
                        submenu: [
                        ]             
                    },

                ]             
        },
            {
                label:    '  code  >',
                submenu: [
                    {
                        label:    'Camel K',
                        function: 'setCamelK'
                    },
                    {
                        label:    'Camel 3',
                        function: 'setCamelVersion3Spring'   
                    },
                    {
                        label:    'camel 2\n(spring)',
                        function: 'setCamelVersion2Spring'
                    },
                    {
                        label:    'camel 2\n(blueprint)',
                        function: 'setCamelVersion2Blueprint'
                    }
                ]             
            },
        ]
    }

    let defMenuHelp  = 
    {
        name: 'help...',
        class: 'help', 
        enabled: true, 
        menu: [
            {
                label:    'how to...',
                function: 'openDocumentation',                
            },
        ]
    }


    //MENU POSITIONING:
    //    (see comments on head of function)
    //References:
    //Resources on how to obtain A-Frame canvas dimensions:
    //   - https://stackoverflow.com/questions/44974596/how-to-fit-a-plane-to-the-a-canvas
    //   - http://irfu.cea.fr/Projets/PYMSES/_images/pymses_pespective_camera.png
    //   - https://jsfiddle.net/cpg890nm/1/

    let controlId = 'handle-control'

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

    let menuPos = document.getElementById('handle').object3D.position

    // let position = -width/2+' '+height/2+' -4'
    // let position = '1 '+height/2+' -4'
    // let position = {
    //     x: 1,
    //     y: height/2,
    //     z: -4
    // }
    let position = {
        x: menuPos.x+6,
        y: menuPos.y,
        z: menuPos.z
    }

    
    let handle = document.getElementById(controlId)
    
    //if one exists, we discard and recreate
    if(handle){
        //keep original position
        // position = handle.getAttribute('position')
        position = handle.object3D.position
        camera.removeChild(handle)
    }

    //Create the menu handler (grabber to drag'n'drop)
    handle = document.createElement('a-cylinder')
    handle.id = 'handle-control'
    handle.setAttribute('color', '#454545')
    handle.setAttribute('radius', '.15')
    handle.setAttribute('height', '.051')
    // handle.setAttribute('position', -width/2+' '+height/2+' -4')
    // handle.setAttribute('position', position)
    handle.object3D.position.set(
        position.x, 
        position.y, 
        position.z
    )

    //make interactive
    handle.classList.add('interactive')
    handle.classList.add('clickable')
    handle.setAttribute('dragndrop','')


    let routes = getRoutes()
    let option

    for(let i = 0; i < routes.length ; i++){
        
        option = 
            {
                label:    routes[i].id,
                function: 'nextRoute',
                arguments: routes[i].id
            }

        defMenuRoutes.menu[0].submenu[1].submenu.push(option)
    }

    //create all menus
    let menuRoutes = createMenuButton(defMenuRoutes)
    menuRoutes.setAttribute('position', '.5 0 0')

    let menuHelp = createMenuButton(defMenuHelp)
    menuHelp.setAttribute('position', '1.5 0 0')


    //create menu container
    let menu3D = document.createElement("a-entity")
    menu3D.appendChild(menuRoutes)
    menu3D.appendChild(menuHelp)

    //rotate handle, and counter-rotate menu (to compensate parent's rotation)
    handle.setAttribute('rotation', '90 0 0')
    menu3D.setAttribute('rotation', '-90 0 0')

    //attach menu to grabber
    handle.appendChild(menu3D)

    //create hint for handler
    // let hint = document.createElement("a-entity")
    // hint.setAttribute('hint', 'message: Drag the menu from the round shape')
    // hint.setAttribute('rotation', '-90 0 0')
    // hint.setAttribute('scale', '.5 .5 .5')
    // handle.appendChild(hint)

    //attach menu to camera
    camera.appendChild(handle)


    //create hint for handler
    // let itext = document.createElement("a-input")
    // itext.setAttribute('position', '0 0 -2')
    // itext.classList.add('interactive')
    // camera.appendChild(itext)

    // itext = document.createElement("a-sphere")
    // itext.setAttribute('position', '-1 0 -2')
    // itext.classList.add('interactive')
    // itext.setAttribute('clickable', '')
    // camera.appendChild(itext)

    // <a-input class="interactive" clickable position="0 0 -2" placeholder="Username" color="black" width="1"></a-input>


}





  function editRouteName(){
      //obtain UI form
      let configPanel = document.getElementById('ui-route-rename') 

      //populate UI input with current Route ID
      configPanel.querySelector('a-input').setAttribute('value', getActiveRoute().id)

      //activate UI configuration panel
      configPanel.components.form.setActive(true);
  }


  function renameActiveRoute(newRouteId){
    getActiveRoute().id = newRouteId
    routes[0] = newRouteId
    document.getElementsByTagName("routenav")[1].innerHTML = newRouteId;

    //as the route name has changed, the dropdown menu needs to be synched
    createMenu3Dcontrol();
  }



  function createTextInput(defaultText, listener){

    let textbox = document.createElement("a-plane")
    textbox.setAttribute('color', 'grey')
    textbox.setAttribute('width', '2')
    textbox.setAttribute('height', '.3')

    let label = appendLabel(textbox, defaultText)
    label.setAttribute('inputlistener', '')
    label.setAttribute('position', "-0.95 0.015 0")
    label.setAttribute('align', 'left');
    label.setAttribute('color', 'black');

    UiInput.focus(label)

    label.addEventListener('uiinputsubmit', listener);

    return textbox
  }


/*
  AFRAME.registerComponent('menu', {
    schema: {
        //menu: {}
        // value: { type: "string", default: "" },
        // width: { type: "number", default: 1 },
        // wrapcount: { type: "number" },
        // enabled: { type: "boolean", default: true }
    },
    init: function () {

        let menu = this.data.menu

    },
    update: function (oldData) {
    },
    tick: function () {},
    remove: function () {},
    pause: function () {},
    play: function () {}
  });
  
  AFRAME.registerPrimitive('a-menu', {
    defaultComponents: {
      button: {}
    },
    mappings: {
        // menu: "dropdown.menu"
        // value: "button.value",
        // width: "button.width",
        // wrapcount: "button.wrapcount",
        // enabled: "button.enabled"
    }
  });
  */


//===========================================================
//===========================================================

//This function creates a 3D navigation control
function createNavigationControl()
{
    let controlId = 'navigation-control'
  
    //keep reference to camera
    var camera = document.getElementById("main-camera");

    let button = document.createElement('a-cone')
    button.setAttribute("opacity", .4)
    button.setAttribute("height", .3)
    button.setAttribute("radius-bottom", .1)
    button.setAttribute("rotation", "0 0 90")
    button.classList.add('interactive')
    button.setAttribute("position", "-.5 0 0")
    button.id = "nav-left"

   
    button.onmousedown = function(){
        window.dispatchEvent(new KeyboardEvent('keydown', {
            // key: "a",
            // keyCode: 69,
            code: "KeyA",
            // which: 69,
            shiftKey: false,
            ctrlKey: false,
            metaKey: false
          }));
    }
    
    button.onmouseup = function(){
        window.dispatchEvent(new KeyboardEvent('keyup', {
            // key: "a",
            // keyCode: 69,
            code: "KeyA",
            // which: 69,
            shiftKey: false,
            ctrlKey: false,
            metaKey: false
          }));
      }


    //create menu container
    let navControlTop = document.createElement("a-entity")
    let navControl = document.createElement("a-entity")
    navControlTop.appendChild(navControl)
    navControlTop.setAttribute("handgrip", "")
    navControlTop.id = controlId
    // navControl.setAttribute("handgrip", "")
    navControl.appendChild(button)
    // navControl.setAttribute("position", ".7 -.3 0")
    // navControl.setAttribute("position", "-.3 .3 0")
    // navControl.setAttribute("position", "0 0 0")

    // setUiItemLocation(navControlTop, -.7, .9)
    // setUiItemLocation(navControlTop, -.9, .8)
    setUiItemLocation(navControlTop, -.8, .85)

    // setUiItemLocation(navControlTop, -.5, .5)
    // setUiItemLocation(navControl, -.5, .5)


    //This checkbox's role is to pin the orientation of the nav. system
    //when pinned, up/down will zoon in/out
    //when un-pinned, up/down will move the camera vertically
    let checkbox = document.createElement('a-checkbox')
    checkbox.setAttribute("label", "pin")
    // checkbox.setAttribute("position", "-.55 .3 0")
    // checkbox.setAttribute("position", ".5 -.3 0")
    checkbox.setAttribute("position", ".25 -.3 0")
    checkbox.setAttribute("visible", false)
    checkbox.setAttribute("checked", false)
    checkbox.setAttribute("scale", ".8 .8 .8")
    navControl.appendChild(checkbox)


            button = document.createElement('a-cone')
            button.setAttribute("opacity", .4)
            button.setAttribute("height", .3)
            button.setAttribute("radius-bottom", .1)
            button.setAttribute("rotation", "0 0 -90")
            button.classList.add('interactive')
            button.setAttribute("position", ".5 0 0")
            button.id = "nav-right"
            navControl.appendChild(button)
        

            button.onmousedown = function(){
                window.dispatchEvent(new KeyboardEvent('keydown', {
                    // key: "a",
                    // keyCode: 69,
                    code: "KeyD",
                    // which: 69,
                    shiftKey: false,
                    ctrlKey: false,
                    metaKey: false
                }));
            }
            
            button.onmouseup = function(){

                window.dispatchEvent(new KeyboardEvent('keyup', {
                    // key: "a",
                    // keyCode: 69,
                    code: "KeyD",
                    // which: 69,
                    shiftKey: false,
                    ctrlKey: false,
                    metaKey: false
                }));
            }

 
                    button = document.createElement('a-cone')
                    button.setAttribute("opacity", .4)
                    button.setAttribute("height", .3)
                    button.setAttribute("radius-bottom", .1)
                    button.setAttribute("rotation", "0 0 0")
                    button.classList.add('interactive')
                    button.setAttribute("position", "0 .3 0")
                    button.id = "nav-up"
                          

                    button.onmousedown = function(){
                        window.dispatchEvent(new KeyboardEvent('keydown', {
                            // key: "a",
                            // keyCode: 69,
                            code: "KeyW",
                            // which: 69,
                            shiftKey: false,
                            ctrlKey: false,
                            metaKey: false
                        }));
                    }
                    
                    button.onmouseup = function(){
                
                        window.dispatchEvent(new KeyboardEvent('keyup', {
                            // key: "a",
                            // keyCode: 69,
                            code: "KeyW",
                            // which: 69,
                            shiftKey: false,
                            ctrlKey: false,
                            metaKey: false
                        }));
                    }

                    let updownControl = document.createElement("a-entity")
                    updownControl.appendChild(button)
                    navControl.appendChild(updownControl)
                    //   navControl.appendChild(button)


                            button = document.createElement('a-cone')
                            button.setAttribute("opacity", .4)
                            button.setAttribute("height", .3)
                            button.setAttribute("radius-bottom", .1)
                            button.setAttribute("rotation", "0 0 180")
                            button.classList.add('interactive')
                            button.setAttribute("position", "0 -.3 0")
                            button.id = "nav-down"

                            button.onmousedown = function(){
                                window.dispatchEvent(new KeyboardEvent('keydown', {
                                    // key: "a",
                                    // keyCode: 69,
                                    code: "KeyS",
                                    // which: 69,
                                    shiftKey: false,
                                    ctrlKey: false,
                                    metaKey: false
                                }));
                            }
                            
                            button.onmouseup = function(){                
                                window.dispatchEvent(new KeyboardEvent('keyup', {
                                    // key: "a",
                                    // keyCode: 69,
                                    code: "KeyS",
                                    // which: 69,
                                    shiftKey: false,
                                    ctrlKey: false,
                                    metaKey: false
                                }));
                            }

                        // let updownControl = document.createElement("a-entity")
                        updownControl.appendChild(button)
                        // navControl.appendChild(button)
                        
                        // updownControl.setAttribute("rotation", "-60 20 0")
                        // updownControl.setAttribute("rotation", "-45 0 0")
                        // updownControl.setAttribute("position", "0 -.05 0")
                        // navControl.appendChild(updownControl)

                        let rig = document.getElementById("rig")
                        
                        document.addEventListener('keydown', function(e){
                            if(e.key == "Shift" && checkbox.attributes.checked.value == "false")
                            {
                                checkbox.setAttribute("visible", true)
                                checkbox.setAttribute("checked", false)

                                rig.setAttribute("wasd-controls", "wsAxis:z; wsInverted:false")
                                // console.log("shift: "+evt.type+"/"+evt.key)
                                // updownControl.setAttribute("rotation", "-50 0 0")
                                // navControl.setAttribute("rotation", "-70 0 0")
                                // navControl.setAttribute("rotation", "0 90 90")
                                updownControl.setAttribute("rotation", "0 90 -90")
                            }
                        }.bind(this));
                        // }.bind(updownControl));

                        document.addEventListener('keyup', function(e){
                            if(e.key == "Shift" && checkbox.attributes.checked.value == "false")
                            {
                                checkbox.setAttribute("visible", false)

                                rig.setAttribute("wasd-controls", "wsAxis:y; wsInverted:true")

                                // console.log("shift: "+evt.type+"/"+evt.key)
                                updownControl.setAttribute("rotation", "0 0 0")
                                // navControl.setAttribute("rotation", "0 0 0")
                            }
                        }.bind(this));
                        //}.bind(updownControl));


                        //when PIN is unchecked we restore vertical camera movement
                        checkbox.onclick = function(){
                            if(this.attributes.checked.value == "true"){
                                //hide pin
                                checkbox.setAttribute("visible", false)
                                rig.setAttribute("wasd-controls", "wsAxis:y; wsInverted:true")
                                updownControl.setAttribute("rotation", "0 0 0")
                            }
                        }


    //attach menu to camera
    // camera.appendChild(navControl)
    camera.appendChild(navControlTop)
}
