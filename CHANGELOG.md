# Change Log

## 0.X.0

- Fix: smoother 3D input box when blinking. \
- Fix: WASD controls now always in-sync with camera position
- Fix: broken detach/attach functionality for some activities now resolved.
- Fix: Webview disposal revised and corrected.
- Fix: Prevent duplication of route IDs when loading source code.
- New navigation controls to move camera in scene with zoom in/out function.
- Scanning of header/property variables improved (includes parent/child routes)
- New HTTP/S endpoint using new configuration system
- All endpoints (to/toD) upgraded to use new configuration system
- Starting activities 'direct' and 'timer' now configurable.
- Split of REST and Route definitions for Camel Quarkus base code.


## 0.10.0

- New AtlasMap endpoint to create data mappings. \
  The endpoint integrates with the VSCode AtlasMap extension to open/create ADM files. \
  To properly integrate with AtlasMap ensure you have installed:
  - AtlasMap Data Transformation editor by Red Hat (minimum version 0.1.2)
- included in menu a 'help' category with access to 'how-to' documentation
- included in configuration panels access to 'how-to' documentation

## 0.9.2

- **IMPORTANT**: install this version for users on VSCode 1.62.x onwards.

- fix: VSCode version 1.62.x was breaking the extension due to unstable local resources loaders. Now the code uses the officially supported ```asWebviewUri``` method to load local resources.

## 0.9.1

- fix: Camel code switching wasn't working as expected (CamelK/Spring/Blueprint) \
  **Note**: improved, but not fully stable yet, code to be reviewed

## 0.9.0

- Introduced 'Aggregator' definitions (EIP pattern)
- Introduced 'Process' definitions (EIP pattern *Message Translator*)
- Introduced action to clean headers (in Camel `<removeHeaders/>`)
- New MAIL (SMTP) endpoint to send emails to mail server
- New G-DRIVE endpoint to interact with Google Drive APIs
- New G-SHEETS endpoint to interact with Google Sheets APIs
- `<choice>` statement improvements:
  - Menu includes option for 1/2/3 conditions (+1 for `<otherwise>` branch) \
    If more needed, add them in the code and reload the visual editor.
  - Vertical position of transition (choice --> activity) determines order of branches in the code \
  Drag'n'drop 1st branch activity to change order of conditions in the code.
- Default code generation now set to Camel K
- Menu option to switch Camel code type (under control menu)
- Menu option to select Camel route
- VR mode enabled (for browsers, not VSCode)
- Mouse and VR controllers alignment (same underlying implementation)- New 3D forms to configure activities (to replace 2D HTML ones). New configurators for:
  - Aggregator
  - Route name

## 0.8.1

- CamelContext now includes the attribute `streamCache="true"` (this helps on demos when body contains a stream)
- REST methods (except `GET`) now include the default attribute `type="String"` (allows Swagger to display a text input)

## 0.8.0

- New 3D menu to create activities replaces the previous HTML menu
- Camel Designer activities can now be extended with custom consumers/producers (editing VSCode settings).
- *How-To* documentation includes '*Extend menu options*' to explain how to include custom consumers/producers
- Hints (helper notes) can now be removed with a click action

## 0.7.2

- no functionality updates. Resolving publishing issues. 

## 0.7.1

- minor packaging version tag

## 0.7.0

- Added DataFormat constructs. \
DataFormats included:

  |  |  |  | (library) |
  |:------:|:-:|-----------|:-------:|
  |   XML  | ⇆ | Java object | Jackson |
  |  JSON  | ⇆ | Java object | Jackson |
  | Base64 | ⇆ |    String   |         |

<br>

- New FTP endpoint to read/write data from/to a remote FTP server 
- New PDF endpoint to create documents in PDF format 
- Fix: position coordinates (JSON metadata) of activities was no longer being persisted. Now resolved.
- Fix: code changes broke the correct URI option parameters handling causing configuration values losses
- Fix: detach/reattach action throwing an exception. Now resolved 
- Fix: detach/reattach action not working for all activities. Now resolved
- Fix: code generator missing catch exceptions. Now resolved
- *How-To* documentation now includes *Groups* and *Try-Catch* blocks

## 0.6.0

- Mouse 3D interaction has been rewritten (using raycaster) to accurately pinpoint 3D entities
- Drag'n'Drop effect has been rewritten to freely work with entities inside/outside other entities
- Double click behaviour has been rewritten to fit with the new mouse interaction.
- Introduced 'Activity Groups' (sequence of activities forming a unit, e.g. splits, loops, etc.)
- Introduced 'Try-Catch-Finally' definitions to provide initial error handling capabilities.
- Introduced 'Split' definitions (EIP pattern)

## 0.5.0

- Initial implementation of unit testing process, browser dependant at the moment.
- Initial implementation of Camel tracing via Jolokia, and visually displaying results.
- new 'how-to' guide to help new users getting up to speed
- fix: issue when saving workspace files. Now only Camel XML should save a '.metadata' file.

## 0.4.2

- included 'method' as an optional expression language in setter activities

## 0.4.1

- fix: issue loading routes with no id

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

## 0.2.0

- Activity positions now persisted in JSON metadata file (same file name with suffix ".metadata")
- Processing of `<choice>` element has been rewritten, allowing nested nodes and multiple branches
- Default Camel syntax is Camel 3. If imported source is Camel 2, it tries to auto-detect and switch to Camel 2
- Initial implementation for handling Spring XML and Blueprint XML. 
- Initial support for `<routeContext>` files and `<routes>` (Camel-K) files

## 0.1.2

- added search tags

## 0.1.1

- suppressed 'showDesigner' from command palette

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




