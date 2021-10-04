const Utils = {};

/**
  Utils.preloadAssets([])
  Add assets to Assets management system.
*/
Utils.preloadAssets = ()=>{

    let assets_arr = [
        { type: 'img', id: 'aframeCheckboxMark', crossorigin: 'anonymous', src: `${AFRAME.ASSETS_PATH}/images/CheckmarkIcon.png`},
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