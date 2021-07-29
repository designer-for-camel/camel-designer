# *Apache Camel* Visual Designer

Implement [*Apache Camel*](https://camel.apache.org/) integrations using a visual designer (powered by [*A-Frame*](https://aframe.io)). The visual tool synchronises the text editor *on-the-fly* generating XML source code containing the *CamelContext* definition translated from the graphical flows.

> **EARLY PROTOTYPE**: \
Please bear in mind this *VSCode* extension is in 'early-prototype' phase and is yet not functional. It helps playing with ideas on how the initiative can progress.

![Overview](docs/images/readme/vs-extension.gif)


## Feature highlights

* Easy visual design of processing flows
* Organise activities and groups with drag & drop
* REST definitions
* Click in the text editor to:
  - switch between routes
  - select activities to configure
* Predefined EIPs (e.g. *Choice* / *Split*)
* DataFormat definitions
* Error handling with Try/Catch/Finally statements
* Open Camel XML files and render visually.
* Trace live Camel Exchanges
* Extend *Camel Designer* with new custom consumers/producers
* Support for Spring-XML/Blueprint-XML/Camel-K/Camel-2/Camel-3


## Using the extension

To start using the extension and generate your Camel definitions:

1. In VS Code, create a new workspace.
2. From the menu, select **File > New File**
3. To activate the designer view button, change the file language to XML, by either:
    - clicking on the language in the status bar (bottom right corner)
    - pressing the keys (Mac) <kbd>⌘</kbd>+<kbd>K</kbd> then <kbd>M</kbd>, (Windows) <kbd>Ctrl</kbd>+<kbd>K</kbd> then <kbd>M</kbd>
4. The preview button will appear (top right), click on it as shown in the extension animation above.
5. The Designer view will load, you can now model you Camel definitions.

## How-To guide

To get more familiar with the available functionality, check the [*HOW-TO*](./docs/how-to.md) guide which includes step by step details and helpful animations.

## Pending code improvements

- Current XML rendering for Camel routes uses 3D objects to navigate.
  Applying an XSLT transform on the HTML nodes might improve the process to rendering the source code. 

## List of future candidate features

- option to create 2/3/4 ways in choices and forks
- possibility to add comments
- scrolling controls, zoom in/out controls, general UI improvements 

## Known Issues

- Code synchronisation between editor and designer is to be completed. Changes on designer will reflect on the editor but changes in the editor will not reflect on the designer view.
- add/delete activities mid-flow not always possible, review needed.
- Only limited Camel blocks are supported, more will be implemented. For now, unsupported blocks will show red and a question mark. 

</br>

---

## Release Notes

Check release details in the [*CHANGELOG.md*](./CHANGELOG.md) file.



---

