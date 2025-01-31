export { Viewport, Constants, Block, Obstacles, BlockOptions };
export type { Key, State };

const Viewport = {
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
  // Obstacles that will be generated
  Obstacles = [
    [
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 3, y: 7 },
      { x: 4, y: 7 },
      { x: 5, y: 7 },
      { x: 6, y: 7 },
    ],
    [
      { x: 0, y: 17 },
      { x: 1, y: 17 },
      { x: 2, y: 17 },
      { x: 7, y: 17 },
      { x: 8, y: 17 },
      { x: 9, y: 17 },
    ],
    [
      { x: 4, y: 14 },
      { x: 5, y: 14 },
      { x: 4, y: 15 },
      { x: 5, y: 15 },
    ],
    [
      { x: 1, y: 10 },
      { x: 2, y: 10 },
      { x: 7, y: 10 },
      { x: 8, y: 10 },
    ],
    [
      { x: 0, y: 15 },
      { x: 0, y: 14 },
      { x: 0, y: 13 },
      { x: 9, y: 15 },
      { x: 9, y: 14 },
      { x: 9, y: 13 },
    ],
  ],
  // Block options for the blocks that will be generated
  BlockOptions = [
    // {
    //   blocks: [
    //     { x: 0, y: 0 },
    //     { x: 1, y: 0 },
    //     { x: 2, y: 0 },
    //     { x: 3, y: 0 },
    //     { x: 4, y: 0 },
    //     { x: 0, y: 1 },
    //     { x: 1, y: 1 },
    //     { x: 2, y: 1 },
    //     { x: 3, y: 1 },
    //     { x: 4, y: 1 },
    //   ],
    //   color: "black",
    // },
    {
      positions: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
      color: "#FDDA1D",
    }, // O
    {
      positions: [
        { x: 2, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      color: "#FF8300",
    }, // L
    {
      positions: [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 0 },
      ],
      color: "#3DCA31",
    }, // S
    {
      positions: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
      color: "#21CDFF",
    }, // I
    {
      positions: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      color: "#EB0045",
    }, // Z
    {
      positions: [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      color: "#B231F0",
    }, // T
    {
      positions: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      color: "#0F6CF2",
    }, // J
  ];

// Key type
type Key = "KeyS" | "KeyA" | "KeyD" | "Space" | "KeyW";

// State type
type State = Readonly<{
  gameEnd: boolean;
  currentBlock: SVGElement[];
  nextBlock: SVGElement[];
  score: number;
  level: number;
  highScore: number;
  existingBlocks: SVGElement[];
}>;
