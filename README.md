# *Apache Camel* visual designer

Implement *Apache Camel* routes using a visual designer. It synchronises the editor on-the-fly generating XML source code containing the *CamelContext* and all the routes graphically defined.

> **EARLY PROTOTYPE**: \
Please bear in mind this *VSCode* extension is in 'early-prototype' phase and is yet not functional. It helps playing with ideas on how the initiative can progress.


![feature X](docs/images/readme/vs-extension.gif)


## Features

* Easy processing flow design
* Drag & drop activities to organise them
* Create multiple routes (process flows)
* Connect flows using the 'direct' activity
* Configure activities
* Create parallel flows
* Create *Choice* flows


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
- Current XML rendering for Camel routes is too complicated, navigating via 3D objects.
  applying an XSLT transform on the HTML nodes might do the trick and vastly simplifying the task. 

## List of future candidate features

- Ability to open in Designer view saved XML definitions.
- create wire tap activity
- create Transform activity (entity with box and triangle alternating)
- option to create 2/3/4 ways in choices and forks
- align VR/mouse controllers
- option on/off to move/work
- navigation buttons (e.g. left/right with slide animations effect) 
- (started) import Camel XML files to 3D models

## Known Issues

- Code synchronisation between editor and designer is to be completed. Changes on designer will reflect on the editor but changes in the editor will not reflect on the designer view.
- Designer panel gets lost and reset if panel is hidden.
- add/delete activities mid-flow not always possible, review needed.
- add choice in mid step not clean, to reproduce: from(),log1(),log2(), from log1 do choice()
- adding steps from start not working
- (fixed?) mouse drag-n-drop not great, has jumps, please make smooth
- (fixed?) sometimes positions are not in sync, is there anything possible to do to fix?
- (fixed?) nextPos sometimes jumps to far ahead.
- (fixed?) choices are not created with symetric shape and distances 

</br>

---

## Release Notes

### 0.0.1

The focus of this release has been to integrate the Browser based Designer with VSCode as an webview extension.

The following list describes the work done on the graphical Designer:
- use "call to: route" on direct calls
- export 3D models to Camel XML files
- add/delete activities mid-flow
- conditions on choices
- follow head of route with camera
- information Arrow on Direct activities
- multiple FROMs
- circle activity under configuration
- choice paths
- parallel paths
- pre-head buttons with category labels (from/to), and replace with timer/log

### 1.0.0

Not there yet... one day.

---

