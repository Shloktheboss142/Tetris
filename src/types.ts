export {Viewport, Constants, Block, Obstacles, Tetriminos}
export type {Key, State}

const 
  Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
    PREVIEW_WIDTH: 160,
    PREVIEW_HEIGHT: 80,
  } as const,
    
  Constants = {
    TICK_RATE_MS: 500,
    GRID_WIDTH: 10,
    GRID_HEIGHT: 20,
  } as const,
    
  Block = {
    WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
    HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
  },

  Obstacles = [
    [{x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6}, {x: 6, y: 6}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}] ,
    [{x: 0, y: 17}, {x: 1, y: 17}, {x: 2, y: 17}, {x: 7, y: 17}, {x: 8, y: 17}, {x: 9, y: 17}],
    [{x: 4, y: 14}, {x: 5, y: 14}, {x: 4, y: 15}, {x: 5, y: 15}],
    [{x: 1, y: 10}, {x: 2, y: 10}, {x: 7, y: 10}, {x: 8, y: 10}],
    [{x: 0, y: 15}, {x: 0, y: 14}, {x: 0, y: 13}, {x: 9, y: 15}, {x: 9, y: 14}, {x: 9, y: 13}],
  ],

  Tetriminos = [
    // {blocks : [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 4, y: 1}], color: 'black'},
    // I Tetrimino
    { blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }], color: 'cyan' },
    // J Tetrimino
    { blocks: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: 'blue' },
    // L Tetrimino
    { blocks: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: 'orange' },
    // O Tetrimino
    { blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], color: 'yellow' },
    // T Tetrimino
    { blocks: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: 'purple' },
    // Z Tetrimino
    { blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: 'red' },
    // S Tetrimino
    { blocks: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], color: 'green' },
  ]

  type Key = "KeyS" | "KeyA" | "KeyD" | "Space" | "KeyW";

  type State = Readonly<{
    gameEnd: boolean;
    currentBlock: SVGElement[];
    nextBlock: SVGElement[];
    score: number;
    level: number;
    highScore: number;
    rotation: number;
    existingBlocks: SVGElement[];
  }>;