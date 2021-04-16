# squared-away

#### A tile-matching puzzle game.

_See the app running at [levi.dev/squared-away](https://levi.dev/squared-away)!_

This app was designed with emphasis on native JavaScript code without the use of external libraries. (That being said, it does use SoundJS, due to the limited functionality of the currently supported HTML5 audio utilities.)

The technology stack for this web app includes: HTML5, CSS3, NodeJS, Express, Stylus, Jade, Mocha.

## Gameplay

Core gameplay features:

- Blocks fall from all four sides
- Blocks stack and collapse according to rules that closely resemble the familiar game of Tetris
- Upcoming blocks are shown for each side with a cooldown progress indicator
- Falling blocks can be manipulated with either the mouse or the keyboard if keyboard mode is enabled
- Falling blocks can be slid downward, slid from side to side, rotated, and moved to the next quadrant
- As a falling block is being manipulated, phantom lines are shown, which help to indicate where a block can be moved
  in either the downward or lateral directions.
- As more layers of blocks are collapsed, the player advances through levels and gameplay becomes more difficult
  with faster falling blocks and shorter cooldown times.
- Awesome sound effects and background music.

Additional optional gameplay features include:

- A mode where only complete layers around the entire center square are collapsed.
- A mode where blocks fall from the center outward.
- A special block type that "settles" all of the blocks that have landed.
- A special block type that destroys any nearby block that has landed.

======

[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=levisl176&url=github.com/levisl176/squared-away&title=squared-away&language=javascript&tags=github&category=software)
