# *Apache Camel* Visual Designer

Implement [*Apache Camel*](https://camel.apache.org/) integrations using a visual designer (powered by [*A-Frame*](https://aframe.io)). The visual tool synchronises the text editor *on-the-fly* generating XML source code containing the *CamelContext* definition translated from the graphical flows.

> **EARLY PROTOTYPE**: \
Please bear in mind this *VSCode* extension is in 'early-prototype' phase and is yet not functional. It helps playing with ideas on how the initiative can progress.


![Overview](https://github.com/designer-for-camel/camel-designer/blob/master/docs/images/readme/vs-extension.gif)


## Feature highlights

* Easy visual design of processing flows
* Organise activities with drag & drop
* REST definitions
* Click in the text editor to navigate:
  - switch between routes
  - select activities to configure
* Configuration panels per activity
* Predefined sets (*Choice* / *Parallel*)
* Open Camel XML files and render visually.

### REST definitions

The Designer includes a REST designer where you an define groups of REST methods. As you create new REST elements, the tool translates into Camel REST DSL in the text editor.

![REST](https://github.com/designer-for-camel/camel-designer/blob/master/docs/images/readme/vs-extension-rest.gif)

### Navigation

From the text editor, click or use the arrow keys to navigate to the region of interest, and the Camel Designer will visually display the definition corresponding to the block of code selected.

![Navigation](https://github.com/designer-for-camel/camel-designer/blob/master/docs/images/readme/vs-extension-navigation.gif)


## Using the extension

To start using the extension and generate your Camel definitions:

1. In VS Code, create a new workspace.
2. From the menu, select **File > New File**
3. To activate the designer view button, change the file language to XML, by either:
    - clicking on the language in the status bar (bottom right corner)
    - pressing the keys (Mac) <kbd>⌘</kbd>+<kbd>K</kbd> then <kbd>M</kbd>, (Windows) <kbd>Ctrl</kbd>+<kbd>K</kbd> then <kbd>M</kbd>
4. The preview button will appear (top right), click on it as shown in the extension animation above.
5. The Designer view will load, you can now model you Camel definitions.

## Requirements

  Pending definition

## Extension Settings

  Pending definition


## Pending code improvements

- Current 'Drag & Drop' in Designer view lacks precision, it's not using a-frame/three.js native mechanisms.
  Needs to be replaced with native one.
- Current XML rendering for Camel routes uses 3D objects to navigate.
  Applying an XSLT transform on the HTML nodes might improve the process to rendering the source code. 

## List of future candidate features

- create Transform activity (entity with box and triangle alternating)
- option to create 2/3/4 ways in choices and forks
- align VR/mouse controllers
- option on/off to move/work
- navigation buttons (e.g. left/right with slide animations effect) 

## Known Issues

- Code synchronisation between editor and designer is to be completed. Changes on designer will reflect on the editor but changes in the editor will not reflect on the designer view.
- add/delete activities mid-flow not always possible, review needed.
- adding steps from start not working
- Only limited Camel blocks are supported, more will be implemented. For now, unsupported blocks will show red and a question mark. 

</br>

---

## Release Notes

### 0.1.0

The focus of this release has been to integrate the Browser based Designer with VSCode as an webview extension.

The following list describes the work done on the graphical Designer:
- use "call to: route" on direct calls
- export 3D models to Camel XML files
- import Camel XML files into 3D models
- add/delete activities mid-flow
- conditions on choices
- follow head of route with camera
- information Arrow on Direct activities
- multiple FROMs
- circle activity under configuration
- choice paths
- parallel paths
- REST definitions
- Support to accommodate unimplemented Camel patterns.

### 1.0.0

Not there yet... keep watching this space.

---

