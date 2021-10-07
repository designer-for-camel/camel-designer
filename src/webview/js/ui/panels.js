var html = `
<a-form handgrip id="ui-route-rename" position="-1 0 -2.5">
  <a-plane-rounded opacity=".5" width="2" height="1" radius="0.05" color="grey">
  </a-plane-rounded>
  <a-entity scale=".3 .3 .3">
    <a-text font="roboto" align="center" position="3.5 2.5 0" scale="2 2 2" value="Rename Route"></a-text>
    <a-text   position="1 1.25 0" value="Name: "></a-text>
    <a-input  position="2   1.25 0" width="3" value="value 1"></a-input>
    <a-button position="5.6 1.25 0" onclick="renameActiveRoute(this.previousElementSibling.getAttribute('value'));this.parentEl.parentEl.components.form.setActive(false)"></a-button>
  </a-entity>
</a-form>

<a-form handgrip id="ui-config-aggregate" position="-1 -1.5 -2" active="false">
  <a-plane-rounded id="3d-config-aggr" opacity=".5" width="6" height="3.1" radius="0.05" scale="0.3 0.3 0.3" color="grey">
  </a-plane-rounded>
  <a-entity scale=".3 .3 .3">
    <a-text     position="1.1 2.5 0" value="Expression language: "></a-text>
    <a-dropdown position="3.8 2.5 0" 
                menu='{"name":"uidropdown","label":"testmenu","class":"ui","enabled":true,"menu":[{"label":"simple","function":"createHeader"},{"label":"constant","function":"createProperty"},{"label":"xpath","function":"xpath"}]}'></a-dropdown>

    <a-checkbox position="4.5 2.5 0" width="1" name="stuff" label="saxon" checked="false"></a-checkbox>
    <a-input position="1 2 0" placeholder="Username" color="black" width="4" value="value 2"></a-input>
    
    <a-text align="right" position="2 1.25 0" value="strategyRef"></a-text>
    <a-input position="2.1 1.25 0" placeholder="Username" color="black" width="2" value="value 1"></a-input>

    <a-text  align="right" position="2 0.75 0" value="completionSize"></a-text>
    <a-input position="2.1 0.75 0" placeholder="Username" color="black" width="2" value="value 2"></a-input>
  </a-entity>
</a-form>
`;

document.getElementById('main-camera').insertAdjacentHTML('beforeend', html);