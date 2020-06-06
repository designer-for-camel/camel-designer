// npm needed:
//      npm i --save-dev chai
//      npm i --save-dev jsdom
//      npm i --save-dev --save-exact jsdom-global
//      npm i --save-dev canvas

// run test with:
//      ./node_modules/mocha/bin/mocha test-aframe/experimental/mock-webgl/unit.test.js -r jsdom-global/register

// current not working with message:
//      THREE.WebGLRenderer: Error creating WebGL context.

require('webgl-mock-threejs');

const { JSDOM } = require('jsdom');
var expect = require('chai').expect;

const options = {
    contentType: 'text/html',
    resources: 'usable',
    runScripts: 'dangerously'
  };

describe('my experiment', function() {

    let jsdom;
    before(async function() {
        // jsdom = await JSDOM.fromFile('/Users/bruno/workspace_vs-camel-editor/camel-designer/src/webview/index-debug.html', {
        jsdom = await JSDOM.fromFile('./test-aframe/experimental/mock-webgl/test.html', {
            resources: "usable",
            runScripts: "dangerously"
        });

        await new Promise(resolve =>
            jsdom.window.addEventListener("load", resolve)
        );
    });

 
    it('should return 0', function() {

        // jsdom.window.createDirectStart()

        expect(0).to.equal(0)
    })

})