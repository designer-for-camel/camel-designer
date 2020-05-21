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

## 0.X.X

- Initial implementation to provide help with expression variables in configuration panels