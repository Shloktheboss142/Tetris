/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { Subscription, fromEvent, interval, merge } from "rxjs";
import { map, filter, scan } from "rxjs/operators";
// import { updateView } from "./view";

/** Constants */

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

interface Action {
  apply(s: State): State;
}

/** User input */

type Key = "KeyS" | "KeyA" | "KeyD";

type Event = "keydown" | "keyup" | "keypress";

/** Utility functions */

/** State processing */

type State = Readonly<{
  gameEnd: boolean;
  score: number;
  activeBlock: SVGElement;
}>;



/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => s;

/** Rendering (side effects) */

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGGraphicsElement) => {
  elem.setAttribute("visibility", "visible");
  elem.parentNode!.appendChild(elem);
};

/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
const hide = (elem: SVGGraphicsElement) =>
  elem.setAttribute("visibility", "hidden");

/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
  namespace: string | null,
  name: string,
  props: Record<string, string> = {}
) => {
  const elem = document.createElementNS(namespace, name) as SVGElement;
  Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
  return elem;
};

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {
  // Canvas elements
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;
  const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
    HTMLElement;
  const container = document.querySelector("#main") as HTMLElement;

  svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
  svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
  preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

  // Text fields
  const levelText = document.querySelector("#levelText") as HTMLElement;
  const scoreText = document.querySelector("#scoreText") as HTMLElement;
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

  /** User input */

  const key$ = fromEvent<KeyboardEvent>(document, "keypress");

  const fromKey = (keyCode: Key) =>
    key$.pipe(filter(({ code }) => code === keyCode));

  const left$ = fromKey("KeyA");
  const right$ = fromKey("KeyD");
  const down$ = fromKey("KeyS");

  /** Observables */

  const reduceState = (s: State, action: Action) => action.apply(s);

  const initialState: State = {
    gameEnd: false,
    score: 0,
    activeBlock: newBlock(),
  };

  function newBlock() {
    const cube = createSvgElement(svg.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: "40",
      y: "40",
      style: "fill: red",
    });
    svg.appendChild(cube);
    return cube;
  }

  class Move implements Action {
    constructor (private readonly x: number, private readonly y: number) {}
    apply = (s:State) => ({
      ...s, ship: { ...s.activeBlock as SVGRectElement, x: this.x + Block.WIDTH * this.x, y: this.y + Block.HEIGHT * this.y}
    })
  }

  class Tick implements Action {
    constructor (private readonly elapsed: number) {}
    apply = (s:State) => ({
      ...s, ship: { ...s.activeBlock as SVGRectElement, y: this.elapsed * Block.HEIGHT}
    })
  }

  /** Determines the rate of time steps */
  const 
    tick$ = interval(Constants.TICK_RATE_MS).pipe(map(elapsed => new Tick(elapsed))),
    leftAction$ = left$.pipe(map(_ => new Move(1,0))),
    rightAction$ = right$.pipe(map(_ => new Move(-1, 0))),
    downAction$ = down$.pipe(map(_ => new Move(0, 1)));

  const action$ = merge(leftAction$, rightAction$);
  const state$ = action$.pipe(scan(reduceState, initialState)); 
//   const subscription: Subscription = state$.subscribe((state: State) => render(state, subscription.unsubscribe()));

  /**
   * Renders the current state to the canvas.
   *
   * In MVC terms, this updates the View using the Model.
   *
   * @param s Current state
   */
  const render = (s: State) => {
    // Clear the canvas
    svg.innerHTML = "";
    preview.innerHTML = "";
    function render(s: State): void {
      // Clear the canvas
      svg.innerHTML = "";
      preview.innerHTML = "";

      // Add blocks to the main grid canvas
      const cube = createSvgElement(svg.namespaceURI, "rect", {
        height: `${Block.HEIGHT}`,
        width: `${Block.WIDTH}`,
        x: "0",
        y: "0",
        style: "fill: green",
      });
      svg.appendChild(cube);
      const cube2 = createSvgElement(svg.namespaceURI, "rect", {
        height: `${Block.HEIGHT}`,
        width: `${Block.WIDTH}`,
        x: `${Block.WIDTH * (3 - 1)}`,
        y: `${Block.HEIGHT * (20 - 1)}`,
        style: "fill: red",
      });
      svg.appendChild(cube2);
      const cube3 = createSvgElement(svg.namespaceURI, "rect", {
        height: `${Block.HEIGHT}`,
        width: `${Block.WIDTH}`,
        x: `${Block.WIDTH * (4 - 1)}`,
        y: `${Block.HEIGHT * (20 - 1)}`,
        style: "fill: red",
      });
      svg.appendChild(cube3);

      // Add a block to the preview canvas
      const cubePreview = createSvgElement(preview.namespaceURI, "rect", {
        height: `${Block.HEIGHT}`,
        width: `${Block.WIDTH}`,
        x: `${Block.WIDTH * 2}`,
        y: `${Block.HEIGHT}`,
        style: "fill: green",
      });
      preview.appendChild(cubePreview);
    }

    const source$ = merge(tick$)
      .pipe(scan((s: State) => ({ ...s, gameEnd: false, score: 0 } as State), initialState))
      .subscribe((s: State) => {
        render(s);

        if (s.gameEnd) {
          show(gameover);
        } else {
          hide(gameover);
        }
      });
    // Add blocks to the main grid canvas
    // const cube = createSvgElement(svg.namespaceURI, "rect", {
    //   height: `${Block.HEIGHT}`,
    //   width: `${Block.WIDTH}`,
    //   x: "0",
    //   y: "0",
    //   style: "fill: green",
    // });
    // svg.appendChild(cube);
    // const cube2 = createSvgElement(svg.namespaceURI, "rect", {
    //   height: `${Block.HEIGHT}`,
    //   width: `${Block.WIDTH}`,
    //   x: `${Block.WIDTH * (3 - 1)}`,
    //   y: `${Block.HEIGHT * (20 - 1)}`,
    //   style: "fill: red",
    // });
    // svg.appendChild(cube2);
    // const cube3 = createSvgElement(svg.namespaceURI, "rect", {
    //   height: `${Block.HEIGHT}`,
    //   width: `${Block.WIDTH}`,
    //   x: `${Block.WIDTH * (4 - 1)}`,
    //   y: `${Block.HEIGHT * (20 - 1)}`,
    //   style: "fill: red",
    // });
    // svg.appendChild(cube3);

    // // Add a block to the preview canvas
    // const cubePreview = createSvgElement(preview.namespaceURI, "rect", {
    //   height: `${Block.HEIGHT}`,
    //   width: `${Block.WIDTH}`,
    //   x: `${Block.WIDTH * 2}`,
    //   y: `${Block.HEIGHT}`,
    //   style: "fill: green",
    // });
    // preview.appendChild(cubePreview);

  };

  const source$ = merge(tick$)
    .pipe(scan((s: State) => ({ ...s, gameEnd: false, score: 0 } as State), initialState))
    .subscribe((s: State) => {
      render(s);

      if (s.gameEnd) {
        show(gameover);
      } else {
        hide(gameover);
      }
    });
}

// function updateView(unsubscribe: () => void) {
//   return function(s: State):void {
//       const svg = document.getElementById("svgCanvas")

//       render(s);
//   }
// }

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}




