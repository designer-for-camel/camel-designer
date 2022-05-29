const Utils = {};

/**
  Utils.preloadAssets([])
  Add assets to Assets management system.
*/
Utils.preloadAssets = ()=>{

    let assets_arr = [
        { type: 'img', id: 'aframeCheckboxMark', crossorigin: 'anonymous', src: `${AFRAME.ASSETS_PATH}/images/CheckmarkIcon.png`},
        { type: 'img', id: 'icon-gdrive',        crossorigin: 'anonymous', src: `${AFRAME.ASSETS_PATH}/icons/google-drive.png`},
        { type: 'img', id: 'icon-gsheets',       crossorigin: 'anonymous', src: `${AFRAME.ASSETS_PATH}/icons/google-sheets.png`},
        { type: 'img', id: 'icon-kafka',         crossorigin: 'anonymous', src: `${AFRAME.ASSETS_PATH}/icons/kafka.png`},
        { type: 'img', id: 'icon-mail',          crossorigin: 'anonymous', src: `${AFRAME.ASSETS_PATH}/icons/mail.png`},
        { type: 'img', id: 'icon-atlasmap',      crossorigin: 'anonymous', src: `${AFRAME.ASSETS_PATH}/icons/atlasmap.png`},
    ]

    let assets = document.querySelector('a-assets')
    let already_exists;

    if (!assets) {
        var scene = document.querySelector('a-scene');
        assets = document.createElement('a-assets');
        scene.appendChild(assets);
    }

    for (let item of assets_arr) {
        already_exists = false;

        /***** With Edge, assets.children is a HTMLCollection, not an Array! *****/
        for (let stuff of Array.from(assets.children)) {
            if (item.id === stuff.id) {
                already_exists = true;
            }
        }

        if (!already_exists) {
            //create asset
            var asset_item = document.createElement(item.type);

            //set asset attributes
            let keys = Object.keys(item)
            for(let i=1; i<keys.length; i++){
                asset_item.setAttribute(keys[i], item[keys[i]]);
            }

            //include new asset in collection
            assets.appendChild(asset_item);
        }
    }
}

//calculates the object's position using the reference coordinate system
//reference: reference in coordinates system A
//object: object in coordinates system B
//example:
// if   ref. position is 5 5 5 (world position)
// and  obj. position is 3 3 3 (child of obj in 7 7 7)
// then obj. relative position to ref. is 5 5 5 (calculated from (7+3)-5)
// Utils.getRelativePosition = (reference, object)=>{
Utils.getRelativePosition = (reference, worldposition)=>{

    

    //variables
    let posRef = new THREE.Vector3()
    let posObj = new THREE.Vector3()

    //obtain respective world positions
    reference.object3D.getWorldPosition(posRef)      
        // object.object3D.getWorldPosition(posObj)      

    //vectors
    let v1 = posRef.negate()
    // let v2 = posObj
    let v2 = worldposition
        
    //add them
    v1.add(v2)
    
    return v1
}