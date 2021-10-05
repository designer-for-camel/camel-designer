
class UiInput{
  static activeElement = null;

  //activates given UI input for editing
  static focus(element) {
    //unfocus previous element
    if(this.activeElement){
        this.activeElement.components.input.unfocus()
    }
    //sets new UI element as active one 
    this.activeElement = element;
  }

  //inactivates current UI input
  static unfocus() {
    if(this.activeElement){
        this.activeElement.components.input.unfocus()
        this.activeElement = null
    }
  }

  static getActiveElement() {
    return this.activeElement
  }

  static setValue(value){
    this.activeElement.setAttribute('value', value)
  }

  static getValue(){
    return this.activeElement.getAttribute('value')
  }
}

AFRAME.registerComponent('input', {
  schema: {
    value: { type: "string", default: "" },
    name: { type: "string", default: "" },
    disabled: { type: "boolean", default: false },
  //   color: { type: "color", default: "#000" },
  //   align: { type: "string", default: "left" },
  //   font: { type: "string", default: "" },
  //   letterSpacing: { type: "int", default: 0 },
  //   lineHeight: { type: "string", default: "" },
  //   opacity: { type: "number", default: 1 },
  //   side: { type: "string", default: 'front' },
  //   tabSize: { type: "int", default: 4 },
  //   placeholder: { type: "string", default: "" },
  //   placeholderColor: { type: "color", default: "#AAA" },
  //   maxLength: { type: "int", default: 0 },
  //   type: { type: "string", default: "text" },
    width: { type: "number", default: 1 },
  //   cursorWidth: { type: "number", default: 0.01 },
  //   cursorHeight: { type: "number", default: 0.08 },
  //   cursorColor: { type: "color", default: "#007AFF" },
  //   backgroundColor: { type: "color", default: "#FFF" },
  //   backgroundOpacity: { type: "number", default: 1 },
  },

  init: function () {

    //create button entity
    let input = document.createElement('a-plane-rounded')
    // input.setAttribute('value', 'white')
    input.setAttribute('color', 'white')
    input.setAttribute('width', this.data.width)
    input.setAttribute('height', '.3')
    input.setAttribute('radius', '.05')
    input.setAttribute('position', '0 -.15 .003')


    let label = document.createElement('a-text')
    label.setAttribute('value', this.data.value);
    input.appendChild(label)
    // let label = appendLabel(input, this.data.value)
    label.setAttribute('position', "0 0.15 0.003")
    label.setAttribute('align', 'left');
    label.setAttribute('color', 'black');
    label.setAttribute('wrap-count', '')
    this.label = label

    // UiInput.focus(label)
    // label.addEventListener('uiinputsubmit', listener);

    // input.appendChild(label)


    let blinker = document.createElement('a-text')
    // blinker.setAttribute('value', this.data.value);
    input.appendChild(blinker)
    // let blinker = appendLabel(input, "|")
    blinker.setAttribute('position', "0 0.15 0.003")
    blinker.setAttribute('visible', 'false')
    // blinker.setAttribute('scale', '1.05 1.05 1');
    blinker.setAttribute('align', 'left');
    blinker.setAttribute('color', 'black');
    blinker.setAttribute('wrap-count', '')
    this.blinker = blinker
    input.appendChild(blinker)
    this.blinkerVisible = false
    // this.blinkerTick()


    this.el.appendChild(input)

    // UiInput.focus(label)
    // UiInput.setValue(this.data.value)

    input.classList.add('interactive')
    // input.setAttribute('clickable', '')

    let that = this

    this.el.addEventListener('click', function() {
        console.log('input click: '+that.id)
        that.focus(that)
    });

  },

  linkLabel: function(label){
    this.linkedLabel = label
  },

  blinkerTick: function(){
    if(!this.blinkerVisible){
      this.blink()
    }
    else{
      component.blinker.setAttribute('visible', 'false')
      this.blinkerVisible = false
    }

    let l = component.blinker.getAttribute('visible')
    // console.log("blinker: "+l)
  },
  
  focus: function(input){
    // return this.label.getAttribute('value')
    input.blinker.setAttribute('visible', 'true')
    // UiInput.focus(input)
    UiInput.focus(this.el)
    this.blink()
    document.getElementById('main-camera').setAttribute('wasd-controls-enabled', false)

  },

  unfocus: function(){
    document.getElementById('main-camera').setAttribute('wasd-controls-enabled', true)

    // return this.label.getAttribute('value')
    this.blinker.setAttribute('visible', 'false')
  },

  getValue: function(){
    return this.label.getAttribute('value')
  },

  setValue: function(value){
    this.label.setAttribute('value', value)

    //if there is an activity label we do a live update
    if(this.linkedLabel){
      this.linkedLabel.setAttribute('value', '"'+value+'"')
    }

    if(this.onupdate){
      this.onupdate.call() 
    }

    //if input has focus, we blink to update blinker's position
    if(this.blinker.getAttribute('visible')){
      this.blink()
    }
  },

  blink: function(){

      this.blinkerVisible = true

      let value = this.label.getAttribute('value')
      let length = value.length

      component = this
      // console.log("blink")

      // if(component.blinkerFirst){
      //     UiInput.setValue(UiInput.getValue()+' ')
      //     component.blinkerFirst = false
      // }
/*
      let font = this.label.components.text.mesh.geometry.layout._opt.font

      let code //= value.charCodeAt(value.length-1)
      let char = font.chars.find(x => {return x.id===code})

      let width = 0

      for(let i=0;i<value.length;i++){
        code = value.charCodeAt(i)

        if(code==32){
          width+=15
          continue
        }
        // width+= font.chars.find(x => {return x.id===code}).width -6
        width+= font.chars.find(x => {return x.id===code}).width //+2
      }
*/

/*
      // let gliphs = component.el.object3DMap.text.geometry.visibleGlyphs
      let gliphs = component.label.object3DMap.text.geometry.visibleGlyphs
      
      // let last = gliphs[gliphs.length-1]
      let last = gliphs[length-1]
      let lastPosition = last.position[0]
      let lastWidth    = last.data.width
      let end = lastPosition+lastWidth
*/

      // let assumed = 370
      // let factor = component.label.getAttribute('width') / assumed
      // let padding = 0
      // let position = width * factor - padding

      // console.log("width in meters: "+position )

      // component.blinker.setAttribute('position', position+" 0.28 0")
      component.blinker.setAttribute('value', value+"|")
      component.blinker.setAttribute('visible', 'true')
      this.blinkerVisible = true
  },

  //A-Frame calls 'update' when the HTML attributes are changed
  update: function (oldData) {
    console.log('input update')

    //at creation time there is no data, so we ignore the invocation
    if(Object.keys(oldData).length === 0){
      return
    }

    //for now we just care the for attribute 'value'
    if(this.data.value != oldData.value){
      this.setValue(this.data.value)

      //when the value changes we sync with the editor
      syncEditor()
    }
  },

  setFunctionOnUpdate: function(action) {
    this.onupdate = action
  }


/*
    blink: function() {
      let that = this;
      if (!this.isFocused) {
        that.cursor.setAttribute('visible', false);
        clearInterval(this.cursorInterval);
        this.cursorInterval = null;
        return
      }
      this.cursorInterval = setInterval(function(){
        that.cursor.setAttribute('visible', !that.cursor.getAttribute('visible'));
      }, 500);
    },
    isFocused: false,
    focus: function(noemit) {
      if (this.isFocused) { return; }
      this.isFocused = true;
      this.cursor.setAttribute('visible', true);
      this.blink();
      Event.emit(this.el, 'focus');
      if (!noemit) { Event.emit(document.body, 'didfocusinput', this.el); }
    },
    blur: function(noemit) {
      if (!this.isFocused) { return; }
      this.isFocused = false;
      if (this.cursorInterval) {
        clearInterval(this.cursorInterval);
        this.cursorInterval = null;
      }
      this.cursor.setAttribute('visible', false);
      Event.emit(this.el, 'blur');
      if (!noemit) { Event.emit(document.body, 'didblurinput', this.el); }
    },
    appendString: function(data) {
      if(data === '\n') {
        return this.blur();
      }
      let str = this.el.getAttribute("value");
      if (!str) { str = "" }
      str = str+data;
      this.el.setAttribute("value", str)
      Event.emit(this.el, 'change', str);
    },
    deleteLast: function() {
      let str = this.el.getAttribute("value");
      if (!str) { str = "" }
      str = str.slice(0, -1);
      this.el.setAttribute("value", str)
      Event.emit(this.el, 'change', str);
    },
    updateText: function() {
      let that = this;
      let padding = {
        left: 0.021,
        right: 0.021
      };
  
      let props = {
        color: this.data.color,
        align: this.data.align,
        side: this.data.side,
        tabSize: this.data.tabSize,
        wrapCount: 24*this.data.width,
        width: this.data.width
      }
  
      // Make cursor stop blinking when typing..
      // (and blinking again after typing stop).
      let attr = this.text.getAttribute("text");
      if (attr) {
        if (this.data.value !== attr.value) {
          if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
            this.cursorInterval = null;
          }
          if (this.cursorTimer) {
            clearTimeout(this.cursorTimer);
            this.cursorTimer = null;
          }
          this.cursor.setAttribute('visible', true);
          this.cursorTimer = setTimeout(function(){
            that.blink();
          }, 50);
        }
      }
  
      // Max length
      if (this.data.maxLength) {
        props.value = this.data.value.substring(0, this.data.maxLength);
        this.el.setAttribute('value', props.value)
      } else {
        props.value = this.data.value;
      }
  
      if (this.data.type === "password") {
        props.value = "*".repeat(this.data.value.length);
      }
  
      if (this.data.font.length) { props.font = this.data.font }
      if (this.data.letterSpacing) { props.letterSpacing = this.data.letterSpacing; }
      if (this.data.lineHeight.length) { props.lineHeight = this.data.lineHeight; }
      this.text.setAttribute('visible', false);
      this.text.setAttribute("text", props);
  
      function getTextWidth(el, data, trimFirst, _widthFactor) {
        if (!el.object3D || !el.object3D.children || !el.object3D.children[0]) { return 0; }
        let v = el.object3D.children[0].geometry.visibleGlyphs;
        if (!v) { return 0; }
        v = v[v.length-1];
        if (!v) { return 0; }
        if (v.line) {
          if (trimFirst) {
            data.value = data.value.substr(1);
          } else {
            data.value = data.value.slice(0, -1);
          }
          el.setAttribute("text", data);
          return getTextWidth(el, data, trimFirst);
        } else {
          if (!_widthFactor) { _widthFactor = Utils.getWidthFactor(el, data.wrapCount); }
          v = (v.position[0] + v.data.width) / (_widthFactor/that.data.width);
          let textRatio = (v+padding.left+padding.right) / that.data.width;
  
          if (textRatio > 1) {
            if (trimFirst) {
              data.value = data.value.substr(1);
            } else {
              data.value = data.value.slice(0, -1);
            }
            el.setAttribute("text", data);
            return getTextWidth(el, data, trimFirst, _widthFactor);
          }
        }
        return v;
      }
  
  
      if (props.value.length) {
        this.placeholder.setAttribute('visible', false);
      } else {
        this.placeholder.setAttribute('visible', true);
      }
  
      let placeholder_props = Utils.clone(props);
      placeholder_props.value = this.data.placeholder;
      placeholder_props.color = this.data.placeholderColor;
      this.placeholder.setAttribute("text", placeholder_props);
  
      setTimeout(function() {
        if (that.text.object3D) {
          let children = that.text.object3D.children;
          if (children[0] && children[0].geometry && children[0].geometry.visibleGlyphs) {
            let v = 0;
            if (children[0].geometry.visibleGlyphs.length) {
              v = getTextWidth(that.text, props, true);
              that.text.setAttribute('visible', true);
            }
            that.cursor.setAttribute('position', v+padding.left+' 0 0.003');
          } else {
            that.cursor.setAttribute('position', padding.left+' 0 0.003');
          }
        } else {  that.cursor.setAttribute('position', padding.left+' 0 0.003'); }
        getTextWidth(that.placeholder, placeholder_props);
      }, 0)
  
      this.background.setAttribute('color', this.data.backgroundColor)

      this.background.setAttribute('width', this.data.width);
      //this.background.setAttribute('position', this.data.width/2+' 0 0');
      this.background.setAttribute('position', '0 -0.09 0.001');
      this.text.setAttribute('position', padding.left-0.001+this.data.width/2+' 0 0.002');
      this.placeholder.setAttribute('position', padding.left-0.001+this.data.width/2+' 0 0.002');
    },
    updateCursor: function() {
      this.cursor.setAttribute('width', this.data.cursorWidth)
      this.cursor.setAttribute('height', this.data.cursorHeight)
      this.cursor.setAttribute('color', this.data.cursorColor);
    },
    update: function () {
      let that = this;
      setTimeout(function() {
      //  Utils.updateOpacity(that.el, that.data.opacity);
      }, 0)
  
      this.updateCursor();
      this.updateText();
    },
    tick: function () {},
    remove: function () {},
    pause: function () {},
    play: function () {}
*/
  });
  
  AFRAME.registerPrimitive('a-input', {
    defaultComponents: {
      input: {}
    },
    mappings: {
      value: 'input.value',
      name: 'input.name',
      disabled: 'input.disabled',
    //   color: 'input.color',
    //   align: 'input.align',
    //   font: 'input.font',
    //   'letter-spacing': 'input.letterSpacing',
    //   'line-height': 'input.lineHeight',
    //   'opacity': 'input.opacity',
    //   'side': 'input.side',
    //   'tab-size': 'input.tabSize',
    //   placeholder: 'input.placeholder',
    //   'placeholder-color': 'input.placeholderColor',
    //   'max-length': 'input.maxLength',
    //   type: 'input.type',
      width: 'input.width',
    //   'cursor-width': "input.cursorWidth",
    //   'cursor-height': "input.cursorHeight",
    //   'cursor-color': "input.cursorColor",
    //   'background-color': 'input.backgroundColor',
    //   'background-opacity': 'input.backgroundOpacity'
    }
  });


  /*
  function getTextWidth(el, data, trimFirst, _widthFactor) {
    if (!el.object3D || !el.object3D.children || !el.object3D.children[0]) { return 0; }
    let v = el.object3D.children[0].geometry.visibleGlyphs;
    if (!v) { return 0; }
    v = v[v.length-1];
    if (!v) { return 0; }
    if (v.line) {
      if (trimFirst) {
        data.value = data.value.substr(1);
      } else {
        data.value = data.value.slice(0, -1);
      }
      el.setAttribute("text", data);
      return getTextWidth(el, data, trimFirst);
    } else {
      if (!_widthFactor) { _widthFactor = getWidthFactor(el, data.wrapCount); }
      v = (v.position[0] + v.data.width) / (_widthFactor/that.data.width);
      let textRatio = (v+padding.left+padding.right) / that.data.width;

      if (textRatio > 1) {
        if (trimFirst) {
          data.value = data.value.substr(1);
        } else {
          data.value = data.value.slice(0, -1);
        }
        el.setAttribute("text", data);
        return getTextWidth(el, data, trimFirst, _widthFactor);
      }
    }
    return v;
  }

  function  getWidthFactor(el, wrapCount) {
    let widthFactor = 0.00001;
    if (el.components.text && el.components.text.currentFont) {
      widthFactor = el.components.text.currentFont.widthFactor
      widthFactor = ((0.5 + wrapCount) * widthFactor);
    }
    return widthFactor;
  }
  */