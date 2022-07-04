# Director
Are you annoyed with assigning a single tag for a huge bunch of tiles? Or with managing all your MATT-powered switches on a scene? This module is a solution!
Just select all your tiles (or tokens) and drag&drop the tag to assign it. Choose a color for it (useless but fancy) and create an action: toggle your tiles' visibility or fire the Active Tiles' trigger. 
Your actions are stored in the scene's data so that you can have many of them. The global tags are global; let's be consistent across the scenes!

## Hints
- you can drag and drop tags
- right click on tag opens a color picker
- click on "visible/hidden" tag in a selection card toggles visibility
- You can [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/averrin)

## Supported actions
It's not going to be MATT's alternative, so actions are pretty basic
- Execute a trigger [requires MATT]
- Toggle visibility
- Hide
- Show
- Kill [only for tokens]
- Revive [only for tokens]
- Play a sequence

## Integrations
* Tagger [required]
* Monk's Active Tiles Triggers
* Sequencer [BETA, required]
* Token Magic FX [Virtual Sequencer's section]

## Sequencer progress
<details>
  <summary>Effects</summary>

### Generic Methods
- [x] Wait Until Finished
- [x] Async
- [x] Repeats
- [x] Play if
- [x] Delay
- [x] Fade In
- [x] Fade Out
- [x] Duration
- [x] Opacity
- [x] Start Time
- [x] Start Time Percentage
- [x] End Time
- [x] End Time Percentage
- [x] Time Range
- [x] Locally
- [ ] For Users
### Effect Methods
- [ ] Base folder
- [x] File
- [x] From
- [x] At location
- [x] Attach To
- [x] Rotate Towards
- [x] Stretch To
- [x] Move Towards
- [x] Move Speed
- [x] Snap to Grid
- [ ] Offset
- [ ] Sprite Offset
- [x] Zero Sprite Rotation
- [x] Persist
- [x] No Loop
- [x] Extra End Duration
- [x] Origin
- [x] Name
- [x] Private
- [x] Missed
- [ ] Add override
- [ ] Set mustache
- [x] Size (partially)
- [x] Scale
- [x] Scale In
- [x] Scale Out
- [x] Scale To Object
- [x] Anchor (partially)
- [x] Sprite Anchor (partially)
- [x] Center
- [x] Mirror
- [x] Randomize mirror
- [x] Rotate
- [x] Rotate In
- [x] Rotate Out
- [x] Random rotation
- [x] Playback rate
- [x] Below tokens
- [x] Below tiles
- [x] Above lighting
- [x] Z-Index
- [ ] Animate Property
- [ ] Loop Property
- [ ] Filter
- [x] Tint (without picker)
- [x] Screen Space
- [x] Screen Space Above UI
- [ ] Screen Space Position
- [x] Screen Space Anchor
- [ ] Screen Space Scale
- [ ] Text
- [ ] XRay
- [ ] Mask
</details>

## Plans
- [ ] [Alpha HUD](https://github.com/averrin/alpha-hud) integrations. A scene widget with something like the hotbar.

## Images
![toolbar](/assets/toolbar.png)
![selection](/assets/selection.png)
![actions](/assets/actions.png)
![sequencer](/assets/sequencer.png)

## My modules
- [Alpha HUD](https://github.com/averrin/alpha-hud)
- [Merchant Control](https://github.com/averrin/merchant-control)
