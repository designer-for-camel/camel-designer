//======================

function doubleClick(fn, timeout = 500) {
    let last = Date.now();

    return function(e) {
        const now = Date.now();
        const diff = now - last;

        console.log('single');

        if (diff < timeout) {
            fn(e);

            console.log('double');
        }

        last = now;
    }
};

AFRAME.registerComponent('double-click', {

    init: function() {
        // this.el.sceneEl.canvas.addEventListener('click', doubleClick(this.onDoubleClick.bind(this)));
        this.el.addEventListener('click', doubleClick(this.onDoubleClick.bind(this)));
    },

    onDoubleClick: function() {

        //ignore double-click events for REST elements on Camel Quarkus:
        //REST and ROUTE definitions are split, we can't jump from one file definition to another
        if(isRestElement(this.el) && isCamelQuarkus()){
            return
        }

        //to switch route:
        // 1) obtain the target 'uri' the direct activity points to
        // 2) find the route that contains the direct (target)
        let targetUri = this.el.querySelector(".uri").getAttribute('value')
        let routeId = findRouteIdFromDirectUri(targetUri)

        //ignore direct elements not being properly configured
        if(!routeId){
            return
        }

        // var camera = document.getElementById("main-camera");
        var camera = document.getElementById("rig");

        //listens to animation end
        camera.addEventListener('animationcomplete', function enterDirect() {

          //delete listener
          this.removeEventListener('animationcomplete', enterDirect);

          //delete animation
          this.removeAttribute('animation');

          //jump to route
          nextRoute(routeId);
        });

        //obtain the absolute position to provide a target for the camera
        let target = getPositionInScene(this.el)

        //animation starts from this moment
        camera.setAttribute('animation', {property: 'position', dur: '1500', to: target, loop: false});

    }
});