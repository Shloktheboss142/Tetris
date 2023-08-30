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

import { fromEvent, interval, merge, of, combineLatest, Subscription } from "rxjs";
import { map, filter, scan, tap, takeWhile } from "rxjs/operators";

/** Constants */

abstract class RNG {
  // LCG using GCC's constants
  private static m = 0x80000000; // 2**31
  private static a = 1103515245;
  private static c = 12345;

  /**
   * Call `hash` repeatedly to generate the sequence of hashes.
   * @param seed 
   * @returns a hash of the seed
   */
  public static hash = (seed: number) => (RNG.a * seed + RNG.c) % RNG.m;

  /**
   * Takes hash value and scales it to the range [-1, 1]
   */
  public static scale = (hash: number) => (2 * hash) / (RNG.m - 1) - 1;
}

const bricks = [
  [[0, 0, 0], [1, 1, 1], [0, 0, 0]],
  [[1, 1, 1], [0, 1, 0], [0, 1, 0]],
  [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
  [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
  [[1, 1, 0], [1, 1, 0], [0, 0, 0]]
]

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

const randomBrick = () => bricks[Math.floor(Math.random() * bricks.length)];

/** State processing */

type State = Readonly<{
  gameEnd: boolean;
  x: number;
  y: number;
  score: number;
}>;

const initialState: State = {
  gameEnd: false,
  x: 0,
  y: 0,
  score: 0,
} as const;



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

const previousBlocks: SVGRectElement[] = [];

function addBlockToList(block: SVGRectElement) {
  previousBlocks.push(block);
}

let adddedBlockToList: Subscription | null = null;

/**d
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

    const fromKey = (keyCode: Key, direction: number) =>
      key$.pipe(filter(({ code }) => code === keyCode), map(() => direction));

    const left$ = fromKey("KeyA", -1);
    const right$ = fromKey("KeyD", 1);
    const down$ = fromKey("KeyS", 0);

      /** Observables */

      // const cube = createSvgElement(svg.namespaceURI, "rect", {
      //   height: `${Block.HEIGHT}`,
      //   width: `${Block.WIDTH}`,
      //   x: "0",
      //   y: "0",
      //   style: "fill: green",
      //   });
      //   svg.appendChild(cube);

      //   const cube2 = createSvgElement(svg.namespaceURI, "rect", {
      //     height: `${Block.HEIGHT}`,
      //     width: `${Block.WIDTH}`,
      //     x: "20",
      //     y: "0",
      //     style: "fill: green",
      //     });
      //     svg.appendChild(cube2);

      //     const cube3 = createSvgElement(svg.namespaceURI, "rect", {
      //       height: `${Block.HEIGHT}`,
      //       width: `${Block.WIDTH}`,
      //       x: "0",
      //       y: "20",
      //       style: "fill: green",
      //       });
      //       svg.appendChild(cube3);
    
      //       const cube4 = createSvgElement(svg.namespaceURI, "rect", {
      //         height: `${Block.HEIGHT}`,
      //         width: `${Block.WIDTH}`,
      //         x: "20",
      //         y: "20",
      //         style: "fill: green",
      //         });
      //         svg.appendChild(cube4);
  
      function move(object: SVGElement) {
          const action$ = merge(left$, right$, down$)
          .pipe(
            scan((acc: { x: number; y: number }, direction: number) => {
              const objext = object as SVGRectElement;
              objext.x.baseVal.value = objext.x.baseVal.value + direction * Block.WIDTH;
              if (objext.x.baseVal.value < 0 || objext.x.baseVal.value > Viewport.CANVAS_WIDTH - Block.WIDTH) {
                return acc;
              }

              if (direction === 0) {
                objext.y.baseVal.value = objext.y.baseVal.value + Block.HEIGHT;
              }
              if (objext.y.baseVal.value > Viewport.CANVAS_HEIGHT - Block.HEIGHT) {
                return acc;
              }
              return { x: objext.x.baseVal.value, y: objext.y.baseVal.value };
            }, { x: (object as SVGRectElement).x.baseVal.value, y: (object as SVGRectElement).y.baseVal.value })
        ).subscribe(({ x, y }) => {
          (object as SVGRectElement).setAttribute("x", `${x}`);
          (object as SVGRectElement).setAttribute("y", `${y}`);
        }
          );
      }

      // move(cube);
      // move(cube2);
      // move(cube3);
      // move(cube4); 

      

      

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
        // Add blocks to the main grid canvas
        
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

      const keyboardControl = (object: SVGElement, previousBlocks: SVGRectElement[]) => {
        const keyDown$ = fromEvent<KeyboardEvent>(document, "keydown");
      
        return keyDown$.pipe(
          map(event => {
            switch (event.code) {
              case "KeyA": return -1; // Move left
              case "KeyD": return 1;  // Move right
              case "KeyS": return 0;  // Move down
              default: return 0;      // Default to no movement
            }
          }),
          scan((state, direction) => {
            const replacedObject = object as SVGRectElement;
      
            const newX = Math.max(
              0,
              Math.min(
                Viewport.CANVAS_WIDTH - Block.WIDTH,
                replacedObject.x.baseVal.value + direction * Block.WIDTH
              )
            );
            const newY = direction !== 0
              ? replacedObject.y.baseVal.value
              : Math.min(
                  Viewport.CANVAS_HEIGHT - Block.HEIGHT,
                  replacedObject.y.baseVal.value + Block.HEIGHT
                );
      
            if (!checkCollision(replacedObject, previousBlocks)) {
              replacedObject.x.baseVal.value = newX;
              replacedObject.y.baseVal.value = newY;
            }
    
            // else {
            //   addedBlock = generateNewBlock()
            // }
      
            return { x: newX, y: newY };
          }, {
            x: (object as SVGRectElement).x.baseVal.value,
            y: (object as SVGRectElement).y.baseVal.value
          }),
          takeWhile(({ x, y }) => !checkCollision(object as SVGRectElement, previousBlocks)),
          tap(({ x, y }) => {
            (object as SVGRectElement).setAttribute("x", `${x}`);
            (object as SVGRectElement).setAttribute("y", `${y}`);
          })
        ).subscribe();
      };

      function generateNewBlock() {
        // Unsubscribe from the previous addedBlockSubscription if it exists
        if (adddedBlockToList) {
          adddedBlockToList.unsubscribe();
        }
      
        const newBlock = createSvgElement(svg.namespaceURI, "rect", {
          height: `${Block.HEIGHT}`,
          width: `${Block.WIDTH}`,
          x: "0",
          y: "0",
          style: "fill: pink",
        });
      
        svg.appendChild(newBlock);
        addBlockToList(newBlock as SVGRectElement);
      
        // Create a new subscription for the keyboard control of the newBlock
        adddedBlockToList = keyboardControl(newBlock as SVGRectElement, previousBlocks);
      
        return newBlock;
      }
    
      function removeFilledRows() {
        const rowsToRemove = [];
      
        for (let row = Constants.GRID_HEIGHT - 1; row >= 0; row--) {
          const blocksInRow = previousBlocks.filter(block => {
            const blockY = block.y.baseVal.value;
            return Math.floor(blockY / Block.HEIGHT) === row;
          });
      
          if (blocksInRow.length === Constants.GRID_WIDTH) {
            rowsToRemove.push(row);
          }
        }
      
        rowsToRemove.forEach(row => {
          const blocksInRow = previousBlocks.filter(block => {
            const blockY = block.y.baseVal.value;
            return Math.floor(blockY / Block.HEIGHT) === row;
          });
      
          blocksInRow.forEach(block => {
            block.remove();
            previousBlocks.splice(previousBlocks.indexOf(block), 1);
          });
      
          // Move all blocks above the removed row down by one row
          previousBlocks.forEach(block => {
            const blockY = block.y.baseVal.value;
            if (blockY < (row * Block.HEIGHT)) {
              block.y.baseVal.value += Block.HEIGHT;
            }
          });
        });
      }


      let addedBlock = generateNewBlock()

      function checkCollision(block: SVGRectElement, previousBlocks: SVGRectElement[]): boolean {
        const blockX = block.x.baseVal.value;
        const blockY = block.y.baseVal.value;
      
        const collisionDetected = previousBlocks.some(previousBlocks => {
          const previousBlockX = previousBlocks.x.baseVal.value;
          const previousBlockY = previousBlocks.y.baseVal.value;
      
          return blockX === previousBlockX && blockY + Block.HEIGHT === previousBlockY;
        });
      

        //   const touchesLeft = previousBlocks.some(previousBlocks => {
        //     const previousBlockX = previousBlocks.x.baseVal.value;
        //     return blockX === previousBlockX - Block.WIDTH && blockY === previousBlocks.y.baseVal.value;
        //   });

        //   const touchesRight = previousBlocdks.some(previousBlocks => {
        //     const previousBlockX = previousBlocks.x.baseVal.value;

        //     return blockX === previousBlockX + Block.WIDTH && blockY === previousBlocks.y.baseVal.value;
        //   });


        const touchesBottom = blockY + Block.HEIGHT === Viewport.CANVAS_HEIGHT;

        // if (touchesLeft) {
        //   block.x.baseVal.value -= Block.WIDTH;
        //   return false;
        // }

        // else if (touchesRight) {
        //   block.x.baseVal.value += Block.WIDTH;
        //   return false;
        // }
      
        // else 
        if (collisionDetected || touchesBottom) {
          // Stop all operations and disable controls
          // source$.unsubscribe(); // Unsubscribe from the tick$ observable
          // keyDownSubscription.unsubscribe();
          addedBlock = generateNewBlock()
          
          // addedBlock = generateNewBlock();
          return true; // Collision detected
        }
      
        return false; // No collision detected
      }
    
      // if checkCollision()
      // keyboardControl(added_block); 
      // keyboardControl(addedBlock, existingBlocks);
    
      const source$ = tick$.pipe(
        scan((s: State) => ({ ...s, gameEnd: false }), initialState),
        map((s: State) => {
          const cubeRect = addedBlock as SVGRectElement;
    
          // Check for collision with existing blocks
          if (!checkCollision(cubeRect, previousBlocks)) {
            cubeRect.y.baseVal.value += Block.HEIGHT;
    
            if (cubeRect.y.baseVal.value >= Viewport.CANVAS_HEIGHT - Block.HEIGHT) {
              cubeRect.y.baseVal.value = Viewport.CANVAS_HEIGHT - Block.HEIGHT;
            }
          }
    
          removeFilledRows();
    
          return s;
        }),
        tap((s: State) => {
          render(s);
    
          if (s.gameEnd) {
            show(gameover);
          } else {
            hide(gameover);
          }
        })
      ).subscribe();
    }



// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
