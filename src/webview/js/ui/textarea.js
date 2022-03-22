/* global AFRAME */

if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
  }
  
  /**
   * Textarea component for A-Frame.
   */
  AFRAME.registerComponent('textarea', {
    schema: {
      cols: {type: 'int', default: 40},
      rows: {type: 'int', default: 20},
      color: {type: 'color', default: 'black'},
      backgroundColor: {type: 'color', default: 'white'},
      disabledBackgroundColor: {type: 'color', default: 'lightgrey'},
      disabled: {type: 'boolean', default: false},
      content: {type: 'string', default: ''}
    },
    init: function () {
      this.text = null;
      this.lines = [];
      this.lastBlink = 0;
      this.blinkEnabled = !this.data.disabled;
      this.charWidth = this.charHeight = null;
      this.selectionStart = this.selectionEnd = 0;
      this.endIndexInfo = this.startIndexInfo = null;
      this.origin = {x: 0, y: 0};
  
      this.background = document.createElement('a-plane');
    //   this.background = document.createElement('a-plane-rounded');
      this.background.setAttribute('color', this.data.disabled ? this.data.disabledBackgroundColor : this.data.backgroundColor);
      // this.background.setAttribute('clickable')
    //   this.background.setAttribute('dragndrop')
      this.background.classList.add('interactive')
      this.el.appendChild(this.background);
  


      this.textAnchor = document.createElement('a-entity');
      this.el.appendChild(this.textAnchor);
      this.textAnchor.setAttribute('text', {
        // mode: 'pre',
        baseline: 'top',
        anchor: 'center',
        font: 'dejavu',
        wrapCount: this.data.cols,
        height: this.data.rows,
        color: this.data.color
      });
    //   this.textAnchor.object3D.renderOrder = 1
  
      this._initTextarea();
  
      this._initCursor();
  
      this.el.addEventListener('textfontset', this._updateCharMetrics.bind(this));
      this.el.addEventListener('char-metrics-changed', this._updateIndexInfo.bind(this));
this.el.addEventListener('char-metrics-changed', this._updateCursorGeometry.bind(this));
      this.el.addEventListener('text-changed', this._updateLines.bind(this));
      this.el.addEventListener('text-changed', this._updateDisplayText.bind(this));
      this.el.addEventListener('selection-changed', this._updateIndexInfo.bind(this));
      this.el.addEventListener('selection-changed', this._updateCursorStyle.bind(this));
this.el.addEventListener('selection-changed', this._updateCursorGeometry.bind(this));
      this.el.addEventListener('selection-changed', this._updateHorizontalOrigin.bind(this));
      this.el.addEventListener('lines-changed', this._updateIndexInfo.bind(this));
      this.el.addEventListener('index-info-changed', this._updateOrigin.bind(this));
this.el.addEventListener('index-info-changed', this._updateCursorGeometry.bind(this));
      this.el.addEventListener('index-info-changed', this._updateHorizontalOrigin.bind(this));
this.el.addEventListener('origin-changed', this._updateCursorGeometry.bind(this));
      this.el.addEventListener('origin-changed', this._updateDisplayText.bind(this));
      this.el.addEventListener('click', this.focus.bind(this));

    //   this.focus()
    //   this.tick()
    //   this.focusout()


      this.hide()
    },
    update: function (oldData) {
      if (this.data.content !== oldData.content) {
        this._updateTextarea();
      }
  
      if (this.data.backgroundColor !== oldData.backgroundColor || this.data.disabledBackgroundColor !== oldData.disabledBackgroundColor) {
        this.background.setAttribute('color', this.data.disabled ? this.data.disabledBackgroundColor : this.data.backgroundColor);
      }
  
      if (this.data.disabled !== oldData.disabled) {
        this.blinkEnabled = !this.data.disabled;
        this.textarea.disabled = this.data.disabled;
        this.cursorMesh.visible = !this.data.disabled;
        this.background.setAttribute('color', this.data.disabled ? this.data.disabledBackgroundColor : this.data.backgroundColor);
      }

      if (this.data.rows !== oldData.rows) {
        this.textarea.rows = this.data.rows;
        this.textAnchor.setAttribute('position', {x: 0, y: this.charHeight * this.data.rows / 2, z: 0});
        this.background.setAttribute('scale', {x: 1.05, y: this.charHeight * this.data.rows * 1.05, z: 1});  

        // this.background.setAttribute('scale', {
        //   x: this.charWidth  * this.data.cols * 1.05,
        //   y: this.charHeight * this.data.rows * 1.05,
        //   z: 1});
      }


      if(this.data.cols !== oldData.cols) {
        this.textAnchor.setAttribute('text', 'wrapCount', this.data.cols)
        // this._updateTextarea();
        this.textarea.cols = this.data.cols;
        if(this.textAnchor.components.text.geometry){
          this._updateCharMetrics();
        }
        
        this._updateCursorStyle()


        this.background.setAttribute('scale', {x: 1.05, y: this.charHeight * this.data.rows * 1.05, z: 1});  
        // this.textAnchor.setAttribute('text', 'width', this.charWidth  * this.data.cols * 1.05,)
        // this.background.setAttribute('scale', {
        //     x: this.charWidth  * this.data.cols * 1.05,
        //     y: this.charHeight * this.data.rows * 1.05,
        //     z: 1});

        // this._updateCharMetrics();
      }

    },

    focus: function (event) {
      if(event){
        event.stopPropagation()
      }
      this.textarea.focus();
      this.blinkEnabled = true
      this.hasFocus = true
      this.cursorMesh.visible = true
      this._updateCursorStyle()
    },
    focusout: function () {
      console.log('lost focus')
        this.cursorMesh.visible = false
        this.hasFocus = false
        this.blinkEnabled = false

      // if(this.currentbinding){
      //   let simulatedEvent = {keyCode: 13}
      //   this.
      // }

    },
    _initTextarea: function () {
      this.textarea = document.createElement('textarea');
      document.body.appendChild(this.textarea);
      this._updateTextarea();
      this.textarea.addEventListener('focusout', this.focusout.bind(this));
    },
    _updateTextarea: function () {
      this.textarea.style.whiteSpace = 'pre';
      this.textarea.style.overflow = 'hidden';
      this.textarea.style.opacity = '0';
      //this.textarea.style.opacity = '0.5';
  
      this.textarea.cols = this.data.cols;
      this.textarea.rows = this.data.rows;
      this.textarea.value = this.data.content;
      this.textarea.selectionStart = 0;
      this.textarea.selectionEnd = 0;
  
      this._updateIndexInfo();
    },
    _initCursor: function () {
      this.cursor = document.createElement('a-entity');
      this.cursorGeo = new THREE.PlaneGeometry(1, 1);
      this.cursorMat = new THREE.MeshBasicMaterial({
        // color: 'black',
        color: this.data.color,
        transparent: true,
        opacity: 0.5,
        //depthWrite: false
      });
      this.cursorMesh = new THREE.Mesh(this.cursorGeo, this.cursorMat);
      window.cursorMesh = this.cursorMesh;
      this.cursor.setObject3D('mesh', this.cursorMesh);
      this.el.appendChild(this.cursor);
      this.cursorMesh.visible = false
      this.hasFocus = false
    },

    _emit: function (eventName, detail) {
      this.el.emit(eventName, detail);
    },

    _updateCharMetrics: function (event) {
      // geometry.layout._opt.font.widthFactor
      const layout = this.textAnchor.components.text.geometry.layout;
      // const fontWidthFactor = event.detail.fontObj.widthFactor;
      const fontWidthFactor = layout._opt.font.widthFactor;
      this.charWidth = fontWidthFactor * this.textAnchor.object3DMap.text.scale.x;
      this.charHeight = this.charWidth * layout.lineHeight / fontWidthFactor;
      this.textAnchor.setAttribute('position', {x: 0, y: this.charHeight * this.data.rows / 2, z: 0});
      this.background.setAttribute('scale', {x: 1.05, y: this.charHeight * this.data.rows * 1.05, z: 1});
      // this.background.setAttribute('scale', {
      //   x: this.charWidth  * this.data.cols * 1.05,
      //   y: this.charHeight * this.data.rows * 1.05,
      //   z: 1});
      

      this.background.setAttribute('position', {x: 0, y: 0, z: 0});
      this._emit('char-metrics-changed');
    },

    _checkAndUpdateSelection: function () {
      if (
              this.selectionStart === this.textarea.selectionStart &&
              this.selectionEnd === this.textarea.selectionEnd
          ) {
        return;
      }
  
      const lastStart = this.selectionStart;
      const lastEnd = this.selectionEnd;
  
      this.selectionStart = this.textarea.selectionStart;
      this.selectionEnd = this.textarea.selectionEnd;
  
      this._emit('selection-changed', {
        start: {old: lastStart, new: this.selectionStart, changed: this.selectionStart !== lastStart},
        end: {old: lastEnd, new: this.selectionEnd, changed: this.selectionEnd !== lastEnd}
      });
    },
    tick: function (time) {

    //   if(!this.hasFocus){
    //       this.cursorMesh.visible = false
    //   }

      if (time - this.lastBlink > 500 && this.blinkEnabled) {
        this.cursorMesh.visible = this.hasFocus && !this.cursorMesh.visible;
        this.lastBlink = time;
      }
      this._checkAndUpdateSelection();
      this._checkAndUpdateText();
    },
    _getIndexInfo: function (lineIndex, textIndex) {
      const y = Math.max(0, lineIndex);
      const line = this.lines[y];
      const x = textIndex - line.start;
      return {
        line: line,
        x: x * this.charWidth,
        y: -this.charHeight * y + -this.charHeight / 2
      };
    },
    _updateIndexInfo: function () {
      if (!this.lines.length) {
        return;
      }
      const lastStart = this.startIndexInfo && this.startIndexInfo.line.index;
      const lastEnd = this.endIndexInfo && this.endIndexInfo.line.index;
      this.startIndexInfo = null;
      this.endIndexInfo = null;
      var i;
      var startChanged = false;
      var endChanged = false;
      for (i = 0; i <= this.lines.length; i++) {
        const prevLine = this.lines[i - 1];
        const lineStart = i === this.lines.length ? (prevLine.start + prevLine.length + 1) : this.lines[i].start;
        if (lineStart > this.selectionStart && !this.startIndexInfo) {
          this.startIndexInfo = this._getIndexInfo(i - 1, this.selectionStart);
          if (this.startIndexInfo.line.index !== lastStart) {
            startChanged = true;
          }
        }
        if (lineStart > this.selectionEnd) {
          this.endIndexInfo = this._getIndexInfo(i - 1, this.selectionEnd);
          if (this.endIndexInfo.line.index !== lastEnd) {
            endChanged = true;
          }
          break;
        }
      }
      if (startChanged || endChanged) {
        this._emit('index-info-changed', {
          start: {changed: startChanged},
          end: {changed: endChanged}
        });
      }
    },
    _updateOrigin: function (event) {
      var changed = false;
      if (event.detail.end.changed) {
        const end = this.origin.y + this.data.rows - 1;
        if (this.endIndexInfo.line.index > end) {
          this.origin.y = this.endIndexInfo.line.index + 1 - this.data.rows;
          changed = true;
        } else if (this.endIndexInfo.line.index < this.origin.y) {
          this.origin.y = this.endIndexInfo.line.index;
          changed = true;
        }
      }
      if (event.detail.start.changed) {
        if (this.startIndexInfo.line.index < this.origin.y) {
          this.origin.y = this.startIndexInfo.line.index;
          changed = true;
        }
      }
      if (changed) {
        this._emit('origin-changed');
      }
    },
    _updateHorizontalOrigin: function (event) {
      if (!this.endIndexInfo) {
        return;
      }
      var changed = true;
      if (event.detail.end.changed) {
        const endIndex = this.selectionEnd - this.endIndexInfo.line.start;
        if (endIndex > this.origin.x + this.data.cols) {
          this.origin.x = endIndex - this.data.cols;
          changed = true;
        } else if (endIndex < this.origin.x) {
          this.origin.x = endIndex;
          changed = true;
        }
      }
      const startIndex = this.selectionStart - this.startIndexInfo.line.start;
      if (event.detail.start.changed) {
        if (startIndex > this.origin.x + this.data.cols) {
          this.origin.x = startIndex - this.data.cols;
          changed = true;
        } else if (startIndex < this.origin.x) {
          this.origin.x = startIndex;
          changed = true;
        }
      }
      if (changed) {
        this._emit('origin-changed');
      }
    },
    _updateCursorStyle: function () {
      if (this.selectionStart === this.selectionEnd) {
        this.blinkEnabled = true;
        // this.cursorMat.color.setStyle('black');
        this.cursorMat.color.setStyle(this.data.color);
        // this.cursorMat.color.setStyle('white');
        // this.cursorMat.transparent = true;
        // this.cursorMesh.visible = true;
    } else {
        this.blinkEnabled = false;
        // this.cursorMat.color.setStyle('white');
        this.cursorMat.color.setStyle('blue');
        // this.cursorMesh.visible = true;
        // this.cursorMat.transparent = true;
      }

      this.cursorMesh.visible = this.hasFocus;
    },
    
    _updateCursorGeometry: function () {
        if (!this.startIndexInfo) {
            return;
        }
        //   this.cursorMesh.geometry = new THREE.Geometry();
        // this.cursorMesh.geometry = new THREE.BufferGeometry()

        const startLine = Math.max(this.origin.y, this.startIndexInfo.line.index);
        const endLine = Math.min(this.origin.y + this.data.rows - 1, this.endIndexInfo.line.index);
        const maxIndex = this.origin.x + this.data.cols;

        let geometry = null
        let geometries = []

        for (var i = startLine; i <= endLine; i++) {
            // const mesh = new THREE.Mesh(this.cursorGeo, this.cursorMat);
            var size;
            var offset = 0;
            if (endLine === startLine) {
                offset = Math.max(this.origin.x, this.selectionStart - this.startIndexInfo.line.start);
                const end = Math.min(maxIndex, this.selectionEnd - this.startIndexInfo.line.start);
                size = Math.max(0.2, end - offset)
            } 
            else {
                var end;
                if (i === this.startIndexInfo.line.index) {
                    offset = Math.max(this.origin.x, this.selectionStart - this.startIndexInfo.line.start);
                    end = Math.min(maxIndex, this.startIndexInfo.line.length);
                } 
                else if (i === this.endIndexInfo.line.index) {
                    offset = this.origin.x;
                    end = Math.min(maxIndex, this.selectionEnd - this.endIndexInfo.line.start);
                } 
                else {
                    offset = this.origin.x;
                    end = Math.min(maxIndex, this.lines[i].length);
                }
                size = end - offset;
            }

            //new geometry, with new dimensions (cursor or selection)
            geometry = new THREE.PlaneGeometry(this.charWidth * size, this.charHeight);

            //shift the geometry's position (when merging geometries, each geometry represents a line)
            setGeometryPosition(geometry,                
                    offset * this.charWidth + this.charWidth * size / 2 - 0.5 - this.origin.x * this.charWidth,
                    -i * this.charHeight + (this.charHeight * this.data.rows) / 2 - this.charHeight / 2 + this.origin.y * this.charHeight,
                    .002
                )

            //keep geometry for merge process
            geometries.push(geometry)
        }

        //new Mesh
        let resultMesh = new THREE.Mesh(THREE.BufferGeometryUtils.mergeBufferGeometries(geometries), this.cursorMat)

        //keep old geometry
        let oldGeometry = this.cursorMesh.geometry

        //update with new mesh
        this.cursorMesh = resultMesh
        this.cursor.setObject3D('mesh',this.cursorMesh)

        //dispose of older geometry
        oldGeometry.dispose()
    },

    _updateLines: function () {
      this.lines = [];
      const lines = this.text.split('\n');
      var counter = 0;
      for (var i = 0; i < lines.length; i++) {
        this.lines[i] = {
          index: i,
          length: lines[i].length,
          start: counter
        };
        counter += lines[i].length + 1;
      }
      this._emit('lines-changed');
    },

    _getViewportText: function () {
      return this.text.split('\n').slice(this.origin.y, this.origin.y + this.data.rows)
        .map(function (line) {
          return line.substr(this.origin.x, this.data.cols) || ' ';
        }.bind(this)).join('\n');
    },

    _updateDisplayText: function () {
      this.textAnchor.setAttribute('text', {
        value: this._getViewportText()
      });
    },
    _checkAndUpdateText: function () {
      const text = this.textarea.value;
      if (text === this.text) {
        return;
      }
      this.text = text;
      this._emit('text-changed');
    },



    //invokes callback with current text
    callbackOnInput: function(callback, e){
      //when the user presses enter
      if (e.keyCode === 13){
        callback(this.textarea.value)
        e.preventDefault();

        this.textarea.removeEventListener('keydown',  this.currentbinding)
        this.textarea.removeEventListener('focusout', this.currentbinding)
        this.currentbinding = null

        this.hide()
      }
      //when the user clicks somewhere else
      else if(e.type == "focusout"){
        callback(this.textarea.value)
        this.textarea.removeEventListener('keydown',  this.currentbinding)
        this.textarea.removeEventListener('focusout', this.currentbinding)
        this.currentbinding = null
        this.hide()
      }
    },

    //deactivates and hides the textarea
    hide: function(){
      this.background.classList.remove('interactive')
      this.el.setAttribute("visible", false)
    },

    //makes the textarea behave as an input box: one line text input element.
    setInputMode: function(content, maxlength, callback){
      this.textarea.value = content
      // this.text = 
      this.el.setAttribute("scale", "2.2 2.2 2.2")
      this.el.setAttribute("cols", "18")
      this.el.setAttribute("rows", "1")
      // this.textarea.setAttribute("wrap", "soft")

      if(maxlength){
        this.textarea.setAttribute("maxlength", maxlength)
      }
      else{
        this.textarea.removeAttribute("maxlength")
      }

      this.background.classList.add('interactive')
      this.el.setAttribute("visible", true)

      this._emit('text-changed');

      // this.textarea.removeEventListener('keydown', this.currentbinding)
      this.currentbinding = this.callbackOnInput.bind(this, callback)
      this.textarea.addEventListener('keydown',  this.currentbinding);
      this.textarea.addEventListener('focusout', this.currentbinding);
    },

    //makes the textarea behave as a textarea element.
    setTextareaMode: function(content, callback, cols, rows){
      this.textarea.value = content
      this.el.setAttribute("cols", "60")
      this.el.setAttribute("rows", "4")
      // this.el.setAttribute("scale", "7.5 7.5 7.5")
      this.el.setAttribute("scale", "6.5 6.5 6.5")

      this.textarea.removeAttribute("maxlength")

      this.currentbinding = this.callbackOnInput.bind(this, callback)
      this.textarea.addEventListener('focusout', this.currentbinding);


      this.background.classList.add('interactive')
      this.el.setAttribute("visible", true)

      this._emit('text-changed');
    }


  });


function setGeometryPosition(geometry, x, y, z){
    let count = geometry.attributes.position.count
    let geoX,geoY,geoZ 
    for(let i=0; i<count; i++){
        geoX = geometry.attributes.position.getX(i)
        geoY = geometry.attributes.position.getY(i)
        geoZ = geometry.attributes.position.getZ(i)
        geometry.attributes.position.setX(i,geoX+x)
        geometry.attributes.position.setY(i,geoY+y)
        geometry.attributes.position.setZ(i,geoZ+z)
    }
}

AFRAME.registerPrimitive('a-textarea', {
    defaultComponents: {
        textarea: {}
    },
    mappings: {
        cols:                    "textarea.cols",
        rows:                    "textarea.rows",
        colortext:               "textarea.color",
        colorbackground:         "textarea.backgroundColor",
        colorbackgrounddisabled: "textarea.disabledBackgroundColor",
        disabled:                "textarea.disabled",
        textvalue:               "textarea.text",
    }
});