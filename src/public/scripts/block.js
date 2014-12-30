// ------------------------------------------------------------------------- //
// -- window.Block
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// All of the Block logic is encapsulated in this anonymous function.  This is 
// then stored in the window.Block property.  This has the effect of 
// minimizing side-effects and problems when linking multiple script files.
// 
// Dependencies:
//    - window.log
//    - window.Sprite
//    - utils
// ------------------------------------------------------------------------- //

(function() {
  'use strict';

  log.d('-->block.LOADING_MODULE');

  // --------------------------------------------------------------------- //
  // -- Private static members

  var _SOURCE_SQUARE_SIZE = 16; // in pixels

  // ---------- Color indices ---------- //

  var _GREY_INDEX = 0; // T-shaped block
  var _BLUE_INDEX = 1; // Square-shaped block
  var _PURPLE_INDEX = 2; // L-shaped block
  var _YELLOW_INDEX = 3; // J-shaped block
  var _GREEN_INDEX = 4; // Z-shaped block
  var _RED_INDEX = 5; // S-shaped block
  var _ORANGE_INDEX = 6; // Line-shaped block (defaults to vertical orientation)

  var _COLOR_INDICES = [
    _GREY_INDEX, // Block.prototype.ONE_1 (Line-shaped block)

    _GREY_INDEX, // Block.prototype.TWO_1 (Line-shaped block)

    _GREEN_INDEX, // Block.prototype.THREE_1 (Line-shaped block)
    _RED_INDEX, // Block.prototype.THREE_2 (L-shaped block)

    _RED_INDEX, // Block.prototype.FOUR_1 (S-shaped block)
    _GREEN_INDEX, // Block.prototype.FOUR_2 (Z-shaped block)
    _PURPLE_INDEX, // Block.prototype.FOUR_3 (L-shaped block)
    _YELLOW_INDEX, // Block.prototype.FOUR_4 (J-shaped block)
    _BLUE_INDEX, // Block.prototype.FOUR_5 (Square-shaped block)
    _ORANGE_INDEX, // Block.prototype.FOUR_6 (Line-shaped block)
    _GREY_INDEX, // Block.prototype.FOUR_7 (T-shaped block)

    _BLUE_INDEX, // Block.prototype.FIVE_1 (Line-shaped block)
    _RED_INDEX, // Block.prototype.FIVE_2 (Tall-L-shaped block)
    _GREEN_INDEX, // Block.prototype.FIVE_3 (Tall-J-shaped block)
    _BLUE_INDEX, // Block.prototype.FIVE_4 (L-crooked-shaped block)
    _ORANGE_INDEX, // Block.prototype.FIVE_5 (R-crooked-shaped block)
    _RED_INDEX, // Block.prototype.FIVE_6 (L-thumbs-up-shaped block)
    _GREEN_INDEX, // Block.prototype.FIVE_7 (R-thumbs-up-shaped block)
    _GREY_INDEX, // Block.prototype.FIVE_8 (U-shaped block)
    _YELLOW_INDEX, // Block.prototype.FIVE_9 (L-bump-shaped block)
    _PURPLE_INDEX, // Block.prototype.FIVE_10 (R-bump-shaped block)
    _ORANGE_INDEX, // Block.prototype.FIVE_11 (T-shaped block)
    _PURPLE_INDEX, // Block.prototype.FIVE_12 (Short-L-shaped block)
    _GREY_INDEX, // Block.prototype.FIVE_13 (Stairs-shaped block)
    _PURPLE_INDEX, // Block.prototype.FIVE_14 (S-shaped block)
    _YELLOW_INDEX, // Block.prototype.FIVE_15 (Z-shaped block)
    _ORANGE_INDEX, // Block.prototype.FIVE_16 (L-weird-shaped block)
    _BLUE_INDEX, // Block.prototype.FIVE_17 (R-weird-shaped block)
    _YELLOW_INDEX  // Block.prototype.FIVE_18 (Cross-shaped block)
  ];

  var CELL_OFFSETS_FROM_TOP_LEFT_TO_CENTER = [
    { x: 0.5, y: 0.5 }, // Block.prototype.ONE_1 (Square-shaped block)

    { x: 0.5, y: 1 }, // Block.prototype.TWO_1 (Line-shaped block)

    { x: 0.5, y: 1.5 }, // Block.prototype.THREE_1 (Line-shaped block)
    { x: 1, y: 1 }, // Block.prototype.THREE_2 (L-shaped block)

    { x: 1.5, y: 1 }, // Block.prototype.FOUR_1 (S-shaped block)
    { x: 1.5, y: 1 }, // Block.prototype.FOUR_2 (Z-shaped block)
    { x: 1, y: 1.5 }, // Block.prototype.FOUR_3 (L-shaped block)
    { x: 1, y: 1.5 }, // Block.prototype.FOUR_4 (J-shaped block)
    { x: 1, y: 1 }, // Block.prototype.FOUR_5 (Square-shaped block)
    { x: 0.5, y: 2 }, // Block.prototype.FOUR_6 (Line-shaped block)
    { x: 1.5, y: 1 }, // Block.prototype.FOUR_7 (T-shaped block)

    { x: 0.5, y: 2.5 }, // Block.prototype.FIVE_1 (Line-shaped block)
    { x: 1, y: 2 }, // Block.prototype.FIVE_2 (Tall-L-shaped block)
    { x: 1, y: 2 }, // Block.prototype.FIVE_3 (Tall-J-shaped block)
    { x: 1, y: 2 }, // Block.prototype.FIVE_4 (L-crooked-shaped block)
    { x: 1, y: 2 }, // Block.prototype.FIVE_5 (R-crooked-shaped block)
    { x: 1, y: 1.5 }, // Block.prototype.FIVE_6 (L-thumbs-up-shaped block)
    { x: 1, y: 1.5 }, // Block.prototype.FIVE_7 (R-thumbs-up-shaped block)
    { x: 1.5, y: 1 }, // Block.prototype.FIVE_8 (U-shaped block)
    { x: 1, y: 2 }, // Block.prototype.FIVE_9 (L-bump-shaped block)
    { x: 1, y: 2 }, // Block.prototype.FIVE_10 (R-bump-shaped block)
    { x: 1.5, y: 1.5 }, // Block.prototype.FIVE_11 (T-shaped block)
    { x: 1.5, y: 1.5 }, // Block.prototype.FIVE_12 (Short-L-shaped block)
    { x: 1.5, y: 1.5 }, // Block.prototype.FIVE_13 (Stairs-shaped block)
    { x: 1.5, y: 1.5 }, // Block.prototype.FIVE_14 (S-shaped block)
    { x: 1.5, y: 1.5 }, // Block.prototype.FIVE_15 (Z-shaped block)
    { x: 1.5, y: 1.5 }, // Block.prototype.FIVE_16 (L-weird-shaped block)
    { x: 1.5, y: 1.5 }, // Block.prototype.FIVE_17 (R-weird-shaped block)
    { x: 1.5, y: 1.5 }  // Block.prototype.FIVE_18 (Cross-shaped block)
  ];

  // These coordinates dictate the position (in cells) of each constituent 
  // square relative to the position of the parent block
  var _DEFAULT_SQUARE_CELL_POSITIONS = [
    [{ x: 0, y: 0 }], // Block.prototype.ONE_1 (Square-shaped block)

    [{ x: 0, y: 0 }, { x: 0, y: 1 }], // Block.prototype.TWO_1 (Line-shaped block)

    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }], // Block.prototype.THREE_1 (Line-shaped block)
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], // Block.prototype.THREE_2 (L-shaped block)

    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }], // Block.prototype.FOUR_1 (S-shaped block)
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], // Block.prototype.FOUR_2 (Z-shaped block)
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }], // Block.prototype.FOUR_3 (L-shaped block)
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }], // Block.prototype.FOUR_4 (J-shaped block)
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }], // Block.prototype.FOUR_5 (Square-shaped block)
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }], // Block.prototype.FOUR_6 (Line-shaped block (defaults to vertical orientation))
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }], // Block.prototype.FOUR_7 (T-shaped block)

    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }],  // Block.prototype.FIVE_1 (Line-shaped block)
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 1, y: 3 }],  // Block.prototype.FIVE_2 (Tall-L-shaped block)
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 0, y: 3 }],  // Block.prototype.FIVE_3 (Tall-J-shaped block)
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 3 }],  // Block.prototype.FIVE_4 (L-crooked-shaped block)
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 3 }],  // Block.prototype.FIVE_5 (R-crooked-shaped block)
    [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 1, y: 0 }],  // Block.prototype.FIVE_6 (L-thumbs-up-shaped block)
    [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 0 }],  // Block.prototype.FIVE_7 (R-thumbs-up-shaped block)
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 0 }],  // Block.prototype.FIVE_8 (U-shaped block)
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 0, y: 1 }],  // Block.prototype.FIVE_9 (L-bump-shaped block)
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 1, y: 1 }],  // Block.prototype.FIVE_10 (R-bump-shaped block)
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],  // Block.prototype.FIVE_11 (T-shaped block)
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],  // Block.prototype.FIVE_12 (Short-L-shaped block)
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],  // Block.prototype.FIVE_13 (Stairs-shaped block)
    [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }],  // Block.prototype.FIVE_14 (S-shaped block)
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],  // Block.prototype.FIVE_15 (Z-shaped block)
    [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 1 }],  // Block.prototype.FIVE_16 (L-weird-shaped block)
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 0, y: 1 }],  // Block.prototype.FIVE_17 (R-weird-shaped block)
    [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 1 }]   // Block.prototype.FIVE_18 (Cross-shaped block)
  ];

  // These points represent the shape of the given block along the given 
  // side.  These are relative to the position of the parent block.
  // NOTE: all points are given in clockwise order
  var _DEFAULT_SIDE_CELL_POSITIONS = [
    [ // Block.prototype.ONE_1 (Square-shaped block)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }], // TOP_SIDE
      [{ x: 1, y: 0 }, { x: 1, y: 1 }], // RIGHT_SIDE
      [{ x: 1, y: 1 }, { x: 0, y: 1 }], // BOTTOM_SIDE
      [{ x: 0, y: 1 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],

    [ // Block.prototype.TWO_1 (Line-shaped block)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 0, y: 2 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }], // TOP_SIDE
      [{ x: 1, y: 0 }, { x: 1, y: 2 }], // RIGHT_SIDE
      [{ x: 1, y: 2 }, { x: 0, y: 2 }], // BOTTOM_SIDE
      [{ x: 0, y: 2 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],

    [ // Block.prototype.THREE_1 (Line-shaped block)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 3 }, { x: 0, y: 3 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }], // TOP_SIDE
      [{ x: 1, y: 0 }, { x: 1, y: 3 }], // RIGHT_SIDE
      [{ x: 1, y: 3 }, { x: 0, y: 3 }], // BOTTOM_SIDE
      [{ x: 0, y: 3 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.THREE_2 (L-shaped block)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 0, y: 2 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], // TOP_SIDE
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }], // RIGHT_SIDE
      [{ x: 2, y: 2 }, { x: 0, y: 2 }], // BOTTOM_SIDE
      [{ x: 0, y: 2 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],

    [ // Block.prototype.FOUR_1 (S-shaped block)
      [{ x: 1, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 1 }, { x: 1, y: 1 }], // ALL_SIDES
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 3, y: 0 }], // TOP_SIDE
      [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }], // RIGHT_SIDE
      [{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 0, y: 2 }], // BOTTOM_SIDE
      [{ x: 0, y: 2 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FOUR_2 (Z-shaped block)
      [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 1 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }], // TOP_SIDE
      [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }], // RIGHT_SIDE
      [{ x: 3, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 1 }], // BOTTOM_SIDE
      [{ x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FOUR_3 (L-shaped block)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 0, y: 3 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }], // TOP_SIDE
      [{ x: 1, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }], // RIGHT_SIDE
      [{ x: 2, y: 3 }, { x: 0, y: 3 }], // BOTTOM_SIDE
      [{ x: 0, y: 3 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FOUR_4 (J-shaped block)
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 3 }, { x: 0, y: 3 }, { x: 0, y: 2 }, { x: 1, y: 2 }], // ALL_SIDES
      [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }, { x: 2, y: 0 }], // TOP_SIDE
      [{ x: 2, y: 0 }, { x: 2, y: 3 }], // RIGHT_SIDE
      [{ x: 2, y: 3 }, { x: 0, y: 3 }], // BOTTOM_SIDE
      [{ x: 0, y: 3 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FOUR_5 (Square-shaped block)
      [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 2, y: 0 }], // TOP_SIDE
      [{ x: 2, y: 0 }, { x: 2, y: 2 }], // RIGHT_SIDE
      [{ x: 2, y: 2 }, { x: 0, y: 2 }], // BOTTOM_SIDE
      [{ x: 0, y: 2 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FOUR_6 (Line-shaped block (defaults to vertical orientation))
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 4 }, { x: 0, y: 4 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }], // TOP_SIDE
      [{ x: 1, y: 0 }, { x: 1, y: 4 }], // RIGHT_SIDE
      [{ x: 1, y: 4 }, { x: 0, y: 4 }], // BOTTOM_SIDE
      [{ x: 0, y: 4 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FOUR_7 (T-shaped block)
      [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 1 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 3, y: 0 }], // TOP_SIDE
      [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }], // RIGHT_SIDE
      [{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 1 }], // BOTTOM_SIDE
      [{ x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],

    [ // Block.prototype.FIVE_1 (Line-shaped block)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 5 }, { x: 0, y: 5 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }], // TOP_SIDE
      [{ x: 1, y: 0 }, { x: 1, y: 5 }], // RIGHT_SIDE
      [{ x: 1, y: 5 }, { x: 0, y: 5 }], // BOTTOM_SIDE
      [{ x: 0, y: 5 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_2 (Tall-L-shaped block)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 0, y: 4 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 3 }, { x: 2, y: 3 }], // TOP_SIDE
      [{ x: 1, y: 0 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 2, y: 4 }], // RIGHT_SIDE
      [{ x: 2, y: 4 }, { x: 0, y: 4 }], // BOTTOM_SIDE
      [{ x: 0, y: 4 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_3 (Tall-J-shaped block)
      [{ x: 0, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 4 }, { x: 0, y: 4 }], // ALL_SIDES
      [{ x: 0, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 0 }, { x: 2, y: 0 }], // TOP_SIDE
      [{ x: 2, y: 0 }, { x: 2, y: 4 }], // RIGHT_SIDE
      [{ x: 2, y: 4 }, { x: 0, y: 4 }], // BOTTOM_SIDE
      [{ x: 0, y: 4 }, { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_4 (L-crooked-shaped block)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 0, y: 3 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }], // TOP_SIDE
      [{ x: 1, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 4 }], // RIGHT_SIDE
      [{ x: 2, y: 4 }, { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 0, y: 3 }], // BOTTOM_SIDE
      [{ x: 1, y: 4 }, { x: 1, y: 3 }, { x: 0, y: 3 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_5 (R-crooked-shaped block)
      [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 0, y: 4 }], // ALL_SIDES
      [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }, { x: 2, y: 0 }], // TOP_SIDE
      [{ x: 2, y: 0 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 4 }], // RIGHT_SIDE
      [{ x: 2, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 0, y: 4 }], // BOTTOM_SIDE
      [{ x: 0, y: 4 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_6 (L-thumbs-up-shaped block)
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 3 }, { x: 0, y: 3 }], // ALL_SIDES
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }], // TOP_SIDE
      [{ x: 2, y: 0 }, { x: 2, y: 3 }], // RIGHT_SIDE
      [{ x: 2, y: 3 }, { x: 0, y: 3 }], // BOTTOM_SIDE
      [{ x: 0, y: 3 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_7 (R-thumbs-up-shaped block)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 3 }, { x: 0, y: 3 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], // TOP_SIDE
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 3 }], // RIGHT_SIDE
      [{ x: 2, y: 3 }, { x: 0, y: 3 }], // BOTTOM_SIDE
      [{ x: 0, y: 3 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_8 (U-shaped block)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 2 }, { x: 0, y: 2 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 0 }, { x: 3, y: 0 }], // TOP_SIDE
      [{ x: 3, y: 0 }, { x: 3, y: 2 }], // RIGHT_SIDE
      [{ x: 3, y: 2 }, { x: 0, y: 2 }], // BOTTOM_SIDE
      [{ x: 0, y: 2 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_9 (L-bump-shaped block)
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 1, y: 2 }, { x: 0, y: 2 }], // ALL_SIDES
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }], // TOP_SIDE
      [{ x: 2, y: 0 }, { x: 2, y: 4 }], // RIGHT_SIDE
      [{ x: 2, y: 4 }, { x: 1, y: 4 }, { x: 1, y: 2 }, { x: 0, y: 2 }], // BOTTOM_SIDE
      [{ x: 1, y: 4 }, { x: 1, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_10 (R-bump-shaped block)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 4 }, { x: 0, y: 4 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], // TOP_SIDE
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 4 }], // RIGHT_SIDE
      [{ x: 2, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 4 }, { x: 0, y: 4 }], // BOTTOM_SIDE
      [{ x: 0, y: 4 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_11 (T-shaped block)
      [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 0, y: 3 }], // ALL_SIDES
      [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 3, y: 2 }], // TOP_SIDE
      [{ x: 2, y: 0 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }], // RIGHT_SIDE
      [{ x: 3, y: 3 }, { x: 0, y: 3 }], // BOTTOM_SIDE
      [{ x: 0, y: 3 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_12 (Short-L-shaped block)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 0, y: 3 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 3, y: 2 }], // TOP_SIDE
      [{ x: 1, y: 0 }, { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }], // RIGHT_SIDE
      [{ x: 3, y: 3 }, { x: 0, y: 3 }], // BOTTOM_SIDE
      [{ x: 0, y: 3 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_13 (Stairs-shaped block)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 2 }, { x: 0, y: 2 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 2 }], // TOP_SIDE
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }], // RIGHT_SIDE
      [{ x: 3, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 2 }, { x: 0, y: 2 }], // BOTTOM_SIDE
      [{ x: 1, y: 3 }, { x: 1, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_14 (S-shaped block)
      [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 3 }, { x: 0, y: 3 }], // ALL_SIDES
      [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }, { x: 3, y: 0 }], // TOP_SIDE
      [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 3 }], // RIGHT_SIDE
      [{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 3 }, { x: 0, y: 3 }], // BOTTOM_SIDE
      [{ x: 0, y: 3 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_15 (Z-shaped block)
      [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 1 }, { x: 0, y: 1 }], // ALL_SIDES
      [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 3, y: 2 }], // TOP_SIDE
      [{ x: 2, y: 0 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }], // RIGHT_SIDE
      [{ x: 3, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 1 }, { x: 0, y: 1 }], // BOTTOM_SIDE
      [{ x: 1, y: 3 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_16 (L-weird-shaped block)
      [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 0, y: 3 }], // ALL_SIDES
      [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }], // TOP_SIDE
      [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }], // RIGHT_SIDE
      [{ x: 3, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 0, y: 3 }], // BOTTOM_SIDE
      [{ x: 0, y: 3 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_17 (R-weird-shaped block)
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 2 }, { x: 0, y: 2 }], // ALL_SIDES
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 3, y: 2 }], // TOP_SIDE
      [{ x: 2, y: 0 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }], // RIGHT_SIDE
      [{ x: 3, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 2 }, { x: 0, y: 2 }], // BOTTOM_SIDE
      [{ x: 1, y: 3 }, { x: 1, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }]  // LEFT_SIDE
    ],
    [ // Block.prototype.FIVE_18 (Cross-shaped block)
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 2 }, { x: 0, y: 2 }], // ALL_SIDES
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }], // TOP_SIDE
      [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }], // RIGHT_SIDE
      [{ x: 3, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 2 }, { x: 0, y: 2 }], // BOTTOM_SIDE
      [{ x: 1, y: 3 }, { x: 1, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }]  // LEFT_SIDE
    ]
  ];

  // Ratios of the four-square block fall speed
  var _FIVE_SQUARE_BLOCK_FALL_PERIOD_RATIO = 1.3;
  var _THREE_SQUARE_BLOCK_FALL_PERIOD_RATIO = 0.925;
  var _TWO_SQUARE_BLOCK_FALL_PERIOD_RATIO = 0.8;
  var _ONE_SQUARE_BLOCK_FALL_PERIOD_RATIO = 0.7;

  var _oneSquareBlockFallPeriod; // millis / blocks
  var _twoSquareBlockFallPeriod; // millis / blocks
  var _threeSquareBlockFallPeriod; // millis / blocks
  var _fourSquareBlockFallPeriod; // millis / blocks
  var _fiveSquareBlockFallPeriod; // millis / blocks

  // Constructor
  // type: which type of block this is (0-6)
  // x: the x-coordinate of this block's initial position (in pixels)
  // y: the y-coordinate of this block's initial position (in pixels)
  // orientation: which orientation this block starts with (0-3)
  // fallDirection: which direction this block originally falls in (0-3)
  // 
  // NOTE: I choose to represent the cell 'position' of a block as the 
  //     top-left cell occupied by the bounding box formed by the current 
  //     orientation of the block.
  function Block(type, orientation, fallDirection, bombType) {
    log.d('-->block.Block');

    // ----------------------------------------------------------------- //
    // -- Private members

    var _type = type;
    var _pixelPosition = { x: -1, y: -1 }; // pixels // TODO: refactor this to need only one position representation
    var _cellPosition = { x: -1, y: -1 }; // column and row indices
    var _orientation = orientation;
    var _fallDirection = fallDirection;
    var _timeSinceLastFall = 0;
    var _hasLanded = false;
    var _hasCollidedWithOutOfBounds = false;
    var _hasCollidedWithBackLineOfCenterSquare = false;
    var _bombType = bombType;

    // Each block keeps track of its own timers so it can fall and shimmer 
    // independently.
    function _update(deltaTime, squaresOnGameWindow, blocksOnGameWindow) {
      _timeSinceLastFall += deltaTime;

      var fallPeriod = _getFallPeriod(_type);

      // Check whether this block needs to fall one space
      if (_timeSinceLastFall > fallPeriod) {
          
        if (game.blocksFallOutwardOn) {
          _hasCollidedWithOutOfBounds = 
              _checkForCollisionWithCenterSquare();

          if (!_hasCollidedWithOutOfBounds) {
            _hasLanded = 
                _checkForCollisionWithGameWindowEdge() ||
                _checkForCollisionWithSquare(squaresOnGameWindow, 
                                blocksOnGameWindow);

            if (!_hasLanded) {
              _fall();

              sound.playSfx('fall');
            }
          }
        } else {
          _hasCollidedWithOutOfBounds = 
              _checkForCollisionWithGameWindowEdge();

          if (!_hasCollidedWithOutOfBounds) {
            _hasLanded = 
                _checkForCollisionWithCenterSquare() ||
                _checkForCollisionWithSquare(squaresOnGameWindow, 
                                blocksOnGameWindow);

            if (!_hasLanded) {
              _hasCollidedWithBackLineOfCenterSquare = 
                  _checkForCollisionWithBackLineOfCenterSquare();
              if (game.canFallPastCenterOn || 
                  !_hasCollidedWithBackLineOfCenterSquare) {
                _fall();

                sound.playSfx('fall');
              }
            }
          }
        }

        _timeSinceLastFall %= fallPeriod;
      }

      // Check whether this block needs to shimmer
      if (false && // TODO: fix the false bit to use a shimmer timer
          !_hasCollidedWithOutOfBounds && !_hasLanded) {
        // TODO: 
      }
    }

    // Render this block on the given drawing context.  The context should 
    // be transforme beforehand in order to place the origin at the 
    // top-left corner of the play area.
    function _draw(context) {
      var positions = _getSquareCellPositionsRelativeToBlockPosition(
                  _type, _orientation);

      var colorIndex = _bombType >= 0 ? 7 + _bombType : _COLOR_INDICES[_type];

      var i;

      // Translate the square positions from block cell space to canvas 
      // pixel space
      for (i = 0; i < positions.length; ++i) {
        positions[i].x = _pixelPosition.x + 
                (positions[i].x * gameWindow.squarePixelSize);
        positions[i].y = _pixelPosition.y + 
                (positions[i].y * gameWindow.squarePixelSize);
      }

      // Draw the constituent squares
      for (i = 0; i < positions.length; ++i) {
        Block.prototype.drawSquare(context, colorIndex, 
                    positions[i].x, positions[i].y, 0);
      }
    }

    // Rotate the orientation of this block clockwise 90 degrees, if this 
    // rotation would not cause this block to collide with other squares 
    // in the game area.  If the rotation is successful, then return true.
    // 
    // NOTE: If checkForCollisions is not true, then the client should not 
    //     care about rotational collisions and should be updating this 
    //     block's position manually afterward.
    function _rotate(squaresOnGameWindow, blocksOnGameWindow, checkForCollisions) {
      if (checkForCollisions) {
        // Get the square positions
        var squarePositions = 
          _getSquareCellPositionsRelativeToBlockPosition(
                    _type, _orientation);

        // Rotate the square positions
        squarePositions = _rotatePoints(squarePositions, 1, _type);

        var i;

        // Translate the square positions from block space to canvas space
        for (i = 0; i < squarePositions.length; ++i) {
          squarePositions[i].x += _cellPosition.x;
          squarePositions[i].y += _cellPosition.y;
        }

        // Get the offset needed so that the lower-left corner of the 
        // block will still be at the same cell
        var midOffset = Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter(_type, _orientation);
        var oldWidth = midOffset.x * 2;
        var oldHeight = midOffset.y * 2;
        var offset = { x: 0, y: 0 };
        switch (_fallDirection) {
        case Block.prototype.DOWNWARD:
          offset.y = oldHeight - oldWidth;
          break;
        case Block.prototype.LEFTWARD:
          // Do nothing
          break;
        case Block.prototype.UPWARD:
          offset.x = oldWidth - oldHeight;
          break;
        case Block.prototype.RIGHTWARD:
          offset.x = oldWidth - oldHeight;
          offset.y = oldHeight - oldWidth;
          break;
        default:
          return;
        }

        // Apply the offset to each of the squares
        for (i = 0; i < squarePositions.length; ++i) {
          squarePositions[i].x += offset.x;
          squarePositions[i].y += offset.y;
        }

        // Check whether the new square positions are valid
        var squareIndices = _positionsToIndices(squarePositions);
        var collision = false;
        for (i = 0; i < squareIndices.length; ++i) {
          if (squaresOnGameWindow[squareIndices[i]] > -1) {
            collision = true;
          }
        }

        if (!collision) {
          // Save the block offset
          _setCellPosition(_cellPosition.x + offset.x, _cellPosition.y + offset.y);

          // Save the orientation change
          _orientation = (_orientation + 1) % 4;

          return true;
        } else {
          return false;
        }
      } else {
        // Save the orientation change
        _orientation = (_orientation + 1) % 4;

        return true;
      }
    }

    // Rotate the fall direction of this block clockwise 90 degrees.
    function _switchFallDirection() {
      _fallDirection = (_fallDirection + 1) % 4;
    }
    
    // Add the squares that comprise this block to the given game area.  
    // Negative values in the game area represent cells which do not 
    // contain squares.  When a cell does contain a square, the color of 
    // the square is determined by the positive number of the 
    // corresponding block type.  Return the positions where squares were 
    // added.
    function _addSquaresToGameWindow(squaresOnGameWindow) {
      var positions = _getSquareCellPositions();
      var indices = _positionsToIndices(positions);
      var colorIndex = _COLOR_INDICES[_type];

      for (var i = 0; i < positions.length; ++i) {
        squaresOnGameWindow[indices[i]] = colorIndex;
      }

      return positions;
    }

    // Return an array of position objects which represent the cells in 
    // the game area which are occupied by this block.
    function _getSquareCellPositions() {
      var positions = _getSquareCellPositionsRelativeToBlockPosition(
                  _type, _orientation);

      // Translate the square positions from block space to canvas space
      for (var i = 0; i < positions.length; ++i) {
        positions[i].x += _cellPosition.x;
        positions[i].y += _cellPosition.y;
      }

      return positions;
    }

    // Move this block down by 1 square according to its current fall 
    // direction.
    function _fall() {
      var deltaX;
      var deltaY;

      switch (_fallDirection) {
      case Block.prototype.DOWNWARD:
        deltaX = 0;
        deltaY = 1;
        break;
      case Block.prototype.LEFTWARD:
        deltaX = -1;
        deltaY = 0;
        break;
      case Block.prototype.UPWARD:
        deltaX = 0;
        deltaY = -1;
        break;
      case Block.prototype.RIGHTWARD:
        deltaX = 1;
        deltaY = 0;
        break;
      default:
        return;
      }

      _cellPosition.x += deltaX;
      _cellPosition.y += deltaY;
      _pixelPosition.x = _cellPosition.x * gameWindow.squarePixelSize;
      _pixelPosition.y = _cellPosition.y * gameWindow.squarePixelSize;
    }

    // Return true if this block has collided with a stationary square on 
    // the given game area and is therefore done falling.  Non-negative 
    // values in the game area should represent cells containing squares.
    // 
    // NOTE: it is important to check that this block is not colliding 
    //     with an edge of the game area BEFORE calling this function.  
    //     Otherwise, this function may look out of bounds in the game 
    //     area array.
    function _checkForCollisionWithSquare(squaresOnGameWindow, blocksOnGameWindow) { // TODO: handle collision detection with blocksOnGameWindow
      var deltaI;

      switch (_fallDirection) {
      case Block.prototype.DOWNWARD:
        deltaI = gameWindow.gameWindowCellSize;
        break;
      case Block.prototype.LEFTWARD:
        deltaI = -1;
        break;
      case Block.prototype.UPWARD:
        deltaI = -gameWindow.gameWindowCellSize;
        break;
      case Block.prototype.RIGHTWARD:
        deltaI = 1;
        break;
      default:
        return;
      }

      var positions = _getSquareCellPositions();
      var indices = _positionsToIndices(positions);
      var neighborIndex;

      for (var i = 0; i < indices.length; ++i) {
        neighborIndex = indices[i] + deltaI;

        if (squaresOnGameWindow[neighborIndex] > -1) {
          return true;
        }
      }

      return false;
    }

    function _checkForCollisionWithGameWindowEdge() {
      var deltaX;
      var deltaY;

      switch (_fallDirection) {
      case Block.prototype.DOWNWARD:
        deltaX = 0;
        deltaY = 1;
        break;
      case Block.prototype.LEFTWARD:
        deltaX = -1;
        deltaY = 0;
        break;
      case Block.prototype.UPWARD:
        deltaX = 0;
        deltaY = -1;
        break;
      case Block.prototype.RIGHTWARD:
        deltaX = 1;
        deltaY = 0;
        break;
      default:
        return;
      }

      var positions = _getSquareCellPositions();

      for (var i = 0; i < positions.length; ++i) {
        if (positions[i].x + deltaX >= gameWindow.gameWindowCellSize || 
            positions[i].x + deltaX < 0 || 
            positions[i].y + deltaY >= gameWindow.gameWindowCellSize || 
            positions[i].y + deltaY < 0) {
          return true;
        }
      }

      return false;
    }

    function _checkForCollisionWithCenterSquare() {
      var deltaX;
      var deltaY;

      switch (_fallDirection) {
      case Block.prototype.DOWNWARD:
        deltaX = 0;
        deltaY = 1;
        break;
      case Block.prototype.LEFTWARD:
        deltaX = -1;
        deltaY = 0;
        break;
      case Block.prototype.UPWARD:
        deltaX = 0;
        deltaY = -1;
        break;
      case Block.prototype.RIGHTWARD:
        deltaX = 1;
        deltaY = 0;
        break;
      default:
        return;
      }

      var minCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX;
      var maxCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize;

      var positions = _getSquareCellPositions();

      for (var i = 0; i < positions.length; ++i) {
        if (positions[i].x + deltaX >= minCenterSquareCellPositionX && 
            positions[i].x + deltaX < maxCenterSquareCellPositionX && 
            positions[i].y + deltaY >= minCenterSquareCellPositionX && 
            positions[i].y + deltaY < maxCenterSquareCellPositionX) {
          return true;
        }
      }

      return false;
    }

    function _checkForCollisionWithBackLineOfCenterSquare() {
      var lastPossibleRow = -1;
      var lastPossibleCol = -1;
      var i;

      switch (_fallDirection) {
      case Block.prototype.DOWNWARD:
        lastPossibleRow = gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize - 1;
        break;
      case Block.prototype.LEFTWARD:
        lastPossibleCol = gameWindow.centerSquareCellPositionX;
        break;
      case Block.prototype.UPWARD:
        lastPossibleRow = gameWindow.centerSquareCellPositionX;
        break;
      case Block.prototype.RIGHTWARD:
        lastPossibleCol = gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize - 1;
        break;
      default:
        return;
      }

      var positions = _getSquareCellPositions();

      if (lastPossibleRow >= 0) {
        for (i = 0; i < positions.length; ++i) {
          if (positions[i].y === lastPossibleRow) {
            return true;
          }
        }
      } else {
        for (i = 0; i < positions.length; ++i) {
          if (positions[i].x === lastPossibleCol) {
            return true;
          }
        }
      }

      return false;
    }

    function _checkIsOverTopSquare(squaresOnGameWindow) {
      var positions = _getSquareCellPositions();
      var indices = _positionsToIndices(positions);

      for (var i = 0; i < indices.length; ++i) {
        if (squaresOnGameWindow[indices[i]] > -1) {
          return true;
        }
      }

      return false;
    }

    // Return the farthest left position this block can move to from its 
    // current position on its current descent level.  Note: 'left' is 
    // relative to the direction in which this block is falling.
    function _getFarthestLeftCellAvailable(squaresOnGameWindow, blocksOnGameWindow) {
      var deltaI;
      var deltaX;
      var deltaY;

      switch (_fallDirection) {
      case Block.prototype.DOWNWARD:
        deltaI = -1;
        deltaX = -1;
        deltaY = 0;
        break;
      case Block.prototype.LEFTWARD:
        deltaI = -gameWindow.gameWindowCellSize;
        deltaX = 0;
        deltaY = -1;
        break;
      case Block.prototype.UPWARD:
        deltaI = 1;
        deltaX = 1;
        deltaY = 0;
        break;
      case Block.prototype.RIGHTWARD:
        deltaI = gameWindow.gameWindowCellSize;
        deltaX = 0;
        deltaY = 1;
        break;
      default:
        return;
      }

      var howManyStepsBlockCanMove = 
          _getHowManyStepsBlockCanMove(deltaI, deltaX, deltaY, 
              squaresOnGameWindow, blocksOnGameWindow);

      return { 
        x: _cellPosition.x + (howManyStepsBlockCanMove * deltaX),
        y: _cellPosition.y + (howManyStepsBlockCanMove * deltaY)
      };
    }

    // Return the farthest right position this block can move to from its 
    // current position on its current descent level.  Note: 'right' is 
    // relative to the direction in which this block is falling.
    function _getFarthestRightCellAvailable(squaresOnGameWindow, blocksOnGameWindow) {
      var deltaI;
      var deltaX;
      var deltaY;

      switch (_fallDirection) {
      case Block.prototype.DOWNWARD:
        deltaI = 1;
        deltaX = 1;
        deltaY = 0;
        break;
      case Block.prototype.LEFTWARD:
        deltaI = gameWindow.gameWindowCellSize;
        deltaX = 0;
        deltaY = 1;
        break;
      case Block.prototype.UPWARD:
        deltaI = -1;
        deltaX = -1;
        deltaY = 0;
        break;
      case Block.prototype.RIGHTWARD:
        deltaI = -gameWindow.gameWindowCellSize;
        deltaX = 0;
        deltaY = -1;
        break;
      default:
        return;
      }

      var howManyStepsBlockCanMove = 
          _getHowManyStepsBlockCanMove(deltaI, deltaX, deltaY, 
              squaresOnGameWindow, blocksOnGameWindow);

      return { 
        x: _cellPosition.x + (howManyStepsBlockCanMove * deltaX),
        y: _cellPosition.y + (howManyStepsBlockCanMove * deltaY)
      };
    }

    // Return the farthest downward position this block can move to from 
    // its current position.  Note: 'downward' is relative to the 
    // direction in which this block is falling.
    function _getFarthestDownwardCellAvailable(squaresOnGameWindow, blocksOnGameWindow) {
      var deltaI;
      var deltaX;
      var deltaY;

      switch (_fallDirection) {
      case Block.prototype.DOWNWARD:
        deltaI = gameWindow.gameWindowCellSize;
        deltaX = 0;
        deltaY = 1;
        break;
      case Block.prototype.LEFTWARD:
        deltaI = -1;
        deltaX = -1;
        deltaY = 0;
        break;
      case Block.prototype.UPWARD:
        deltaI = -gameWindow.gameWindowCellSize;
        deltaX = 0;
        deltaY = -1;
        break;
      case Block.prototype.RIGHTWARD:
        deltaI = 1;
        deltaX = 1;
        deltaY = 0;
        break;
      default:
        return;
      }

      var howManyStepsBlockCanMove = 
          _getHowManyStepsBlockCanMove(deltaI, deltaX, deltaY, 
              squaresOnGameWindow, blocksOnGameWindow);

      var farthestCellPos = { 
        x: _cellPosition.x + (howManyStepsBlockCanMove * deltaX),
        y: _cellPosition.y + (howManyStepsBlockCanMove * deltaY)
      };

      if (!game.blocksFallOutwardOn && !game.canFallPastCenterOn) {
        // Account for the invisible wall at the back side of the center square
        var half = Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter(_type, _orientation);
        switch (_fallDirection) {
        case Block.prototype.DOWNWARD:
          farthestCellPos.y = Math.min(farthestCellPos.y, 
              gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize - half.y * 2);
          break;
        case Block.prototype.LEFTWARD:
          farthestCellPos.x = Math.max(farthestCellPos.x, 
              gameWindow.centerSquareCellPositionX);
          break;
        case Block.prototype.UPWARD:
          farthestCellPos.y = Math.max(farthestCellPos.y, 
              gameWindow.centerSquareCellPositionX);
          break;
        case Block.prototype.RIGHTWARD:
          farthestCellPos.x = Math.min(farthestCellPos.x, 
              gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize - half.x * 2);
          break;
        default:
          return;
        }
      }

      return farthestCellPos;
    }

    // Return how many steps this block can move using the given delta 
    // index value before colliding with a stationary square or an edge of 
    // the game area.
    function _getHowManyStepsBlockCanMove(deltaI, deltaX, deltaY, 
        squaresOnGameWindow, blocksOnGameWindow) {
      var positions = _getSquareCellPositions();
      var indices = _positionsToIndices(positions);
      var minCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX;
      var maxCenterSquareCellPositionX = gameWindow.centerSquareCellPositionX + gameWindow.centerSquareCellSize;
      var neighborIndex;
      var neighborX;
      var neighborY;
      var i = 0;
      var dI = deltaI;
      var dX = deltaX;
      var dY = deltaY;
      var j;

      // Keep moving one cell in the same direction until we hit a 
      // square on the gameWindow or we hit an edge of the game area
      while (true) {
        // Check each of this block's four constituent squares
        for (j = 0; j < indices.length; ++j) {
          neighborIndex = indices[j] + dI;
          neighborX = positions[j].x + dX;
          neighborY = positions[j].y + dY;

          if (neighborX >= gameWindow.gameWindowCellSize || 
              neighborX < 0 || 
              neighborY >= gameWindow.gameWindowCellSize || 
              neighborY < 0 || 
              squaresOnGameWindow[neighborIndex] > -1 || 
              (neighborX >= minCenterSquareCellPositionX && 
              neighborX < maxCenterSquareCellPositionX && 
              neighborY >= minCenterSquareCellPositionX && 
              neighborY < maxCenterSquareCellPositionX)) { 
            return i;
          }
        }

        ++i;
        dI += deltaI;
        dX += deltaX;
        dY += deltaY;
      }
    }

    function _setCellPosition(x, y) {
      _cellPosition.x = x;
      _cellPosition.y = y;
      _pixelPosition.x = _cellPosition.x * gameWindow.squarePixelSize;
      _pixelPosition.y = _cellPosition.y * gameWindow.squarePixelSize;
    }

    function _getHasCollidedWithOutOfBounds() {
      return _hasCollidedWithOutOfBounds;
    }

    function _getHasLanded() {
      return _hasLanded;
    }

    function _getHasCollidedWithBackLineOfCenterSquare() {
      return _hasCollidedWithBackLineOfCenterSquare;
    }

    function _getType() {
      return _type;
    }

    function _getOrientation() {
      return _orientation;
    }

    function _getFallDirection() {
      return _fallDirection;
    }

    function _getCellPosition() {
      return _cellPosition;
    }

    function _getPixelCenter() {
      var offset = Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter(_type, _orientation);

      return {
        x: _pixelPosition.x + (offset.x * gameWindow.squarePixelSize),
        y: _pixelPosition.y + (offset.y * gameWindow.squarePixelSize)
      };
    }

    function _getPolygon() {
      var points = _getPointsAlongSideRelativeToBlockPosition(_type, _orientation, Block.prototype.ALL_SIDES);

      // Translate from block cell space to game area pixel space
      for (var i = 0; i < points.length; ++i) {
        points[i].x = (points[i].x * gameWindow.squarePixelSize) + _pixelPosition.x;
        points[i].y = (points[i].y * gameWindow.squarePixelSize) + _pixelPosition.y;
      }

      return points;
    }

    function _getSidePointsRelativeToBlockPosition(side) {
      return _getPointsAlongSideRelativeToBlockPosition(_type, _orientation, side);
    }

    function _getLowerLeftAndRightFallDirectionPoints() {
      var mid = Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter(_type, _orientation);
      var maxX = mid.x * 2;
      var maxY = mid.y * 2;
      var leftPoint;
      var rightPoint;

      // Account for the fall direction
      switch (_fallDirection) {
      case Block.prototype.DOWNWARD:
        leftPoint = { x: 0, y: maxY };
        rightPoint = { x: maxX, y: maxY };
        break;
      case Block.prototype.LEFTWARD:
        leftPoint = { x: 0, y: 0 };
        rightPoint = { x: 0, y: maxY };
        break;
      case Block.prototype.UPWARD:
        leftPoint = { x: maxX, y: 0 };
        rightPoint = { x: 0, y: 0 };
        break;
      case Block.prototype.RIGHTWARD:
        leftPoint = { x: maxX, y: maxY };
        rightPoint = { x: maxX, y: 0 };
        break;
      default:
        return;
      }

      // Translate from block cell space to game-area pixel space
      leftPoint.x = (leftPoint.x * gameWindow.squarePixelSize) + _pixelPosition.x;
      leftPoint.y = (leftPoint.y * gameWindow.squarePixelSize) + _pixelPosition.y;
      rightPoint.x = (rightPoint.x * gameWindow.squarePixelSize) + _pixelPosition.x;
      rightPoint.y = (rightPoint.y * gameWindow.squarePixelSize) + _pixelPosition.y;

      return { left: leftPoint, right: rightPoint };
    }

    function _getBombType() {
      return _bombType;
    }

    function _setPixelPosition(x, y) {
      _pixelPosition.x = x;
      _pixelPosition.y = y;
    }

    // ----------------------------------------------------------------- //
    // -- Privileged members

    this.rotate = _rotate;
    this.switchFallDirection = _switchFallDirection;
    this.update = _update;
    this.draw = _draw;
    this.addSquaresToGameWindow = _addSquaresToGameWindow;
    this.getSquareCellPositions = _getSquareCellPositions;
    this.getFarthestLeftCellAvailable = _getFarthestLeftCellAvailable;
    this.getFarthestRightCellAvailable = _getFarthestRightCellAvailable;
    this.getFarthestDownwardCellAvailable = _getFarthestDownwardCellAvailable;
    this.setCellPosition = _setCellPosition;
    this.getHasCollidedWithOutOfBounds = _getHasCollidedWithOutOfBounds;
    this.getHasLanded = _getHasLanded;
    this.getHasCollidedWithBackLineOfCenterSquare = _getHasCollidedWithBackLineOfCenterSquare;
    this.checkIsOverTopSquare = _checkIsOverTopSquare;
    this.checkForCollisionWithSquare = _checkForCollisionWithSquare;
    this.getType = _getType;
    this.getOrientation = _getOrientation;
    this.getFallDirection = _getFallDirection;
    this.getPixelCenter = _getPixelCenter;
    this.getPolygon = _getPolygon;
    this.getCellPosition = _getCellPosition;
    this.getSidePointsRelativeToBlockPosition = _getSidePointsRelativeToBlockPosition;
    this.getLowerLeftAndRightFallDirectionPoints = _getLowerLeftAndRightFallDirectionPoints;
    this.getBombType = _getBombType;
    this.setPixelPosition = _setPixelPosition;

    log.d('<--block.Block');
  }

  // --------------------------------------------------------------------- //
  // -- Private static members

  function _getFallPeriod(type) {
    if (type >= Block.prototype.FIVE_1) {
      return _fiveSquareBlockFallPeriod;
    } else if (type >= Block.prototype.FOUR_1) {
      return _fourSquareBlockFallPeriod;
    } else if (type >= Block.prototype.THREE_1) {
      return _threeSquareBlockFallPeriod;
    } else if (type >= Block.prototype.TWO_1) {
      return _twoSquareBlockFallPeriod;
    } else {
      return _oneSquareBlockFallPeriod;
    }
  }

  // Return an array of point objects which represent the all of the points 
  // along the given outer face of the given block.
  // NOTE: the given side is taken into consideration AFTER rotating 
  //     according to the given orientation.
  function _getPointsAlongSideRelativeToBlockPosition(type, orientation, side) {
    if (side !== Block.prototype.ALL_SIDES) {
      // Correct for the given orientation and account for ALL_SIDES being at index 0
      side = ((((side - 1) - orientation) + 4) % 4) + 1;
    }

    // We're going to be tampering with this array, so lets not use the 
    // original
    var points = _DEFAULT_SIDE_CELL_POSITIONS[type][side];
    points = Block.prototype.copyPoints(points);

    // Get the max x and y coords of ALL sides of this block, then add 
    // this to the points list (this prevents the rotation from offsetting 
    // some sides in un-desired ways)
    var offset = CELL_OFFSETS_FROM_TOP_LEFT_TO_CENTER[type];
    var max = { x: offset.x * 2, y: offset.y * 2 };
    points.push(max);

    // Correct for the given orientation
    points = _rotatePoints(points, orientation, Block.prototype.IGNORE);

    points.pop();

    return points;
  }

  // Return an array of position objects which represent the positions 
  // of this block's constituent squares relative to this block's 
  // position.
  function _getSquareCellPositionsRelativeToBlockPosition(type, orientation) {
    // Get the constituent square positions for the default orientation
    var points = _DEFAULT_SQUARE_CELL_POSITIONS[type];

    points = _rotatePoints(points, orientation, type);

    return points;
  }

  // NOTE: This function assumes that the min x and y coordinates in the 
  //     given collection of points are both 0.
  // NOTE: oldPoints needs to be non-null and non-empty.
  // NOTE: numberOfRotations can range from 0 to 3.
  function _rotatePoints(oldPoints, numberOfRotations, type) {
    var newPoints = Block.prototype.copyPoints(oldPoints);

    // Don't do anything if we are rotating the block 0 times
    // A couple blocks are 90-degrees rotationally symmetric
    if (numberOfRotations > 0 && 
        type !== Block.prototype.ONE_1&& 
        type !== Block.prototype.FOUR_5 && 
        type !== Block.prototype.FIVE_18) {
      var max;
      var i;

      // Rotate the points
      switch (numberOfRotations) {
      case 1:
        max = _findMaxCoords(newPoints);
        for (i = 0; i < oldPoints.length; ++i) {
          newPoints[i].x = max.y - oldPoints[i].y;
          newPoints[i].y = oldPoints[i].x;
        }
        break;
      case 2:
        // Some of the blocks 180-degrees rotationally symmetric
        if (type !== Block.prototype.FOUR_1 && 
            type !== Block.prototype.FOUR_2 && 
            type !== Block.prototype.FOUR_6 && 
            type !== Block.prototype.TWO_1 && 
            type !== Block.prototype.THREE_1 && 
            type !== Block.prototype.FIVE_1) {
          max = _findMaxCoords(newPoints);
          for (i = 0; i < oldPoints.length; ++i) {
            newPoints[i].x = max.x - oldPoints[i].x;
            newPoints[i].y = max.y - oldPoints[i].y;
          }
        }
        break;
      case 3:
        max = _findMaxCoords(newPoints);
        for (i = 0; i < oldPoints.length; ++i) {
          newPoints[i].x = oldPoints[i].y;
          newPoints[i].y = max.x - oldPoints[i].x;
        }
        break;
      default:
        return;
      }
    }

    return newPoints;
  }

  function _findMaxCoords(points) {
    var maxX = points[0].x;
    var maxY = points[0].y;

    for (var i = 1; i < points.length; ++i) {
      if (points[i].x > maxX) {
        maxX = points[i].x;
      }
      if (points[i].y > maxY) {
        maxY = points[i].y;
      }
    }

    return { x: maxX, y: maxY };
  }

  function _positionToIndex(position) {
    return (position.y * gameWindow.gameWindowCellSize) + position.x;
  }

  function _positionsToIndices(positions) {
    var indices = [];

    for (var i = 0; i < positions.length; ++i) {
      indices[i] = _positionToIndex(positions[i]);
    }

    return indices;
  }

  // --------------------------------------------------------------------- //
  // -- Public (non-privileged) static members

  // ---------- Block types ---------- //

  Block.prototype.IGNORE = -1;

  Block.prototype.ONE_1 = 0; // Line-shaped block

  Block.prototype.TWO_1 = 1; // Line-shaped block

  Block.prototype.THREE_1 = 2; // Line-shaped block
  Block.prototype.THREE_2 = 3; // L-shaped block

  Block.prototype.FOUR_1 = 4; // S-shaped block
  Block.prototype.FOUR_2 = 5; // Z-shaped block
  Block.prototype.FOUR_3 = 6; // L-shaped block
  Block.prototype.FOUR_4 = 7; // J-shaped block
  Block.prototype.FOUR_5 = 8; // Square-shaped block
  Block.prototype.FOUR_6 = 9; // Line-shaped block (defaults to vertical orientation)
  Block.prototype.FOUR_7 = 10; // T-shaped block

  Block.prototype.FIVE_1 = 11; // Line-shaped block
  Block.prototype.FIVE_2 = 12; // Tall-L-shaped block
  Block.prototype.FIVE_3 = 13; // Tall-J-shaped block
  Block.prototype.FIVE_4 = 14; // L-crooked-shaped block
  Block.prototype.FIVE_5 = 15; // R-crooked-shaped block
  Block.prototype.FIVE_6 = 16; // L-thumbs-up-shaped block
  Block.prototype.FIVE_7 = 17; // R-thumbs-up-shaped block
  Block.prototype.FIVE_8 = 18; // U-shaped block
  Block.prototype.FIVE_9 = 19; // L-bump-shaped block
  Block.prototype.FIVE_10 = 20; // R-bump-shaped block
  Block.prototype.FIVE_11 = 21; // T-shaped block
  Block.prototype.FIVE_12 = 22; // Short-L-shaped block
  Block.prototype.FIVE_13 = 23; // Stairs-shaped block
  Block.prototype.FIVE_14 = 24; // S-shaped block
  Block.prototype.FIVE_15 = 25; // Z-shaped block
  Block.prototype.FIVE_16 = 26; // L-weird-shaped block
  Block.prototype.FIVE_17 = 27; // R-weird-shaped block
  Block.prototype.FIVE_18 = 28; // Cross-shaped block

  // Orientations
  Block.prototype.DEG0 = 0;
  Block.prototype.DEG90 = 1;
  Block.prototype.DEG180 = 2;
  Block.prototype.DEG270 = 3;

  // Fall directions
  Block.prototype.DOWNWARD = 0;
  Block.prototype.LEFTWARD = 1;
  Block.prototype.UPWARD = 2;
  Block.prototype.RIGHTWARD = 3;

  // Block sides
  Block.prototype.ALL_SIDES = 0;
  Block.prototype.TOP_SIDE = 1;
  Block.prototype.RIGHT_SIDE = 2;
  Block.prototype.BOTTOM_SIDE = 3;
  Block.prototype.LEFT_SIDE = 4;

  Block.prototype.NUMBER_OF_FRAMES_IN_COLLAPSE_ANIMATION = 7;
  Block.prototype.START_INDEX_OF_UP_RIGHT_COLLAPSE_ANIMATION = 5;
  Block.prototype.START_INDEX_OF_SIDEWAYS_COLLAPSE_ANIMATION = 12;

  Block.prototype.NUMBER_OF_FRAMES_IN_SHIMMER_ANIMATION = 4;
  Block.prototype.START_INDEX_OF_SHIMMER_ANIMATION = 1;

  Block.prototype.setFallSpeed = function(fallSpeed) {
    _fourSquareBlockFallPeriod = 1 / fallSpeed;
    _oneSquareBlockFallPeriod = _fourSquareBlockFallPeriod * _ONE_SQUARE_BLOCK_FALL_PERIOD_RATIO;
    _twoSquareBlockFallPeriod = _fourSquareBlockFallPeriod * _TWO_SQUARE_BLOCK_FALL_PERIOD_RATIO;
    _threeSquareBlockFallPeriod = _fourSquareBlockFallPeriod * _THREE_SQUARE_BLOCK_FALL_PERIOD_RATIO;
    _fiveSquareBlockFallPeriod = _fourSquareBlockFallPeriod * _FIVE_SQUARE_BLOCK_FALL_PERIOD_RATIO;
  };

  Block.prototype.drawSquare = function(context, colorIndex, x, y, 
      animationIndex) {
    if (colorIndex >= 0) {
      var sourceY = colorIndex * _SOURCE_SQUARE_SIZE;
      var sourceX = animationIndex * _SOURCE_SQUARE_SIZE;

      context.drawImage(resources.get('/squared-away/images/sprites.png'),
        sourceX, sourceY, 
        _SOURCE_SQUARE_SIZE, _SOURCE_SQUARE_SIZE, 
        x, y, 
        gameWindow.squarePixelSize, gameWindow.squarePixelSize);
    }
  };

  Block.prototype.getCellOffsetFromTopLeftOfBlockToCenter = function(blockType, orientation) {
    var oldOffset = CELL_OFFSETS_FROM_TOP_LEFT_TO_CENTER[blockType];
    var newOffset = { x: oldOffset.x, y: oldOffset.y };

    // If the block is oriented 90 degrees off of the default, then swap 
    // the x and y offsets
    if (orientation === 1 || orientation === 3) {
      var tmp = newOffset.x;
      newOffset.x = newOffset.y;
      newOffset.y = tmp;
    }

    return newOffset;
  };

  Block.prototype.copyPoints = function(oldPoints) {
    var newPoints = [];
    for (var i = 0; i < oldPoints.length; ++i) {
      newPoints.push({ x: oldPoints[i].x, y: oldPoints[i].y });
    }
    return newPoints;
  };

  // Make Block available to the rest of the program
  window.Block = Block;

  log.i('<--block.LOADING_MODULE');
}());
