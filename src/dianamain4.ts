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

import { fromEvent, interval, merge } from "rxjs";
import { map, filter, scan } from "rxjs/operators";

/** Constants */

const tetriminos = [
  // // I Tetrimino
  // { blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }], color: 'cyan' },
  // // J Tetrimino
  // { blocks: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: 'blue' },
  // // L Tetrimino
  // { blocks: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: 'orange' },
  // O Tetrimino
  { blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], color: 'yellow' },
  // T Tetrimino
  { blocks: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: 'purple' },
//   // Z Tetrimino
//   { blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: 'red' },
//   // S Tetrimino
//   { blocks: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], color: 'green' },
];

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

/** User input */

type Key = "KeyS" | "KeyA" | "KeyD";

type Event = "keydown" | "keyup" | "keypress";

/** Utility functions */

/** State processing */

type State = Readonly<{
  gameEnd: boolean;
  currentBlock: SVGElement[];
  nextBlock: SVGElement[];
  score: number;
  highScore: number;
  level: number;
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

function createNewBlock(): SVGElement[] {
  const block = tetriminos[0];
  const hehe: SVGElement[] = [];
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  block.blocks.forEach(element => {
    const cube = createSvgElement(svg.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${Block.WIDTH * element.x}`,
      y: `${Block.HEIGHT * element.y}`,
      style: `fill: ${block.color}`,
    });
    hehe.push(cube);
    // svg.appendChild(cube);
  })
  return hehe;
}

const initialState: State = {
  gameEnd: false,
  currentBlock: createNewBlock(),
  nextBlock: createNewBlock(),
  score: 0,
  highScore: 0,
  level: 0,
};

const existingBlocks: SVGElement[] = [];

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

  const fromKey = (keyCode: Key, xDirection: number, yDirection: number) =>
      key$.pipe(filter(({ code }) => code === keyCode), map(() => xDirection, yDirection));

  const left$ = fromKey("KeyA", -1, 0);
  const right$ = fromKey("KeyD", 1, 0);
  const down$ = fromKey("KeyS", 0, 1);

  /** Observables */
  

  /** Determines the rate of time steps */
  const tick$ = interval(Constants.TICK_RATE_MS);

  /**
   * Renders the current state to the canvas.
   *
   * In MVC terms, this updates the View using the Model.
   *
   * @param s Current state
   */
  const render = (s: State) => {
    s.currentBlock.forEach(element => {
      svg.appendChild(element);
    });
    
    // Add a block to the preview canvas
    const cubePreview = createSvgElement(preview.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${Block.WIDTH * 2}`,
      y: `${Block.HEIGHT}`,
      style: "fill: green",
    });
    preview.appendChild(cubePreview);
  };

  const movement$ = merge(left$, right$, down$).pipe(
    scan((s: State, Xdirection: number, Ydirection: number) => {
      const tet = s.currentBlock;
      const newTet: SVGElement[] = [];
      const collideBottom = false;
  
      // Calculate new positions based on direction
          tet.forEach(element => {
            let newX = Number(element.getAttribute("x"));
            let newY = Number(element.getAttribute("y"));

            if (Xdirection === -1) {
              newX -= Block.WIDTH; // Move left
            } 
            else if (Xdirection === 1) {
              newX += Block.WIDTH; // Move right
            } 
            // else if (Ydirection === 1) {
            //   newY += Block.HEIGHT; // Move down
            // }
    
            // Perform bounds checking for walls
            // newX = Math.max(newX, 0); // Prevent moving beyond left wall
            // newX = Math.min(newX, Viewport.CANVAS_WIDTH - Block.WIDTH); // Prevent moving beyond right wall

            // Perform bounds checking for bottom
            // newY = Math.min(newY, Viewport.CANVAS_HEIGHT - Block.HEIGHT); // Keep the block within the bottom boundary

            
      
            element.setAttribute("x", `${newX}`);
            element.setAttribute("y", `${newY}`);
            newTet.push(element);
          }, newTet);
          return {...s, currentBlock: newTet};
      //     );
      // if (checkCollision(newTet)) {
      //   return { ...s, currentBlock: newTet };
      // } else {
      //   return s;
      // }
    }, initialState)
  ).subscribe((s: State) => {
    render(s);
  }
  );

  function maxXAndMaxY (tet: SVGElement[]): number[] {
    // const tet = s.currentBlock;
    let maxX = 0;
    let maxY = 0;
    tet.forEach(element => {
      const newX = Number(element.getAttribute("x"));
      const newY = Number(element.getAttribute("y"));
      if (newX > maxX) {
        maxX = newX;
      }
      if (newY > maxY) {
        maxY = newY;
      }
    });
    return [maxX, maxY];
  }

  function minXAndMinY (tet: SVGElement[]): number[] {
    // const tet = s.currentBlock;
    let minX = Number(Viewport.CANVAS_WIDTH);
    let minY = Number(Viewport.CANVAS_HEIGHT);
    tet.forEach(element => {
      const newX = Number(element.getAttribute("x"));
      const newY = Number(element.getAttribute("y"));
      if (newX < minX) {
        minX = newX;
      }
      if (newY < minY) {
        minY = newY;
      }
    });
    return [minX, minY];
  }

  function checkCollision(tet: SVGElement[]): boolean {
    // const tet = s.currentBlock;
    let collision = false;
    const [maxX, maxY] = maxXAndMaxY(tet);
    const [minX, minY] = minXAndMinY(tet);
    // tet.forEach(element => {
    //   const newX = Number(element.getAttribute("x"));
    //   const newY = Number(element.getAttribute("y"));
    //   existingBlocks.forEach(block => {
    //     const blockX = Number(block.getAttribute("x"));
    //     const blockY = Number(block.getAttribute("y"));
    //     if (newX === blockX && newY === blockY) {
    //       collision = true;
    //       return collision;
    //     }
    //   });
    // }
    if (maxX >= Viewport.CANVAS_WIDTH - Block.WIDTH || maxY >= Viewport.CANVAS_HEIGHT - Block.HEIGHT) {
      collision = true;
    } else if (minX <= -20 || minY <= 0) {
      collision = true;
    }
    return collision;
  }

  function checkOutOfBounds(tet: SVGElement[]): boolean {
    // const tet = s.currentBlock;
    let outOfBounds = false;
    tet.forEach(element => {
      const newY = Number(element.getAttribute("y"));
      if (newY >= Viewport.CANVAS_HEIGHT - Block.HEIGHT) {
        outOfBounds = true;
        return outOfBounds;
      }
    });
    return outOfBounds;
  }


  const source$ = merge(tick$)
  .pipe(
    scan((s: State) => ({ ...s, gameEnd: false }), initialState),
    map((s: State) => {
      const tet = s.currentBlock;
      const newTet: SVGElement[] = [];
      tet.forEach(element => {
        const newY = Number(element.getAttribute("y")) + Block.HEIGHT;
        element.setAttribute("y", `${newY}`);
        newTet.push(element);
      });

      // Check for collision
      // const collisionDeteced = checkCollision(s);

      // Stop movement if collision is detected
      // if (collisionDeteced || checkOutOfBounds(s)) {
      //   return s; // Return the same state without updating the position
      // }

      return {...s, currentBlock: newTet};
    }))
  .subscribe((s: State) => {
    render(s);

    if (s.gameEnd) {
      show(gameover);
    } else {
      hide(gameover);
    }
  });
}


// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}