# Change Log


## 0.1.0

- Initial release
- Definition of REST Apis
- Definition of Camel routes
- 3D models rendered in Camel XML files
- Camel XML definitions rendered into 3D models
- add/delete activities mid-flow
- Flow navigation from text editor
- Double click on Direct activities opens targeted Route
- Configurable activities
- choice paths
- parallel paths
- Support to accommodate unimplemented Camel patterns.

## 0.1.1

- suppressed 'showDesigner' from command palette

## 0.1.2

- added search tags

## 0.2.0

- Activity positions now persisted in JSON metadata file (same file name with suffix ".metadata")
- Processing of `<choice>` element has been rewritten, allowing nested nodes and multiple branches
- Default Camel syntax is Camel 3. If imported source is Camel 2, it tries to auto-detect and switch to Camel 2
- Initial implementation for handling Spring XML and Blueprint XML. 
- Initial support for `<routeContext>` files and `<routes>` (Camel-K) files

## 0.3.0

- Initial implementation to provide help adding expression variables in configuration panels
- Progress done with functionality on 'from' activities
- Introduction to the concept of predefined 'kits' (blocks with multiple activities)
    - json to xml
    - xml to json
- fix: can delete activity that follows 'from'
- code rewrite to define a reusable 'expression' component
- code rewrite to define a reusable 'expression' configuration panel
- new button interface layout

## 0.4.0

- fix: issue on concurrent expressions initialising
- fix: camera movement for REST methods
- REST parsing is now aware of inner route definitions which get moved out as normal routes with 'from' element
- new 'uri' (a-frame) component which provides uri handling functionality to activities
- new 'hint' (a-frame) component to create tutorial hints to the user on how to use the interface
- new Kafka endpoint to send/receive kafka messages
- new File endpoint to read/write data from/to filesystem
- detach/reattach activities:
  1. press SHIFT to discover (highlighted in yellow) detachable activities.
  2. press SHIFT + MOUSE-click to detach.
  3. to reattach an activity, drag'n'drop on a link.

## 0.4.1

- fix: issue loading routes with no id

## 0.4.2

- included 'method' as an optional expression language in setter activities

## 0.5.0

- Initial implementation of unit testing process, browser dependant at the moment.
- Initial implementation of Camel tracing via Jolokia, and visually displaying results.
- new 'how-to' guide to help new users getting up to speed
- fix: issue when saving workspace files. Now only Camel XML should save a '.metadata' file.

## 0.6.0

- Mouse 3D interaction has been rewritten (using raycaster) to accurately pinpoint 3D entities
- Drag'n'Drop effect has been rewritten to freely work with entities inside/outside other entities
- Double click behaviour has been rewritten to fit with the new mouse interaction.
- Introduced 'Activity Groups' (sequence of activities forming a unit, e.g. splits, loops, etc.)
- Introduced 'Try-Catch-Finally' definitions to provide initial error handling capabilities.
- Introduced 'Split' definitions (EIP pattern)
- test