
AFRAME.registerComponent('handgrip', {
    schema: {
    //   checked: { type: 'boolean', default: false },
    //   disabled: { type: 'boolean', default: false },
    //   name: { type: "string", default: "" },
    //   value: { type: "string", default: "" },
    //   label: { type: "string", default: "" },
    //   checkboxColor: { type: "color", default: "#757575"},
    //   checkboxColorChecked: { type: "color", default: "#4076fd"},
    //   color: { type: "color", default: "#757575" },
    //   font: { type: "string", default: "" },
    //   letterSpacing: { type: "int", default: 0 },
    //   lineHeight: { type: "string", default: "" },
      opacity: { type: "number", default: 0 },
      position: { type: "vec3", default: "0 0 0" },
    //   width: { type: "number", default: 1 }
      active: { type: "boolean", default: true },
    },

    init: function (data) {
        this.el.setAttribute('geometry','primitive: cylinder; height: 0.01; radius: 0.1;')
        this.el.setAttribute('material','color: grey')
        this.el.getObject3D('mesh').rotateX(Math.PI/2)

        this.el.setAttribute('clickable','')
        this.el.setAttribute('dragndrop','')

        if(this.data.active){
          this.el.classList.add('interactive')
        }
      },
 
    update: function () {
      if(this.data.active){
        this.el.classList.add('interactive')
      }
      else{
        this.el.classList.remove('interactive')
      }
    },


    tick: function () {},
    remove: function () {},
    pause: function () {},
    play: function () {}
  });
