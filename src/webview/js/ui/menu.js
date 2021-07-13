// References:
// Resources on how to obtain A-Frame canvas dimensions:
//   - https://stackoverflow.com/questions/44974596/how-to-fit-a-plane-to-the-a-canvas
//   - http://irfu.cea.fr/Projets/PYMSES/_images/pymses_pespective_camera.png
//   - https://jsfiddle.net/cpg890nm/1/


function appendLabel(parent, text){
    let label = createText()
    label.setAttribute('value', text);
    label.setAttribute('color', 'lightgray');
    label.setAttribute('align', 'center');
    label.setAttribute('side', 'double');
    label.setAttribute('scale', '.7 .7 .7');
    label.setAttribute('position', '0 0 .01');
    parent.appendChild(label)
}


function createMenuButton(menu, configuration)
{
    let groupButton = document.createElement('a-box')
    groupButton.id = 'menu-main'

    groupButton.classList.add(menu.class)
    groupButton.classList.add('menu-button')


    setButtonEnabled(groupButton, menu.enabled)

//     if(menu.enabled){
//         groupButton.setAttribute('class', 'interactive menu-button')
//         groupButton.setAttribute('color', 'grey')
//        groupButton.setAttribute('opacity', '.4')
// }
//     else{
//         groupButton.setAttribute('color', '#181818')
//         groupButton.setAttribute('opacity', '.8')
//     } 


    // groupButton.setAttribute('depth', '.1')
    groupButton.setAttribute('depth', '.05')
    // groupButton.setAttribute('width', '2')
    // groupButton.setAttribute('height', '.5')
    groupButton.setAttribute('width', '1')
    groupButton.setAttribute('height', '.3')
    // groupButton.setAttribute('color', 'grey')
    groupButton.setAttribute('animation__scale',         {property: 'opacity', dur: 0, to: '.6', startEvents: 'mouseenter'});
    groupButton.setAttribute('animation__scale_reverse', {property: 'opacity', dur: '0', to: '.4',   startEvents: 'mouseleave'});

    appendLabel(groupButton, menu.name)


    let menuContainer = document.createElement('a-entity')
    // menuContainer.id = 'menu-1'
    menuContainer.id = menu.name
    // menuContainer.setAttribute('position', '0 -.5 0')
    menuContainer.setAttribute('position', '0 -.3 0')
    menuContainer.setAttribute('visible', false)

    //Create each menu option
    for (var item in menu.menu) {
        createMenuOption(menuContainer, menu.menu[item])
    }

        for (var item in configuration) {
            createMenuOption(menuContainer, configuration[item])
        }

    groupButton.appendChild(menuContainer)


    groupButton.addEventListener('mouseenter', function(){

        // let container = document.getElementById('menu-1')
        let container = document.getElementById(menu.name)

        container.setAttribute('visible', 'true')

        for(option of container.children){
            option.classList.add('interactive')
        }
    });

    groupButton.addEventListener('mouseleave', function(e){

        // let container = document.getElementById('menu-1')
        let container = document.getElementById(menu.name)

        for(option of container.children){
            option.classList.remove('interactive')
        }

        container.setAttribute('visible', false)
    });

    return groupButton
}

// function createMenuOption(container, menu, name, axisX)
function createMenuOption(container, menu, axisX)
{
    let count = container.children.length
    // let position = -.5 * count
    let position = -.3 * count

    axisX = axisX || 0

    let menuItem = document.createElement('a-box')
    // menuItem.setAttribute('depth', '.1')
    menuItem.setAttribute('depth', '.05')    
    // menuItem.setAttribute('width', '2')
    // menuItem.setAttribute('height', '.5')
    menuItem.setAttribute('width', '1')
    menuItem.setAttribute('height', '.3')
    menuItem.setAttribute('color', 'grey')
    menuItem.setAttribute('opacity', '.4')
    // menuItem.setAttribute('animation__scale',         {property: 'position', dur: 100, to: '0 '+position+' .1', startEvents: 'mouseenter'});
    // menuItem.setAttribute('animation__scale_reverse', {property: 'position', dur: 100, to: '0 '+position+' 0',   startEvents: 'mouseleave'});
    menuItem.setAttribute('animation__scale',         {property: 'position', dur: 0, to: axisX+' '+position+' .05', startEvents: 'mouseenter'});
    menuItem.setAttribute('animation__scale_reverse', {property: 'position', dur: 0, to: axisX+' '+position+' 0',   startEvents: 'mouseleave'});    
    menuItem.setAttribute('position', '0 '+position+' 0')


    if(menu.class){
        menuItem.classList.add(menu.class)
        menuItem.classList.add('menu-button')
    }

    // appendLabel(menuItem, 'http')

    // if(typeof(menu) == 'string'){
    if(menu.function){
        // appendLabel(menuItem, menu)
        appendLabel(menuItem, menu.label)


        menuItem.addEventListener('click', function(){
            // window[menu]()

            if(menu.arguments)
                window[menu.function](menu.arguments)
            else
                window[menu.function]()
                
        });
    

    }
    else{
        appendLabel(menuItem, menu.label)
    }
    container.appendChild(menuItem)

    // if(typeof(menu) == 'object'){
    if(menu.submenu){

        // let menuId = 'menu-'+name
        let menuId = 'menu-'+menu.label

        let subContainer = document.createElement('a-entity')
        // subContainer.id = 'sub-1'
        subContainer.id = menuId
        // subContainer.setAttribute('position', '2 0 0')
        subContainer.setAttribute('position', '1 0 0')
        subContainer.setAttribute('visible', false)
    

        for (option in menu.submenu) {
            // createMenuOption(subContainer, menu[x], x)
            // createMenuOption(subContainer, menu.submenu[option], menu.submenu[option].label)
            createMenuOption(subContainer, menu.submenu[option])
        }

        menuItem.appendChild(subContainer)

                menuItem.addEventListener('mouseenter', function(){

                    // let container = document.getElementById('sub-1')
                    let container = document.getElementById(menuId)
            
                    container.setAttribute('visible', 'true')
            
                    for(option of container.children){
                        option.classList.add('interactive')
                    }
                });
            
                menuItem.addEventListener('mouseleave', function(e){
            
                    // let container = document.getElementById('sub-1')
                    let container = document.getElementById(menuId)
            
                    for(option of container.children){
                        option.classList.remove('interactive')
                    }
            
                    container.setAttribute('visible', false)
                });
    }
}


function createMenu3D(configuration)
{
    //this line simulates the configuration the User can customise from 
    //settings.json in VSCode (see package.json > configuration)
    configuration = configuration ||    { 
                                            "producers": [
                                                {
                                                    "label":    "ftp-custom-code",
                                                    "function": "createFtpStart"                
                                                }
                                                
                                            ],
                                            "consumers": [
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
                                            ]
                                        }

    let defMenuFrom = 
    {
        name: 'from...',
        class: 'producer',
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
        class: 'consumer', 
        enabled: false, 
        menu: [
            {
                label:    'log',
                function: 'createLog',                
            },
            {
                label:    'direct',
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
                label:    'dataformat',
                submenu: [
                    {
                        label:    'base64',
                        function: 'createDataformatWith',
                        arguments: ['base64']            
                    },
                    {
                        label:    'jacksonxml',
                        function: 'createDataformatWith',
                        arguments: ['jacksonxml']            
                    },
                    {
                        label:    'json-jackson',
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
        class: 'consumer', 
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
        class: 'consumer', 
        enabled: false, 
        menu: [
            {
                label:    'json > xml (xpath)',
                function: 'createPredefinedSetWithId',                
                arguments: 'xpath-json-to-xml',
            },
            {
                label:    'xml > json (xpath)',
                function: 'createPredefinedSetWithId',                
                arguments: 'xpath-xml-to-json',
            },
            {
                label:    'json > xml (dataformat)',
                function: 'createPredefinedSetWithId',                
                arguments: 'df-json-to-xml',
            },
            {
                label:    'xml > json (dataformat)',
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


var camera = document.getElementById("main-camera");

let cam = camera.components.camera.camera; 

// this.distance = this.el.object3D.getWorldPosition().distanceTo(new THREE.Vector3(0,1.6,0));
let distance = 4
var height = 2 * distance * Math.tan(cam.fov / 2 / 180 * Math.PI);
var width = height * cam.aspect;

height = height * .6
width = width * .8

console.log("frame dimensions: " + height +" "+width);




    // let handle = document.createElement('a-sphere')
    let handle = document.createElement('a-cylinder')
    handle.id = 'handle'
    handle.setAttribute('radius', '.05')
    handle.setAttribute('height', '.3')
    handle.setAttribute('color', 'darkgrey')
    // handle.setAttribute('opacity', '.6')
    // handle.setAttribute('position', '-2 2 -4')
    handle.setAttribute('position', -width/2+' '+height/2+' -4')
    // handle.setAttribute('class', 'interactive clickable dragndrop')

    // handle.classList.add('dnd-handler')
    handle.classList.add('interactive')
    handle.classList.add('clickable')
    handle.setAttribute('dragndrop','')

    // if(vscode){
    //     let config = vscode.workspace.getConfiguration('cameldesigner').producers
    // }

    let producers = configuration.producers || []
    let consumers = configuration.consumers || []

    let menuFrom = createMenuButton(defMenuFrom, producers)
    menuFrom.setAttribute('position', '.5 0 0')

    let menuSet = createMenuButton(defMenuSet)
    menuSet.setAttribute('position', '1.5 0 0')

    let menuEIP = createMenuButton(defMenuEIP)
    menuEIP.setAttribute('position', '2.5 0 0')

    let menuTo = createMenuButton(defMenuTo, consumers)
    menuTo.setAttribute('position', '3.5 0 0')

    let menuKit = createMenuButton(defMenuKit)
    menuKit.setAttribute('position', '4.5 0 0')

    let menuREST = createMenuButton(defMenuREST)
    menuREST.setAttribute('position', '5.5 0 0')


    handle.appendChild(menuFrom)
    handle.appendChild(menuSet)
    handle.appendChild(menuEIP)
    handle.appendChild(menuTo)
    handle.appendChild(menuKit)
    handle.appendChild(menuREST)



    // camera.appendChild(menuButton)
    // father.appendChild(handle)
    // camera.appendChild(father)
    camera.appendChild(handle)
}



// function createTestComp1(definition)
function createCustomEndpointTo(uri)
{
    // definition = definition || new DOMParser().parseFromString('<to uri="test1:atest"/>', "text/xml").documentElement
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