export type {Key, Event, State, Action};
export { Viewport, Constants, Block, initialState };

const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
    PREVIEW_WIDTH: 160,
    PREVIEW_HEIGHT: 80,
  } as const;
  
  const Constants = {
    TICK_RATE_MS: 500,
    GRID_WIDTH: 10,
    GRID_HEIGHT: 20,
  } as const;
  
  const Block = {
    WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
    HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
  };
  
  type Key = "KeyS" | "KeyA" | "KeyD" | "KeyQ" | "KeyE" | "Space";
  
  type Event = "keydown" | "keyup" | "keypress";

  type State = Readonly<{
    gameEnd: boolean;
  }>;
  
  const initialState: State = {
    gameEnd: false,
  } as const;

  interface Action {
    apply(s: State): State;
  }